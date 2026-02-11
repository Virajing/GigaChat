import React from "react";
import styles from "../Stylesheets/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles["footer-content"]}>
        <span className={styles["footer-logo"]}>⚡ Giga Chat</span>
        <p>Made with ❤️ by Viraj (Team Giga) · © {new Date().getFullYear()}</p>
      </div>
      <ul className={styles["footer-links"]}>
        <li>Privacy Policy</li>
        <li>Terms</li>
        <li>Contact</li>
      </ul>
    </footer>
  );
}
