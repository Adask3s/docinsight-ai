// src/components/AnalysisView.jsx
import UploadForm from "./UploadForm";
import AnalysisReport from "./AnalysisReport";
import ChatWithDocument from "./ChatWithDocument";
import Button from "./Button"; // <--- Zmiana: Używamy Twojego gotowego komponentu Button
import styles from "./AnalysisView.module.css";

function AnalysisView({
  parsedText,
  setParsedText,
  summaryResult,
  setSummaryResult,
  classificationResult,
  setClassificationResult,
  riskResult,
  setRiskResult,
  isLoggedIn,
  onSaved,
  goToDashboard,
  isHistoryView, // odbieramy flagę, która mówi nam, czy jesteśmy w trybie historii (czyli przeglądamy zapisany dokument) czy w trybie nowej analizy
}) {
  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.title}>Document Analysis</h1>
        <Button variant="primary" onClick={goToDashboard}>
          Back to Dashboard
        </Button>
      </header>

      {/* GŁÓWNA SIATKA */}
      <div className={styles.contentGrid}>
        {/* LEWA KOLUMNA (Szersza) - Upload i Raport */}
        {/* Formularz pokazuje się TYLKO gdy NIE jesteśmy w historii */}
        <div className={styles.mainColumn}>
          {!isHistoryView && (
            <UploadForm
              setParsedText={setParsedText}
              parsedText={parsedText}
              setSummaryResult={setSummaryResult}
              setClassificationResult={setClassificationResult}
              setRiskResult={setRiskResult}
              summaryResult={summaryResult}
              classificationResult={classificationResult}
              riskResult={riskResult}
              isLoggedIn={isLoggedIn}
              onSaved={onSaved}
            />
          )}

          {/* A jeśli JESTEŚMY w historii, pokażemy ładny komunikat */}
          {isHistoryView && (
            <div
              style={{
                background: "rgba(0, 119, 182, 0.1)",
                border: "1px solid rgba(0, 119, 182, 0.3)",
                color: "#bae6fd",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: 600,
              }}
            >
              Oglądasz archiwalną analizę. Nie możesz jej modyfikować.
            </div>
          )}

          {(summaryResult || classificationResult || riskResult) && (
            <AnalysisReport
              summaryResult={summaryResult}
              classificationResult={classificationResult}
              riskResult={riskResult}
            />
          )}
        </div>

        {/* PRAWA KOLUMNA (Węższa) - Czat */}
        <div className={styles.sideColumn}>
          {parsedText ? (
            <ChatWithDocument documentText={parsedText} />
          ) : (
            /* Zastępczy tekst, gdy dokument nie jest wgrany */
            <div
              style={{
                color: "#bae6fd",
                textAlign: "center",
                padding: "2rem",
                border: "1px dashed rgba(0, 119, 182, 0.4)",
                borderRadius: "12px",
                background: "rgba(0, 87, 184, 0.05)",
              }}
            >
              Upload a document to start chatting with AI.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalysisView;
