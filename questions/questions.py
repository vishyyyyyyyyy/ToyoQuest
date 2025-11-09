import pathlib
import os
import csv
import json
import re

# Lazy import of requests to avoid import errors if not installed
requests = None

def _ensure_requests_imported():
    """Lazy import of requests - only import when needed"""
    global requests
    if requests is None:
        try:
            import requests
        except ImportError as e:
            # requests is optional, only used for fallback HTTP calls
            print(f"Warning: requests module not found. Some fallback features may not work: {e}")
            return None
    return requests

# Lazy import of google.genai to avoid import errors if not installed
genai = None
types = None

def _ensure_genai_imported():
    """Lazy import of google.genai - only import when needed"""
    global genai, types
    if genai is None:
        try:
            from google import genai
            from google.genai import types
        except ImportError as e:
            raise ImportError(
                "google.genai module not found. Please install it with: pip install google-genai"
            ) from e
    return genai, types

# Helper: load latest form data and quiz selections that the Flask app writes
def load_latest_data():
    """Try to load form data and quiz selections from JSON files in the same directory.

    Returns a tuple (financials_dict, selected_cards_list) where:
    - financials_dict has keys: name, budget, creditScore, etc (may be empty)
    - selected_cards_list is a list of card names selected in the quiz (may be empty)
    """
    script_dir = pathlib.Path(__file__).parent
    financials_file = script_dir / 'latest_financials.json'
    quiz_file = script_dir / 'latest_quiz.json'

    # Load financials
    financials = {}
    if financials_file.exists():
        try:
            with financials_file.open('r', encoding='utf-8') as f:
                financials = json.load(f)
        except Exception as e:
            print(f"Failed to read latest_financials.json: {e}")

    # Load quiz selections
    selected_cards = []
    if quiz_file.exists():
        try:
            with quiz_file.open('r', encoding='utf-8') as f:
                quiz_data = json.load(f)
                selected_cards = quiz_data.get('selectedCards', [])
        except Exception as e:
            print(f"Failed to read latest_quiz.json: {e}")

    # Fallback: try to GET from local Flask endpoints (if running)
    requests_module = _ensure_requests_imported()
    if requests_module and not financials:
        try:
            resp = requests_module.get('http://127.0.0.1:5000/financials', timeout=1)
        except Exception:
            pass

    if requests_module and not selected_cards:
        try:
            resp = requests_module.get('http://127.0.0.1:5000/quiz', timeout=1)
        except Exception:
            pass

    return financials, selected_cards

# Expose module-level variables for use elsewhere in the script
form_data, selected_cards = load_latest_data()

# Financial form variables
name = form_data.get('name')
budget = form_data.get('budget')
creditScore = form_data.get('creditScore')
downPayment = form_data.get('downPayment')
paymentPeriod = form_data.get('paymentPeriod')
annualMileage = form_data.get('annualMileage')
leaseMonths = form_data.get('leaseMonths')

# Quiz selections
# selected_cards is already a list of card names chosen by the user

# Define expanded card information dictionary
CARD_DETAILS = {
    'Sleek Sporty': {
        'description': 'For sports cars and sedans',
        'vehicle_types': ['sports car', 'sedan'],
        'features': ['aerodynamic', 'performance-oriented'],
        'preferences': ['speed', 'style']
    },
    'Family Roomy': {
        'description': 'For SUVs and minivans',
        'vehicle_types': ['SUV', 'minivan'],
        'features': ['spacious', 'comfortable'],
        'preferences': ['safety', 'space']
    },
    'Gas1 Mood': {
        'description': 'For Hybrid and Electric vehicles',
        'vehicle_types': ['hybrid', 'electric'],
        'features': ['fuel-efficient', 'eco-friendly'],
        'preferences': ['economy', 'sustainability']
    },
    'Gas2 Whatev': {
        'description': 'For Gasoline vehicles',
        'vehicle_types': ['gasoline'],
        'features': ['traditional', 'versatile'],
        'preferences': ['conventional', 'reliability']
    },
    'Speed Demon': {
        'description': 'High miles per gallon and fuel efficient',
        'vehicle_types': ['efficient performance'],
        'features': ['fuel efficiency', 'performance'],
        'preferences': ['economy', 'speed']
    },
    'Practical Life': {
        'description': 'Lower mileage, more performance',
        'vehicle_types': ['performance vehicle'],
        'features': ['powerful', 'dynamic'],
        'preferences': ['performance', 'excitement']
    },
    'Chill': {
        'description': 'For smooth city cruisers like sedans and hatchbacks',
        'vehicle_types': ['sedan', 'hatchback'],
        'features': ['comfortable', 'city-friendly'],
        'preferences': ['comfort', 'practicality']
    },
    'Chaos': {
        'description': 'For rugged rides like SUVs and trucks',
        'vehicle_types': ['SUV', 'truck'],
        'features': ['rugged', 'off-road capable'],
        'preferences': ['adventure', 'capability']
    }
}

# Keep original simple mapping for backwards compatibility
answerChosen = {
    "Sleek Sporty": "For sports cars and sedans",
    "Family & roomy": "For SUVs and minivans",
    "Big mood": "For Hybrid and Electric vehicles",
    "Whatever": "For Gasoline vehicles",
    "Speed Demon": "High miles per gallon and fuel efficient",
    "Practical life": "Lower mileage, more performance",
    "Chill vibes": "For smooth city cruisers like sedans and hatchbacks",
    "Off-road chaos": "For rugged rides like SUVs and trucks"
}

# Create dictionary of chosen cards with their full details
chosenCards = {
    card: CARD_DETAILS.get(card, {
        'description': 'Unknown card type',
        'vehicle_types': [],
        'features': [],
        'preferences': []
    })
    for card in selected_cards
}




# Get API key from environment variable or use the provided one
api_key = os.getenv("GOOGLE_GENAI_API_KEY", "AIzaSyAvKJEnOdDbweHBb_tHD-rLCIdCas8aMRs")
# Client will be initialized lazily when needed
client = None

def _get_client():
    """Get or create the genai client"""
    global client
    if client is None:
        genai_module, _ = _ensure_genai_imported()
        client = genai_module.Client(api_key=api_key)
    return client

# Get the directory where this script is located
script_dir = pathlib.Path(__file__).parent

# Use the CSV file
filepath = script_dir / 'toyota_modal_data.csv'

# Check if file exists
if not filepath.exists():
    raise FileNotFoundError(f"CSV file not found: {filepath}")

# Read CSV file and convert to text format
def read_csv_to_text(csv_path):
    """Read CSV file and return as formatted text string"""
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
    except Exception as e:
        raise ValueError(f"Error reading CSV file: {e}")
    
    if not rows:
        return "No data found in CSV file."
    
    # Get column names
    columns = list(rows[0].keys())
    
    # Format as text - prioritize important columns for readability
    # Important columns that should be prominently displayed
    important_cols = ['base_model', 'trim_name', 'source_url']
    
    # Additional useful columns for recommendations
    useful_cols = ['0_specsLabel', '1_specsLabel', '2_specsLabel', 
                   'primaryFeatures_decodedValue', 'keyFeatures_decodedValue']
    
    # Format header
    text_data = f"Toyota Vehicle Data - {len(rows)} records\n"
    text_data += "=" * 80 + "\n\n"
    text_data += f"Available columns ({len(columns)} total): {', '.join(columns[:20])}...\n\n"
    
    # Format all records with important columns first, skip empty values
    # Limit the amount of data to avoid token limits
    max_text_length = 50000  # Approximate token limit consideration
    text_data_length = len(text_data)
    
    for i, row in enumerate(rows, 1):
        if text_data_length > max_text_length:
            text_data += f"\n... (showing {i-1} of {len(rows)} records to stay within token limits)\n"
            break
            
        record_text = f"\n--- Record {i} ---\n"
        
        # Show important columns first
        for col in important_cols:
            if col in row and row[col] and str(row[col]).strip():
                record_text += f"{col}: {row[col]}\n"
        
        # Show useful columns
        for col in useful_cols:
            if col in row and row[col] and str(row[col]).strip():
                value = str(row[col]).strip()
                if len(value) > 200:
                    value = value[:200] + "..."
                record_text += f"{col}: {value}\n"
        
        # Show a subset of other columns (skip empty values, truncate very long ones)
        # Only include a few key columns to save tokens
        other_cols_shown = 0
        max_other_cols = 5  # Limit number of other columns per record
        
        for col in columns:
            if col not in important_cols and col not in useful_cols and other_cols_shown < max_other_cols:
                value = str(row.get(col, '')).strip()
                # Skip empty values
                if value:
                    # Truncate very long values to save tokens
                    if len(value) > 150:
                        value = value[:150] + "..."
                    record_text += f"{col}: {value}\n"
                    other_cols_shown += 1
        
        text_data += record_text
        text_data_length += len(record_text)
    
    print(f"CSV data formatted: {len(text_data)} characters")
    return text_data

# Load CSV data once at the start (will be included in every request)
try:
    print("Loading CSV data...")
    csv_text = read_csv_to_text(filepath)
    # Store CSV text as a string - will be passed directly in contents
    csv_data = csv_text
    print("CSV data loaded successfully!")
except Exception as e:
    print(f"Error loading CSV data: {e}")
    raise

# Build user preferences string from chosen cards
def get_preferences_from_cards():
    if not chosenCards:
        return "no specific preferences provided"
    
    preferences = []
    vehicle_types = set()
    features = set()
    
    for card_info in chosenCards.values():
        vehicle_types.update(card_info.get('vehicle_types', []))
        features.update(card_info.get('features', []))
        preferences.extend(card_info.get('preferences', []))
    
    return (f"looking for vehicles that are {', '.join(features)} "
            f"with a focus on {', '.join(preferences)}, "
            f"particularly interested in {', '.join(vehicle_types)}")

# System prompt for the assistant
system_prompt = (
    f"You are a Toyota vehicle matching expert. Based on this complete customer profile:\n"
    f"- Budget Range: {budget}\n"
    f"- Credit Score Range: {creditScore}\n"
    f"- Down Payment: ${downPayment}\n"
    f"- Payment Period: {paymentPeriod} months\n"
    f"- Annual Mileage: {annualMileage}k miles\n"
    f"- Lease Duration: {leaseMonths} months\n"
    f"- Style Preferences: {get_preferences_from_cards()}\n"
    f"- User's life style: {chosenCards}\n"
    "Using the Toyota vehicle data provided in the CSV file and their profile above, "
    "to refine the recommendations. Focus on vehicles within their budget and "
    "financing terms. Recommend vehicles that align with their style preferences and lifestyle and are closest to their budget.\n\n"
    "IMPORTANT: Return your top 3 recommendations in the following JSON format:\n"
    "{\n"
    '  "recommendations": [\n'
    '    {"rank": 1, "base_model": "Model Name", "trim_name": "Trim Name", "reason": "Brief reason"},\n'
    '    {"rank": 2, "base_model": "Model Name", "trim_name": "Trim Name", "reason": "Brief reason"},\n'
    '    {"rank": 3, "base_model": "Model Name", "trim_name": "Trim Name", "reason": "Brief reason"}\n'
    "  ]\n"
    "}\n"
    "Only return valid JSON, no additional text before or after."
)



def parse_recommendations(response_text):
    """
    Parse the AI response to extract vehicle recommendations.
    Returns a list of dictionaries with rank, base_model, trim_name, and reason.
    """
    if not response_text:
        print("[PARSE] ERROR: Empty response text")
        return []
    
    print(f"[PARSE] Attempting to parse response (length: {len(response_text)})")
    
    try:
        # Try to extract JSON from the response - improved regex to handle nested structures
        # Look for JSON object with recommendations array
        json_match = re.search(r'\{\s*"recommendations"\s*:\s*\[.*?\]\s*\}', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            print(f"[PARSE] Found JSON match: {json_str[:200]}...")
            data = json.loads(json_str)
            recs = data.get('recommendations', [])
            if recs:
                print(f"[PARSE] Successfully parsed {len(recs)} recommendations from JSON")
                return recs
        
        # Fallback: try to parse the entire response as JSON
        print("[PARSE] Trying to parse entire response as JSON...")
        data = json.loads(response_text.strip())
        recs = data.get('recommendations', [])
        if recs:
            print(f"[PARSE] Successfully parsed {len(recs)} recommendations from full JSON")
            return recs
    except json.JSONDecodeError as e:
        print(f"[PARSE] JSON decode error: {e}")
        print("[PARSE] Attempting text-based parsing...")
    
    # If JSON parsing fails, try to extract vehicle names from text
    recommendations = []
    lines = response_text.split('\n')
    
    print(f"[PARSE] Parsing {len(lines)} lines of text...")
    
    for i, line in enumerate(lines):
        # Look for patterns like "1. Model Trim" or "Rank 1: Model Trim" or "1st: Model Trim"
        # Improved regex to catch more patterns
        patterns = [
            r'(?:^|\s)(?:#|(\d+)\.?|Rank\s*(\d+)|(\d+)(?:st|nd|rd|th)):?\s*([A-Za-z\s]+?)\s+([A-Za-z0-9\s\-]+?)(?:\s|$|:|,|\n)',
            r'(\d+)\.\s*([A-Za-z\s]+?)\s+([A-Za-z0-9\s\-]+?)(?:\s|$|:)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                groups = match.groups()
                # Extract rank (could be in different groups)
                rank = None
                for g in groups[:3]:
                    if g and g.isdigit():
                        rank = int(g)
                        break
                
                if not rank:
                    rank = len(recommendations) + 1
                
                # Extract model and trim (usually in last groups)
                base_model = groups[-2].strip() if len(groups) >= 2 else ""
                trim_name = groups[-1].strip() if len(groups) >= 1 else ""
                
                # Clean up model/trim names
                base_model = re.sub(r'^[0-9\.\s]+', '', base_model).strip()
                trim_name = re.sub(r'[^\w\s\-]', '', trim_name).strip()
                
                if rank <= 3 and base_model and trim_name and len(base_model) > 2:
                    recommendations.append({
                        'rank': rank,
                        'base_model': base_model,
                        'trim_name': trim_name,
                        'reason': 'Recommended based on your profile'
                    })
                    print(f"[PARSE] Found recommendation {rank}: {base_model} {trim_name}")
                    break  # Found a match, move to next line
    
    # If we found at least some recommendations, return them
    if recommendations:
        # Sort by rank and return top 3
        recommendations.sort(key=lambda x: x['rank'])
        print(f"[PARSE] Returning {len(recommendations[:3])} parsed recommendations")
        return recommendations[:3]
    
    print("[PARSE] WARNING: Could not parse any recommendations from response")
    print(f"[PARSE] Response preview: {response_text[:500]}")
    # Last resort: return empty list
    return []


def get_recommendations():
    """
    Get vehicle recommendations and return as structured data.
    Returns a list of dictionaries with rank, base_model, trim_name, and reason.
    Reloads financial and quiz data to ensure we have the latest information.
    """
    try:
        # Reload data to ensure we have the latest financials and quiz selections
        form_data, selected_cards = load_latest_data()
        
        print(f"[DEBUG] Loaded form_data keys: {list(form_data.keys())}")
        print(f"[DEBUG] Selected cards: {selected_cards}")
        
        # Check if we have minimum required data
        if not form_data and not selected_cards:
            print("[WARNING] No financial or quiz data found. Using defaults.")
        
        # Update module-level variables for the system prompt
        global budget, creditScore, downPayment, paymentPeriod, annualMileage, leaseMonths, chosenCards
        
        budget = form_data.get('budget', '')
        creditScore = form_data.get('creditScore', '')
        downPayment = form_data.get('downPayment', '')
        paymentPeriod = form_data.get('paymentPeriod', '')
        annualMileage = form_data.get('annualMileage', '')
        leaseMonths = form_data.get('leaseMonths', '')
        
        # Rebuild chosenCards from selected_cards
        chosenCards = {
            card: CARD_DETAILS.get(card, {
                'description': 'Unknown card type',
                'vehicle_types': [],
                'features': [],
                'preferences': []
            })
            for card in selected_cards
        }
        
        print(f"[DEBUG] Budget: {budget}, Credit Score: {creditScore}, Selected Cards: {list(chosenCards.keys())}")
        
        # Rebuild system prompt with fresh data
        current_system_prompt = (
            f"You are a Toyota vehicle matching expert. Based on this complete customer profile:\n"
            f"- Budget Range: {budget}\n"
            f"- Credit Score Range: {creditScore}\n"
            f"- Down Payment: ${downPayment}\n"
            f"- Payment Period: {paymentPeriod} months\n"
            f"- Annual Mileage: {annualMileage}k miles\n"
            f"- Lease Duration: {leaseMonths} months\n"
            f"- Style Preferences: {get_preferences_from_cards()}\n"
            f"- User's life style: {chosenCards}\n"
            "Using the Toyota vehicle data provided in the CSV file and their profile above, "
            "to refine the recommendations. Focus on vehicles within their budget and "
            "financing terms. Recommend vehicles that align with their style preferences and lifestyle and are closest to their budget.\n\n"
            "IMPORTANT: Return your top 3 recommendations in the following JSON format:\n"
            "{\n"
            '  "recommendations": [\n'
            '    {"rank": 1, "base_model": "Model Name", "trim_name": "Trim Name", "reason": "Brief reason"},\n'
            '    {"rank": 2, "base_model": "Model Name", "trim_name": "Trim Name", "reason": "Brief reason"},\n'
            '    {"rank": 3, "base_model": "Model Name", "trim_name": "Trim Name", "reason": "Brief reason"}\n'
            "  ]\n"
            "}\n"
            "Only return valid JSON, no additional text before or after."
        )
        
        # Build the contents list with CSV data and system prompt
        # csv_data is loaded at module level, access it as global
        global csv_data
        if not csv_data:
            print("[ERROR] csv_data is not loaded!")
            return []
        
        contents = [f"{csv_data}\n\n{current_system_prompt}"]
        
        print("[DEBUG] Calling Gemini API...")
        # Generate recommendations using the complete profile
        genai_client = _get_client()
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
        
        print(f"[DEBUG] Received response from API. Response length: {len(response.text) if response.text else 0}")
        print(f"[DEBUG] First 200 chars of response: {response.text[:200] if response.text else 'No response text'}")
        
        # Parse the response
        recommendations = parse_recommendations(response.text)
        
        print(f"[DEBUG] Parsed {len(recommendations)} recommendations")
        if recommendations:
            for rec in recommendations:
                print(f"[DEBUG] - Rank {rec.get('rank')}: {rec.get('base_model')} {rec.get('trim_name')}")
        else:
            print("[WARNING] No recommendations parsed from response")
            print(f"[DEBUG] Full response text: {response.text}")
        
        return recommendations
        
    except ImportError as e:
        print(f"\n[ERROR] Import error: {e}")
        print("This usually means google.genai is not installed. Install it with: pip install google-genai")
        import traceback
        traceback.print_exc()
        return []
    except Exception as e:
        print(f"\n[ERROR] Error generating recommendations: {e}")
        print(f"[ERROR] Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return []


def main():
    """
    Main function to get vehicle recommendations based on user profile.
    """
    print("=" * 70)
    print("Toyota Vehicle Recommendation System")
    print("=" * 70)
    print("\nAnalyzing your profile and preferences...")
    print(f"Budget Range: {budget}")
    print(f"Credit Score: {creditScore}")
    print(f"Style Preferences: {get_preferences_from_cards()}")
    print(f"Selected Cards: {', '.join(chosenCards.keys())}")
    print("\nGenerating personalized recommendations...\n")
    
    recommendations = get_recommendations()
    
    print("Top 3 Recommended Vehicles:")
    print("=" * 70)
    for rec in recommendations:
        print(f"\nRank {rec['rank']}: {rec['base_model']} {rec['trim_name']}")
        print(f"Reason: {rec.get('reason', 'N/A')}")
    print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except Exception as e:
        print(f"Error: {e}")
        print(f"Error type: {type(e).__name__}")
