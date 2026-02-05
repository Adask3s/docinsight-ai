import { useState } from "react";

function ChatWithDocument({ documentText }) {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // [{role: "user"|"ai", text: "..."}]
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    /* nie wysyłamy zapytania jeśli nie ma pytania */
    if (!question) return;
    setLoading(true);
    {
      /* re-render komponentu po otrzymaniu pytania */
    }
    setChatHistory((prev) => [...prev, { role: "user", text: question }]);

    const response = await fetch("http://localhost:5191/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: documentText, question }),
    });
    const data = await response.json();
    {
      /* re-render komponentu po otrzymaniu odpowiedzi */
    }
    const aiMessage =
      data.ok === false
        ? `❌ ${data.error?.message || "Błąd analizy"}`
        : data.data?.answer || "—";

    setChatHistory((prev) => [...prev, { role: "ai", text: aiMessage }]);
    setQuestion("");
    {
      /* odblokowujemy czat */
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px solid #333",
        background: "#181818",
        borderRadius: "10px",
        color: "#f1f1f1",
      }}
    >
      <h3 style={{ color: "#fff" }}>💬 Czat z dokumentem</h3>
      <div
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          background: "#222",
          padding: "1rem",
          marginBottom: "1rem",
          borderRadius: "8px",
          border: "1px solid #333",
        }}
      >
        {/* iterujemy po tablicy chatHistory, callback (=>) zwraca element JSX (cały poniższy div dla konkretnej msg i idx (id)) */}
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              margin: "0.5rem 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background: msg.role === "user" ? "#0057b8" : "#333",
                color: "#fff",
                borderRadius: "16px",
                padding: "0.5rem 1rem",
                maxWidth: "80%",
                wordBreak: "break-word",
                fontWeight: msg.role === "user" ? "bold" : "normal",
                boxShadow:
                  msg.role === "user"
                    ? "0 2px 8px rgba(0,87,184,0.15)"
                    : "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <strong
                style={{ color: msg.role === "user" ? "#aeefff" : "#ffb800" }}
              >
                {msg.role === "user" ? "Ty" : "AI"}:
              </strong>{" "}
              {msg.text}
            </span>
          </div>
        ))}
        {/* informacja podczas ładowania */}
        {loading && <div style={{ color: "#aaa" }}>AI pisze odpowiedź...</div>}
      </div>
      <textarea
        rows={2}
        style={{
          width: "100%",
          background: "#222",
          color: "#fff",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "0.5rem",
        }}
        value={question}
        /* zmiana stanu przy wpisywaniu pytania */
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Wpisz pytanie..."
        /* blokuejmy możliwośc pytania, gdy czekamy na odpowiedź */
        disabled={loading}
      />
      <button
        onClick={handleAsk}
        /* wyłączony przycisk jeśli ładuje się odpowiedź lub nie wpisano pytania */
        disabled={loading || !question}
        style={{
          marginTop: "0.5rem",
          background: "#0057b8",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "0.5rem 1.5rem",
          fontWeight: "bold",
          cursor: loading || !question ? "not-allowed" : "pointer",
          opacity: loading || !question ? 0.6 : 1,
        }}
      >
        {loading ? "Czekaj..." : "Zadaj pytanie"}
      </button>
    </div>
  );
}

export default ChatWithDocument;
