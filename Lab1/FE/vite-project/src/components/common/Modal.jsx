function Modal({ title, children, open, onClose, width = 400 }) {
  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div
        style={{ ...styles.modal, width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>

          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;

// ==============================
// STYLE
// ==============================
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    borderRadius: "8px",
    padding: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
  },
  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: "18px",
    cursor: "pointer",
  },
  body: {
    marginTop: "10px",
  },
};