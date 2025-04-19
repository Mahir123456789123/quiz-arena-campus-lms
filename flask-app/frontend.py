import streamlit as st
import requests

API_URL = "http://127.0.0.1:5000"

st.set_page_config(page_title="LMS Gemini Chatbot", page_icon="🤖")
st.title("📚 LMS Chatbot Assistant")
st.markdown("Ask about your progress or deadlines. Try: 'What’s my progress?' or 'Do I have anything due?'")

student_id = st.text_input("👤 Enter your student ID", value="sakshi")
user_input = st.text_input("💬 Type your question")

if st.button("Send"):
    if student_id and user_input:
        with st.spinner("Thinking..."):
            fetch = requests.post(f"{API_URL}/fetch", json={"student_id": student_id}).json()
            chat = requests.post(f"{API_URL}/chat_with_data", json={
                "student_id": student_id,
                "message": user_input,
                "progress": fetch.get("progress", ""),
                "deadlines": fetch.get("deadlines", "")
            }).json()
        st.markdown("#### 🤖 Chatbot:")
        st.write(chat.get("response", "Something went wrong."))
