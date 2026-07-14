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

## 🌟 Key Features

### 📖 1. Bookstore Catalog
* **Dynamic Search & Filtration:** Advanced search, category tabs (Fiction, Tech, Manga, etc.), sorting, and filters on the [AllBooks](file:///d:/online-books/frontend/src/pages/AllBooks.js) catalog.
* **Interactive Shopping Cart:** Real-time cart calculations, items increment/decrement, and database synchronization.
* **Trending Feed:** Dynamic display of popular titles powered by specific popularity metrics.

### 🔐 2. Authentication Suite
* **Secure JWT Login:** Clean login forms with password toggles and cookie configuration.
* **Passwordless OTP Sign-in:** Multi-digit email verification flow with resend timers and cooldown controls.
* **Auth Guards & Grace Periods:** Dynamic redirection logic that grants access tokens a brief grace window to load local sessions smoothly without flashing login screens.

### 💼 3. Book Partner Program (Seller Enrollment)
* **7-Step Registration Wizard:** Interactive registration system for third-party sellers:
  1. **Info:** Personal details (auto-fills from user profile).
  2. **Store:** Optional store title and details.
  3. **Address:** Physical location and coordinates.
  4. **Identity:** Aadhaar Card & PAN Card info with mandatory uploads.
  5. **Payout:** Select Bank Account or UPI ID with validation.
  6. **Business:** Corporate or Individual seller classification (GST / selling experience).
  7. **Confirm:** Consent checklist.
* **Client-Side Image Compression:** To circumvent Vercel's **4.5MB payload limitations**, uploads are automatically compressed client-side to maximum dimensions of 1000px at 60% JPEG quality using the Canvas API.
* **Registration States:** Gracefully manages the review pipeline, showing an "Application Under Review" screen to pending applicants and redirecting approved partners to their dashboard.

### 📊 4. Partner Dashboard
* **Product Catalog Controls:** Partners can upload new book listings, configure prices, write detailed descriptions, choose genre categories, and upload book covers.
* **Sales Analytics & Orders:** Tracking system for active orders, store metrics, and monthly payout details.

### 🛡️ 5. Administrative Console
* **Application Review Queue:** Central hub for administrators to verify partner applications, review uploaded Aadhaar/PAN cards, and approve or reject applications with custom reasons.
* **User Management & Audit Trails:** Admin view for user accounts, logs of recent authentication occurrences, and system-wide activities.

---

## 📂 Project Architecture

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

## 🛠️ Installation & Getting Started

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

---

## 📍 API Reference

### Auth Routes (`/api/auth`)
* `POST /login` - Log in with password
* `POST /send-otp` - Dispatch OTP verification email
* `POST /verify-otp` - Confirm OTP and issue JWT token

### Partner Routes (`/api/partner`)
* `POST /apply` - Submit a new partner registration application
* `GET /my-status` - Query current seller application status
* `GET /applications` - List all submitted applications (Admin Only)
* `POST /review/:id` - Approve or reject applications (Admin Only)

### Catalog Routes (`/api/books`)
* `GET /` - Retrieve books catalog
* `POST /` - Insert a new book listing
* `DELETE /:id` - Erase a book from inventory
