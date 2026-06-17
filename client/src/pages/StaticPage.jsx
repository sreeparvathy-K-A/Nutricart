import React from "react";
import "../CSS-pages/StaticPage.css";

const pageContent = {
  about: {
    title: "About Us",
    body: "Nutricart connects customers with fresh meals, restaurant partners, and reliable delivery partners through one simple food ordering platform.",
  },
  contact: {
    title: "Contact Us",
    body: "For support, partnership requests, or order help, reach the Nutricart team through your dashboard or registered contact details.",
  },
  privacy: {
    title: "Privacy Policy",
    body: "Nutricart protects customer, restaurant, and delivery partner information and uses account data only to provide ordering, delivery, and platform services.",
  },
  terms: {
    title: "Terms & Conditions",
    body: "By using Nutricart, users agree to provide accurate information, follow platform rules, and use ordering, restaurant, and delivery features responsibly.",
  },
};

function StaticPage({ type }) {
  const content = pageContent[type] || pageContent.about;

  return (
    <main className="static-page">
      <section className="static-panel">
        <p className="static-kicker">Nutricart</p>
        <h1>{content.title}</h1>
        <p>{content.body}</p>
      </section>
    </main>
  );
}

export default StaticPage;
