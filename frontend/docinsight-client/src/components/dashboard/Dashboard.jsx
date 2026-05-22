import { useState, useEffect } from "react";
import DocumentsList from "./DocumentsList"; // <--- Importujemy komponent
import styles from "./Dashboard.module.css";
import utils from "../../styles/utils.module.css";
import Button from "../ui/Button"; // Nasz komponent!
import { FaCirclePlus } from "react-icons/fa6"; // Twoja ikona!

function Dashboard({ onLogout, goToAnalysis, onLoadDocument }) {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ saved: 0, latestDate: "-" });
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const DOCUMENT_GOAL = 10; // used to normalize "All Documents" progress (adjustable)

  // 1. Logika pobierania (Fetch)
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;

    try {
      // Bierzemy środkową część tokena (payload) i ją odkodowujemy
      const payloadBase64 = token.split(".")[1];
      // atob dekoduje base64. encode/decodeURIComponent rozwiązuje problem polskich znaków
      const jsonPayload = decodeURIComponent(
        atob(payloadBase64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );

      const decodedToken = JSON.parse(jsonPayload);
      // DEBUG: Wypisujemy zdekodowany token, żeby zobaczyć, jakie mamy klucze do dyspozycji
      // console.log("Zdekodowany JWT:", decodedToken);

      // W systemach .NET adres e-mail często kryje się pod tym długim kluczem lub pod zwykłym "email" / "sub"
      const email =
        decodedToken.email ||
        decodedToken[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] ||
        decodedToken[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] ||
        "User";

      setUserEmail(email);
    } catch (e) {
      console.error("Błąd dekodowania tokena", e);
      setUserEmail("User"); // Fallback w razie błędu
    }

    const fetchDocuments = async () => {
      try {
        const response = await fetch("http://localhost:5191/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Error fetching documents");

        const data = await response.json();
        console.log("GET /documents response:", JSON.stringify(data, null, 2));
        setDocuments(data);

        // Aktualizacja statystyk

        // Skoro endpoint zwraca tylko zapisane analizy, to length jest naszym savedCount
        const savedCount = data.length;
        const latestDate =
          savedCount > 0
            ? new Date(data[0].uploadedAt).toLocaleDateString()
            : "No documents yet";

        setStats({
          saved: savedCount,
          latestDate: latestDate,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load documents. Please try again later.");
      }
    };

    fetchDocuments();
  }, []);

  // 2. Logika usuwania (Delete) - PRZENIESIONA TUTAJ
  const handleDeleteDocument = async (id) => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5191/documents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(errData.message || "Error deleting document");
        return;
      }

      // Aktualizacja stanu po usunięciu
      setDocuments((prevDocs) => {
        const newDocs = prevDocs.filter((doc) => doc.id !== id);
        const newSaved = newDocs.length;
        const newLatestDate =
          newSaved > 0
            ? new Date(newDocs[0].uploadedAt).toLocaleDateString()
            : "Brak dokumentów";

        setStats({ saved: newSaved, latestDate: newLatestDate });
        return newDocs;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the server.");
    }
  };

  // MENTORING: Tutaj liczymy procent dla paska, czysta matematyka wewnątrz renderu.
  const pctSaved =
    DOCUMENT_GOAL === 0
      ? 100
      : Math.min(100, Math.round((stats.saved / DOCUMENT_GOAL) * 100));

  return (
    <div className={utils.bgMain}>
      <div className={utils.blob1}></div>
      <div className={utils.blob2}></div>

      <header className={styles.header}>
        <div>
          <div className={styles.title}>DocInsight AI</div>
          {/* Elegancka pigułka użytkownika */}
          <div className={styles.userInfoBadge}>
            <div className={styles.userAvatar}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span className={styles.userText}>
              Zalogowano jako: <strong>{userEmail}</strong>
            </span>
          </div>
        </div>
        <Button variant="logout" onClick={onLogout}>
          Wyloguj
        </Button>
      </header>

      <section className={styles.statsContainer}>
        {/* KARTA 2: Ostatnia aktywność (sama data, bez paska) */}
        <div className={styles.card}>
          <h3>Ostatnia Analiza</h3>
          <p className={styles.latestDate}>{stats.latestDate}</p>
        </div>
        {/* KARTA 2: Zapisane analizy (z dynamicznym paskiem postępu) */}
        <div className={styles.card}>
          <h3>Zapisane Analizy</h3>
          <p>{stats.saved}</p>
          <div className={styles.progressBar}>
            {/* 👇 TO JEST REACT WAY: Bezpośrednie bindowanie zmiennej do atrybutu style */}
            <div
              className={styles.progressFill}
              style={{ width: `${pctSaved}%` }}
            ></div>
          </div>
        </div>
      </section>

      <div className={styles.heroButtonWrapper}>
        <Button
          variant="primary"
          onClick={goToAnalysis}
          className={styles.heroButton}
        >
          <FaCirclePlus size={24} color="#00bfff" />
          Nowa Analiza
        </Button>
      </div>

      <section className={styles.documentsSection}>
        <h2 className={styles.sectionTitle}>Historia dokumentów</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* UŻYWAMY KOMPONENTU - CZYSTO I ZGODNIE Z DRY */}
        <DocumentsList
          documents={documents}
          onSelectDocument={onLoadDocument} // Funkcja z App.jsx
          onDeleteDocument={handleDeleteDocument} // Funkcja lokalna z Dashboardu
        />
      </section>
    </div>
  );
}

export default Dashboard;
