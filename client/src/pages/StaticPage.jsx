import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaEnvelope,
  FaHeadset,
  FaLeaf,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaRegClock,
  FaStore,
  FaUsers,
} from "react-icons/fa";
import "../CSS-pages/StaticPage.css";

const legalContent = {
  privacy: {
    title: "Privacy Policy",
    body: "Nutricart protects customer, restaurant, and delivery partner information and uses account data only to provide ordering, delivery, and platform services.",
  },
  terms: {
    title: "Terms & Conditions",
    body: "By using Nutricart, users agree to provide accurate information, follow platform rules, and use ordering, restaurant, and delivery features responsibly.",
  },
};

function AboutPage() {
  const values = [
    {
      icon: <FaLeaf />,
      title: "Better choices",
      text: "We make wholesome, nourishing meals easier to discover and enjoy every day.",
    },
    {
      icon: <FaStore />,
      title: "Local partners",
      text: "We help restaurants reach more customers and grow through a simple digital platform.",
    },
    {
      icon: <FaMotorcycle />,
      title: "Reliable delivery",
      text: "Our delivery partners connect kitchens and customers with care, speed, and transparency.",
    },
  ];

  return (
    <main className="static-page about-page">
      <section className="static-hero">
        <div className="static-hero-copy">
          <p className="static-kicker">Our story</p>
          <h1>Good food should make life feel better.</h1>
          <p className="static-lead">
            Nutricart brings customers, restaurants, and delivery partners together
            to make fresh, balanced food simple to find and easy to order.
          </p>
          <Link className="static-primary-link" to="/restaurants">
            Explore restaurants <FaArrowRight />
          </Link>
        </div>
        <div className="about-visual" aria-hidden="true">
          <div className="about-visual-orbit orbit-one" />
          <div className="about-visual-orbit orbit-two" />
          <FaLeaf className="about-visual-icon" />
          <span>Fresh choices</span>
          <strong>Made simple</strong>
        </div>
      </section>

      <section className="about-intro">
        <div>
          <p className="static-kicker">Why Nutricart</p>
          <h2>A healthier food ecosystem, built for everyone.</h2>
        </div>
        <p>
          We believe convenience and mindful eating can belong on the same plate.
          Our platform gives customers more choice, equips restaurant partners with
          useful tools, and creates flexible opportunities for delivery partners.
        </p>
      </section>

      <section className="about-values">
        {values.map((value) => (
          <article className="value-card" key={value.title}>
            <span className="value-icon">{value.icon}</span>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </section>

      <section className="about-cta">
        <div>
          <p className="static-kicker">Grow with us</p>
          <h2>More than an ordering app.</h2>
          <p>Join a community working toward easier access to food that feels good.</p>
        </div>
        <div className="about-cta-links">
          <Link to="/restaurant/register-request">Partner your restaurant</Link>
          <Link to="/delivery/register-request">Become a delivery partner</Link>
        </div>
      </section>
    </main>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <main className="static-page contact-page">
      <section className="contact-heading">
        <p className="static-kicker">Get in touch</p>
        <h1>How can we help?</h1>
        <p className="static-lead">
          Questions about an order, your account, or becoming a Nutricart partner?
          Send us a message and our team will point you in the right direction.
        </p>
      </section>

      <section className="contact-layout">
        <div className="contact-details">
          <article className="contact-card">
            <span><FaEnvelope /></span>
            <div>
              <h3>Email us</h3>
              <a href="mailto:support@nutricart.com">support@nutricart.com</a>
              <p>For general questions and account support.</p>
            </div>
          </article>
          <article className="contact-card">
            <span><FaHeadset /></span>
            <div>
              <h3>Customer support</h3>
              <a href="tel:+919876543210">+91 98765 43210</a>
              <p>Help with active orders and payments.</p>
            </div>
          </article>
          <article className="contact-card">
            <span><FaMapMarkerAlt /></span>
            <div>
              <h3>Our office</h3>
              <p>Kerala, India</p>
              <small>Serving customers and partners across growing cities.</small>
            </div>
          </article>
          <div className="contact-hours">
            <FaRegClock />
            <p><strong>Support hours</strong><br />Monday–Saturday, 9:00 AM–7:00 PM</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-heading">
            <span><FaUsers /></span>
            <div>
              <h2>Send us a message</h2>
              <p>We usually respond within one business day.</p>
            </div>
          </div>
          <div className="contact-form-row">
            <label>
              Your name
              <input type="text" name="name" placeholder="Enter your name" required />
            </label>
            <label>
              Email address
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
          </div>
          <label>
            What can we help with?
            <select name="subject" defaultValue="" required>
              <option value="" disabled>Select a topic</option>
              <option>Order support</option>
              <option>Account help</option>
              <option>Restaurant partnership</option>
              <option>Delivery partnership</option>
              <option>Other</option>
            </select>
          </label>
          <label>
            Message
            <textarea name="message" rows="5" placeholder="Tell us a little more..." required />
          </label>
          <button type="submit">Send message <FaArrowRight /></button>
          {submitted && (
            <p className="contact-success" role="status">
              Thanks! Your message has been received.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}

function StaticPage({ type }) {
  if (type === "about") return <AboutPage />;
  if (type === "contact") return <ContactPage />;

  const content = legalContent[type] || legalContent.privacy;
  return (
    <main className="static-page legal-page">
      <section className="static-panel">
        <p className="static-kicker">Nutricart</p>
        <h1>{content.title}</h1>
        <p>{content.body}</p>
      </section>
    </main>
  );
}

export default StaticPage;
