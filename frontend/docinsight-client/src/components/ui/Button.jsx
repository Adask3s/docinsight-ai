import styles from "./Button.module.css";

/**
 * className prop allows passing CSS module class names (strings) from parent
 * Example usage:
 * <Button variant="primary" className={`${utils.fullWidth}`}>OK</Button>
 */
function Button({ children, variant = "primary", className = "", ...props }) {
  const variantClass =
    {
      primary: styles.primary,
      secondary: styles.secondary,
      logout: styles.logout,
      tab: styles.tab,
      "tab-active": styles.tabActive,
    }[variant] || "";

  const classList = [styles.base, variantClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classList} {...props}>
      {children}
    </button>
  );
}

export default Button;
