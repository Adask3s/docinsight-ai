import styles from "./AnalysisReport.module.css";

// --- SUBKOMPONENTY ---

function Stat({ label, value }) {
  return (
    <div className={styles.statBox}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function SeverityBadge({ level }) {
  const map = {
    wysokie: {
      bg: "rgba(170, 43, 43, 0.2)",
      border: "#aa2b2b",
      text: "#ffb3b3",
    },
    średnie: {
      bg: "rgba(176, 110, 25, 0.2)",
      border: "#b06e19",
      text: "#ffd9a1",
    },
    niskie: {
      bg: "rgba(62, 122, 62, 0.2)",
      border: "#3e7a3e",
      text: "#b9f2b3",
    },
  };
  const theme = map[level] ?? map["średnie"];

  return (
    <span
      className={styles.badge}
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
      }}
    >
      {level}
    </span>
  );
}

function KeywordBar({ label, value, max }) {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.85rem",
          color: "#ccc",
          marginBottom: "4px",
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: "bold" }}>{value}</span>
      </div>
      <div className={styles.progressBarBg}>
        <div
          className={styles.progressBarFill}
          style={{
            width: `${width}%`,
            background: "var(--accent-blue)",
            boxShadow: "0 0 8px rgba(0, 87, 184, 0.8)",
          }}
        />
      </div>
    </div>
  );
}

// --- GŁÓWNY KOMPONENT ---

export default function AnalysisReport({
  summaryResult,
  classificationResult,
  riskResult,
}) {
  const riskKeywords = riskResult?.data?.keyword_frequencies || {};
  const maxRiskKw = Object.values(riskKeywords).reduce(
    (m, v) => Math.max(m, v),
    0,
  );

  return (
    <div className={styles.reportContainer}>
      {/* KARTA 1: STRESZCZENIE */}
      {summaryResult && (
        <section className={styles.card}>
          <h3 className={styles.cardHeader}>Streszczenie 🧠</h3>

          {summaryResult.ok === false ? (
            <div style={{ color: "#ff8080" }}>
              ❌ {summaryResult.error?.message || "Błąd analizy"}
            </div>
          ) : (
            <div className={styles.summaryText}>
              {summaryResult.data?.summary?.summary || "Brak streszczenia."}
            </div>
          )}

          {summaryResult.ok && (
            <div style={{ marginTop: "1.5rem" }}>
              <h4
                style={{
                  color: "#aaa",
                  fontSize: "0.9rem",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                Statystyki tekstu
              </h4>
              <div className={styles.statsGrid}>
                <Stat
                  label="Liczba słów"
                  value={
                    summaryResult.data?.visualization_data?.length_in_words ??
                    "—"
                  }
                />
                <Stat
                  label="Śr. dł. zdania"
                  value={
                    summaryResult.data?.visualization_data
                      ?.avg_sentence_length ?? "—"
                  }
                />
                <Stat
                  label="Top słowo"
                  value={
                    Object.keys(
                      summaryResult.data?.visualization_data?.top_words || {},
                    )[0] || "—"
                  }
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* KARTA 2: KLASYFIKACJA */}
      {classificationResult && (
        <section className={styles.card}>
          <h3 className={styles.cardHeader}>Klasyfikacja Dokumentu 🏷️</h3>
          {classificationResult.ok === false ? (
            <div style={{ color: "#ff8080" }}>
              ❌ {classificationResult.error?.message || "Błąd analizy"}
            </div>
          ) : (
            <div className={styles.statsGrid}>
              <Stat
                label="Typ dokumentu"
                value={
                  classificationResult.data?.classification?.type || "Nieznany"
                }
              />
              <div className={styles.statBox} style={{ gridColumn: "span 2" }}>
                <span className={styles.statLabel}>Kategorie tematyczne</span>
                <span
                  style={{
                    color: "var(--accent-blue)",
                    fontWeight: 500,
                    marginTop: "4px",
                  }}
                >
                  {classificationResult.data?.classification?.categories?.join(
                    ", ",
                  ) || "—"}
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* KARTA 3: RYZYKA */}
      {riskResult && (
        <section className={styles.card}>
          <h3 className={styles.cardHeader}>Analiza Ryzyka ⚠️</h3>

          {riskResult.ok === false ? (
            <div style={{ color: "#ff8080" }}>
              ❌ {riskResult.error?.message || "Nieznany błąd"}
            </div>
          ) : (
            <>
              {/* Ogólny Wynik Ryzyka */}
              {typeof riskResult.data?.risk_score === "number" && (
                <div style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      Ogólny poziom ryzyka
                    </span>
                    <span
                      style={{
                        fontSize: "2rem",
                        fontWeight: 800,
                        color:
                          riskResult.data.risk_score > 70
                            ? "#ff4d4d"
                            : riskResult.data.risk_score > 40
                              ? "#ffb800"
                              : "#4caf50",
                      }}
                    >
                      {riskResult.data.risk_score}%
                    </span>
                  </div>
                  <div
                    className={styles.progressBarBg}
                    style={{ height: "12px" }}
                  >
                    <div
                      className={styles.progressBarFill}
                      style={{
                        width: `${riskResult.data.risk_score}%`,
                        background:
                          riskResult.data.risk_score > 70
                            ? "linear-gradient(90deg, #b80000, #ff4d4d)"
                            : riskResult.data.risk_score > 40
                              ? "linear-gradient(90deg, #b88600, #ffb800)"
                              : "linear-gradient(90deg, #006600, #4caf50)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Słowa kluczowe */}
              <div style={{ marginBottom: "2rem" }}>
                <h4
                  style={{
                    color: "#aaa",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  Wykryte zapalniki (Triggers)
                </h4>
                {Object.keys(riskResult.data?.keyword_frequencies || {})
                  .length === 0 ? (
                  <div style={{ color: "#888", fontSize: "0.9rem" }}>
                    Brak niepokojących słów.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "0 2rem",
                    }}
                  >
                    {Object.entries(riskResult.data.keyword_frequencies).map(
                      ([k, v]) => (
                        <KeywordBar
                          key={k}
                          label={k}
                          value={v}
                          max={maxRiskKw}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* Fragmenty wysokiego ryzyka */}
              <div>
                <h4
                  style={{
                    color: "#aaa",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    marginBottom: "1rem",
                  }}
                >
                  Zidentyfikowane klauzule
                </h4>
                {Array.isArray(riskResult.data?.risk_analysis) &&
                riskResult.data.risk_analysis.length > 0 ? (
                  <div>
                    {riskResult.data.risk_analysis.map((r, idx) => {
                      const lvl = (r?.severity || "").toLowerCase();
                      const borderColor =
                        lvl === "wysokie"
                          ? "#aa2b2b"
                          : lvl === "średnie"
                            ? "#b06e19"
                            : "#3e7a3e";

                      return (
                        <div
                          key={idx}
                          className={styles.riskItem}
                          style={{ borderLeftColor: borderColor }}
                        >
                          <div className={styles.riskHeader}>
                            <span>Oznaczony fragment</span>
                            <SeverityBadge level={lvl} />
                          </div>
                          <div className={styles.riskText}>
                            “{r?.text_fragment || "—"}”
                          </div>
                          <div className={styles.riskReason}>
                            <strong style={{ color: "#fff" }}>
                              Dlaczego:{" "}
                            </strong>{" "}
                            {r?.reason || "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: "#888", fontSize: "0.9rem" }}>
                    Nie znaleziono niebezpiecznych klauzul.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
