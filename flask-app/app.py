from flask import Flask, request, jsonify
from chatbot_logic import chatbot_with_data
from config import SUPABASE_URL, SUPABASE_HEADERS
import requests

app = Flask(__name__)

def get_progress(student_id):
    try:
        url = f"{SUPABASE_URL}/progress?student_id=eq.{student_id}"
        res = requests.get(url, headers=SUPABASE_HEADERS)
        data = res.json()
        if not data:
            return "📊 No progress data found."

        result = "📊 Progress Report:\n"
        for item in data:
            percent = round((item["completed_modules"] / item["total_modules"]) * 100)
            result += f"- {item['course_name']}: {percent}% complete\n"
        return result
    except Exception as e:
        return f"❌ Error fetching progress: {str(e)}"


def get_deadlines(student_id):
    try:
        url = f"{SUPABASE_URL}/deadlines?student_id=eq.{student_id}"
        res = requests.get(url, headers=SUPABASE_HEADERS)
        data = res.json()
        if not data:
            return "📅 No upcoming deadlines."

        result = "📅 Upcoming Deadlines:\n"
        for item in data:
            result += f"- {item['course_name']}: {item['task']} due on {item['due_date']}\n"
        return result
    except Exception as e:
        return f"❌ Error fetching deadlines: {str(e)}"


@app.route("/fetch", methods=["POST"])
def fetch_data():
    data = request.json
    student_id = data.get("student_id")
    if not student_id:
        return jsonify({"error": "Missing student_id"}), 400

    progress = get_progress(student_id)
    deadlines = get_deadlines(student_id)

    return jsonify({"progress": progress, "deadlines": deadlines})

@app.route("/chat_with_data", methods=["POST"])
def chat_with_data():
    data = request.json
    student_id = data.get("student_id")
    user_input = data.get("message")
    progress = data.get("progress")
    deadlines = data.get("deadlines")

    if not all([student_id, user_input, progress, deadlines]):
        return jsonify({"error": "Missing fields"}), 400

    response = chatbot_with_data(user_input, student_id, progress, deadlines)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
