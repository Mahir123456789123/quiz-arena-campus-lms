import requests
import config
import google.generativeai as genai

genai.configure(api_key=config.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

def get_progress(student_id):
    url = f"{config.SUPABASE_URL}/progress?student_id=eq.{student_id}"
    res = requests.get(url, headers=config.SUPABASE_HEADERS)
    if res.status_code != 200:
        return "Couldn't fetch progress."
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
        return "Couldn't fetch deadlines."
    data = res.json()
    result = "📅 Upcoming Deadlines:\n"
    for item in data:
        result += f"- {item['course_name']}: {item['task']} due on {item['due_date']}\n"
    return result

def chatbot_response(user_input, student_id):
    if "progress" in user_input.lower():
        info = get_progress(student_id)
    elif "deadline" in user_input.lower() or "due" in user_input.lower():
        info = get_deadlines(student_id)
    else:
        info = get_progress(student_id) + "\n\n" + get_deadlines(student_id)

    prompt = f"""
    You are a helpful academic chatbot. Answer this student based on their info.

    ID: {student_id}
    Question: {user_input}
    Info:
    {info}
    """

    response = model.generate_content(prompt)
    return response.text.strip()
