from flask import Flask, render_template, request, jsonify
import json
import pathlib

# File paths for persisting data
FINANCIALS_FILE = pathlib.Path(__file__).parent / 'latest_financials.json'
QUIZ_FILE = pathlib.Path(__file__).parent / 'latest_quiz.json'

# Optional: enable CORS so a frontend running on another port (e.g. Next.js on 3000)
try:
    from flask_cors import CORS
except Exception:
    CORS = None

app = Flask(__name__)
if CORS:
    CORS(app)


# Fallback CORS headers in case flask_cors isn't installed or configured.
# This ensures browser fetch requests from localhost:3000 (Next dev) won't be blocked.
@app.after_request
def add_cors_headers(response):
    response.headers.setdefault('Access-Control-Allow-Origin', '*')
    response.headers.setdefault('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response


@app.route('/financials', methods=['GET', 'POST'])
def financials_page():
    """Endpoint for receiving financial form data from the frontend.

    - GET: returns a short instruction string
    - POST: accepts JSON payload and returns a JSON acknowledgement
    """
    if request.method == 'POST':
        data = request.get_json(force=True) or {}

        # Extract fields from JSON body (keys should match the front-end payload)
        name = data.get('name')
        budget = data.get('budget')
        creditScore = data.get('creditScore')
        downPayment = data.get('downPayment')
        paymentPeriod = data.get('paymentPeriod')
        annualMileage = data.get('annualMileage')
        leaseMonths = data.get('leaseMonths')

        # Log for debugging — this will print to the Flask server terminal
        print(
            f"[financials POST] Name: {name}, Budget: {budget}, Credit Score: {creditScore}, "
            f"Down Payment: {downPayment}, Payment Period: {paymentPeriod}, "
            f"Annual Mileage: {annualMileage}, Lease Months: {leaseMonths}"
        )

        # You can add processing here (store, compute, etc.)

        # Persist the received data to a JSON file so other scripts (e.g. questions.py)
        # can read it without requiring an HTTP call.
        try:
            with FINANCIALS_FILE.open('w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to write form data to file: {e}")

        # Return acknowledgement and echo back received data
        return jsonify(success=True, received=data), 200

    # For GET requests, return usage instructions
    return (
        "Send a JSON POST to this endpoint with keys: name, budget, creditScore, downPayment, paymentPeriod, annualMileage, leaseMonths"
    )


@app.route('/quiz', methods=['GET', 'POST'])
def quiz_page():
    """Endpoint for receiving selected cards from the quiz page.

    - GET: returns the latest quiz selections
    - POST: accepts JSON payload with selectedCards array
    """
    if request.method == 'POST':
        data = request.get_json(force=True) or {}
        selected_cards = data.get('selectedCards', [])

        # Log received cards
        print(f"[quiz POST] Selected cards: {selected_cards}")

        # Store to file for questions.py to read
        try:
            with QUIZ_FILE.open('w', encoding='utf-8') as f:
                json.dump({'selectedCards': selected_cards}, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to write quiz data to file: {e}")

        return jsonify(success=True, received=data), 200

    # GET: return the latest quiz selections
    try:
        if QUIZ_FILE.exists():
            with QUIZ_FILE.open('r', encoding='utf-8') as f:
                quiz_data = json.load(f)
                return jsonify(quiz_data), 200
        else:
            return jsonify({'selectedCards': []}), 200
    except Exception as e:
        print(f"Failed to read quiz data: {e}")
        return jsonify({'selectedCards': []}), 200


@app.route('/recommendations', methods=['GET'])
def recommendations_page():
    """Endpoint for getting vehicle recommendations.
    
    - GET: returns top 3 vehicle recommendations based on financials and quiz data
    """
    try:
        # Import here to avoid circular imports and ensure data is loaded
        from questions import get_recommendations
        
        print("[Flask] Calling get_recommendations()...")
        # Get recommendations
        recommendations = get_recommendations()
        
        print(f"[Flask] Received {len(recommendations) if recommendations else 0} recommendations")
        
        if not recommendations:
            print("[Flask] WARNING: No recommendations returned. Check server logs for details.")
            return jsonify({
                'success': False,
                'error': 'No recommendations generated. Check server console for details.',
                'recommendations': []
            }), 200
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
        print(f"[Flask] ERROR generating recommendations: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'recommendations': []
        }), 500

#def caculatePayment()

if __name__ == '__main__':
    app.run(debug=True)