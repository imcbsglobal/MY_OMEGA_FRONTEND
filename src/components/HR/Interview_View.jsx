import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import api from "../../api/client";
import { toast } from "react-toastify";

export default function Interview_View() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ratings
  const [ratings, setRatings] = useState({
    appearance: 0,
    knowledge: 0,
    confidence: 0,
    attitude: 0,
    communication: 0,
  });

  // Form fields
  const [languages, setLanguages] = useState([]);
  const [expectedSalary, setExpectedSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [remark, setRemark] = useState("");

  // Voice Note Recording
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);

  const languageList = ["English", "Malayalam", "Tamil", "Hindi"];

  // Fetch Interview and Evaluation Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/interview-management/${id}/`);
        const data = res.data.data;
        setInterview(data);

        if (data.evaluation) {
          setRatings({
            appearance: data.evaluation.appearance || 0,
            knowledge: data.evaluation.knowledge || 0,
            confidence: data.evaluation.confidence || 0,
            attitude: data.evaluation.attitude || 0,
            communication: data.evaluation.communication || 0,
          });
          setLanguages(
            data.evaluation.languages
              ? data.evaluation.languages.split(",").map((l) => l.trim())
              : []
          );
          setExpectedSalary(data.evaluation.expected_salary || "");
          setExperience(data.evaluation.experience || "");
          setRemark(data.evaluation.remark || "");
          if (data.evaluation.voice_note) {
            setAudioURL(data.evaluation.voice_note);
          }
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
        toast.error("Failed to load interview data!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle star click
  const handleStarClick = (field, value) =>
    setRatings((prev) => ({ ...prev, [field]: value }));

  const handleLanguageToggle = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // 🎤 Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(blob);
        setAudioURL(audioUrl);
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setRecording(true);
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error("Microphone access denied:", error);
      toast.error("Please allow microphone access to record voice note.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // 💾 Submit Evaluation
  const handleSubmit = async () => {
    if (!interview) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("appearance", ratings.appearance);
    formData.append("knowledge", ratings.knowledge);
    formData.append("confidence", ratings.confidence);
    formData.append("attitude", ratings.attitude);
    formData.append("communication", ratings.communication);
    formData.append("languages", languages.join(", "));
    formData.append("expected_salary", expectedSalary);
    formData.append("experience", experience);
    formData.append("remark", remark);

    if (audioBlob) formData.append("voice_note", audioBlob, "voice_note.mp3");

    try {
      const res = await api.post(
        `/api/interview-management/${id}/evaluation/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message || "Evaluation saved successfully!");
      navigate("/interview-management");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save evaluation. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading Candidate Rating...</p>
      </div>
    );

  const candidate = interview?.candidate || {};

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>CANDIDATE RATING</h2>

      <div style={styles.card}>
        {/* Candidate Info */}
        <div style={{ marginBottom: "15px" }}>
          <p>
            <strong>Name:</strong> {candidate.name} <br />
            <strong>Job Title:</strong> {candidate.job_title_name} <br />
            <strong>Email:</strong> {candidate.email}
          </p>
        </div>

        {/* Ratings */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>⭐ RATE THE CANDIDATE</h3>
          <div style={styles.ratingGrid}>
            {Object.entries(ratings).map(([key, value]) => (
              <div key={key} style={styles.ratingItem}>
                <span style={styles.label}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={18}
                    color={star <= value ? "#facc15" : "#d1d5db"}
                    style={{ marginRight: 3, cursor: "pointer" }}
                    onClick={() => handleStarClick(key, star)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🗣️ LANGUAGES KNOWN</h3>
          <div style={styles.languageGrid}>
            {["English", "Malayalam", "Tamil", "Hindi"].map((lang) => (
              <div key={lang} style={styles.languageItem}>
                <input
                  type="checkbox"
                  checked={languages.includes(lang)}
                  onChange={() => handleLanguageToggle(lang)}
                />
                <input type="text" value={lang} readOnly style={styles.languageInput} />
              </div>
            ))}
          </div>
        </div>

        {/* Other Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 OTHER DETAILS</h3>
          <label style={styles.label}>Expected Salary:</label>
          <input
            style={styles.input}
            value={expectedSalary}
            onChange={(e) => setExpectedSalary(e.target.value)}
          />
          <label style={styles.label}>Experience:</label>
          <input
            style={styles.input}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
          <label style={styles.label}>Remarks:</label>
          <textarea
            style={styles.textarea}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        {/* 🎤 Voice Note Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🎤 VOICE NOTE</h3>
          <div style={styles.voiceRow}>
            {!recording ? (
              <button
                onClick={startRecording}
                style={{ ...styles.btn, backgroundColor: "#16a34a" }}
              >
                🎙️ Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{ ...styles.btn, backgroundColor: "#dc2626" }}
              >
                ⏹️ Stop Recording
              </button>
            )}
          </div>

          {audioURL && (
            <div style={{ marginTop: "12px" }}>
              <audio controls src={audioURL} style={{ width: "100%" }} />
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              ...styles.btn,
              backgroundColor: isSubmitting ? "#9ca3af" : "#15803d",
              padding: "8px 24px",
            }}
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Styles =====
const styles = {
  container: {
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    padding: "30px",
  },
  heading: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px",
    maxWidth: "900px",
    margin: "0 auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  section: { marginBottom: "25px" },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: "15px",
  },
  ratingGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    rowGap: "12px",
  },
  ratingItem: { display: "flex", alignItems: "center" },
  label: {
    fontWeight: "600",
    color: "#111827",
    width: "120px",
    fontSize: "14px",
  },
  languageGrid: { display: "flex", flexWrap: "wrap", gap: "12px" },
  languageItem: { display: "flex", alignItems: "center", gap: "6px" },
  languageInput: {
    padding: "6px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    width: "130px",
    backgroundColor: "#fff",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    minHeight: "80px",
  },
  btn: {
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontWeight: "600",
    padding: "8px 18px",
    cursor: "pointer",
    transition: "0.2s",
  },
  voiceRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};
