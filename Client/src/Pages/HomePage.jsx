import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import styles from "../Stylesheets/Homepage.module.css"; // import the CSS file
import Navbar from "../Components/AuthNav";
import Footer from "../Components/Footer";

export default function HomePage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/main");
    }
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className={styles.homepage}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.hero}
        >
          <div className={styles["hero-icon"]}>
            <MessageCircle size={48} color="#FFD700" />
          </div>
          <h1>
            Welcome to <span className={styles.highlight}>Giga Chat</span>
          </h1>
          <p>
            A next-gen chat webapp designed for seamless conversations, real-time
            messaging, and smart features. Connect with your friends, teams, or
            communities all in one place!
          </p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={styles.features}
        >
          {[
            {
              title: "Real-time Chat",
              desc: "Stay connected instantly with smooth and fast messaging.",
              icon: <MessageCircle size={36} color="#FFD700" />,
            },
            {
              title: "Smart Features",
              desc: "Voice & video calls, media sharing, and intelligent tools.",
              icon: <Sparkles size={36} color="#FFD700" />,
            },
            {
              title: "Community Ready",
              desc: "Create groups, manage contacts, and grow your network.",
              icon: <MessageCircle size={36} color="#FFD700" />,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className={styles["feature-card"]}
            >
              <div className={styles["feature-icon"]}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className={styles.cta}
        >
          <button className={styles["cta-btn"]} onClick={() => navigate('/register')}>Get Started</button>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
