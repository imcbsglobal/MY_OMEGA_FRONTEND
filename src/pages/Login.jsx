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
        sessionStorage.setItem("menuTree", JSON.stringify(data.menu_tree));
      }
      if (data.allowed_menus) {
        sessionStorage.setItem("menuTree", JSON.stringify(data.allowed_menus));
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
          .login-container {
            flex-direction: column !important;
          }

          .login-left-side {
            display: none !important;
          }

          .login-right-side {
            width: 100% !important;
            padding: 40px 25px !important;
            flex: none !important;
          }

          .login-mobile-logo {
            display: block !important;
            width: 120px !important;
            height: auto !important;
            margin: 0 auto 30px auto !important;
          }

          .login-top-brand {
            font-size: 40px !important;
            margin-bottom: 35px !important;
          }

          .login-welcome-title {
            font-size: 28px !important;
          }

          .login-welcome-subtitle {
            font-size: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .login-left-side {
            display: none !important;
          }

          .login-right-side {
            padding: 35px 20px !important;
          }

          .login-mobile-logo {
            display: block !important;
            width: 100px !important;
            height: auto !important;
            margin: 0 auto 25px auto !important;
          }

          .login-welcome-title {
            font-size: 26px !important;
          }

          .login-welcome-subtitle {
            font-size: 13px !important;
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

          .login-footer {
            margin-top: 25px !important;
          }

          .login-forgot-password {
            font-size: 13px !important;
          }

          .login-signup-text {
            font-size: 13px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .login-left-logo {
            width: 200px !important;
          }

          .login-top-brand {
            font-size: 44px !important;
          }

          .login-welcome-title {
            font-size: 30px !important;
          }
        }
      `}</style>

      <div style={styles.container} className="login-container">
        {/* Left Side - White with Large Logo */}
        <div style={styles.leftSide} className="login-left-side">
          <img 
            src="/assets/omega-logo.png" 
            alt="Omega Logo" 
            style={styles.leftLogo} 
            className="login-left-logo"
          />
        </div>

        {/* Right Side - White with Form */}
        <div style={styles.rightSide} className="login-right-side">
          <div style={styles.loginBox}>
            {/* Mobile Logo - Only shows on mobile */}
            {isMobile && (
              <img 
                src="/assets/omega-logo.png" 
                alt="Omega Logo" 
                style={styles.mobileLogo} 
                className="login-mobile-logo"
              />
            )}


            {/* Welcome Section */}
            <div style={styles.welcomeBox}>
              <h2 style={styles.welcomeTitle} className="login-welcome-title">Welcome Back</h2>
              <p style={styles.welcomeSubtitle} className="login-welcome-subtitle">Sign in to continue</p>
            </div>

            {/* Error Message */}
            {error && <div style={styles.errorBox}>{error}</div>}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label} className="login-label">Username or Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  className="login-input"
                  onFocus={(e) => e.target.style.borderColor = "#E85555"}
                  onBlur={(e) => e.target.style.borderColor = "#E0E0E0"}
                  placeholder="admin@gmail.com"
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
                  onBlur={(e) => e.target.style.borderColor = "#E0E0E0"}
                  placeholder="••••••••"
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
                    e.target.style.boxShadow = "0 6px 20px rgba(232, 85, 85, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 10px rgba(232, 85, 85, 0.2)";
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
                Forgot Password?
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
    margin: 0,
    padding: 0,
  },

  // ========== LEFT SIDE - WHITE WITH LOGO ==========
  leftSide: {
    flex: 1,
    background: "linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 20%, #FFE8E8 40%, #FFD6D5 60%, #F3CFCE 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    minHeight: "100vh",
    margin: 0,
  },
  leftLogo: {
    width: "280px",
    height: "auto",
    maxWidth: "90%",
  },

  // ========== RIGHT SIDE - WHITE WITH FORM ==========
  rightSide: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    minHeight: "100vh",
    margin: 0,
  },
  loginBox: {
    width: "100%",
    maxWidth: "500px",
  },
  mobileLogo: {
    display: "none",
    width: "120px",
    height: "auto",
    margin: "0 auto 30px auto",
  },
  topBrand: {
    fontSize: "48px",
    fontWeight: "700",
    textAlign: "center",
    color: "#E85555",
    marginBottom: "40px",
    letterSpacing: "-1px",
  },
  welcomeBox: {
    textAlign: "center",
    marginBottom: "40px",
  },
  welcomeTitle: {
    fontSize: "36px",
    fontWeight: "600",
    color: "#2D2D2D",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
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
    borderRadius: "12px",
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
    fontSize: "14px",
    color: "#6B6B6B",
    marginBottom: "8px",
    fontWeight: "500",
    letterSpacing: "0.2px",
  },
  input: {
    width: "100%",
    padding: "18px 20px",
    fontSize: "16px",
    border: "1.5px solid #E0E0E0",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#F8F9FA",
    color: "#2D2D2D",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "18px",
    fontSize: "17px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #FF7878 0%, #E85555 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    letterSpacing: "0.3px",
    boxShadow: "0 2px 10px rgba(232, 85, 85, 0.2)",
  },
  footer: {
    textAlign: "center",
    marginTop: "30px",
  },
  forgotPassword: {
    display: "block",
    color: "#E85555",
    fontSize: "15px",
    fontWeight: "500",
    textDecoration: "none",
    marginBottom: "16px",
    transition: "all 0.3s ease",
  },
  signupText: {
    fontSize: "15px",
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