import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
  FaTwitter,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-column footer-brand">
          <Link className="footer-logo" to="/" aria-label="Nutricart home">
            <span className="footer-logo-mark">N</span>
            <span>Nutricart</span>
          </Link>
          <p>Fresh, healthy food ordering made simple for customers and partners.</p>
          <span className="footer-tagline">Eat better. Live brighter.</span>
        </div>

        <nav className="footer-column footer-company" aria-label="Company">
          <h3>Company</h3>
          <Link to="/about"><span>About Us</span><FaArrowRight /></Link>
          <Link to="/restaurants"><span>Restaurants</span><FaArrowRight /></Link>
          <Link to="/cart"><span>Cart</span><FaArrowRight /></Link>
          <Link to="/contact"><span>Contact Us</span><FaArrowRight /></Link>
          <Link to="/admin/login"><span>Admin Access</span><FaArrowRight /></Link>
        </nav>

        <div className="footer-column">
          <h3>Partners</h3>
          <Link to="/restaurant/login">Become a Restaurant Partner</Link>
          <Link to="/delivery/login">Become a Delivery Partner</Link>
        </div>

        <div className="footer-column">
          <h3>Legal</h3>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>

        <div className="footer-column">
          <h3>Available in:</h3>
          <span>Kerala</span>
          <span>Bangalore</span>
          <span>Hyderabad</span>
          <span>Delhi</span>
          <span>Mumbai</span>
          <span>Pune</span>
        </div>

        <div className="footer-column">
          <h3>Social Links</h3>
          <div className="footer-socials">
            <a href="https://www.linkedin.com" aria-label="Nutricart LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="https://www.instagram.com" aria-label="Nutricart Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.facebook.com" aria-label="Nutricart Facebook">
              <FaFacebookF />
            </a>
            <a href="https://www.pinterest.com" aria-label="Nutricart Pinterest">
              <FaPinterestP />
            </a>
            <a href="https://www.twitter.com" aria-label="Nutricart Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Nutricart. All rights reserved.</p>
        <p>Made with care for healthier choices.</p>
      </div>
    </footer>
  );
}

export default Footer;
