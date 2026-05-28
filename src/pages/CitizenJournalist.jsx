import { useState } from "react";
import { api } from "../services/api";
import LexicalEditor from "../components/LexicalEditor";

const CATEGORIES = [
  "NNS Originals",
  "NNS Culture",
  "Travel",
  "Top Stories",
  "Sport",
  "Business",
];

const SUBMISSION_TYPES = [
  {
    id: "Story Idea",
    icon: "💡",
    title: "Story Idea",
    desc: "Share a lead or concept — our team will research and write it",
  },
  {
    id: "Full Article",
    icon: "✍️",
    title: "Full Article",
    desc: "Submit a complete, written article for editorial review",
  },
  {
    id: "Video Suggestion",
    icon: "🎥",
    title: "Video Suggestion",
    desc: "Propose a video topic or share an existing video link",
  },
];

export default function SubmitStory() {
  const [step, setStep] = useState(1);
  const [submissionType, setSubmissionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    storyTitle: "",
    storyCategory: "",
    storyContent: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // Called by LexicalEditor for Full Article content
  const handleContentChange = (content) => {
    setForm((prev) => ({ ...prev, storyContent: content }));
  };

  const handleTypeSelect = (type) => {
    setSubmissionType(type);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(
        "/public/leads/submit-story",
        { ...form, submissionType },
        {}
      );
      setStep(3);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSubmissionType("");
    setForm({ name: "", email: "", mobile: "", storyTitle: "", storyCategory: "", storyContent: "" });
    setError("");
  };

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.badge}>COMMUNITY</div>
        <h1 style={styles.heading}>
          Share Your <span style={styles.accent}>Story</span>
        </h1>
        <p style={styles.subheading}>
          Have a story that the world needs to hear? <br />
          Submit your idea or article — our editorial team will review and publish it.
        </p>
      </div>

      <div style={styles.container}>

        {/* ── STEP 1: Type Select ── */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>What would you like to submit?</h2>
            <div style={styles.typeGrid}>
              {SUBMISSION_TYPES.map((t) => (
                <button
                  key={t.id}
                  style={styles.typeCard}
                  onClick={() => handleTypeSelect(t.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#f97316";
                    e.currentTarget.style.background = "rgba(249,115,22,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  <span style={styles.typeIcon}>{t.icon}</span>
                  <span style={styles.typeTitle}>{t.title}</span>
                  <span style={styles.typeDesc}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Form ── */}
        {step === 2 && (
          <div style={{
            ...styles.card,
            // Wider card for Full Article to fit the rich editor
            maxWidth: submissionType === "Full Article" ? 900 : 760,
            margin: "0 auto",
          }}>
            <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>

            <div style={styles.selectedType}>
              {SUBMISSION_TYPES.find((t) => t.id === submissionType)?.icon}{" "}
              {submissionType}
            </div>

            <h2 style={styles.cardTitle}>Your Details</h2>

            <form onSubmit={handleSubmit} style={styles.form}>

              {/* Row 1: Name + Email */}
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input style={styles.input} name="name" value={form.name} onChange={handleChange}
                    placeholder="Your full name" required
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="you@email.com" required
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
              </div>

              {/* Row 2: Mobile + Category */}
              <div style={styles.row}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Mobile Number *</label>
                  <input style={styles.input} name="mobile" value={form.mobile} onChange={handleChange}
                    placeholder="10-digit mobile number" required
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Category</label>
                  <select style={styles.input} name="storyCategory" value={form.storyCategory} onChange={handleChange}
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}>
                    <option value="" style={{ background: "#1f2937", color: "#fff" }}>Select a category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} style={{ background: "#1f2937", color: "#fff" }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Story Title */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {submissionType === "Video Suggestion" ? "Video Topic / Title *" : "Story Title *"}
                </label>
                <input style={styles.input} name="storyTitle" value={form.storyTitle} onChange={handleChange}
                  placeholder={submissionType === "Video Suggestion" ? "What should the video be about?" : "Enter a clear, descriptive title"}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>

              {/* ── Content Field ── */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  {submissionType === "Story Idea"
                    ? "Describe Your Idea *"
                    : submissionType === "Full Article"
                    ? "Article Content *"
                    : "Video Description or YouTube Link *"}
                </label>

                {/* Full Article → Rich Editor with embeds */}
                {submissionType === "Full Article" ? (
                  <div style={{ marginTop: 4 }}>
                    <LexicalEditor
                      value={form.storyContent}
                      onChange={handleContentChange}
                      placeholder="Write your complete article here... Use 'Add Media' to embed YouTube, Twitter, Instagram posts and images."
                    />
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
                      💡 Tip: Use "Add Media" button to embed YouTube videos, Twitter/X posts, Instagram posts, Facebook posts, or images inside your article.
                    </p>
                  </div>
                ) : (
                  /* Story Idea / Video Suggestion → Simple textarea */
                  <textarea
                    style={{ ...styles.input, ...styles.textarea }}
                    name="storyContent"
                    value={form.storyContent}
                    onChange={handleChange}
                    placeholder={
                      submissionType === "Story Idea"
                        ? "Describe the story — what is it about, where did the lead come from, any sources or references?"
                        : "Describe the video concept in detail, or paste a YouTube link..."
                    }
                    required
                    rows={8}
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                )}
              </div>

              {/* Error */}
              {error && <div style={styles.errorBox}>{error}</div>}

              {/* Submit */}
              <button
                type="submit"
                style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                disabled={loading}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#ea6c0a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#f97316"; }}
              >
                {loading ? "Submitting..." : "Submit Story →"}
              </button>

              <p style={styles.disclaimer}>
                * After submission, our editorial team will review your story within 3–5 working days.
                You will be notified via email if your story is selected for publication.
              </p>
            </form>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <div style={{ ...styles.card, textAlign: "center", padding: "60px 40px" }}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={{ ...styles.cardTitle, marginBottom: 12 }}>Submission Received!</h2>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
              Thank you for contributing to NoNoiseStories. <br />
              Our editorial team will review your submission within 3–5 working days. <br />
              If selected, you will receive a confirmation at{" "}
              <strong style={{ color: "#f97316" }}>{form.email}</strong>.
            </p>
            <button style={styles.submitBtn} onClick={resetForm}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#ea6c0a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#f97316")}>
              Submit Another Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0d1117", color: "#fff", fontFamily: "'Segoe UI', sans-serif", paddingBottom: 80 },
  header: { textAlign: "center", padding: "72px 20px 48px", background: "linear-gradient(180deg, rgba(249,115,22,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  badge: { display: "inline-block", background: "rgba(249,115,22,0.15)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 20 },
  heading: { fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 },
  accent: { color: "#f97316" },
  subheading: { color: "rgba(255,255,255,0.55)", fontSize: 16, lineHeight: 1.8, margin: 0 },
  container: { maxWidth: 760, margin: "0 auto", padding: "40px 20px 0" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "40px" },
  cardTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 28px", color: "#fff" },
  typeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 },
  typeCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "28px 20px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "border-color 0.2s, background 0.2s", color: "#fff" },
  typeIcon: { fontSize: 32 },
  typeTitle: { fontSize: 16, fontWeight: 700 },
  typeDesc: { fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.5 },
  backBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 20, display: "block" },
  selectedType: { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#f97316", fontWeight: 600, marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", transition: "border-color 0.2s", width: "100%", boxSizing: "border-box" },
  textarea: { resize: "vertical", lineHeight: 1.6, minHeight: 160 },
  errorBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "12px 16px", color: "#f87171", fontSize: 14 },
  submitBtn: { background: "#f97316", color: "#fff", border: "none", borderRadius: 8, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "background 0.2s", alignSelf: "flex-start" },
  disclaimer: { color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.6, margin: 0 },
  successIcon: { fontSize: 56, marginBottom: 20 },
};