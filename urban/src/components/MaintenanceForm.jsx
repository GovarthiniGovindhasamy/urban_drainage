import { useState, useRef } from "react";
import {
  MapPin,
  FileText,
  AlertTriangle,
  Send,
  Camera,
  UploadCloud,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import LocationMap from "./LocationMap";

const COMPLAINT_CATEGORIES = [
  "Blocked Drain",
  "Overflowing Drain",
  "Damaged Drain",
  "Broken Drain Cover",
  "Water Stagnation",
  "Garbage in Drain",
  "Illegal Drain Connection",
  "Flooding",
  "Mosquito Breeding",
  "Other",
];

const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  latitude: null,
  longitude: null,
  address: "",
  area: "",
  pincode: "",
  landmark: "",
  ward: "",
  priority: "medium",
};

const MAX_IMAGES = 5;

export default function MaintenanceForm({ prefill = false }) {
  const [formData, setFormData] = useState(
    prefill
      ? {
          title: "Severe Water Logging on Main Road",
          category: "Water Stagnation",
          description:
            "Water has been stagnating for the last 3 days due to a blocked drainage pipe. It is causing severe traffic issues and breeding mosquitoes.",
          latitude: null,
          longitude: null,
          address: "",
          area: "Ring Road Junction",
          pincode: "110001",
          landmark: "Near Metro Station Pillar 42",
          ward: "Ward 42",
          priority: "high",
        }
      : { ...EMPTY_FORM },
  );

  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [submitMsg, setSubmitMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Image state: array of { file, preview (dataURL), base64 }
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // ── Location callback from map ──────────────────────────────────────────────
  const handleLocationChange = (lat, lng, address) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address,
    }));
  };

  // ── Form field change ───────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrioritySelect = (level) => {
    setFormData({ ...formData, priority: level });
  };

  // ── Image handling ──────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result; // full data URL: "data:image/png;base64,..."
        setImages((prev) => [...prev, { file, preview: base64, base64 }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(null);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setSubmitStatus("error");
      setSubmitMsg("You must be logged in to submit a complaint.");
      return;
    }

    if (!formData.category) {
      setSubmitStatus("error");
      setSubmitMsg("Please select a complaint category.");
      return;
    }

    if (!formData.description) {
      setSubmitStatus("error");
      setSubmitMsg("Please enter a problem description.");
      return;
    }

    setLoading(true);

    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Generate a random complaint ID (demo mode — no backend)
    const complaintId = Math.floor(Math.random() * 9000) + 1000;

    setSubmitStatus("success");
    setSubmitMsg(`Complaint #${complaintId} submitted successfully!`);
    setFormData({ ...EMPTY_FORM });
    setImages([]);
    setLoading(false);
  };


  const displayLat = formData.latitude;
  const displayLng = formData.longitude;

  return (
    <main
      className="main-content"
      style={{ maxWidth: "1200px", margin: "0 auto" }}
    >
      {/* Mobile-specific map+form layout styles */}
      <style>{`
        .form-map-panel {
          flex: 1 1 340px;
          position: sticky;
          top: 80px;
          align-self: flex-start;
        }
        .form-fields-panel {
          flex: 1 1 340px;
        }
        .form-layout-wrapper {
          display: flex;
          gap: 30px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .form-map-panel {
            position: relative !important;
            top: 0 !important;
            flex: 1 1 100%;
            width: 100%;
          }
          .form-fields-panel {
            flex: 1 1 100%;
            width: 100%;
          }
          .form-layout-wrapper {
            flex-direction: column;
            gap: 16px;
          }
          /* Fixed height for the map — never stretches on mobile */
          .form-map-panel .map-container,
          .form-map-panel .map-container.large-map {
            height: 240px !important;
          }
        }
      `}</style>
      <div className="form-layout-wrapper">
        {/* Left Side: Map — fixed height on mobile, sticky on desktop */}
        <div className="form-map-panel">
          <h2 className="page-title">New Complaint</h2>
          <p className="page-subtitle">
            Report a drainage issue with location and details
          </p>
          <div
            style={{
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              borderRadius: "8px",
              overflow: "visible",
            }}
          >
            <LocationMap
              lat={displayLat}
              lng={displayLng}
              onLocationChange={handleLocationChange}
              className="large-map"
            />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="form-fields-panel">
          {/* Status Banner */}
          {submitStatus === "success" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 18px",
                marginBottom: "20px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                color: "#15803d",
              }}
            >
              <CheckCircle size={20} />
              <span style={{ fontWeight: 500 }}>{submitMsg}</span>
            </div>
          )}
          {submitStatus === "error" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 18px",
                marginBottom: "20px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
              }}
            >
              <XCircle size={20} />
              <span style={{ fontWeight: 500 }}>{submitMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Complaint Information */}
            <div
              className="form-section"
              style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
            >
              <div className="form-section-header">
                <span className="icon">
                  <FileText size={18} />
                </span>
                <h3>Complaint Information</h3>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Complaint Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "0.85rem",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                  placeholder="Enter a brief title for the complaint..."
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">
                  Complaint Category <span className="required">*</span>
                </label>
                <select
                  name="category"
                  className="form-input"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "0.85rem",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label className="form-label">
                  Problem Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  className="form-textarea"
                  style={{ background: "#f9fafb" }}
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* 2. Location Details */}
            <div
              className="form-section"
              style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
            >
              <div className="form-section-header">
                <span className="icon">
                  <MapPin size={18} />
                </span>
                <h3>Location Details</h3>
              </div>

              <div
                style={{ display: "flex", gap: "16px", marginBottom: "16px" }}
              >
                <div style={{ flex: 1 }}>
                  <label className="form-label">Latitude</label>
                  <input
                    type="text"
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "0.85rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      color: "#6b7280",
                    }}
                    value={
                      displayLat ? `${displayLat.toFixed(5)}°` : "Detecting…"
                    }
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Longitude</label>
                  <input
                    type="text"
                    readOnly
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "0.85rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      color: "#6b7280",
                    }}
                    value={
                      displayLng ? `${displayLng.toFixed(5)}°` : "Detecting…"
                    }
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Detected Address</label>
                <input
                  type="text"
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "0.85rem",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    color: "#6b7280",
                  }}
                  value={formData.address || "Waiting for GPS or map click…"}
                />
              </div>

              <div
                style={{ display: "flex", gap: "16px", marginBottom: "16px" }}
              >
                <div style={{ flex: 1 }}>
                  <label className="form-label">Area / Street Name</label>
                  <input
                    type="text"
                    name="area"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "0.85rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                    }}
                    value={formData.area}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      fontSize: "0.85rem",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                    }}
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "0.85rem",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                  placeholder="(Optional) Add a landmark for reference"
                  value={formData.landmark}
                  onChange={handleChange}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label className="form-label">Ward Number (Optional)</label>
                <input
                  type="text"
                  name="ward"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "0.85rem",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                  }}
                  placeholder="E.g. Ward 42"
                  value={formData.ward}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 3. Priority Level */}
            <div
              className="form-section"
              style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
            >
              <div className="form-section-header">
                <span className="icon">
                  <AlertTriangle size={18} />
                </span>
                <h3>Priority Level</h3>
              </div>
              <div className="severity-options">
                {["low", "medium", "high", "emergency"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`severity-btn ${formData.priority === level ? "selected " + level : ""}`}
                    onClick={() => handlePrioritySelect(level)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Media Upload */}
            <div
              className="form-section"
              style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
            >
              <div className="form-section-header">
                <span className="icon">
                  <Camera size={18} />
                </span>
                <h3>Media Upload</h3>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              {/* Clickable upload zone */}
              {images.length < MAX_IMAGES && (
                <div
                  className="photo-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: "pointer" }}
                >
                  <UploadCloud
                    size={28}
                    className="upload-icon"
                    style={{ margin: "0 auto 10px" }}
                  />
                  <p>
                    <span className="browse-link">Click to Upload Photos</span>{" "}
                    ({images.length}/{MAX_IMAGES} selected)
                  </p>
                  <p className="file-hint">
                    JPG, PNG, WebP accepted. Geo-tagged photos recommended.
                  </p>
                </div>
              )}

              {/* Image Thumbnails */}
              {images.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "14px",
                  }}
                >
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        width: "90px",
                        height: "90px",
                      }}
                    >
                      <img
                        src={img.preview}
                        alt={`upload-${idx}`}
                        style={{
                          width: "90px",
                          height: "90px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "2px solid #e5e7eb",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "-6px",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length >= MAX_IMAGES && (
                <p
                  style={{
                    marginTop: "10px",
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  }}
                >
                  Maximum of {MAX_IMAGES} photos reached.
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div
              className="form-actions"
              style={{ justifyContent: "flex-end", marginTop: "20px" }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "12px 24px" }}
                disabled={loading}
              >
                <Send size={15} />
                {loading ? "Submitting…" : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
