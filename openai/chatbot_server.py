from flask import Flask, request, jsonify, render_template
from chatbot import send_message, activate_message, wait_for_completion, list_messages, get_partner_id, get_or_create_thread_and_summary

app = Flask(__name__)

# Load partner_id and thread_id
partner_id = get_partner_id()
thread_id = get_or_create_thread_and_summary()

@app.route('/')
def index():
    return render_template('index.html')  # 웹 UI 렌더링

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        # 챗봇 응답 처리
        send_message(thread_id, user_message)
        run_id = activate_message(thread_id, partner_id)
        wait_for_completion(thread_id, run_id)
        partner_response = list_messages(thread_id)

        # 응답 반환 (감정 분석 제외)
        return jsonify({'response': partner_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
