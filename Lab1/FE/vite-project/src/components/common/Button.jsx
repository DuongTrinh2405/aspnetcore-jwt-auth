function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  style = {},
}) {
  const getStyle = () => {
    switch (variant) {
      case "danger":
        return styles.danger;
      case "secondary":
        return styles.secondary;
      default:
        return styles.primary;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles.base,
        ...getStyle(),
        ...(disabled ? styles.disabled : {}),
        ...style,
      }}
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  );
}

export default Button;

// ==============================
// STYLE
// ==============================
const styles = {
  base: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#fff",
    fontSize: "14px",
  },

  primary: {
    background: "#1677ff",
  },

  secondary: {
    background: "#888",
  },

  danger: {
    background: "#ff4d4f",
  },

  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};