// src/components/ChatWithDocument.jsx
import { useState } from "react";
import Button from "./Button";
import styles from "./ChatWithDocument.module.css"; // 👈 Podpinamy style

function ChatWithDocument({ documentText }) {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    // Zapobieganie wysyłaniu pustych znaków (np. samych spacji)
    if (!question.trim()) return;

    setLoading(true);

    // Zapisujemy treść do wysłania
    const currentQuestion = question.trim();

    // 1. Dodajemy pytanie do widoku
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: currentQuestion },
    ]);

    // 2. UX MENTORING: Natychmiast czyścimy input, zanim przyjdzie odpowiedź!
    setQuestion("");

    try {
      const response = await fetch("http://localhost:5191/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Wysyłamy zmienną currentQuestion, bo 'question' w stanie zostało już wyczyszczone
        body: JSON.stringify({ text: documentText, question: currentQuestion }),
      });

      const data = await response.json();

      const aiMessage =
        data.ok === false
          ? `❌ ${data.error?.message || "Błąd serwera AI"}`
          : data.data?.answer || "Brak odpowiedzi.";

      // 3. Dodajemy odpowiedź AI
      setChatHistory((prev) => [...prev, { role: "ai", text: aiMessage }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: `❌ Błąd połączenia: ${err.message}` },
      ]);
    }

    setLoading(false);
  };

  // UX MENTORING: Obsługa entera
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Blokujemy przejście do nowej linii
      handleAsk(); // Wysyłamy wiadomość
    }
  };

  return (
    <div className={styles.chatCard}>
      <h3 className={styles.header}>Czat z Asystentem AI 🤖</h3>

      <div className={styles.messagesArea}>
        {chatHistory.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              color: "#7dd3fc",
              opacity: 0.6,
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            Zadaj pierwsze pytanie dotyczące dokumentu...
          </div>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`${styles.messageWrapper} ${
              msg.role === "user" ? styles.userWrapper : styles.aiWrapper
            }`}
          >
            <span className={styles.roleLabel}>
              {msg.role === "user" ? "Ty" : "DocInsight AI"}
            </span>
            <div
              className={`${styles.messageBubble} ${
                msg.role === "user" ? styles.userBubble : styles.aiBubble
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className={styles.loadingText}>
            AI analizuje i pisze odpowiedź...
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <textarea
          className={styles.textArea}
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown} // 👈 Podpięcie akcji Entera
          placeholder="Zapytaj o szczegóły w dokumencie (Enter, aby wysłać)..."
          disabled={loading}
        />

        {/* Korzystamy z Twojego globalnego komponentu Button! */}
        <Button
          variant="primary"
          onClick={handleAsk}
          disabled={loading || !question.trim()}
          className={styles.submitBtn}
        >
          {loading ? "Wysyłanie..." : "Wyślij"}
        </Button>
      </div>
    </div>
  );
}

export default ChatWithDocument;
