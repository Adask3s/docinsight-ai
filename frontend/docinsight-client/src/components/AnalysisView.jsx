import UploadForm from "./UploadForm";
import AnalysisReport from "./AnalysisReport";
import ChatWithDocument from "./ChatWithDocument";
import DocumentsList from "./DocumentsList";
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
}) {
  return (
    <div className={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className={styles.title}>Analiza Dokumentu</h1>
        <button className={styles.button} onClick={goToDashboard}>
          Powrót do Dashboard
        </button>
      </div>

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

      {(summaryResult || classificationResult || riskResult) && (
        <AnalysisReport
          summaryResult={summaryResult}
          classificationResult={classificationResult}
          riskResult={riskResult}
        />
      )}

      {parsedText && <ChatWithDocument documentText={parsedText} />}

      <DocumentsList
        onSelectDocument={() => {}}
        refreshTrigger={0}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}

export default AnalysisView;
