function Footer() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return (
    <footer className="app-footer">
      <p>AI Smart Complaint Management System · ESE Project 2025-26</p>
      <p className="footer-sub">Powered by MERN + OpenRouter AI · Deployed on Render</p>
    </footer>
  );
}

export default Footer;
