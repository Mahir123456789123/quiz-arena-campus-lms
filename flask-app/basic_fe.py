import streamlit as st
from chatbot_logic import chatbot_response

# Configure Streamlit page
st.set_page_config(page_title="LMS Gemini Chatbot", page_icon="🤖")

st.title("📚 LMS Chatbot Assistant")
st.markdown("Ask about your progress or deadlines. Try: 'What’s my progress?' or 'Do I have anything due?'")

# Input fields
student_id = st.text_input("👤 Enter your student ID", value="sakshi")
user_input = st.text_input("💬 Type your question")

# Handle chat
if st.button("Send"):
    if student_id and user_input:
        with st.spinner("Thinking..."):
            reply = chatbot_response(user_input, student_id)
        st.markdown("#### 🤖 Chatbot:")
        st.write(reply)
