import styles from "./FormInput.module.css";

function FormInput({ type, placeholder, value, onChange, required = false }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={styles.input}
    />
  );
}

export default FormInput;
