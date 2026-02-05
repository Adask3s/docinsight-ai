function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#1f1f1f",
        border: "1px solid #333",
        borderRadius: 8,
        padding: "0.75rem 1rem",
        display: "flex",
        justifyContent: "space-between",
        color: "#eaeaea",
      }}
    >
      <span style={{ color: "#aaa" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SeverityBadge({ level }) {
  const map = {
    wysokie: {
      bg: "#5a1a1a",
      border: "#aa2b2b",
      text: "#ffb3b3",
      label: "Wysokie",
    },
    średnie: {
      bg: "#5a3f1a",
      border: "#b06e19",
      text: "#ffd9a1",
      label: "Średnie",
    },
    niskie: {
      bg: "#2e4d2e",
      border: "#3e7a3e",
      text: "#b9f2b3",
      label: "Niskie",
    },
  };
  const theme = map[level] ?? map["średnie"];
  return (
    <span
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        borderRadius: 999,
        padding: "0.15rem 0.6rem",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {theme.label}
    </span>
  );
}

function KeywordBar({ label, value, max }) {
  const width = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#ccc",
          fontSize: 12,
        }}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div
        style={{
          background: "#242424",
          border: "1px solid #333",
          borderRadius: 6,
          height: 10,
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            background: "#0057b8",
            borderRadius: 6,
            boxShadow: "0 0 6px rgba(0, 87, 184, 0.5)",
          }}
        />
      </div>
    </div>
  );
}

export default function AnalysisReport({
  summaryResult,
  classificationResult,
  riskResult,
}) {
  // Ryzyka (słowa + max do keyword bar)
  const riskKeywords = riskResult?.data?.keyword_frequencies || {};

  const maxRiskKw = Object.values(riskKeywords).reduce(
    (m, v) => Math.max(m, v),
    0
  );

  return (
    <div
      style={{
        marginTop: "2rem",
        background: "#181818",
        border: "1px solid #333",
        borderRadius: 10,
        color: "#f1f1f1",
        padding: "1rem",
      }}
    >
      <h2 style={{ marginTop: 0 }}>📄 Raport analizy</h2>

      {/* Sekcja: Streszczenie */}
      {summaryResult && (
        <section>
          <h3>🧠 Streszczenie</h3>
          {summaryResult.ok === false ? (
            <div style={{ color: "#ff8080" }}>
              ❌ {summaryResult.error?.message || "Błąd analizy"}
            </div>
          ) : (
            <div style={{ background: "#1f1f1f", padding: "1rem" }}>
              {summaryResult.data?.summary?.summary || "—"}
            </div>
          )}
          {summaryResult.ok && (
            <section>
              <h4>📊 Wizualizacje</h4>
              <Stat
                label="Liczba słów"
                value={
                  summaryResult.data?.visualization_data?.length_in_words ?? "—"
                }
              />
              <Stat
                label="Śr. dł. zdania"
                value={
                  summaryResult.data?.visualization_data?.avg_sentence_length ??
                  "—"
                }
              />

              {/* Nowa sekcja z top 5 najczęstszymi słowami */}
              <div style={{ marginTop: "1rem" }}>
                <h4>🔠 5 najczęstszych słów</h4>
                {summaryResult.data?.visualization_data?.top_words ? (
                  Object.entries(
                    summaryResult.data.visualization_data.top_words
                  ).map(([word, freq]) => (
                    <div
                      key={word}
                      style={{ color: "#ccc", fontSize: "0.9rem" }}
                    >
                      {word}: {freq}
                    </div>
                  ))
                ) : (
                  <div>—</div>
                )}
              </div>
            </section>
          )}
        </section>
      )}

      {/* Sekcja: Klasyfikacja */}
      {classificationResult && (
        <section>
          <h3>🏷️ Klasyfikacja</h3>
          {classificationResult.ok === false ? (
            <div style={{ color: "#ff8080" }}>
              ❌ {classificationResult.error?.message || "Błąd analizy"}
            </div>
          ) : (
            <div>
              <div>
                <strong>Typ:</strong>{" "}
                {classificationResult.data?.classification?.type}
              </div>
              <div>
                <strong>Kategorie:</strong>{" "}
                {classificationResult.data?.classification?.categories?.join(
                  ", "
                ) || "—"}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Sekcja: Ryzyka */}
      {riskResult && (
        <section style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ margin: "0 0 .5rem 0" }}>⚠️ Ryzyka</h3>

          {/* --- Obsługa błędu z backendu --- */}
          {riskResult.ok === false ? (
            <div style={{ color: "#ff8080", marginBottom: "1rem" }}>
              ❌ {riskResult.error?.message || "Nieznany błąd"}
            </div>
          ) : (
            <>
              {/* Risk score */}
              {typeof riskResult.data?.risk_score === "number" && (
                <div
                  style={{
                    background: "#1f1f1f",
                    border: "1px solid #333",
                    borderRadius: 8,
                    padding: "1rem",
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                >
                  {riskResult.data.risk_score}%
                  <div
                    style={{
                      marginTop: 8,
                      height: 12,
                      background: "#333",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${riskResult.data.risk_score}%`,
                        height: "100%",
                        background:
                          riskResult.data.risk_score > 70
                            ? "#b80000"
                            : riskResult.data.risk_score > 40
                            ? "#ffb800"
                            : "#009900",
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Słowa ryzykowne */}
              <h4 style={{ marginTop: "1rem" }}>🔎 Słowa ryzykowne</h4>
              {Object.keys(riskResult.data?.keyword_frequencies || {})
                .length === 0 ? (
                <div style={{ color: "#aaa" }}>
                  Brak danych o słowach ryzykownych.
                </div>
              ) : (
                <div>
                  {Object.entries(riskResult.data.keyword_frequencies).map(
                    ([k, v]) => (
                      <KeywordBar key={k} label={k} value={v} max={maxRiskKw} />
                    )
                  )}
                </div>
              )}

              {/* Lista Ryzyk */}
              {Array.isArray(riskResult.data?.risk_analysis) &&
              riskResult.data.risk_analysis.length > 0 ? (
                <div
                  style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}
                >
                  {riskResult.data.risk_analysis.map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#1f1f1f",
                        border: "1px solid #333",
                        borderRadius: 8,
                        padding: "0.75rem 1rem",
                        color: "#eaeaea",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <strong>Fragment</strong>
                        <SeverityBadge
                          level={(r?.severity || "").toLowerCase()}
                        />
                      </div>
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          marginBottom: 6,
                          color: "#ddd",
                        }}
                      >
                        “{r?.text_fragment || "—"}”
                      </div>
                      <div style={{ color: "#bbb" }}>
                        <strong>Uzasadnienie:</strong> {r?.reason || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#aaa", marginTop: "1rem" }}>
                  Brak wykrytych ryzyk.
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
