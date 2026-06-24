import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import {
  Search,
  BookOpen,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  X,
  Clock,
  ChevronRight,
  Info
} from "lucide-react";

export default function AllBooks() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [toast, setToast] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailBook, setDetailBook] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/books")
      .then((res) => {
        setBooks(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setBooks([]);
      });

    // Load wishlist
    try {
      const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlist(stored);
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    if (books.length > 0 && window.location.hash) {
      const id = decodeURIComponent(window.location.hash.substring(1));
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [books]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const addToCart = (book) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(book);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    showToastMsg(`✓ Added "${book.title}" to cart successfully!`);
  };

  const toggleWishlist = (book, e) => {
    e.stopPropagation();
    const bookId = book._id || book.id;
    let nextWish = [...wishlist];
    const index = nextWish.findIndex(item => (item._id || item.id) === bookId);
    if (index !== -1) {
      nextWish.splice(index, 1);
      showToastMsg(`Removed "${book.title}" from wishlist.`);
    } else {
      nextWish.push(book);
      showToastMsg(`✓ Added "${book.title}" to wishlist!`);
    }
    setWishlist(nextWish);
    localStorage.setItem("wishlist", JSON.stringify(nextWish));
  };

  const openDetail = (book) => {
    setDetailBook(book);
    setShowDescription(false);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setDetailBook(null);
  };

  const openCheckout = (book) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToastMsg("Please login or register to buy books.");
      navigate("/login");
      return;
    }
    setSelectedBook(book);
    setBuyerName("");
    setBuyerAddress("");
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedBook(null);
  };

  const confirmOrder = async () => {
    if (!buyerName.trim() || !buyerAddress.trim()) {
      showToastMsg("Please enter your name and address.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const orderPayload = {
        userId,
        books: [
          {
            bookId: selectedBook._id || selectedBook.id,
            title: selectedBook.title,
            price: selectedBook.price,
            quantity: 1
          }
        ],
        buyerName,
        buyerAddress,
        totalAmount: selectedBook.price
      };
      await api.post("/orders", orderPayload, {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });
    } catch (err) {
      showToastMsg("Order failed. Please try again.");
      return;
    }

    // Remove purchased item from cart
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const bookIndex = cart.findIndex(item => (item._id || item.id) === (selectedBook._id || selectedBook.id));
    if (bookIndex !== -1) {
      cart.splice(bookIndex, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }

    // Add notification with full order details
    const notification = {
      title: "Order Completed!",
      message: `Your order for "${selectedBook.title}" has been placed successfully. Total: ₹${selectedBook.price}`,
      time: new Date().toLocaleString(),
      read: false,
      orderDetails: {
        books: [selectedBook],
        totalAmount: selectedBook.price,
        buyerName,
        buyerAddress
      }
    };

    const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    existingNotifications.push(notification);
    localStorage.setItem("notifications", JSON.stringify(existingNotifications));

    // Trigger event for navbar to update
    window.dispatchEvent(new Event("notificationAdded"));

    showToastMsg("✓ Order placed! We will verify the payment and contact you.");
    closeCheckout();
  };

  const filteredBooks = books.filter((book) => {
    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return title.includes(query) || author.includes(query);
  });

  // Group books by category
  const booksByCategory = filteredBooks.reduce((acc, book) => {
    const cat = book.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(book);
    return acc;
  }, {});

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-8 mb-10 gap-6">
          <div>
            <h1 className="font-playfair text-4xl font-black text-slate-900 md:text-5xl">
              All Books Catalog
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Browse through our complete library grouped by specific genre categories.
            </p>
          </div>

          {/* Search bar input */}
          <div className="relative flex items-center w-full md:w-80 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
            <Search className="h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, author, publisher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-none bg-transparent pl-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Categories sidebar navigation map */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Quick Categories Navigation Anchor Sidebar (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-24 self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-poppins font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                Quick Navigation
              </h3>
              <nav className="space-y-1">
                {Object.keys(booksByCategory).map((cat) => (
                  <a
                    key={cat}
                    href={`#${cat}`}
                    className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                      {booksByCategory[cat].length}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Grid content list */}
          <main className="lg:col-span-9 space-y-12">
            {Object.keys(booksByCategory).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-3xl bg-white">
                <BookOpen className="h-12 w-12 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">No books match your criteria.</p>
              </div>
            ) : (
              Object.entries(booksByCategory).map(([category, categoryBooks]) => (
                <section
                  key={category}
                  id={category}
                  className="scroll-mt-24 space-y-5"
                >
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                    <span className="text-2xl" role="img" aria-label="Category icon">
                      📚
                    </span>
                    <h2 className="font-poppins font-bold text-slate-900 text-lg md:text-xl">
                      {category}
                    </h2>
                    <span className="text-xs text-slate-400 font-semibold">
                      ({categoryBooks.length} items)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                    {categoryBooks.map((book) => {
                      const isFavorite = wishlist.some(
                        (item) => (item._id || item.id) === (book._id || book.id)
                      );
                      return (
                        <div
                          key={book._id || book.id}
                          onClick={() => openDetail(book)}
                          className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
                        >
                          {book.discount > 0 ? (
                            <span className="absolute top-4 left-4 z-10 rounded-lg bg-green-500 text-[10px] font-bold text-white px-2 py-1 shadow-sm uppercase tracking-wide">
                              {book.discount}% OFF
                            </span>
                          ) : null}

                          <button
                            onClick={(e) => toggleWishlist(book, e)}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                            aria-label="Wishlist toggle"
                          >
                            <Heart
                              className={`h-4.5 w-4.5 ${
                                isFavorite ? "fill-red-500 text-red-500" : ""
                              }`}
                            />
                          </button>

                          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-4 relative">
                            <img
                              src={book.image}
                              alt={book.title}
                              className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-slate-700 hover:text-blue-600 transition-colors">
                                <Eye className="h-4.5 w-4.5" />
                              </span>
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-poppins font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {book.title}
                              </h3>
                              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                                by {book.author}
                              </p>
                              <div className="mt-2">{renderStars(book.rating)}</div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-baseline gap-1.5 mb-3">
                                <span className="text-base font-extrabold text-slate-900">
                                  ₹{book.price}
                                </span>
                                {book.originalPrice && (
                                  <span className="text-xs text-slate-400 line-through">
                                    ₹{book.originalPrice}
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(book);
                                  }}
                                  className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 hover:bg-slate-50 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                                >
                                  <ShoppingCart className="h-3.5 w-3.5" />
                                  Cart
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCheckout(book);
                                  }}
                                  className="rounded-lg bg-blue-600 hover:bg-blue-700 py-1.5 text-xs font-bold text-white transition-colors"
                                >
                                  Buy
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </main>
        </div>
      </div>

      {/* Floating Toast notification popup */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Detailed book modal overlay */}
      {isDetailOpen && detailBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-30 duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col md:flex-row gap-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={closeDetail}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-slate-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all z-10 bg-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Book Image */}
            <div className="md:w-1/3 aspect-[3/4] md:aspect-auto md:h-72 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
              <img
                src={detailBook.image}
                alt={detailBook.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Book Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider mb-2">
                  {detailBook.category}
                </span>
                <h2 className="font-playfair text-xl md:text-2xl font-black text-slate-900">
                  {detailBook.title}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">by {detailBook.author}</p>

                <div className="mt-3 flex items-center gap-2">
                  {renderStars(detailBook.rating)}
                  <span className="text-xs text-slate-400 font-semibold">({detailBook.rating})</span>
                </div>

                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-xl font-extrabold text-slate-900">₹{detailBook.price}</span>
                  {detailBook.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">₹{detailBook.originalPrice}</span>
                  )}
                  {detailBook.discount && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 rounded px-1.5 py-0.5">
                      Save {detailBook.discount}%
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-[11px] font-semibold mt-2.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  Ships within 1-2 business days
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
                  >
                    {showDescription ? "Hide Description" : "View Description"}
                    <ChevronRight className={`h-4 w-4 transform transition-transform ${showDescription ? "rotate-90" : ""}`} />
                  </button>
                  {showDescription && (
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 max-h-32 overflow-y-auto pr-2">
                      {detailBook.description || "Detailed book description is currently unavailable. Contact store team for custom summaries."}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-100 mt-5">
                <button
                  onClick={() => addToCart(detailBook)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 py-3 text-sm font-bold text-slate-700 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    closeDetail();
                    openCheckout(detailBook);
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR checkout Modal */}
      {isCheckoutOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-30 duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col md:flex-row gap-6 animate-in zoom-in-95 duration-200">
            <button
              onClick={closeCheckout}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* QR column */}
            <div className="md:w-1/2 flex flex-col items-center justify-center p-4 border-r border-slate-100">
              <h3 className="font-poppins font-bold text-slate-900 text-sm mb-1 text-center">Scan to Pay</h3>
              <span className="text-[10px] text-slate-400 font-semibold mb-3">Pay exactly ₹{selectedBook.price}</span>
              <div className="rounded-2xl border border-slate-200 p-2.5 bg-white shadow-sm">
                <img
                  src="/phone-pe.jpg"
                  alt="PhonePe QR"
                  className="w-48 h-48 object-contain rounded-xl"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=260";
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-normal mt-3 max-w-xs">
                Scan PhonePe QR to send money directly to Vansh Ashokbhai Suthar using any UPI client.
              </p>
            </div>

            {/* Billing fields */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-poppins font-bold text-slate-900 text-sm">Billing Details</h3>
                <p className="text-xs text-slate-400 truncate mb-4">{selectedBook.title}</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter recipient name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Shipping Address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Full home or office address details..."
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  onClick={closeCheckout}
                  className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOrder}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition-colors shadow-md shadow-blue-500/10"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
