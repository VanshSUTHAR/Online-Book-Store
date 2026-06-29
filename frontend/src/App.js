import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import Cart from "./pages/Cart";
import AllBooks from "./pages/AllBooks";
import Admin from "./pages/Admin";
import Delivery from "./pages/Delivery";
import FAQ from "./pages/FAQ";
import MyOrders from "./pages/MyOrders";
import { UserProvider } from "./context/UserContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";
  return (
    <div className="app-shell">
      <ScrollToTop />
      {!isAdminPage && <Navbar />}
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Books />} />
          <Route path="/all-books" element={<AllBooks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}

