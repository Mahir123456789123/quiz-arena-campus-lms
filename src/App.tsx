
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { ChatButton } from './components/chat/ChatButton';
import ChatBot from './pages/ChatBot';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatBot />} />
      </Routes>
      <ChatButton />
    </Router>
  );
};

export default App;
