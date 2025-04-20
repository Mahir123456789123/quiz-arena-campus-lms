from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import google.generativeai as genai
from config import SUPABASE_URL, SUPABASE_HEADERS, GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

app = Flask(__name__)
CORS(app)


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


def get_quiz_feedback(student_id):
    try:
        url = f"{SUPABASE_URL}/quizzes?student_id=eq.{student_id}"
        res = requests.get(url, headers=SUPABASE_HEADERS)
        data = res.json()
        if not data:
            return "🧪 No quiz data found."

        result = "🧪 Quiz Performance:\n"
        course_scores = {}
        for item in data:
            course = item["course_name"]
            score = item["score"]
            course_scores.setdefault(course, []).append(score)

        for course, scores in course_scores.items():
            avg = round(sum(scores) / len(scores))
            result += f"- {course}: Avg {avg}% from {len(scores)} quizzes\n"
            if avg < 70:
                result += "⚠️ Consider reviewing concepts.\n"
        return result
    except Exception as e:
        return f"❌ Error fetching quizzes: {str(e)}"


def get_goal(student_id):
    try:
        url = f"{SUPABASE_URL}/goals?student_id=eq.{student_id}"
        res = requests.get(url, headers=SUPABASE_HEADERS)
        data = res.json()
        if not data:
            return "🎯 No goal set for today."
        return f"🎯 Today's Goal: {data[0]['goal']}"
    except Exception as e:
        return f"❌ Error fetching goal: {str(e)}"


def get_streak(student_id):
    try:
        url = f"{SUPABASE_URL}/streaks?student_id=eq.{student_id}"
        res = requests.get(url, headers=SUPABASE_HEADERS)
        data = res.json()
        if not data:
            return "Let's start a study streak today 💪"

        streak = data[0]["streak"]
        if streak >= 3:
            return f"🔥 You're on a {streak}-day study streak! Keep it going!"
        elif streak > 0:
            return f"✅ {streak}-day streak started. Stay consistent!"
        else:
            return "Let's start a study streak today 💪"
    except Exception as e:
        return f"❌ Error fetching streak: {str(e)}"


def get_leaderboard(course_name):
    try:
        url = f"{SUPABASE_URL}/leaderboard?course_name=eq.{course_name}&order=score.desc"
        res = requests.get(url, headers=SUPABASE_HEADERS)
        data = res.json()
        if not data:
            return f"🏆 No leaderboard data for {course_name}."
        result = f"🏆 {course_name} Leaderboard:\n"
        for i, entry in enumerate(data, start=1):
            result += f"{i}. {entry['name']} - {entry['score']}%\n"
        return result
    except Exception as e:
        return f"❌ Error fetching leaderboard: {str(e)}"


def chatbot_with_data(user_input, student_id, data_blocks):
    info = "\n\n".join(data_blocks)

    prompt = f"""
    You are a helpful academic assistant. A student has asked you a question. 
    Use the info below to respond accurately and kindly.

    Student ID: {student_id}
    Question: "{user_input}"

    Info:
    {info}
    """

    response = model.generate_content(prompt)
    return response.text.strip()


@app.route("/fetch", methods=["POST"])
def fetch_data():
    data = request.json
    student_id = data.get("student_id")
    if not student_id:
        return jsonify({"error": "Missing student_id"}), 400

    progress = get_progress(student_id)
    deadlines = get_deadlines(student_id)
    quizzes = get_quiz_feedback(student_id)
    goal = get_goal(student_id)
    streak = get_streak(student_id)

    return jsonify({
        "progress": progress,
        "deadlines": deadlines,
        "quizzes": quizzes,
        "goal": goal,
        "streak": streak
    })


@app.route("/chat_with_data", methods=["POST"])
def chat_with_data():
    data = request.json
    student_id = data.get("student_id")
    user_input = data.get("message")

    if not student_id or not user_input:
        return jsonify({"error": "Missing fields"}), 400

    # Auto-gather all data for richer response
    progress = get_progress(student_id)
    deadlines = get_deadlines(student_id)
    quizzes = get_quiz_feedback(student_id)
    goal = get_goal(student_id)
    streak = get_streak(student_id)

    blocks = [progress, deadlines, quizzes, goal, streak]
    response = chatbot_with_data(user_input, student_id, blocks)

    return jsonify({"response": response})


@app.route("/leaderboard", methods=["POST"])
def leaderboard():
    data = request.json
    course_name = data.get("course_name")
    if not course_name:
        return jsonify({"error": "Missing course_name"}), 400
    leaderboard_data = get_leaderboard(course_name)
    return jsonify({"leaderboard": leaderboard_data})


if __name__ == "__main__":
    app.run(debug=True)
