import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { api } from "../services/api";
import {
  BookOpen,
  ShoppingCart,
  Bell,
  Menu,
  X,
  LogOut,
  Key,
  Check,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Package
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, login, logout } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeLink, setActiveLink] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Sync cart count
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(cart.length);
      } catch {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    // Listen for custom add-to-cart events
    window.addEventListener("cartUpdated", updateCartCount);
    // Also interval check to make sure it's always responsive
    const interval = setInterval(updateCartCount, 1500);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    async function fetchUser() {
      try {
        const res = await api.get(`/auth/user/${userId}`);
        const data = res.data;
        if (data) {
          login(data);
        } else {
          localStorage.removeItem("userId");
        }
      } catch (err) {
        console.log("User sync failed");
      }
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications([]);
      }
    } else {
      setNotifications([]);
    }

    const handleNotificationAdded = () => {
      const updated = localStorage.getItem("notifications");
      if (updated) {
        try {
          setNotifications(JSON.parse(updated));
        } catch {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    };
    window.addEventListener("notificationAdded", handleNotificationAdded);

    const path = window.location.pathname;
    if (path === "/all-books") {
      setActiveLink("all-books");
    } else if (path === "/cart") {
      setActiveLink("cart");
    } else if (path === "/admin") {
      setActiveLink("admin");
    } else {
      setActiveLink("home");
    }

    return () => {
      window.removeEventListener("notificationAdded", handleNotificationAdded);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showProfile || showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfile, showNotifications]);

  const scrollToHome = (e) => {
    e.preventDefault();
    setActiveLink("home");
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToAbout = (e) => {
    e.preventDefault();
    setActiveLink("about");
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const aboutSection = document.querySelector(".about-section");
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } else {
      const aboutSection = document.querySelector(".about-section");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const scrollToTrending = (e) => {
    e.preventDefault();
    setActiveLink("trending");
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const booksSection = document.querySelector("#books-section");
        if (booksSection) {
          booksSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } else {
      const booksSection = document.querySelector("#books-section");
      if (booksSection) {
        booksSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const scrollToContact = (e) => {
    e.preventDefault();
    setActiveLink("contact");
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const contactSection = document.querySelector("#contact-section");
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } else {
      const contactSection = document.querySelector("#contact-section");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
  };

  const removeNotification = (index, e) => {
    e.stopPropagation();
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const openOrderDetails = (notification) => {
    if (notification.orderDetails) {
      setSelectedOrder(notification);
      setShowOrderModal(true);
      setShowNotifications(false);
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  // State for password change
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordToast, setPasswordToast] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordToast("Please fill all fields.");
      setTimeout(() => setPasswordToast(""), 2500);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast("Passwords do not match.");
      setTimeout(() => setPasswordToast(""), 2500);
      return;
    }
    try {
      const res = await api.post("/auth/change-password", {
        email: user.email,
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (res.data.success) {
        setPasswordToast("Password changed successfully.");
        setShowChangePassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordToast(res.data.message || "Failed to change password.");
      }
      setTimeout(() => setPasswordToast(""), 2500);
    } catch (err) {
      setPasswordToast("Password change failed.");
      setTimeout(() => setPasswordToast(""), 2500);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                onClick={() => setActiveLink("home")}
                className="flex items-center gap-2.5 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-playfair text-lg md:text-2xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                  Online<span className="text-blue-600">Books</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                onClick={scrollToHome}
                className={`text-sm font-semibold transition-colors py-1 ${
                  activeLink === "home"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Home
              </a>
              <Link
                to="/all-books"
                onClick={() => setActiveLink("all-books")}
                className={`text-sm font-semibold transition-colors py-1 ${
                  activeLink === "all-books"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Categories
              </Link>
              <a
                href="#trending"
                onClick={scrollToTrending}
                className={`text-sm font-semibold transition-colors py-1 ${
                  activeLink === "trending"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Best Sellers
              </a>
              <a
                href="#about"
                onClick={scrollToAbout}
                className={`text-sm font-semibold transition-colors py-1 ${
                  activeLink === "about"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                About Us
              </a>
              <a
                href="#contact"
                onClick={scrollToContact}
                className={`text-sm font-semibold transition-colors py-1 ${
                  activeLink === "contact"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Contact
              </a>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setActiveLink("admin")}
                  className={`text-sm font-semibold transition-colors py-1 ${
                    activeLink === "admin"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Right Buttons / Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Shopping Cart Icon */}
              <Link
                to="/cart"
                onClick={() => setActiveLink("cart")}
                className={`relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                  activeLink === "cart" ? "text-blue-600 bg-blue-50" : ""
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  {/* My Orders Icon */}
                  <Link
                    to="/my-orders"
                    onClick={() => setActiveLink("my-orders")}
                    className={`hidden md:block relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                      activeLink === "my-orders" ? "text-blue-600 bg-blue-50" : ""
                    }`}
                    title="My Orders"
                  >
                    <Package className="h-5 w-5" />
                  </Link>

                  {/* Notifications Icon & Dropdown */}
                  <div className="hidden md:block relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                        showNotifications ? "bg-slate-100" : ""
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-indigo-600 ring-1 ring-white"></span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2.5 w-72 md:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 slide-in-from-top-3 duration-200 z-50">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="font-poppins font-bold text-slate-900">
                            Notifications
                          </h3>
                          {notifications.length > 0 && (
                            <button
                              onClick={clearNotifications}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        <div className="mt-3 max-h-80 overflow-y-auto space-y-3">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                              <Bell className="h-10 w-10 text-slate-300 mb-2" />
                              <p className="text-sm">No new notifications</p>
                            </div>
                          ) : (
                            [...notifications]
                              .reverse()
                              .map((notification, index) => {
                                const actualIndex =
                                  notifications.length - 1 - index;
                                return (
                                  <div
                                    key={index}
                                    onClick={() =>
                                      openOrderDetails(notification)
                                    }
                                    className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                                  >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 mt-0.5">
                                      <Check className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-bold text-slate-900 truncate">
                                        {notification.title}
                                      </h4>
                                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                        {notification.message}
                                      </p>
                                      <span className="text-[10px] text-slate-400 block mt-1">
                                        {notification.time}
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) =>
                                        removeNotification(actualIndex, e)
                                      }
                                      className="text-slate-400 hover:text-slate-600 p-1"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowProfile(!showProfile)}
                      className="flex items-center gap-1 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold text-xs md:text-sm shadow-sm">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-500 hidden sm:block" />
                    </button>
                    {showProfile && (
                      <div className="absolute right-0 mt-2.5 w-72 md:w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 slide-in-from-top-3 duration-200 z-50">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-extrabold text-lg shadow-sm">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <h4 className="font-poppins font-bold text-slate-900">
                              {user.name}
                            </h4>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span className="font-medium text-slate-400 uppercase tracking-wide text-[10px]">
                                Mobile
                              </span>
                              <span className="font-semibold text-slate-800">
                                {user.mobile || "Not provided"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-slate-400 uppercase tracking-wide text-[10px]">
                                Role
                              </span>
                              <span className="font-semibold text-blue-600 uppercase text-[10px] tracking-wide bg-blue-50 px-1.5 py-0.5 rounded">
                                {user.role || "Customer"}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => setShowChangePassword(true)}
                            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Key className="h-3.5 w-3.5" />
                            Change Password
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50 hover:bg-red-100 px-3 py-2 text-xs font-bold text-red-600 transition-colors"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Login / Register CTAs */
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger menu */}
              <button
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
  aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
>
  {isMobileMenuOpen ? (
    <X className="h-6 w-6" />
  ) : (
    <Menu className="h-6 w-6" />
  )}
</button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-5 duration-200 shadow-lg">
            <a
              href="#home"
              onClick={(e) => {
                scrollToHome(e);
                setIsMobileMenuOpen(false);
              }}
              className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              Home
            </a>
            <Link
              to="/all-books"
              onClick={() => {
                setActiveLink("all-books");
                setIsMobileMenuOpen(false);
              }}
              className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              Categories
            </Link>
            <a
              href="#trending"
              onClick={(e) => {
                scrollToTrending(e);
                setIsMobileMenuOpen(false);
              }}
              className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              Best Sellers
            </a>
            <a
              href="#about"
              onClick={(e) => {
                scrollToAbout(e);
                setIsMobileMenuOpen(false);
              }}
              className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              About Us
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                scrollToContact(e);
                setIsMobileMenuOpen(false);
              }}
              className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
            >
              Contact
            </a>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => {
                  setActiveLink("admin");
                  setIsMobileMenuOpen(false);
                }}
                className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              >
                Admin Panel
              </Link>
            )}

            {user && (
              <>
                <Link
                  to="/my-orders"
                  onClick={() => {
                    setActiveLink("my-orders");
                    setIsMobileMenuOpen(false);
                  }}
                  className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                >
                  My Orders
                </Link>
              </>
            )}

            {!user && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-30 duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowChangePassword(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-indigo-600" />
              <h3 className="font-poppins font-bold text-slate-900 text-lg">
                Change Password
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a new password"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10"
                >
                  Update
                </button>
              </div>
              {passwordToast && (
                <div className="mt-3 rounded-lg bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold text-white">
                  {passwordToast}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Slide-Out Drawer / Modal */}
      {showOrderModal && selectedOrder && selectedOrder.orderDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in-30 duration-200">
          <div className="h-full w-full max-w-lg bg-white p-6 shadow-2xl ring-1 ring-slate-200 flex flex-col animate-in slide-in-from-right-40 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-poppins font-extrabold text-slate-900 text-lg">
                Order Receipt Detail
              </h2>
              <button
                onClick={closeOrderModal}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Buyer Info */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Shipping Information
                </h3>
                <div className="text-sm text-slate-800 space-y-1.5">
                  <p>
                    <strong className="text-slate-500 font-medium">
                      Recipient Name:
                    </strong>{" "}
                    {selectedOrder.orderDetails.buyerName}
                  </p>
                  <p>
                    <strong className="text-slate-500 font-medium">
                      Address:
                    </strong>{" "}
                    {selectedOrder.orderDetails.buyerAddress}
                  </p>
                  <p>
                    <strong className="text-slate-500 font-medium">
                      Order Time:
                    </strong>{" "}
                    {selectedOrder.time}
                  </p>
                </div>
              </div>

              {/* Products Listed */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Items Ordered
                </h3>
                <div className="space-y-3">
                  {selectedOrder.orderDetails.books.map((book, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-xl border border-slate-100 p-3 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-20 w-16 rounded-lg object-cover shadow-sm bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {book.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          by {book.author}
                        </p>
                        <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 mt-1.5 uppercase tracking-wide">
                          {book.category}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{book.price}
                          </span>
                          {book.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{book.originalPrice}
                            </span>
                          )}
                          {book.discount && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 rounded px-1 py-0.5">
                              {book.discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Total Price */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-base font-bold text-slate-600">Total</span>
              <span className="text-2xl font-black text-blue-600 font-poppins">
                ₹{selectedOrder.orderDetails.totalAmount}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
