import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import utils from "../styles/utils.module.css";

function Dashboard({ onLogout, goToAnalysis }) {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total: 0, saved: 0 });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;

    setUserEmail("user@example.com");

    const fetchDocuments = async () => {
      try {
        const response = await fetch("http://localhost:5191/documents", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Błąd pobierania dokumentów");
        const data = await response.json();
        setDocuments(data);
        setStats({
          total: data.length, // Liczba dokumentów w historii
          saved: data.length, // Wszystkie pobrane z /documents są zapisane
        });

        setTimeout(() => {
          document
            .querySelectorAll(`.${styles.progressFill}`)
            .forEach((el, i) => {
              if (i === 0) el.style.width = `${data.length}%`;
              if (i === 1)
                el.style.width = `${data.filter((d) => d.saved).length}%`;
            });
        }, 200);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className={utils.bgMain}>
      <div className={utils.blob1}></div>
      <div className={utils.blob2}></div>

      <header className={styles.header}>
        <div>
          <div className={styles.title}>DocInsight AI</div>
          <div className={styles.userInfo}>Zalogowany jako: {userEmail}</div>
        </div>
        <button className={styles.button} onClick={onLogout}>
          Wyloguj
        </button>
      </header>

      <section className={styles.statsContainer}>
        <div className={styles.card}>
          <h3>Wszystkie dokumenty</h3>
          <p>{stats.total}</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
        <div className={styles.card}>
          <h3>Zapisane analizy</h3>
          <p>{stats.saved}</p>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
      </section>

      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <button className={styles.button} onClick={goToAnalysis}>
          Analizuj Dokument
        </button>
      </div>

      <section className={styles.documentsSection}>
        <h2>Historia dokumentów</h2>
        {documents.length === 0 ? (
          <p>Brak zapisanych dokumentów.</p>
        ) : (
          <table className={styles.documentsTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Plik</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>{doc.fileName}</td>
                  <td>{new Date(doc.uploadedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
