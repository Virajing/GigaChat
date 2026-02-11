import React from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from  "../Stylesheets/Nav.module.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        <MessageCircle size={28} color="#FFD700" />
        <span>Giga Chat</span>
      </div>
      <ul className={styles["nav-links"]}>
        <li onClick={() => navigate("/")}>Home</li>
         <button className={styles["cta-btn"]} onClick={() => navigate('/register')}>Get Started</button>
      </ul>
    </nav>
  );
}
