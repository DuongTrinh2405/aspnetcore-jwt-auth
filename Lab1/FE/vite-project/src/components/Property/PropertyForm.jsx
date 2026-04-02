import { useEffect, useState } from "react";
import { uploadPropertyImage } from "../../services/propertyService";

function PropertyForm({ initialData, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: "",
    price: "",
    area: "",
    address: "",
    description: "",
    type: 0,
    status: 0,
    imageUrl: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        price: initialData.price || "",
        area: initialData.area || "",
      });
      setPreview(initialData.imageUrl || "");
    }
  }, [initialData]);

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // ==============================
  // FILE
  // ==============================
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return alert("Title không được để trống");
    }

    if (!form.price || Number(form.price) <= 0) {
      return alert("Price phải > 0");
    }

    if (!form.area || Number(form.area) <= 0) {
      return alert("Diện tích phải > 0");
    }

    try {
      setLoading(true);

      let imageUrl = form.imageUrl;

      if (file) {
        imageUrl = await uploadPropertyImage(file);
      }

      await onSubmit({
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        type: Number(form.type),
        status: Number(form.status),
        imageUrl,
      });
    } catch (err) {
      console.error(err);
      alert("Lỗi submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>
          {isEdit ? "Update Property" : "Create Property"}
        </h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* TITLE */}
          <input
            name="title"
            placeholder="Tên bất động sản"
            value={form.title}
            onChange={handleChange}
            style={styles.input}
          />

          {/* PRICE */}
          <input
            name="price"
            type="number"
            placeholder="Giá (VND)"
            value={form.price}
            onChange={handleChange}
            style={styles.input}
          />

          {/* AREA */}
          <input
            name="area"
            type="number"
            placeholder="Diện tích (m²)"
            value={form.area}
            onChange={handleChange}
            style={styles.input}
          />

          {/* ADDRESS */}
          <input
            name="address"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={handleChange}
            style={styles.input}
          />

          {/* DESCRIPTION */}
          <input
            name="description"
            placeholder="Mô tả"
            value={form.description}
            onChange={handleChange}
            style={styles.input}
          />

          {/* TYPE */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={styles.input}
          >
            <option value={0}>Apartment</option>
            <option value={1}>House</option>
            <option value={2}>Villa</option>
          </select>

          {/* STATUS */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={styles.input}
          >
            <option value={0}>Available</option>
            <option value={1}>Reserved</option>
            <option value={2}>Sold</option>
            <option value={3}>Rented</option>
          </select>

          {/* IMAGE */}
          <input type="file" onChange={handleFileChange} />

          {preview && (
            <img src={preview} alt="" style={styles.preview} />
          )}

          {/* ACTION */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.btn, background: "#999" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.btn, background: "#1677ff" }}
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyForm;

// ==============================
// STYLE
// ==============================
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    width: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },

  title: {
    marginBottom: "15px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  preview: {
    width: "100%",
    borderRadius: "8px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "10px",
  },

  btn: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    marginLeft: "8px",
  },
};