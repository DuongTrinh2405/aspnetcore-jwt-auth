import { useEffect, useState } from "react";
import { uploadPropertyImages } from "../../services/propertyService";
import { formStyles } from "../../styles/formStyles";

function PropertyForm({ initialData, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: "",
    price: "",
    area: "",
    address: "",
    description: "",
    type: 0,
    status: 0,
    imageUrls: [],
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      const cleanImages = Array.isArray(initialData.imageUrls)
        ? initialData.imageUrls.map((img) =>
            typeof img === "string" ? img : img.imageUrl
          )
        : [];

      setForm({
        ...initialData,
        price: initialData.price || "",
        area: initialData.area || "",
        type: Number(initialData.type ?? 0),
        status: Number(initialData.status ?? 0),
        imageUrls: cleanImages,
      });

      setPreviews(cleanImages);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "type" || name === "status"
          ? Number(value)
          : value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const newPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return alert("Tên không được để trống");
    if (!form.price || Number(form.price) <= 0) return alert("Giá phải > 0");
    if (!form.area || Number(form.area) <= 0) return alert("Diện tích phải > 0");

    try {
      setLoading(true);

      let imageUrls = form.imageUrls;

      if (files.length > 0) {
        imageUrls = await uploadPropertyImages(files);
      }

      await onSubmit({
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        imageUrls,
      });

      setFiles([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      alert("Lỗi submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formStyles.overlay}>
      <div
        style={{
          ...formStyles.modal,
          padding: "24px",          // 🔥 giảm từ 32 → 24
        }}
      >
        <h3 style={formStyles.title}>
          {isEdit ? "Cập nhật bất động sản" : "Tạo bất động sản"}
        </h3>

        <p
          style={{
            ...formStyles.subtitle,
            marginBottom: "14px",   // 🔥 giảm khoảng cách
          }}
        >
          Nhập thông tin bất động sản
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            ...formStyles.form,
            gap: "14px",            // 🔥 giảm từ 20 → 14
          }}
        >
          {/* TITLE */}
          <div style={formStyles.formGroup}>
            <label style={formStyles.label}>Tên *</label>
            <input name="title" value={form.title} onChange={handleChange} style={formStyles.input} />
          </div>

          {/* PRICE + AREA (🔥 gộp 2 cột) */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="price"
              type="number"
              placeholder="Giá"
              value={form.price}
              onChange={handleChange}
              style={{ ...formStyles.input, flex: 1 }}
            />
            <input
              name="area"
              type="number"
              placeholder="Diện tích"
              value={form.area}
              onChange={handleChange}
              style={{ ...formStyles.input, flex: 1 }}
            />
          </div>

          {/* ADDRESS */}
          <input
            name="address"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={handleChange}
            style={formStyles.input}
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Mô tả"
            value={form.description}
            onChange={handleChange}
            style={{
              ...formStyles.textarea,
              minHeight: "90px",   // 🔥 giảm chiều cao
            }}
          />

          {/* TYPE + STATUS */}
          <div style={{ display: "flex", gap: "10px" }}>
            <select name="type" value={form.type} onChange={handleChange} style={{ ...formStyles.select, flex: 1 }}>
              <option value={0}>Apartment</option>
              <option value={1}>House</option>
              <option value={2}>Villa</option>
              <option value={3}>Townhouse</option>
              <option value={4}>Office</option>
              <option value={5}>Land</option>
              <option value={6}>Warehouse</option>
              <option value={7}>Commercial</option>
            </select>

            <select name="status" value={form.status} onChange={handleChange} style={{ ...formStyles.select, flex: 1 }}>
              <option value={0}>Available</option>
              <option value={1}>Reserved</option>
              <option value={2}>Sold</option>
              <option value={3}>Rented</option>
              <option value={4}>Negotiation</option>
              <option value={5}>Off Market</option>
            </select>
          </div>

          {/* FILE */}
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />

          {/* PREVIEW */}
          {previews.length > 0 && (
            <div style={formStyles.previewContainer}>
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" style={formStyles.previewImage} />
              ))}
            </div>
          )}

          {/* ACTIONS */}
          <div style={formStyles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...formStyles.btn, ...formStyles.btnSecondary }}
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...formStyles.btn,
                ...formStyles.btnPrimary,
                ...(loading ? formStyles.btnDisabled : {}),
              }}
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyForm;