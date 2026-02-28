import { useState } from "react";
import Button from "./Button"; // Używamy Twojego gotowego przycisku!
import styles from "./UploadForm.module.css"; // Importujemy nowe style
import styles2 from "./AnalysisReport.module.css";
import { RiMailSendLine } from "react-icons/ri";
import { FaRegFilePdf } from "react-icons/fa";
import { RiFileAddLine } from "react-icons/ri";
import { RiFile3Line } from "react-icons/ri";

function UploadForm({
  setParsedText,
  parsedText,
  setSummaryResult,
  setClassificationResult,
  setRiskResult,
  summaryResult,
  classificationResult,
  riskResult,
  onSaved,
  isLoggedIn,
}) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(""); // "summary" | "classification" | "risk" | ""

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Wybierz plik przed wysłaniem.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:5191/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Błąd podczas wysyłania");
      const resultJson = await response.json();
      setParsedText(resultJson.text || "");
      setStatus("Plik przetworzony pomyślnie ✅ Możesz teraz analizować.");
      // Resetuj wyniki analizy po nowym uploadzie
      setSummaryResult(null);
      setClassificationResult(null);
      setRiskResult(null);
    } catch (err) {
      setStatus(`❌ Błąd: ${err.message}`);
    }
  };

  const handleSummary = async () => {
    if (!parsedText) {
      setStatus("❗ Nie ma tekstu do analizy.");
      return;
    }
    setLoading("summary");
    setStatus("Analizuję streszczenie...");
    try {
      const response = await fetch("http://localhost:5191/analyze/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: parsedText }),
      });
      if (!response.ok) throw new Error("❌ Błąd podczas analizy.");
      const data = await response.json();

      if (data.ok === false) {
        // ❌ Backend zwrócił error_response
        setSummaryResult(data);
        setStatus(
          `❌ Błąd streszczenia: ${data.error?.message || "Nieznany błąd"}`,
        );
      } else {
        // ✅ normalny wynik
        setSummaryResult(data);
        setStatus("⭐ Streszczenie wygenerowane.");
      }
    } catch (err) {
      setStatus(`❌ Błąd analizy: ${err.message}`);
    }
    setLoading("");
  };

  const handleClassification = async () => {
    if (!parsedText) {
      setStatus("❗ Nie ma tekstu do analizy.");
      return;
    }
    setLoading("classification");
    setStatus("Analizuję klasyfikację...");
    try {
      const response = await fetch(
        "http://localhost:5191/analyze/classification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: parsedText }),
        },
      );
      if (!response.ok) throw new Error("❌ Błąd podczas analizy.");
      const data = await response.json();
      if (data.ok === false) {
        setClassificationResult(data);
        setStatus(
          `❌ Błąd klasyfikacji: ${data.error?.message || "Nieznany błąd"}`,
        );
      } else {
        setClassificationResult(data);
        setStatus("⭐ Klasyfikacja wygenerowana.");
      }
    } catch (err) {
      setStatus(`❌ Błąd analizy: ${err.message}`);
    }
    setLoading("");
  };

  const handleRisk = async () => {
    if (!parsedText) {
      setStatus("❗ Nie ma tekstu do analizy.");
      return;
    }
    setLoading("risk");
    setStatus("Analizuję ryzyka...");
    try {
      const response = await fetch("http://localhost:5191/analyze/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: parsedText }),
      });
      if (!response.ok) throw new Error("❌ Błąd podczas analizy.");
      const data = await response.json();
      if (data.ok === false) {
        setRiskResult(data);
        setStatus(
          `❌ Błąd analizy ryzyka: ${data.error?.message || "Nieznany błąd"}`,
        );
      } else {
        setRiskResult(data);
        setStatus("⭐ Analiza ryzyk wygenerowana.");
      }
    } catch (err) {
      setStatus(`❌ Błąd analizy: ${err.message}`);
    }
    setLoading("");
  };

  const handleSaveAnalysis = async () => {
    // Walidacja – wszystkie analizy muszą być OK
    if (!summaryResult?.ok || !classificationResult?.ok || !riskResult?.ok) {
      setStatus(
        "❌ Potrzebujesz kompletnej analizy, aby zapisać dokument do historii.",
      );
      return;
    }

    const payload = {
      fileName: file?.name || "document.pdf",
      summary: summaryResult.data,
      classification: classificationResult.data,
      risk: riskResult.data,
    };

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch("http://localhost:5191/documents/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      setStatus(json.message || "✅ Analiza zapisana.");
      if (onSaved) onSaved();
    } catch (err) {
      setStatus("❌ Błąd podczas zapisywania: " + err.message);
    }
  };

  return (
    <div className={styles2.card}>
      <h2 className={styles.header}>
        <FaRegFilePdf size={20} /> Prześlij dokument do analizy
      </h2>
      <div className={styles.uploadRow}>
        <label className={styles.customFileDrop}>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
          <div className={styles.dropText}>
            {/* Dynamiczne wyświetlanie nazwy pliku lub zachęty do wgrania */}
            {file ? (
              <>
                <RiFile3Line size={20} />
                Wybrano: <span className={styles.fileName}>{file.name}</span>
              </>
            ) : (
              <>
                <RiFileAddLine size={20} />
                Kliknij tutaj, aby wybrać plik PDF z dysku
              </>
            )}
          </div>
        </label>
        <Button variant="primary" onClick={handleUpload}>
          Wyślij plik
          <RiMailSendLine size={20} />
        </Button>
      </div>

      {status && <div className={styles.statusMessage}>{status}</div>}

      {parsedText && (
        <div className={styles.textPreviewContainer}>
          <h3
            style={{
              color: "#e0f2fe",
              fontSize: "1.1rem",
              marginBottom: "0.5rem",
            }}
          >
            Rozpoznany tekst (Podgląd)
          </h3>
          <pre className={styles.textPreview}>{parsedText}</pre>

          <div className={styles.buttonGroup}>
            <Button
              variant="secondary"
              onClick={handleSummary}
              disabled={loading !== ""}
            >
              {loading === "summary" ? "Czekaj..." : "Streść dokument 🧠"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClassification}
              disabled={loading !== ""}
            >
              {loading === "classification" ? "Czekaj..." : "Klasyfikuj 🏷️"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleRisk}
              disabled={loading !== ""}
            >
              {loading === "risk" ? "Czekaj..." : "Analizuj ryzyko ⚠️"}
            </Button>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: "1rem",
            }}
          >
            <Button
              variant="primary"
              onClick={handleSaveAnalysis}
              disabled={!isLoggedIn}
            >
              Zapisz wyniki w historii 💾
            </Button>
            {!isLoggedIn && (
              <div
                style={{
                  color: "#ff8080",
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                }}
              >
                Musisz być zalogowany, aby zapisać dokument do historii.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadForm;
