import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, BookOpen, Send } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const scrollToSection = (sectionId, page = "/") => {
    if (window.location.pathname !== page) {
      navigate(page);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Top Border with beautiful gradients */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-violet-600 to-amber-500"></div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Mission Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-playfair text-lg font-bold text-white">
                Online<span className="text-blue-500">Books</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Discover stories that inspire, classics that endure, and educational materials that expand your horizons. We curate the best titles for every curious mind.
            </p>
            {/* Social Media SVG Icons */}
            <div className="flex space-x-3 pt-2">
              <a
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-400 transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-400 transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-400 transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
              <a
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Categories Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("books-section", "/")}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("Fiction", "/all-books")}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Fiction Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("Non-Fiction", "/all-books")}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Non-Fiction Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("Technology", "/all-books")}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Technology Books
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("contact-section", "/")}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Contact Form
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/delivery")}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Delivery Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/faq")}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Faq & Help Center
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Map Details Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Newsletter
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe to receive weekly curated recommendations and get 15% off your first checkout!
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                aria-label="Subscribe"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            {newsletterSubscribed && (
              <p className="text-xs text-green-400 font-semibold animate-fade-in animate-pulse">
                ✓ Thank you! Please check your inbox.
              </p>
            )}

            {/* Address */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>123 Book St, New Delhi, India 110001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-blue-400">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright section */}
        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Online Book Store. Crafted with elegance for global readers.</p>
          <div className="flex space-x-6">
            <a href="/faq" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="/delivery" className="hover:text-slate-400 transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
