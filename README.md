# Online Book Store (MERN Full-Stack)

A premium, full-featured web application for browsing, ordering, and managing books, including an administrative console and a multi-step seller enrollment program.

---

## 🚀 Tech Stack

### Frontend
* **Core:** React (v19) with React Router Dom (v7) for dynamic routing.
* **State Management:** React Context API (`UserContext.js`) for authentication and session management.
* **Styling:** Custom Vanilla CSS & Tailwind CSS for modern, responsive, and glassmorphic designs.
* **Icons:** Lucide React for consistent vector iconography.
* **Integrations:** Stripe SDK for secure checkout processing.

### Backend
* **Runtime & Framework:** Node.js with Express.
* **Database:** MongoDB configured with Mongoose ODM schemas.
* **Authentication:** JSON Web Tokens (JWT) & automated email OTP verification (Nodemailer).
* **Payment Gateways:** Stripe API integration.

---

## 🖥️ Frontend Pages Directory (`src/pages`)

The frontend application consists of 12 main views, each mapped to a specific path in [App.js](file:///d:/online-books/frontend/src/App.js):

1. **🏠 [Books.js](file:///d:/online-books/frontend/src/pages/Books.js) (Home Page)**
   * Displays the book showcase, trending sliders, interactive category grids, dynamic star-field backgrounds (`tsparticles`), and general bookstore headers.
2. **📚 [AllBooks.js](file:///d:/online-books/frontend/src/pages/AllBooks.js) (Book Search & Filter)**
   * Provides a comprehensive catalog browser containing a live text search bar, sidebar filtering (by genre, custom price sliders, rating levels), sorting parameters (price, title, rating), and instant cart addition.
3. **🤝 [Become-partner.js](file:///d:/online-books/frontend/src/pages/Become-partner.js) (Seller Enrollment Onboarding)**
   * A 7-step partner application registration wizard checking user details, store name, address, payout options (Bank Account / UPI ID), identity verification (Aadhaar & PAN card image upload), and corporate status.
   * Features client-side image compression (down to 1000px maximum boundaries with 60% JPEG quality) to respect Vercel's **4.5MB payload size limits**.
   * Integrates automatic redirection to the dashboard for approved sellers and a custom "Application Under Review" screen for pending applicants.
4. **📊 [PartnerDashboard.js](file:///d:/online-books/frontend/src/pages/PartnerDashboard.js) (Seller Console)**
   * Access-controlled dashboard allowing approved partners to insert new catalog items (title, author, original/discounted price, category selection, description, and image URL), inspect uploaded items, and trace cumulative sales metrics.
5. **🛒 [Cart.js](file:///d:/online-books/frontend/src/pages/Cart.js) (Shopping Cart)**
   * Displays selected books, quantities, and calculated item subtotals. Synchronizes the cart status with the backend database or falls back to local storage session caching.
6. **💳 [Orders.js](file:///d:/online-books/frontend/src/pages/Orders.js) (Checkout Processing)**
   * Form-based delivery registration page prompting for customer contact details, shipping location, and payment choices. Launches Stripe billing inputs on checkout confirmation.
7. **👤 [Login.js](file:///d:/online-books/frontend/src/pages/Login.js) (Authentication & OTP Verification)**
   * Double-mode portal permitting logins via email-password credentials or dynamic 6-digit email OTP keys (automated nodemailer triggers) backed by resend timers and rate cooldowns.
8. **📝 [Register.js](file:///d:/online-books/frontend/src/pages/Register.js) (Account Registration)**
   * Simple user onboarding page with instant field checks for full name, email, password, and mobile number.
9. **📦 [MyOrders.js](file:///d:/online-books/frontend/src/pages/MyOrders.js) (Customer Order History)**
   * Access portal for logged-in buyers to check their order transactions, delivery timelines, payment confirmations, and historical details.
10. **🛡️ [Admin.js](file:///d:/online-books/frontend/src/pages/Admin.js) (Administrative Control Center)**
    * Ultimate admin panel displaying bookstore analytics (total sales, user counts, approved sellers) and tools to review seller applications (inspect Aadhaar/PAN cards, check payout routes, and approve or reject submissions).
11. **🚚 [Delivery.js](file:///d:/online-books/frontend/src/pages/Delivery.js) (Shipping Operations Guide)**
    * Info page outlining courier partners, shipping speeds, shipping rates, and delivery rules.
12. **❓ [FAQ.js](file:///d:/online-books/frontend/src/pages/FAQ.js) (Support & QA Accordion)**
    * Accordion-style layout resolving customer issues regarding shipping times, cancellations, payment options, and return processes.

---

## 🎨 Global Layout Components (`src/components`)

1. **[Navbar.js](file:///d:/online-books/frontend/src/components/Navbar.js) (Header Controller)**
   * Premium nav header carrying active page navigation, real-time cart badge counts, notification dropdown trays, and user profile management (login/logout triggers).
2. **[Footer.js](file:///d:/online-books/frontend/src/components/Footer.js) (Footer Layout)**
   * Grid section carrying info columns, shopping catalogs, newsletter headers, and payment system badges.
3. **[StripeCheckout.js](file:///d:/online-books/frontend/src/components/StripeCheckout.js) (Payment Modal)**
   * Stripe-integrated layout that securely displays credit/debit card forms and validates charges.

---

## 🛠️ Backend Routing Directory (`backend/routes`)

Endpoints are divided logically into specific routes:

1. **🔐 [authRoutes.js](file:///d:/online-books/backend/routes/authRoutes.js)**
   * `POST /register` - Creates a new user profile.
   * `POST /login` - Processes passwords and issues JWTs.
   * `POST /send-otp` / `POST /verify-otp` - OTP verification logic.
2. **🤝 [partnerRoutes.js](file:///d:/online-books/backend/routes/partnerRoutes.js)**
   * `POST /apply` - Submits partner application data.
   * `GET /my-status` - Checks current seller status for active sessions.
   * `GET /applications` - Fetches all pending/reviewed enrollments (Admin).
   * `POST /review/:id` - Approves or rejects an applicant (Admin).
3. **🛡️ [admin.js](file:///d:/online-books/backend/routes/admin.js)**
   * `GET /users` - Fetches platform profiles.
   * `GET /logs` - Fetches audit trails and admin statistics.
4. **📖 [bookRoutes.js](file:///d:/online-books/backend/routes/bookRoutes.js)**
   * `GET /` - Fetches standard catalog lists.
   * `POST /` - Adds a new book option.
   * `DELETE /:id` - Removes a book item from database.
5. **🛒 [cartRoutes.js](file:///d:/online-books/backend/routes/cartRoutes.js)**
   * `GET /` / `POST /` / `DELETE /:id` - Coordinates live cart updates in MongoDB.
6. **📦 [orderRoutes.js](file:///d:/online-books/backend/routes/orderRoutes.js)**
   * `POST /` - Registers checkout details.
   * `GET /user-orders` - Feeds buyer history pages.
7. **📈 [trendingRoutes.js](file:///d:/online-books/backend/routes/trendingRoutes.js)**
   * `GET /` - Queries dynamic analytics to select popular books.
8. **💳 [paymentRoutes.js](file:///d:/online-books/backend/routes/paymentRoutes.js)**
   * `POST /create-payment-intent` - Validates payment values through Stripe.
9. **📧 [contactRoutes.js](file:///d:/online-books/backend/routes/contactRoutes.js)**
   * `POST /` - Accepts contact query logs.
10. **🌐 [oauthRoutes.js](file:///d:/online-books/backend/routes/oauthRoutes.js)**
    * Connects authentication redirects for Google or other social platforms.

---

## 📂 Project Directory Structure

```
online-books/
├── backend/
│   ├── config/               # DB and environment configuration
│   ├── middleware/           # Token validation (authMiddleware)
│   ├── models/               # MongoDB models (User, PartnerApplication, Book, etc.)
│   ├── routes/               # Express endpoints (auth, books, partners, payments)
│   └── server.js             # API entrypoint & middleware setup
└── frontend/
    ├── public/               # Static assets & public index
    └── src/
        ├── components/       # Layout features (Navbar, Footer, StripeCheckout)
        ├── context/          # State providers (UserContext)
        ├── pages/            # View components (Admin, Login, Become-partner, etc.)
        ├── services/         # Axios API calls (api, cartService)
        └── App.js            # Router and structural layout
```

---

## 🛠️ Setup & Running Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (running instance)

### 1. Setup Backend
1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/onlineBookStore
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=your_email@gmail.com
   ADMIN_EMAIL_PASS=your_app_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

### 2. Setup Frontend
1. Navigate to frontend:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```
4. Run application:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
