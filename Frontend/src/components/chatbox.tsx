import { useState } from "react";
import "./ChatBox.css"; // מייבא את ה-CSS החדש

interface Message {
  from: "user" | "bot";
  text: string;
}

function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async (): Promise<void> => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);

    const response = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    // הדפסה של התשובה הגולמית
    const raw = await response.text();
    console.log("Raw response from server:", raw);

    interface ChatResponse {
      reply: string;
    }

    // מנסים לפרסר את התשובה ל-JSON
    let data: ChatResponse;
    try {
      data = JSON.parse(raw);
      console.log("Parsed data.reply:", data.reply);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      data = { reply: "שגיאה בפענוח התשובה מהשרת" };
    }

    setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    setInput("");
  };

  const goBackHome = () => {
    // כאן אפשר להוסיף ניתוב חזרה או window.location
    window.location.href = "/";
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <button className="back-button" onClick={goBackHome}>
          ← חזור
        </button>
        <h1 className="chat-title">צ'אט עם AI</h1>
      </header>

      <main className="chat-messages">
        {messages.length === 0 && (
          <p className="chat-empty">כתוב הודעה כדי להתחיל שיחה</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${
              msg.from === "user" ? "from-user" : "from-bot"
            }`}
          >
            <span className="message-from">{msg.from === "user" ? "אתה" : "AI"}:</span>{" "}
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
      </main>

      <footer className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="כתוב הודעה..."
          className="chat-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage} className="send-button">
          שלח
        </button>
      </footer>
    </div>
  );
}

export default ChatBox;
