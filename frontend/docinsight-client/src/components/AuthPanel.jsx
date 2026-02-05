import { useState } from "react";
import Button from "./Button";
import FormInput from "./FormInput";
import styles from "./AuthPanel.module.css";
import utils from "../styles/utils.module.css";

function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(mode === "login" ? "Logowanie..." : "Rejestracja...");
    const url =
      mode === "login"
        ? "http://localhost:5191/auth/login"
        : "http://localhost:5191/auth/register";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(
          typeof data === "string"
            ? data
            : Array.isArray(data)
            ? data.map((e) => e.description).join(", ")
            : data.message || "❌ Błąd"
        );
        return;
      }

      if (mode === "register") {
        setStatus("Zarejestrowano! Możesz się zalogować.");
        setMode("login");
        return;
      }

      localStorage.setItem("jwt_token", data.token);
      setStatus("Zalogowano!");
      setEmail("");
      setPassword("");
      if (onAuth) onAuth();
    } catch (err) {
      setStatus("❌ Błąd: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt_token");
    if (onAuth) onAuth();
  };

  const isLoggedIn = !!localStorage.getItem("jwt_token");

  return (
    <div className={utils.bgAuth}>
      <div className={utils.blob1}></div>
      <div className={utils.blob2}></div>

      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <div className={styles.cardInner}>
            <div className={styles.header}>
              <h1 className={styles.title}>Doc Insight</h1>
              <p className={styles.subtitle}>AI-Powered Document Analysis</p>
            </div>

            {isLoggedIn ? (
              <div>
                <div className={styles.statusBox}>
                  <p style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    Zalogowano ✓
                  </p>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.875rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    Jesteś gotowy do analizy dokumentów
                  </p>
                </div>

                <Button
                  variant="logout"
                  onClick={handleLogout}
                  className={utils.fullWidth}
                >
                  Wyloguj się
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.tabs}>
                  <Button
                    variant={mode === "login" ? "tab-active" : "tab"}
                    onClick={() => setMode("login")}
                    className={styles.tabBtn}
                  >
                    Zaloguj
                  </Button>
                  <Button
                    variant={mode === "register" ? "tab-active" : "tab"}
                    onClick={() => setMode("register")}
                    className={styles.tabBtn}
                  >
                    Zarejestruj
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <label className={styles.label}>Email</label>
                    <FormInput
                      type="email"
                      placeholder="twoj@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.label}>Hasło</label>
                    <FormInput
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className={`${utils.fullWidth} ${utils.py3} ${utils.fontSemibold} ${utils.textBase}`}
                  >
                    {mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
                  </Button>
                </form>

                {status && (
                  <div
                    className={styles.statusBox}
                    style={{
                      background: status.includes("❌")
                        ? "rgba(255,0,0,0.04)"
                        : "rgba(52,199,89,0.04)",
                      color: status.includes("❌")
                        ? "#ffb3b3"
                        : "var(--accent-green)",
                    }}
                  >
                    {status}
                  </div>
                )}

                <div className={styles.footer}>
                  <p className={styles.subtitle}>
                    {mode === "login"
                      ? 'Nie masz konta? Kliknij "Zarejestruj"'
                      : "Masz już konto? Kliknij Zaloguj"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className={styles.centerText}>Analiza dokumentów z AI</p>
      </div>
    </div>
  );
}

export default AuthPanel;
