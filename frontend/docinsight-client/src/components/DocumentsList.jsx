import { useEffect, useState } from "react";

function DocumentsList({ onSelectDocument, refreshTrigger, isLoggedIn }) {
  const [documents, setDocuments] = useState([]); // useState([]) to stan początkowy documents - pusta tablica
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        setStatus("Musisz być zalogowany, aby zobaczyć historię dokumentów.");
        setDocuments([]);
        return;
      }
      try {
        const response = await fetch("http://localhost:5191/documents", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Błąd pobierania dokumentów");
        const data = await response.json();
        setDocuments(data);
        setStatus(""); // wyczyść status jeśli się udało
      } catch (err) {
        setStatus("❌ " + err.message);
        setDocuments([]);
      }
    };
    fetchDocuments();
  }, [refreshTrigger, isLoggedIn]); // useEfect() uruchamia się za każdym razem, gdy zmieni się coś w dependencies (czyli w tablicy [refreshTrigger, isLoggedIn]) - refreshTrigger zmienia się po udanym uploadzie, isLoggedIn po zalogowaniu/wylogowaniu

  // Funkcja obsługująca usuwanie dokumentu
  const handleDelete = async (id) => {
    // pobieramy token z localStorage
    const token = localStorage.getItem("jwt_token");

    // jeśli nie ma tokena, to kończymy funkcję
    if (!token) return;

    // okienko potwierdzenia usunięcia
    if (!window.confirm("Czy na pewno chcesz usunąć ten dokument z historii?"))
      // jeśli użytkownik kliknie "Anuluj", to kończymy funkcję
      return;
    try {
      // wysyłamy żądanie DELETE do backendu .NET
      const response = await fetch(`http://localhost:5191/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // dodajemy token uwierzytelniający do nagłówków
        },
      });

      // odbieramy odpowiedź z backendu za pomocą asynchronicznej funkcji .json()
      const data = await response.json();

      // jeśli odpowiedź nie jest ok, to rzucamy błąd
      setStatus(data.message || "Usunięto.");

      // odświeżamy listę po usunięciu
      // ustawiamy nowy stan dla ducuments, filtrując usunięty dokument
      // prev to poprzedni stan documents (ten, któy był do tej pory)
      // używamy funkcji filter(), aby utworzyć nową tablicę bez usuniętego dokumentu
      // zostawiamy więc wszystko dokumenty, których id != id dokumentu, który chcemy usunąć
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setStatus("❌ Błąd usuwania: " + err.message);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>📜 Historia dokumentów</h2>
      {status && <p>{status}</p>}
      {documents.length === 0 ? (
        <p>Brak zapisanych dokumentów.</p>
      ) : (
        <table
          style={{
            width: "100%",
            background: "#1f1f1f",
            borderCollapse: "collapse",
            color: "#f1f1f1",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #333", padding: "0.5rem" }}>
                ID
              </th>
              <th style={{ border: "1px solid #333", padding: "0.5rem" }}>
                Plik
              </th>
              <th style={{ border: "1px solid #333", padding: "0.5rem" }}>
                Data
              </th>
              <th style={{ border: "1px solid #333", padding: "0.5rem" }}>
                Akcja
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td style={{ border: "1px solid #333", padding: "0.5rem" }}>
                  {doc.id}
                </td>
                <td style={{ border: "1px solid #333", padding: "0.5rem" }}>
                  {doc.fileName}
                </td>
                <td style={{ border: "1px solid #333", padding: "0.5rem" }}>
                  {new Date(doc.uploadedAt).toLocaleString()}
                </td>
                {/* <td> to komórka w wierszu, przyciski "Podgląd" i "Usuń" są więc w jednym wierszu, <tr> to wiersz */}
                <td style={{ border: "1px solid #333", padding: "0.5rem" }}>
                  <button onClick={() => onSelectDocument(doc.id)}>
                    🔎 Podgląd
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{ marginLeft: "0.5rem", color: "#ff8080" }}
                    title="Usuń dokument z historii"
                  >
                    🗑 Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DocumentsList;
