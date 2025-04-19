from flask import Flask, request, jsonify
from chatbot_logic import chatbot_response

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    student_id = data.get("student_id")
    user_input = data.get("message")

    if not student_id or not user_input:
        return jsonify({"error": "Missing 'student_id' or 'message'"}), 400

    response = chatbot_response(user_input, student_id)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
