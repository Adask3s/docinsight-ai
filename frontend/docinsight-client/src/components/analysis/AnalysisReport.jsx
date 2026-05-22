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
    <div className={styles.keywordRow}>
      <div className={styles.keywordHeader}>
        <span>{label}</span>
        <span className={styles.keywordValue}>{value}</span>
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
            <div className={styles.errorText}>
              ❌ {summaryResult.error?.message || "Błąd analizy"}
            </div>
          ) : (
            <div className={styles.summaryText}>
              {summaryResult.data?.summary?.summary || "Brak streszczenia."}
            </div>
          )}

          {summaryResult.ok && (
            <div className={styles.sectionGroup}>
              <h4 className={styles.sectionTitle}>Statystyki tekstu</h4>
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
            <div className={styles.errorText}>
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
              <div className={`${styles.statBox} ${styles.fullWidthStat}`}>
                <span className={styles.statLabel}>Kategorie tematyczne</span>
                <span className={styles.categoryList}>
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
            <div className={styles.errorText}>
              ❌ {riskResult.error?.message || "Nieznany błąd"}
            </div>
          ) : (
            <>
              {/* Ogólny Wynik Ryzyka */}
              {typeof riskResult.data?.risk_score === "number" && (
                <div className={styles.riskScoreBlock}>
                  <div className={styles.riskScoreHeader}>
                    <span className={styles.riskScoreLabel}>
                      Ogólny poziom ryzyka
                    </span>
                    <span
                      className={styles.riskScoreValue}
                      style={{
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
                    className={`${styles.progressBarBg} ${styles.riskScoreBar}`}
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
              <div className={styles.riskIntro}>
                <h4 className={styles.riskHeading}>
                  Wykryte zapalniki (Triggers)
                </h4>
                {Object.keys(riskResult.data?.keyword_frequencies || {})
                  .length === 0 ? (
                  <div className={styles.emptyMessage}>
                    Brak niepokojących słów.
                  </div>
                ) : (
                  <div className={styles.keywordGrid}>
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
                <h4 className={styles.riskHeading}>Zidentyfikowane klauzule</h4>
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
                            <strong className={styles.riskReasonStrong}>
                              Dlaczego:{" "}
                            </strong>{" "}
                            {r?.reason || "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyMessage}>
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
