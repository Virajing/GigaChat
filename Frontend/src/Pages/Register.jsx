import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/AuthNav";
import Footer from "../components/Footer";
import styles from "../Stylesheets/Register.module.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
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
    setLoading(true);

    try {
      const res = await fetch("https://gigachat-ivoq.onrender.com/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      console.log("User registered:", data);

      // ✅ Save token or user info if backend sends it
      // localStorage.setItem("token", data.token);

      navigate("/"); // redirect to home
    } catch (err) {
      console.error(err);
      setError(err.message);
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
          <h2>Create Your Account</h2>
          <form onSubmit={handleSubmit} className={styles["register-form"]}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className={styles["register-btn"]}
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          {error && <p className={styles.error}>{error}</p>}

          <p className={styles.para}>
            Already have an account?{" "}
            <span
              className={styles["login-link"]}
              onClick={() => navigate("/login")}
            >
              Login here
            </span>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
