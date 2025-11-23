import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/AuthNav";
import Footer from "../Components/Footer";
import styles from "../Stylesheets/Register.module.css"; // reuse same styles
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = res.data;
      console.log("User logged in:", data);

      // ✅ Save token & user info in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // ✅ Redirect to chat
      navigate("/main");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.registerPage}>
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={styles["register-container"]}
        >
          <h2>Login to Your Account</h2>

          <form onSubmit={handleSubmit} className={styles["register-form"]}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              aria-label="Username"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              aria-label="Password"
            />

            <button
              type="submit"
              className={styles["register-btn"]}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.error}
            >
              {error}
            </motion.p>
          )}

          <p className={styles.para}>
            Don’t have an account?{" "}
            <span
              className={styles["login-link"]}
              onClick={() => navigate("/register")}
            >
              Register here
            </span>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
