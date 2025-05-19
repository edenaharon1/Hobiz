import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatPage.module.css";
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(prevResponse =>
      prevResponse ? `${prevResponse}\nYou: ${prompt}` : `You: ${prompt}`
    );
    setPrompt("");

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      setResponse(prevResponse =>
        prevResponse ? `${prevResponse}\nAI: ${data.reply}` : `AI: ${data.reply}`
      );
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBackHome = () => {
    navigate("/home");
  };

  return (
    <div className={styles.chatContainer}>
      <header className={styles.chatHeader}>
        <h1 className={styles.chatTitle}>AI Advisor</h1>
        <button className={styles.backButton} onClick={goBackHome}>
          ← Back
        </button>
      </header>

      <div className={styles.chatIntro}>
        <p className={styles.chatDescription}>
          Tell the AI about your personality and what you’re drawn to — let it suggest a hobby that perfectly suits your character.
        </p>
      </div>

      <main ref={chatMessagesRef} className={styles.chatMessages}>
        {response && response.split('\n').map((line, index) => {
          const isUser = line.startsWith('You:');
          return (
            <div key={index} className={`${styles.responseContainer} ${isUser ? styles.userResponse : styles.botResponse}`}>
              <p className={styles.responseText}>{line}</p>
            </div>
          );
        })}
        {error && <div className={styles.error}>{error}</div>}
      </main>

      <footer className={styles.chatInputArea}>
        <input
          type="text"
          className={styles.chatInput}
          placeholder="Type a message..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              handleSubmit(e);
            }
          }}
        />
        <button onClick={handleSubmit} className={styles.sendButton} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </footer>
    </div>
  );
};

export default ChatPage;
