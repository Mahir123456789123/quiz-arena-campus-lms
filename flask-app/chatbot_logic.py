import requests
import config
import google.generativeai as genai

genai.configure(api_key=config.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")


def get_progress(student_id):
    url = f"{config.SUPABASE_URL}/progress?student_id=eq.{student_id}"
    res = requests.get(url, headers=config.SUPABASE_HEADERS)
    if res.status_code != 200:
        return "❌ Couldn't fetch progress."
    data = res.json()
    result = "📊 Progress Report:\n"
    for item in data:
        percent = round((item["completed_modules"] / item["total_modules"]) * 100)
        result += f"- {item['course_name']}: {percent}% complete\n"
    return result


def get_deadlines(student_id):
    url = f"{config.SUPABASE_URL}/deadlines?student_id=eq.{student_id}"
    res = requests.get(url, headers=config.SUPABASE_HEADERS)
    if res.status_code != 200:
        return "❌ Couldn't fetch deadlines."
    data = res.json()
    result = "📅 Upcoming Deadlines:\n"
    for item in data:
        result += f"- {item['course_name']}: {item['task']} due on {item['due_date']}\n"
    return result


def get_quiz_feedback(student_id):
    url = f"{config.SUPABASE_URL}/quizzes?student_id=eq.{student_id}"
    res = requests.get(url, headers=config.SUPABASE_HEADERS)
    if res.status_code != 200:
        return "❌ Couldn't fetch quiz scores."
    data = res.json()
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


def get_goal(student_id):
    url = f"{config.SUPABASE_URL}/goals?student_id=eq.{student_id}"
    res = requests.get(url, headers=config.SUPABASE_HEADERS)
    if res.status_code != 200:
        return "❌ Couldn't fetch goal."
    data = res.json()
    if not data:
        return "🎯 No goal set for today."
    return f"🎯 Today's Goal: {data[0]['goal']}"


def get_streak(student_id):
    url = f"{config.SUPABASE_URL}/streaks?student_id=eq.{student_id}"
    res = requests.get(url, headers=config.SUPABASE_HEADERS)
    if res.status_code != 200:
        return "❌ Couldn't fetch study streak."
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


def get_leaderboard(course_name):
    url = f"{config.SUPABASE_URL}/leaderboard?course_name=eq.{course_name}&order=score.desc"
    res = requests.get(url, headers=config.SUPABASE_HEADERS)
    if res.status_code != 200:
        return "❌ Couldn't fetch leaderboard."
    data = res.json()
    result = f"🏆 {course_name} Leaderboard:\n"
    for i, entry in enumerate(data, start=1):
        result += f"{i}. {entry['name']} - {entry['score']}%\n"
    return result


def chatbot_response(user_input, student_id):
    if "progress" in user_input.lower():
        info = get_progress(student_id)
    elif "deadline" in user_input.lower() or "due" in user_input.lower():
        info = get_deadlines(student_id)
    elif "quiz" in user_input.lower():
        info = get_quiz_feedback(student_id)
    elif "goal" in user_input.lower():
        info = get_goal(student_id)
    elif "streak" in user_input.lower():
        info = get_streak(student_id)
    elif "leaderboard" in user_input.lower():
        # extract course from the message somehow — this is just a placeholder
        course = "Python"  # or dynamically extract from user_input
        info = get_leaderboard(course)
    else:
        info = (
            get_progress(student_id)
            + "\n\n"
            + get_deadlines(student_id)
            + "\n\n"
            + get_quiz_feedback(student_id)
        )

    prompt = f"""
    You are a helpful academic chatbot. Answer this student based on their info.

    ID: {student_id}
    Question: {user_input}
    Info:
    {info}
    """

    response = model.generate_content(prompt)
    return response.text.strip()
