from flask import Flask, request, jsonify
from chatbot import send_message, activate_message, wait_for_completion, list_messages, get_or_create_thread_and_summary
import os

app = Flask(__name__)

# Thread 및 Partner ID 초기화
thread_id = get_or_create_thread_and_summary()
partner_id = os.getenv("REACT_APP_PARTNER_ID")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # OpenAI와 대화
        send_message(thread_id, user_message)
        run_id = activate_message(thread_id, partner_id)
        wait_for_completion(thread_id, run_id)
        assistant_response = list_messages(thread_id)

        return jsonify({"response": assistant_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
