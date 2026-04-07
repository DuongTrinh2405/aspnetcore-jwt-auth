// ==============================
// PRO FORM STYLES - PRO MAX UI
// ==============================

export const formStyles = {
  // ==============================
  // OVERLAY
  // ==============================
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(14px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "24px",
  },

  // ==============================
  // MODAL (🔥 NỔI HẲN LÊN)
  // ==============================
  modal: {
    background: "#ffffff",
    padding: "32px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 50px 120px rgba(0,0,0,0.35), 0 20px 50px rgba(0,0,0,0.2)",
    transform: "translateY(-6px)",
  },

  // ==============================
  // TITLE
  // ==============================
  title: {
    marginBottom: "6px",
    fontSize: "22px",
    fontWeight: "600",
    color: "#0f172a",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "20px",
  },

  // ==============================
  // FORM
  // ==============================
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // ==============================
  // FORM GROUP
  // ==============================
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  // ==============================
  // LABEL
  // ==============================
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
  },

  // ==============================
  // INPUT / SELECT / TEXTAREA
  // ==============================
  input: {
    padding: "13px 15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    background: "#ffffff",
    outline: "none",
    transition: "all 0.25s ease",
  },

  textarea: {
    padding: "13px 15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    background: "#ffffff",
    minHeight: "120px",
    resize: "vertical",
    outline: "none",
    transition: "all 0.25s ease",
  },

  select: {
    padding: "13px 15px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    background: "#ffffff",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.25s ease",
  },

  // ==============================
  // FOCUS (🔥 CÓ CHIỀU SÂU)
  // ==============================
  focus: {
    border: "1px solid #2563eb",
    boxShadow: "0 0 0 4px rgba(37,99,235,0.15)",
    transform: "translateY(-1px)",
  },

  // ==============================
  // IMAGE PREVIEW
  // ==============================
  previewContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "8px",
  },

  previewImage: {
    width: "90px",
    height: "90px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
  },

  // ==============================
  // ACTIONS
  // ==============================
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "18px",
  },

  // ==============================
  // BUTTON BASE
  // ==============================
  btn: {
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.25s ease",
  },

  // ==============================
  // BUTTONS (🔥 CTA RÕ)
  // ==============================
  btnPrimary: {
    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
    color: "#fff",
    boxShadow: "0 12px 30px rgba(37,99,235,0.4)",
  },

  btnSecondary: {
    background: "#f8fafc",
    color: "#334155",
    border: "1px solid #e2e8f0",
  },

  btnDanger: {
    background: "#ef4444",
    color: "#fff",
    boxShadow: "0 10px 25px rgba(239,68,68,0.35)",
  },

  // ==============================
  // HOVER EFFECT (🔥 RẤT QUAN TRỌNG)
  // ==============================
  btnHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 18px 40px rgba(37,99,235,0.5)",
  },

  // ==============================
  // DISABLED
  // ==============================
  btnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  // ==============================
  // ERROR
  // ==============================
  error: {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "4px",
  },
};