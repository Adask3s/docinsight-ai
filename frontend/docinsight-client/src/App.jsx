import { useState } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import AnalysisView from "./components/analysis/AnalysisView";
import AuthPanel from "./components/auth/AuthPanel";

function App() {
  const [parsedText, setParsedText] = useState("");
  const [summaryResult, setSummaryResult] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("jwt_token"),
  );
  const [currentView, setCurrentView] = useState("dashboard"); // "dashboard" | "analysis"

  // NOWY STAN: Czy jesteśmy w trybie historii? stan ten jest potrzebny, żeby po kliknięciu "View" w historii przełączyć się na widok analizy i pokazać dane z wybranego dokumentu, bez wyświetlania pustego upload formu (bo w historii nie ma pełnego tekstu PDF, więc upload form byłby mylący)
  const [isHistoryView, setIsHistoryView] = useState(false);

  // FUNKCJA Pobiera dane z historii i ustawia stany
  const handleLoadDocument = async (docId) => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/documents/${docId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        alert("Error: Failed to load document analysis");
        return;
      }

      const data = await response.json();

      // Wypełniamy stany danymi z bazy, tak jakby właśnie przyszły z analizy
      setSummaryResult({
        ok: true,
        data: data.summary,
      });

      setClassificationResult({
        ok: true,
        data: data.classification,
      });

      setRiskResult({
        ok: true,
        data: data.risk,
      });

      // Ustawiamy informację tekstową (bo backend nie trzyma pełnego tekstu PDF)
      setParsedText(
        "This is the original text of the document. Full text is not stored in the database for security reasons.",
      );

      setIsHistoryView(true); // Włączamy tryb historii!
      // Przełączamy widok na analizę
      setCurrentView("analysis");
    } catch (err) {
      console.error(err);
      alert("Failed to load document analysis.");
    }
  };

  // Funkcja przejścia do nowej analizy (czyszczenie stanu)
  const handleNewAnalysis = () => {
    setParsedText("");
    setSummaryResult(null);
    setClassificationResult(null);
    setRiskResult(null);
    setIsHistoryView(false); // Wyłączamy tryb historii (nowy dokument)
    setCurrentView("analysis");
  };

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
      goToAnalysis={handleNewAnalysis} // Używamy funkcji do przejścia do analizy, która czyści stany i wyłącza tryb historii
      // PRZEKAZUJEMY FUNKCJĘ DO DASHBOARDU
      onLoadDocument={handleLoadDocument}
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
      isHistoryView={isHistoryView} // Przekazujemy flagę do widoku
    />
  );
}

export default App;
