import React from "react";

export default function FAQ() {
  return (
    <div className="faq-page">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      <div className="faq-list">
        <div className="faq-item">Q
          <h3>How do I place an order?</h3>
          <p>Browse our collection, add books to your cart, and proceed to checkout. Follow the on-screen instructions to complete your purchase.</p>
        </div>
        <div className="faq-item">
          <h3>What payment methods are accepted?</h3>
          <p>We accept credit/debit cards, UPI, and net banking.</p>
        </div>
        <div className="faq-item">
          <h3>How can I track my order?</h3>
          <p>After your order is shipped, you will receive a tracking link via email and in your account dashboard.</p>
        </div>
        <div className="faq-item">
          <h3>Can I return or exchange a book?</h3>
          <p>Yes, returns and exchanges are accepted within 7 days of delivery. Please see our return policy for details.</p>
        </div>
        <div className="faq-item">
          <h3>How do I contact support?</h3>
          <p>You can reach us via the Contact Us page or email us at hello@onlinebookstore.com.</p>
        </div>
      </div>
    </div>
  );
}
