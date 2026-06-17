import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaTwitter } from "react-icons/fa";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-column footer-brand">
          <h2>Nutricart</h2>
          <p>Fresh, healthy food ordering made simple for customers and partners.</p>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <Link to="/about">About Us</Link>
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className="footer-column">
          <h3>Partners</h3>
          <Link to="/restaurant/register-request">Become a Restaurant Partner</Link>
          <Link to="/delivery/register-request">Become a Delivery Partner</Link>
        </div>

        <div className="footer-column">
          <h3>Legal</h3>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>

        <div className="footer-column">
          <h3>Available in:</h3>
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
        <p>Copyright 2026 Nutricart. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
