import React from "react";

export default function Delivery() {
  return (
    <div className="delivery-page">
      <h1 className="delivery-title">Delivery Information</h1>
      <div className="delivery-content">
        <h3>Shipping Times</h3>
        <p>Orders are processed within 1-2 business days. Delivery typically takes 3-7 business days depending on your location.</p>
        <h3>Shipping Charges</h3>
        <p>We offer free shipping on orders above ₹499. For orders below this amount, a nominal shipping fee applies.</p>
        <h3>Order Tracking</h3>
        <p>Once your order is shipped, you will receive a tracking link via email and in your account dashboard.</p>
        <h3>Delivery Partners</h3>
        <p>We partner with leading courier services to ensure safe and timely delivery of your books.</p>
        <h3>International Shipping</h3>
        <p>Currently, we only ship within India.</p>
      </div>
    </div>
  );
}
