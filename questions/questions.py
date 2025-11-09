from google import genai
from google.genai import types
import pathlib
import os
import csv
import json
import requests

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
    if not financials:
        try:
            resp = requests.get('http://127.0.0.1:5000/financials', timeout=1)
        except Exception:
            pass

    if not selected_cards:
        try:
            resp = requests.get('http://127.0.0.1:5000/quiz', timeout=1)
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
client = genai.Client(api_key=api_key)

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
    "financing terms.Recommend vehicles that align with their style preferences and lifestyle and are closet to their budget."
)



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
    
    try:
        # Build the contents list with CSV data and system prompt
        contents = [f"{csv_data}\n\n{system_prompt}"]
        
        # Generate recommendations using the complete profile
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )
        
        print("Top 3 Recommended Vehicles:")
        print("=" * 70)
        print(f"\n{response.text}\n")
        print("=" * 70)
        
    except Exception as e:
        print(f"\nError generating recommendations: {e}")
        print(f"Error type: {type(e).__name__}")

if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except Exception as e:
        print(f"Error: {e}")
        print(f"Error type: {type(e).__name__}")
