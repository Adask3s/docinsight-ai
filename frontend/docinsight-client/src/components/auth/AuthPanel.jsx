import { useState } from "react";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import styles from "./AuthPanel.module.css";
import utils from "../../styles/utils.module.css";

function AuthPanel({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  // funkcja do zmiany trybu (login/register) i resetowania pól formularza oraz statusu
  const handleModeChange = (newMode) => {
    setMode(newMode); // Zmień tryb (login/register)
    setEmail(""); // Wyczyść email
    setPassword(""); // Wyczyść hasło
    setStatus(""); // Wyczyść stare komunikaty błędów
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(mode === "login" ? "Logging in..." : "Registering...");
    const url =
      mode === "login"
        ? `${import.meta.env.VITE_API_URL}/auth/login`
        : `${import.meta.env.VITE_API_URL}/auth/register`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // 1. Sprawdzamy typ odpowiedzi (JSON czy HTML/Text?)
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server error (not JSON): ${text.slice(0, 50)}...`);
      }

      // 2. Obsługa błędów (np. 400 Bad Request)
      if (!response.ok) {
        let errorMsg = "Error";

        if (typeof data === "string") {
          errorMsg = "Error: " + data;
        } else if (data.message) {
          // Jeśli message jest tablicą (błędy Identity)
          if (Array.isArray(data.message)) {
            errorMsg =
              "Validation error:\n" +
              data.message.map((e) => "- " + e.description).join("\n");
          } else {
            errorMsg = "Error: " + data.message;
          }
        } else if (Array.isArray(data)) {
          errorMsg =
            "Validation error:\n" +
            data.map((e) => "- " + e.description).join("\n");
        }

        setStatus(errorMsg);
        return;
      }

      // 3. Sukces
      if (mode === "register") {
        setStatus("You are registered! You can now log in.");
        setMode("login");
        return;
      }

      localStorage.setItem("jwt_token", data.token);
      setStatus("Logged in!");
      setEmail("");
      setPassword("");
      if (onAuth) onAuth();
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
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
              <p className={styles.subtitle}>Analiza dokumentów z pomocą AI</p>
            </div>

            {isLoggedIn ? (
              <div>
                <div className={styles.statusBox}>
                  <p className={styles.statusInfo}>Zalogowano ✓</p>
                  <p className={styles.descriptionText}>
                    Teraz masz dostęp do wszystkich funkcji analizy dokumentów.
                    Kliknij "Wyloguj", aby zakończyć sesję.
                  </p>
                </div>

                <Button
                  variant="logout"
                  onClick={handleLogout}
                  className={utils.fullWidth}
                >
                  Wyloguj
                </Button>
              </div>
            ) : (
              <>
                <div className={styles.tabs}>
                  <Button
                    variant={mode === "login" ? "tab-active" : "tab"}
                    onClick={() => handleModeChange("login")} // używamy funkcji do zmiany trybu
                    className={styles.tabBtn}
                    rounded
                  >
                    Zaloguj się
                  </Button>
                  <Button
                    variant={mode === "register" ? "tab-active" : "tab"}
                    onClick={() => handleModeChange("register")} // używamy funkcji do zmiany trybu
                    className={styles.tabBtn}
                    rounded
                  >
                    Zarejestruj się
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <label className={styles.label}>Email</label>
                    <FormInput
                      type="email"
                      placeholder="twój@email.pl"
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
                    className={`${styles.statusBox} ${
                      status.includes("Error")
                        ? styles.statusError
                        : styles.statusSuccess
                    }`}
                  >
                    {status}
                  </div>
                )}

                <div className={styles.footer}>
                  <p className={styles.subtitle}>
                    {mode === "login"
                      ? 'Nie masz konta? Kliknij "Zarejestruj się"'
                      : 'Masz już konto? Kliknij "Zaloguj się"'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className={styles.centerText}>Documents analysis with AI</p>
      </div>
    </div>
  );
}

export default AuthPanel;
