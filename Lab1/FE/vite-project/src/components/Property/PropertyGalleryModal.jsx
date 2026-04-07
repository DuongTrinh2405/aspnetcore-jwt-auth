import { useState } from "react";

// 🔥 Helper to get proper image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url; // Already absolute
  if (url.startsWith('/')) return url; // Relative path, browser will handle it
  return `/${url}`; // Add leading slash if missing
};

function PropertyGalleryModal({ property, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!property || !property.imageUrls || property.imageUrls.length === 0) {
    return (
      <div
        style={styles.overlay}
        onClick={onClose}
      >
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3>No Images</h3>
          <p>Property hiện không có ảnh</p>
          <button onClick={onClose} style={styles.closeBtn}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const images = property.imageUrls;
  const currentImage = images[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
    >
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={styles.title}>🖼️ {property.title} - Ảnh</h3>

        {/* Main Image */}
        <img
          src={getImageUrl(currentImage)}
          alt="Property"
          style={styles.mainImage}
        />

        {/* Navigation */}
        <div style={styles.nav}>
          <button onClick={handlePrev} style={styles.navBtn}>
            ← Trước
          </button>
          <span>
            {currentIndex + 1} / {images.length}
          </span>
          <button onClick={handleNext} style={styles.navBtn}>
            Tiếp →
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={styles.thumbnails}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={getImageUrl(img)}
                alt="Thumb"
                onClick={() => setCurrentIndex(idx)}
                style={{
                  ...styles.thumbnail,
                  border: idx === currentIndex ? "2px solid #1677ff" : "1px solid #ddd",
                }}
              />
            ))}
          </div>
        )}

        <button onClick={onClose} style={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "700px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
  },
  title: {
    marginBottom: "15px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  mainImage: {
    width: "100%",
    height: "400px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    gap: "10px",
  },
  navBtn: {
    padding: "8px 12px",
    background: "#1677ff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  thumbnails: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    marginBottom: "15px",
    paddingBottom: "8px",
  },
  thumbnail: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
    flexShrink: 0,
  },
  closeBtn: {
    width: "100%",
    padding: "10px",
    background: "#999",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default PropertyGalleryModal;
