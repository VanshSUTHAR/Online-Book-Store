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

## ⚙️ Backend Core Specifications

### 🖥️ 1. Server Entry Point (`backend/server.js`)
* Configures Express middleware with payload size constraints set to **`50mb`** (via `express.json` and `express.urlencoded`) to permit Base64 string file parsing for identity proofs.
* Sets up CORS (Cross-Origin Resource Sharing) validating dynamic host lists (like Vercel deployments and localhost ports).
* Manages MongoDB network exceptions, executing local fallbacks if cloud SRV lookups fail.

### 🛡️ 2. Token Security Gate (`backend/middleware/authMiddleware.js`)
* Decodes request headers (`Authorization`), strips away prefix formatting (`Bearer `), and queries signatures using JWT keys.
* Carries dev-fallback checks allowing body parameter `userId` passing for local debugging.

---

## 📂 Database Schema Models (`backend/models`)

The application defines 10 specialized MongoDB Mongoose database models:

1. **👤 [User.js](file:///d:/online-books/backend/models/User.js)**
   * Stores customer credentials: Full Name, Email (unique index), hashed Password, and Role (`customer` | `partner` | `admin`).
2. **🤝 [PartnerApplication.js](file:///d:/online-books/backend/models/PartnerApplication.js)**
   * Manages applicant details: User ID relationship, Store Name/Description, address columns, Payout options (Bank/UPI details), business parameters (GSTIN, experience years), application status (`Pending` | `Approved` | `Rejected`), and Base64 images for **Aadhaar Front, Aadhaar Back, and PAN Card**.
3. **📖 [Book.js](file:///d:/online-books/backend/models/Book.js)**
   * Defines standard bookstore offerings: Title, Author, Description, Category (Fiction, Technology, etc.), original Price, discount Price, cover imageUrl, aggregate user rating, and creation date.
4. **🛒 [Cart.js](file:///d:/online-books/backend/models/Cart.js)**
   * Maps user cart items, tracking individual book models, item counts, and selection dates.
5. **📦 [Order.js](file:///d:/online-books/backend/models/Order.js)**
   * Logs sales profiles: Customer details, shipment location, payment references, bought items list, prices, checkout method, status, and completion time.
6. **🔔 [Notification.js](file:///d:/online-books/backend/models/Notification.js)**
   * Real-time notifications system logging profile alerts, system highlights, and admin alerts (like registration applications).
7. **🪵 [ActivityLog.js](file:///d:/online-books/backend/models/ActivityLog.js)**
   * Audits events (logins, uploads, purchases) alongside IP addresses and descriptive details.
8. **📊 [LoginLog.js](file:///d:/online-books/backend/models/LoginLog.js)**
   * Audits authentication metadata, keeping user relationship IDs, log-in times, and network details.
9. **✉️ [Contact.js](file:///d:/online-books/backend/models/Contact.js)**
   * Collects help questions: Sender name, email address, custom message, and submission dates.
10. **📈 [TrendingBooks.js](file:///d:/online-books/backend/models/TrendingBooks.js)**
    * Relates popular bookstore items for custom homepage sliders.

---

## 📍 Backend API Routing Reference (`backend/routes`)

1. **🔐 [authRoutes.js](file:///d:/online-books/backend/routes/authRoutes.js)**
   * `POST /register` - Register a new account.
   * `POST /login` - Password verification and JWT delivery.
   * `POST /send-otp` / `POST /verify-otp` - Dispatch and validation for email OTPs.
2. **🤝 [partnerRoutes.js](file:///d:/online-books/backend/routes/partnerRoutes.js)**
   * `POST /apply` - Submits a partner application payload.
   * `GET /my-status` - Checks application state.
   * `GET /applications` - Fetches all submitted applications (Admin).
   * `POST /review/:id` - Approves or rejects a candidate (Admin).
3. **🛡️ [admin.js](file:///d:/online-books/backend/routes/admin.js)**
   * `GET /users` - Lists registered accounts.
   * `GET /logs` - Audit logs and admin analytics.
4. **📖 [bookRoutes.js](file:///d:/online-books/backend/routes/bookRoutes.js)**
   * `GET /` - Fetches standard catalog lists.
   * `POST /` - Creates a book listing.
   * `DELETE /:id` - Removes a book item from database.
5. **🛒 [cartRoutes.js](file:///d:/online-books/backend/routes/cartRoutes.js)**
   * `GET /` / `POST /` / `DELETE /:id` - Coordinates live cart updates in MongoDB.
6. **📦 [orderRoutes.js](file:///d:/online-books/backend/routes/orderRoutes.js)**
   * `POST /` - Registers checkout details.
   * `GET /user-orders` - Feeds buyer history pages.
7. **📈 [trendingRoutes.js](file:///d:/online-books/backend/routes/trendingRoutes.js)**
   * `GET /` - Dynamic analytics querying popular catalog listings.
8. **💳 [paymentRoutes.js](file:///d:/online-books/backend/routes/paymentRoutes.js)**
   * `POST /create-payment-intent` - Connects checkout prices to Stripe billing.
9. **📧 [contactRoutes.js](file:///d:/online-books/backend/routes/contactRoutes.js)**
   * `POST /` - Registers client inquiries.
10. **🌐 [oauthRoutes.js](file:///d:/online-books/backend/routes/oauthRoutes.js)**
    * Connects login redirects for third-party profiles (Google, etc.).

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

### 📋 Prerequisites & Environment Verification

Before proceeding, ensure you have the correct environments set up on your machine:
* **Node.js:** Verify you have version 16.x or higher installed:
  ```bash
  node -v
  npm -v
  ```
* **MongoDB:** You must have a MongoDB instance running.
  * **Local Instance:** Typically runs at `mongodb://127.0.0.1:27017/onlineBookStore`. Ensure the Mongo service is running (`services.msc` on Windows or `brew services start mongodb-community` on macOS).
  * **Cloud Instance:** Create a free database cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and copy the connection string.

---

### 📦 1. Detailed Backend Configuration

1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Install Server-Side Dependencies:**
   This installs Express, Mongoose, JWT utilities, CORS middleware, Stripe SDK, and Nodemailer:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file directly under the `backend/` folder and configure the following keys:
   ```env
   # Network settings
   PORT=5000

   # Database settings (Replace with your Atlas URI if using cloud)
   MONGO_URI=mongodb://127.0.0.1:27017/onlineBookStore

   # JWT Signature (Choose a strong secret phrase)
   JWT_SECRET=your_jwt_secret_key_here

   # SMTP Credentials for OTP Verification & Admin Alerts
   # Note: For Gmail, you must generate a 16-character 'App Password' from Google Account Settings -> Security -> 2-Step Verification.
   ADMIN_EMAIL=your_email@gmail.com
   ADMIN_EMAIL_PASS=your_16_digit_app_password

   # Stripe Private Keys (Retrieved from Stripe Developer Dashboard -> API Keys)
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   ```

4. **Launch the Server:**
   You have two options for starting the backend process:
   * **Development Mode (Auto-Reload on Code Change):**
     ```bash
     npm run dev
     ```
     *(Uses `nodemon` to automatically restart the server when files are edited.)*
   * **Production / Standard Mode:**
     ```bash
     npm start
     ```
   On launch, you should see console logs verifying `Server running on port 5000` and `MongoDB connected`.

---

### 💻 2. Detailed Frontend Configuration

1. **Navigate to the Frontend Directory:**
   ```bash
   cd ../frontend
   ```

2. **Install Client-Side Dependencies:**
   Installs React packages, Lucide React icons, Stripe Elements, Axios, Tailwind configurations, and animated particles library:
   ```bash
   npm install
   ```

3. **Configure Frontend Environment:**
   Create a `.env` file directly under the `frontend/` folder and populate it:
   ```env
   # API Target (Points to the active backend server instance)
   REACT_APP_API_URL=http://localhost:5000

   # Stripe Public Key (Retrieved from Stripe Developer Dashboard -> API Keys)
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

4. **Execute the Client Application:**
   * **Run Local Dev Server:**
     ```bash
     npm start
     ```
     This starts the app locally. Your default web browser will automatically open [http://localhost:3000](http://localhost:3000).
   * **Build Production Bundle:**
     ```bash
     npm run build
     ```
     *(Compiles code down to minified HTML, CSS, and JS bundles ready for static deployments like Vercel or Netlify.)*

---

### 🛡️ 3. Establishing the Initial Admin Account

To access the administrative console `/admin` and review/approve seller requests:
1. Register a standard user account using the website's sign-up form.
2. Open your MongoDB interface (e.g., **MongoDB Compass** or the `mongosh` terminal).
3. Connect to your database instance and navigate to the `onlineBookStore` database.
4. Open the `users` collection.
5. Find the document matching the email address you just registered.
6. Edit the `role` field value, changing it from `"customer"` to `"admin"`.
7. Save the document modifications.
8. Log out from the bookstore website and log back in. The navigation bar will now show the **Admin Console** dashboard options.

