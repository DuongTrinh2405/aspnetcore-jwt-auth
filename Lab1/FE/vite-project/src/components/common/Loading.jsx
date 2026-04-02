function Loading({ fullScreen = false, text = "Đang tải..." }) {
  return (
    <div style={fullScreen ? styles.fullScreen : styles.inline}>
      <div style={styles.spinner}></div>
      <p style={styles.text}>{text}</p>
    </div>
  );
}

export default Loading;

// ==============================
// STYLE
// ==============================
const styles = {
  fullScreen: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f6fa",
  },
  inline: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #eee",
    borderTop: "4px solid #1677ff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  text: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#555",
  },
};