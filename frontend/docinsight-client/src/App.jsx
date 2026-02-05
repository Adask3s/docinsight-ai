import { useState } from "react";
import Dashboard from "./components/Dashboard";
import AnalysisView from "./components/AnalysisView";
import AuthPanel from "./components/AuthPanel";

function App() {
  const [parsedText, setParsedText] = useState("");
  const [summaryResult, setSummaryResult] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("jwt_token")
  );
  const [currentView, setCurrentView] = useState("dashboard"); // "dashboard" | "analysis"

  if (!isLoggedIn) {
    return (
      <AuthPanel
        onAuth={() => setIsLoggedIn(!!localStorage.getItem("jwt_token"))}
      />
    );
  }

  return currentView === "dashboard" ? (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem("jwt_token");
        setIsLoggedIn(false);
      }}
      goToAnalysis={() => setCurrentView("analysis")}
    />
  ) : (
    <AnalysisView
      parsedText={parsedText}
      setParsedText={setParsedText}
      summaryResult={summaryResult}
      setSummaryResult={setSummaryResult}
      classificationResult={classificationResult}
      setClassificationResult={setClassificationResult}
      riskResult={riskResult}
      setRiskResult={setRiskResult}
      isLoggedIn={isLoggedIn}
      onSaved={() => {}}
      goToDashboard={() => setCurrentView("dashboard")}
    />
  );
}

export default App;
