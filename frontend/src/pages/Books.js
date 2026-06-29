import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import { sendContactMessage } from "../services/contactService";
import { useUser } from "../context/UserContext";
import {
  Search,
  BookOpen,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Truck,
  ShieldCheck,
  RefreshCw,
  Award,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
  Sparkles,
  Info
} from "lucide-react";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [trendingIds, setTrendingIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [toast, setToast] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailBook, setDetailBook] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  // Carousel refs & state
  const arrivalsRef = useRef(null);
  const testimonialsRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  useEffect(() => {
    if (location.state?.buyBook) {
      const loggedInUserId = user?._id || user?.id || localStorage.getItem("userId");
      if (loggedInUserId) {
        setSelectedBook(location.state.buyBook);
        setBuyerName("");
        setBuyerAddress("");
        setIsCheckoutOpen(true);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, user, navigate, location.pathname]);

  useEffect(() => {
    // Fetch all books
    api.get("/books")
      .then(res => {
        setBooks(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setBooks([]));

    // Fetch trending book IDs
    api.get("/trending")
      .then(res => {
        setTrendingIds(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setTrendingIds([]));

    // Load wishlist
    try {
      const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlist(stored);
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    if (isCheckoutOpen || isDetailOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isCheckoutOpen, isDetailOpen]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const addToCart = (book) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(book);
    localStorage.setItem("cart", JSON.stringify(cart));
    // Trigger event for navbar
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
    const loggedInUserId = user?._id || user?.id || localStorage.getItem("userId");
    if (!loggedInUserId) {
      showToastMsg("Please login or register to buy books.");
      navigate("/login", { state: { from: "/", buyBook: book } });
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
      const userId = user && user._id ? user._id : localStorage.getItem("userId");
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
      showToastMsg("Order placement failed. Please try again.");
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

    // Create notification
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

    // Trigger navbar update
    window.dispatchEvent(new Event("notificationAdded"));

    showToastMsg("✓ Order placed successfully!");
    closeCheckout();
  };

  const submitContact = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToastMsg("Please fill all contact fields.");
      return;
    }
    try {
      await sendContactMessage(contactName, contactEmail, contactMessage);
      showToastMsg("✓ Message sent successfully! We will contact you soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      showToastMsg("Failed to send message. Please try again later.");
    }
  };

  // Filter books
  const trendingBooks = books.filter(book => trendingIds.includes(book._id || book.id));
  const filteredTrendingBooks = trendingBooks.filter(book => {
    const title = (book.title || "").toLowerCase();
    const author = (book.author || "").toLowerCase();
    const query = searchTerm.toLowerCase();
    return title.includes(query) || author.includes(query);
  });

  // Categories
  const categoriesList = [
    { name: "Fiction", count: "12,000+ Books", icon: "📖", color: "from-blue-500/10 to-indigo-500/10 hover:border-blue-500/30", linkId: "Fiction" },
    { name: "Non-Fiction", count: "9,500+ Books", icon: "📚", color: "from-purple-500/10 to-pink-500/10 hover:border-purple-500/30", linkId: "Non-Fiction" },
    { name: "Business", count: "4,200+ Books", icon: "💼", color: "from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/30", linkId: "Business" },
    { name: "Technology", count: "6,800+ Books", icon: "💻", color: "from-cyan-500/10 to-blue-500/10 hover:border-cyan-500/30", linkId: "Technology" },
    { name: "Self Help", count: "3,500+ Books", icon: "🧠", color: "from-amber-500/10 to-orange-500/10 hover:border-amber-500/30", linkId: "Self-Help" },
    { name: "Children", count: "5,000+ Books", icon: "🎈", color: "from-rose-500/10 to-pink-500/10 hover:border-rose-500/30", linkId: "Children" },
    { name: "Academic", count: "8,100+ Books", icon: "🎓", color: "from-indigo-500/10 to-violet-500/10 hover:border-indigo-500/30", linkId: "Academic" },
    { name: "Manga", count: "7,300+ Books", icon: "💥", color: "from-orange-500/10 to-red-500/10 hover:border-orange-500/30", linkId: "Manga" }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Aarav Sharma",
      role: "Avid Reader",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      content: "The web layout is incredibly easy to navigate. Book deliveries are always prompt and the packaging is top tier. Easily my go-to store now!",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "College Student",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      content: "As a computer science student, finding textbooks is always hard and expensive. Here I got all my programming reference books at massive discounts!",
      rating: 5
    },
    {
      name: "Vikram Malhotra",
      role: "Tech Lead",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
      content: "Excellent UI! The design looks very high-end and premium. Highly responsive customer support team and effortless order payment via UPI.",
      rating: 5
    }
  ];

  // Scroll functions
  const scrollList = (ref, direction) => {
    if (ref.current) {
      const scrollAmt = direction === "left" ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 2. Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-[#F8FAFC] py-20 lg:py-24">
        {/* Modern Background Effects */}
        <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute bottom-10 left-10 h-[300px] w-[300px] rounded-full bg-violet-400/10 blur-[80px]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/50 px-4 py-1.5 text-xs font-bold text-blue-600 shadow-sm animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>The Premier Book Store of 2026</span>
              </div>
              <h1 className="font-playfair text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Discover Your Next <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Literary Masterpiece
                </span>
              </h1>
              <p className="mx-auto lg:mx-0 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
                Explore thousands of books across multiple genres. From international bestsellers to academic research materials. Delivered instantly to your door.
              </p>

              {/* Search Bar Input */}
              <div className="mx-auto lg:mx-0 max-w-md relative flex items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-100 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-300">
                <Search className="h-5 w-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search by Title, Author, Publisher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-none bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById("books-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  Search
                </button>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById("books-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 text-sm font-bold transition-all shadow-lg hover:translate-y-[-2px]"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("categories-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl border border-slate-200 bg-white/70 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all hover:translate-y-[-2px]"
                >
                  Browse Categories
                </button>
              </div>

              {/* Statistical numbers metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/60 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-black text-slate-900 font-poppins">50,000+</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Books</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 font-poppins">100,000+</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 font-poppins flex items-center justify-center lg:justify-start gap-1">
                    4.9
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Avg Rating</div>
                </div>
              </div>
            </div>

            {/* Right Graphics/Floating Books mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-72 sm:w-96 aspect-square rounded-3xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 flex items-center justify-center shadow-inner">
                {/* Simulated Floating Books */}
                <div className="absolute transform -rotate-12 translate-x-[-30px] translate-y-[-20px] transition-all hover:scale-105 duration-300 shadow-2xl rounded-lg overflow-hidden border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=260"
                    alt="Mockup Book"
                    className="w-40 h-56 object-cover"
                  />
                </div>
                <div className="absolute transform rotate-6 translate-x-[40px] translate-y-[30px] transition-all hover:scale-105 duration-300 shadow-2xl rounded-lg overflow-hidden border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=260"
                    alt="Mockup Book 2"
                    className="w-40 h-56 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories */}
      <section id="categories-section" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-playfair text-3xl font-black text-slate-900 sm:text-4xl">
              Featured Categories
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Dive into our rich collections handpicked for you. Search and discover books of your favorite niche.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {categoriesList.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate("/all-books#" + cat.linkId)}
                className={`group cursor-pointer rounded-2xl border border-slate-150 p-6 bg-gradient-to-br ${cat.color} transition-all duration-300 hover:shadow-lg hover:translate-y-[-3px] flex flex-col items-center text-center`}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300 mb-3 block">
                  {cat.icon}
                </span>
                <h3 className="font-poppins font-bold text-slate-900 text-sm">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400 mt-1">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Best Seller Books Section */}
      <section id="books-section" className="py-20 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                <TrendingUp className="h-3 w-3" />
                <span>Trending Books</span>
              </div>
              <h2 className="font-playfair text-3xl font-black text-slate-900 sm:text-4xl">
                Best Seller Books
              </h2>
            </div>
            <button
              onClick={() => navigate("/all-books")}
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              See All Collection
              <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {filteredTrendingBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-3xl bg-white">
              <BookOpen className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium">No trending books available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {filteredTrendingBooks.map((book) => {
                const isFavorite = wishlist.some(item => (item._id || item.id) === (book._id || book.id));
                return (
                  <div
                    key={book._id || book.id}
                    onClick={() => openDetail(book)}
                    className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col relative"
                  >
                    {/* Discount Tag */}
                    {book.discount > 0 ? (
                      <span className="absolute top-4 left-4 z-10 rounded-lg bg-green-500 text-[10px] font-bold text-white px-2 py-1 shadow-sm uppercase tracking-wide">
                        {book.discount}% OFF
                      </span>
                    ) : null}

                    {/* Heart wishlist button */}
                    <button
                      onClick={(e) => toggleWishlist(book, e)}
                      className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`h-4.5 w-4.5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </button>

                    {/* Book image */}
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-4 relative">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md text-slate-700 hover:text-blue-600 transition-colors">
                          <Eye className="h-5 w-5" />
                        </span>
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 flex flex-col">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 self-start uppercase tracking-wider mb-2">
                        {book.category}
                      </span>
                      <h3 className="font-poppins font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                        by {book.author}
                      </p>

                      <div className="mt-2.5">
                        {renderStars(book.rating)}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-1.5 mt-3">
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{book.price}
                        </span>
                        {book.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{book.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Card actions */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(book);
                          }}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 transition-colors"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openCheckout(book);
                          }}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 py-2 text-xs font-bold text-white transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. New Arrivals Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-playfair text-3xl font-black text-slate-900 sm:text-4xl">
                New Arrivals
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Fresh releases from global publishing houses. Updated hourly.
              </p>
            </div>
            {/* Scroll navigation triggers */}
            <div className="flex space-x-2">
              <button
                onClick={() => scrollList(arrivalsRef, "left")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollList(arrivalsRef, "right")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={arrivalsRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {books.slice(-8).map((book) => (
              <div
                key={book._id || book.id}
                onClick={() => openDetail(book)}
                className="w-64 shrink-0 snap-start cursor-pointer group"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 mb-3 shadow-md border border-slate-100 relative">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                  {book.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-sm">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="font-poppins font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-slate-400 text-xs truncate">by {book.author}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-extrabold text-slate-900">₹{book.price}</span>
                  {renderStars(book.rating)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="py-20 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-playfair text-3xl font-black text-slate-900 sm:text-4xl">
              Why Readers Choose Us
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              We focus on building the absolute best customer experience with focus on affordability and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-bold text-slate-900 text-sm">Fast Delivery</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Free shipping India-wide with automated tracking links.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-bold text-slate-900 text-sm">Huge Collection</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Over 50,000 books covering all genres and academic topics.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-bold text-slate-900 text-sm">Secure Payments</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                100% encrypted direct bank transfer UPI verification.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 mb-4">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-bold text-slate-900 text-sm">Easy Returns</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                7 days replacement policy if the book is damaged.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-poppins font-bold text-slate-900 text-sm">Expert Picks</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Curated catalogs prepared weekly by our chief editor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Customer Reviews */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-playfair text-3xl font-black text-slate-900 sm:text-4xl">
                What Our Customers Say
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Real feedback from our regular bibliophiles and readers.
              </p>
            </div>
            {/* Carousel navigation triggers */}
            <div className="flex space-x-2">
              <button
                onClick={() => scrollList(testimonialsRef, "left")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollList(testimonialsRef, "right")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={testimonialsRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((test, index) => (
              <div
                key={index}
                className="w-full sm:w-[450px] shrink-0 snap-start rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  "{test.content}"
                </p>
                <div className="flex items-center gap-3.5 mt-6 border-t border-slate-100 pt-4">
                  <img
                    src={test.image}
                    alt={test.name}
                    className="h-10 w-10 rounded-full object-cover bg-slate-100"
                  />
                  <div>
                    <h4 className="font-poppins font-bold text-slate-950 text-xs">{test.name}</h4>
                    <span className="text-[10px] text-slate-400 block">{test.role}</span>
                  </div>
                  <div className="ml-auto">
                    {renderStars(test.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Special Offer Banner */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-[40px] transform translate-x-12 translate-y-[-12]" />
            <div className="relative z-10 max-w-xl space-y-5">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 rounded px-2.5 py-1">
                Summer Special Offer
              </span>
              <h2 className="font-playfair text-3xl font-black md:text-4xl leading-tight">
                Get up to 40% discount on Academic & Tech releases.
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                Build your reference library today. Safe payment verification via scanner and free shipping nationwide.
              </p>
              <button
                onClick={() => navigate("/all-books")}
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 text-blue-600 px-6 py-3 font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Claim Offer Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. About Us */}
      <section className="about-section py-20 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text Story */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                  Our Story
                </span>
                <h2 className="font-playfair text-3xl font-black text-slate-900 sm:text-4xl">
                  Your Trusted Partner in Literary Excellence
                </h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Welcome to <strong>Online Book Store</strong>, where stories come alive and knowledge knows no bounds. Since our inception, we've been dedicated to bringing readers and books together, creating a haven for bibliophiles and curious minds alike.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our carefully curated collection spans across genres—from timeless classics to contemporary bestsellers, from gripping manga to thought-provoking non-fiction. We believe every reader deserves access to quality literature at affordable prices.
              </p>

              {/* Mission/Vision Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/50 bg-white p-4">
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Our Mission</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    To make reading affordable, convenient, and accessible to anyone, anywhere in the country.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/50 bg-white p-4">
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Our Vision</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    To foster a national community of readers by offering the best online library experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Graphics */}
            <div className="rounded-3xl bg-white border border-slate-200/60 p-8 shadow-sm grid grid-cols-2 gap-8 text-center relative">
              <div className="space-y-1">
                <span className="text-3xl font-black text-blue-600 font-poppins">12K+</span>
                <h4 className="text-xs font-bold text-slate-900">Books Available</h4>
                <p className="text-[10px] text-slate-400">Regularly updated catalog</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl font-black text-violet-600 font-poppins">24/7</span>
                <h4 className="text-xs font-bold text-slate-900">Client Support</h4>
                <p className="text-[10px] text-slate-400">Email & Call support</p>
              </div>
              <div className="space-y-1 border-t border-slate-100 pt-6">
                <span className="text-3xl font-black text-indigo-600 font-poppins">100%</span>
                <h4 className="text-xs font-bold text-slate-900">Encrypted Payments</h4>
                <p className="text-[10px] text-slate-400">UPI checkout security</p>
              </div>
              <div className="space-y-1 border-t border-slate-100 pt-6">
                <span className="text-3xl font-black text-emerald-600 font-poppins">5 ★</span>
                <h4 className="text-xs font-bold text-slate-900">Client Review</h4>
                <p className="text-[10px] text-slate-400">Top-tier rating average</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Contact Section */}
      <section id="contact-section" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="font-playfair text-3xl font-black text-slate-900 sm:text-4xl">
              Get in Touch
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              Have questions about your order or payment? Send us a message and we'll reply under 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Call Us</h3>
                  <p className="text-sm text-slate-600 mt-1 font-semibold">+91 98765 43210</p>
                  <span className="text-xs text-slate-400 mt-0.5 block">Mon - Sun, 9:00 AM - 9:00 PM</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Email Support</h3>
                  <p className="text-sm text-slate-600 mt-1">hello@onlinebookstore.com</p>
                  <p className="text-sm text-slate-600">support@onlinebookstore.com</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Visit Store Office</h3>
                  <p className="text-sm text-slate-600 mt-1">123 Book Street, Reading City,</p>
                  <span className="text-xs text-slate-400">New Delhi, India 110001</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 p-6 sm:p-8 bg-white shadow-sm space-y-5">
              <h3 className="font-poppins font-bold text-slate-950 text-lg">Send Message</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Write your message detail..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                onClick={submitContact}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10 active:scale-95"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bottom Navigation for All Books catalog */}
      <button
        onClick={() => navigate("/all-books")}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 text-sm font-bold shadow-xl shadow-blue-500/25 active:scale-95 transition-all animate-bounce"
      >
        <BookOpen className="h-4.5 w-4.5" />
        Explore Books Catalog
      </button>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Detailed book modal overlay */}
      {isDetailOpen && detailBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-30 duration-200 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl bg-white p-5 sm:p-6 shadow-2xl ring-1 ring-slate-200 overflow-y-auto flex flex-col md:flex-row gap-5 md:gap-8 animate-in zoom-in-95 duration-200 my-auto">
            <button
              onClick={closeDetail}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all z-20 shadow-sm backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Book Image */}
            <div className="w-40 h-56 sm:w-48 sm:h-64 md:w-60 md:h-80 mx-auto md:mx-0 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 shadow-lg border border-slate-100 relative">
              <img
                src={detailBook.image}
                alt={detailBook.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
                }}
              />
            </div>

            {/* Book Info content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                  {detailBook.category}
                </span>
                <h2 className="font-playfair text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                  {detailBook.title}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">by {detailBook.author}</p>

                <div className="mt-3 flex items-center gap-2">
                  {renderStars(detailBook.rating)}
                  <span className="text-xs text-slate-400 font-semibold">({detailBook.rating})</span>
                </div>

                <div className="flex items-baseline flex-wrap gap-2.5 mt-4">
                  <span className="text-2xl font-extrabold text-slate-900">₹{detailBook.price}</span>
                  {detailBook.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">₹{detailBook.originalPrice}</span>
                  )}
                  {detailBook.discount && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 rounded-full px-2.5 py-0.5 border border-green-200/50">
                      Save {detailBook.discount}%
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs font-medium mt-3 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  Ships within 1-2 business days
                </p>

                <div className="mt-4 sm:mt-5 border-t border-slate-100 pt-3 sm:pt-4">
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider"
                  >
                    {showDescription ? "Hide Description" : "View Description"}
                    <ChevronRight className={`h-4 w-4 transform transition-transform ${showDescription ? "rotate-90" : ""}`} />
                  </button>
                  {showDescription && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-2.5 max-h-36 overflow-y-auto pr-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {detailBook.description || "Detailed book description is currently unavailable. Contact store team for custom summaries."}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 sm:pt-5 border-t border-slate-100 mt-5">
                <button
                  onClick={() => addToCart(detailBook)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-3 text-xs sm:text-sm font-bold text-slate-700 transition-colors shadow-sm"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    closeDetail();
                    openCheckout(detailBook);
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs sm:text-sm font-bold text-white transition-colors shadow-md shadow-blue-500/20"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code / Buyer Info checkout Modal */}
      {isCheckoutOpen && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-30 duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl bg-white p-5 sm:p-6 shadow-2xl ring-1 ring-slate-200 overflow-y-auto flex flex-col md:flex-row gap-6 animate-in zoom-in-95 duration-200 my-auto">
            <button
              onClick={closeCheckout}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all z-20 shadow-sm backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* QR Scanner column */}
            <div className="md:w-1/2 flex flex-col items-center justify-center p-3 sm:p-4 border-b md:border-b-0 md:border-r border-slate-100">
              <h3 className="font-poppins font-bold text-slate-900 text-sm mb-1 text-center">Scan to Pay</h3>
              <span className="text-[10px] text-slate-400 font-semibold mb-3">Pay exactly ₹{selectedBook.price}</span>
              <div className="rounded-2xl border border-slate-200 p-2.5 bg-white shadow-sm">
                <img
                  src="/phone-pe.jpg"
                  alt="PhonePe Payment UPI QR"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=260";
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center leading-normal mt-3 max-w-xs">
                Scan PhonePe QR to send money directly to Vansh Ashokbhai Suthar using any UPI client.
              </p>
            </div>

            {/* Billing fields column */}
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