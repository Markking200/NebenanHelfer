import './Footer.css';

const Footer = () => {
  return (
    <footer id="contact" className="footer">
      {/* Background Elements */}
      <div className="footer-background">
        <div className="footer-orb orb-1"></div>
        <div className="footer-orb orb-2"></div>
        <div className="footer-orb orb-3"></div>
        <div className="footer-connection"></div>
      </div>

      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">
                  <div className="logo-dot dot-1"></div>
                  <div className="logo-dot dot-2"></div>
                  <div className="logo-dot dot-3"></div>
                </div>
                <span className="logo-text">NebenanHelfer</span>
              </div>
              <p className="footer-description">
                Connecting generations through AI-powered community support. 
                Building stronger neighborhoods, one connection at a time.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Facebook">
                  <span className="social-icon">📘</span>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <span className="social-icon">🐦</span>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <span className="social-icon">💼</span>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <span className="social-icon">📷</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <a href="#how-it-works" className="footer-link">
                  <span className="link-bullet"></span>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="footer-link">
                  <span className="link-bullet"></span>
                  Features
                </a>
              </li>
              <li>
                <a href="#stories" className="footer-link">
                  <span className="link-bullet"></span>
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#contact" className="footer-link">
                  <span className="link-bullet"></span>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">
                  <span className="link-bullet"></span>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-bullet"></span>
                  Safety & Privacy
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-bullet"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  <span className="link-bullet"></span>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">Get in Touch</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-content">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">+49 (0) 30 1234 5678</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div className="contact-content">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">info@nebenanhelfer.de</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div className="contact-content">
                  <span className="contact-label">Location</span>
                  <span className="contact-value">Berlin, Germany</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
         
      </div>
    </footer>
  );
};

export default Footer;