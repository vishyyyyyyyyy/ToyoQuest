from google import genai
from google.genai import types
import pathlib
import os
import csv
import json
import requests

# Helper: load latest form data that the Flask app writes to latest_financials.json
def load_latest_financials():
    """Try to load form data from latest_financials.json in the same directory.

    Returns a dict with keys: name, budget, creditScore, downPayment, paymentPeriod,
    annualMileage, leaseMonths (values may be None if missing).
    """
    script_dir = pathlib.Path(__file__).parent
    data_file = script_dir / 'latest_financials.json'

    if data_file.exists():
        try:
            with data_file.open('r', encoding='utf-8') as f:
                data = json.load(f)
                return data
        except Exception as e:
            print(f"Failed to read latest_financials.json: {e}")

    # Fallback: try to GET from local Flask endpoint (if running)
    try:
        resp = requests.get('http://127.0.0.1:5000/financials', timeout=1)
        # The GET endpoint returns an instruction string by default; so we don't
        # expect JSON here. Return empty dict in fallback.
    except Exception:
        pass

    return {}

# Expose module-level variables for use elsewhere in the script
form_data = load_latest_financials()
name = form_data.get('name')
budget = form_data.get('budget')
creditScore = form_data.get('creditScore')
downPayment = form_data.get('downPayment')
paymentPeriod = form_data.get('paymentPeriod')
annualMileage = form_data.get('annualMileage')
leaseMonths = form_data.get('leaseMonths')




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

# System prompt for the assistant
system_prompt = "You are a Toyota Financial services employee trying to help customers find the right car for them. Solely using the data provided in the CSV file (toyota_modal_data.csv), ask for their general purpose, how many seats they need, etc." \
        "Using the response, recommend them 3 of the best models that they would like.When you provide the top 3 recommendations. Only ask one question at a time. You can only ask up to 6 questions to the user. Suggest vehicles that are closest to the user's budget and keep the questions as simple as possible!"

def get_conversation_contents(conversation_messages):
    """
    Build the contents list for the API call.
    Includes CSV data, system prompt, and conversation history.
    
    Args:
        conversation_messages: List of previous messages in the conversation
    
    Returns:
        Complete contents list for the API call
    """
    # Start with CSV data and system prompt as a single combined message
    # Format: CSV data followed by system instructions
    combined_data = f"{csv_data}\n\n{system_prompt}"
    contents = [combined_data]
    
    # Add all conversation messages (user and assistant alternates)
    contents.extend(conversation_messages)
    
    return contents

def get_assistant_response(user_message, conversation_messages):
    """
    Get response from the assistant based on user message and conversation history.
    
    Args:
        user_message: The user's input message
        conversation_messages: List of previous messages in the conversation
    
    Returns:
        The assistant's response text
    """
    # Add user message to conversation history
    conversation_messages.append(user_message)
    
    # Build the complete contents list
    contents = get_conversation_contents(conversation_messages)
    
    # Generate response using the full conversation history
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents
    )
    
    # Get assistant response
    assistant_response = response.text
    
    # Add assistant response to conversation history for next turn
    conversation_messages.append(assistant_response)
    
    return assistant_response

def main():
    """
    Main function to handle multi-turn conversations.
    """
    print("=" * 70)
    print("Toyota Car Recommendation Assistant")
    print("=" * 70)
    print("Type 'quit', 'exit', or 'bye' to end the conversation.\n")
    
    # Initialize conversation messages list
    # Format: [assistant_greeting, user_msg1, assistant_msg1, user_msg2, assistant_msg2, ...]
    conversation_messages = []
    
    # Start the conversation with the greeting (assistant's first message)
    initial_greeting = "Welcome to Toyota, what kind of vehicle are you looking for today?"
    print(f"Assistant: {initial_greeting}\n")
    # Add initial greeting as the assistant's first message in conversation history
    conversation_messages.append(initial_greeting)
    
    # Main conversation loop
    while True:
        # Get user input
        user_input = input("You: ").strip()
        
        # Check if user wants to exit
        if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
            print("\nThank you for using Toyota Car Recommendation Assistant. Goodbye!")
            break
        
        # Skip empty input
        if not user_input:
            continue
        
        try:
            # Get and display assistant response
            # This will add user_input and response to conversation_messages
            response = get_assistant_response(user_input, conversation_messages)
            print(f"\nAssistant: {response}\n")
        except Exception as e:
            print(f"\nError: {e}")
            print(f"Error type: {type(e).__name__}")
            print("Please try again or type 'quit' to exit.\n")

if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except Exception as e:
        print(f"Error: {e}")
        print(f"Error type: {type(e).__name__}")
