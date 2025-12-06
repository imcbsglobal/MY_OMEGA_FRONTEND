// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/login/", { email, password });
      const data = res.data;

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");

      if (data.menu_tree) {
        localStorage.setItem("menuTree", JSON.stringify(data.menu_tree));
      }
      if (data.allowed_menus) {
        localStorage.setItem("menuTree", JSON.stringify(data.allowed_menus));
      }
      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body, html {
          overflow-x: hidden;
          width: 100%;
        }

        @media (max-width: 768px) {
          .login-left-side {
            display: none !important;
          }
          
          .login-right-side {
            flex: 1 !important;
            width: 100% !important;
            padding: 30px 20px !important;
          }

          .login-brand-right {
            font-size: 36px !important;
            margin-bottom: 25px !important;
          }

          .login-welcome-title {
            font-size: 26px !important;
          }

          .login-welcome-subtitle {
            font-size: 15px !important;
          }

          .login-welcome-box {
            margin-bottom: 30px !important;
          }
        }

        @media (max-width: 480px) {
          .login-right-side {
            padding: 25px 16px !important;
          }

          .login-brand-right {
            font-size: 32px !important;
            margin-bottom: 20px !important;
          }

          .login-welcome-title {
            font-size: 24px !important;
          }

          .login-welcome-subtitle {
            font-size: 14px !important;
          }

          .login-welcome-box {
            margin-bottom: 25px !important;
          }

          .login-form {
            gap: 20px !important;
          }

          .login-label {
            font-size: 12px !important;
          }

          .login-input {
            padding: 14px 16px !important;
            font-size: 14px !important;
          }

          .login-btn {
            padding: 15px !important;
            font-size: 15px !important;
          }

          .login-error-box {
            padding: 12px 16px !important;
            font-size: 13px !important;
            margin-bottom: 20px !important;
          }

          .login-footer {
            margin-top: 20px !important;
          }

          .login-forgot-password {
            font-size: 13px !important;
            margin-bottom: 14px !important;
          }

          .login-signup-text {
            font-size: 13px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .login-left-side {
            flex: 0.8 !important;
          }

          .login-brand-left {
            font-size: 50px !important;
          }

          .login-tagline-left {
            font-size: 16px !important;
          }

          .login-right-side {
            flex: 1 !important;
            padding: 35px !important;
          }

          .login-brand-right {
            font-size: 38px !important;
          }

          .login-welcome-title {
            font-size: 28px !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        {/* Left Side - Red Gradient Background (Hidden on mobile) */}
        {!isMobile && (
          <div style={styles.leftSide} className="login-left-side">
            <div style={styles.leftContent}>
              <h1 style={styles.brandLeft} className="login-brand-left">Omega</h1>
              <p style={styles.taglineLeft} className="login-tagline-left">Experience the Future</p>
            </div>
          </div>
        )}

        {/* Right Side - Login Form */}
        <div style={styles.rightSide} className="login-right-side">
          <div style={styles.loginBox}>
            {/* Brand Name */}
            <h1 style={styles.brandRight} className="login-brand-right">Omega</h1>

            {/* Welcome Section */}
            <div style={styles.welcomeBox} className="login-welcome-box">
              <h2 style={styles.welcomeTitle} className="login-welcome-title">Welcome Back</h2>
              <p style={styles.welcomeSubtitle} className="login-welcome-subtitle">Sign in to continue</p>
            </div>

            {/* Error Message */}
            {error && <div style={styles.errorBox} className="login-error-box">{error}</div>}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={styles.form} className="login-form">
              <div style={styles.formGroup}>
                <label style={styles.label} className="login-label">Username or Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  className="login-input"
                  onFocus={(e) => e.target.style.borderColor = "#E85555"}
                  onBlur={(e) => e.target.style.borderColor = "#E5E5E5"}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} className="login-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  className="login-input"
                  onFocus={(e) => e.target.style.borderColor = "#E85555"}
                  onBlur={(e) => e.target.style.borderColor = "#E5E5E5"}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.loginBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
                className="login-btn"
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 20px rgba(232, 85, 85, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(232, 85, 85, 0.3)";
                  }
                }}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            {/* Footer Links */}
            <div style={styles.footer} className="login-footer">
              <a 
                href="#" 
                style={styles.forgotPassword}
                className="login-forgot-password"
                onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.target.style.textDecoration = "none"}
              >
                Forget Password?
              </a>
              <p style={styles.signupText} className="login-signup-text">
                Need an account?{" "}
                <a 
                  href="#" 
                  style={styles.signupLink}
                  onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                >
                  SIGN UP
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    overflow: "hidden",
  },

  // ========== LEFT SIDE - RED GRADIENT ==========
  leftSide: {
    flex: 1,
    background: "linear-gradient(180deg, #FFCACA 0%, #FFB0B0 15%, #FF9898 30%, #FF8282 45%, #FF7070 60%, #F86060 75%, #E85555 90%, #DD4A4A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: "100vh",
  },
  leftContent: {
    textAlign: "center",
    zIndex: 10,
    color: "white",
    padding: "20px",
  },
  brandLeft: {
    fontSize: "60px",
    fontWeight: "700",
    margin: "0 0 10px 0",
    color: "white",
    letterSpacing: "-1px",
    textShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
  },
  taglineLeft: {
    fontSize: "18px",
    margin: 0,
    color: "white",
    fontWeight: "400",
    opacity: 0.95,
    letterSpacing: "0.5px",
  },

  // ========== RIGHT SIDE - WHITE FORM ==========
  rightSide: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    minHeight: "100vh",
    width: "100%",
  },
  loginBox: {
    width: "100%",
    maxWidth: "440px",
  },
  brandRight: {
    fontSize: "40px",
    fontWeight: "700",
    textAlign: "center",
    color: "#E85555",
    margin: "0 0 30px 0",
    letterSpacing: "-0.5px",
  },
  welcomeBox: {
    textAlign: "center",
    marginBottom: "40px",
  },
  welcomeTitle: {
    fontSize: "30px",
    fontWeight: "600",
    color: "#2D2D2D",
    margin: "0 0 8px 0",
    letterSpacing: "-0.3px",
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#8B8B8B",
    margin: 0,
    fontWeight: "400",
  },
  errorBox: {
    backgroundColor: "#FFE8E8",
    color: "#D32F2F",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "24px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    border: "1px solid #FFCDD2",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    color: "#6B6B6B",
    marginBottom: "8px",
    fontWeight: "500",
    letterSpacing: "0.2px",
  },
  input: {
    width: "100%",
    padding: "16px 18px",
    fontSize: "15px",
    border: "1.5px solid #E5E5E5",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#FFFFFF",
    color: "#2D2D2D",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "17px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #FF7070 0%, #E85555 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    letterSpacing: "0.3px",
    boxShadow: "0 4px 15px rgba(232, 85, 85, 0.3)",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
  },
  forgotPassword: {
    display: "block",
    color: "#E85555",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
    marginBottom: "16px",
    transition: "all 0.3s ease",
  },
  signupText: {
    fontSize: "14px",
    color: "#8B8B8B",
    margin: 0,
    fontWeight: "400",
  },
  signupLink: {
    color: "#E85555",
    fontWeight: "600",
    textDecoration: "none",
    letterSpacing: "0.5px",
    transition: "all 0.3s ease",
  },
};