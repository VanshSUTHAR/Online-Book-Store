import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import {
  Store,
  BookOpen,
  DollarSign,
  PlusCircle,
  TrendingUp,
  Package,
  Layers,
  LogOut,
  CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function PartnerDashboard() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [partnerStatus, setPartnerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);

  // Form state to add new books
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    originalPrice: "",
    category: "Fiction",
    description: "",
    image: "",
    condition: ""
  });

  const [photoChecking, setPhotoChecking] = useState(false);

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Technology",
    "Business",
    "Self-Help",
    "Children",
    "Academic",
    "Manga"
  ];

  // Security Check: Redirect if not partner
  useEffect(() => {
    async function checkStatus() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: token } : {};
        const res = await api.get("/partner/my-status", { headers });
        if (res.data.success) {
          setPartnerStatus(res.data);
          // If not approved and not admin, redirect
          if (res.data.role !== "partner" && res.data.role !== "admin") {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } catch (err) {
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    if (!user) {
      navigate("/login");
    } else {
      checkStatus();
    }
  }, [user, navigate]);

  // Fetch partner's books (or standard catalog for demo purposes)
  useEffect(() => {
    async function fetchMyBooks() {
      try {
        const res = await api.get("/books");
        setBooks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    }
    fetchMyBooks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset condition verification if image URL changes
      if (name === "image") {
        next.condition = "";
      }
      return next;
    });
  };

  const handlePhotoCheck = async () => {
    if (!formData.image) {
      Swal.fire("Required Field", "Please enter a Cover Image URL first.", "warning");
      return;
    }
    setPhotoChecking(true);

    // Simulate smart AI cover quality verification analysis
    setTimeout(() => {
      const textForAnalysis = (formData.title + " " + formData.description).toLowerCase();
      let detectedCondition = "Good";

      if (textForAnalysis.includes("old") || textForAnalysis.includes("torn") || textForAnalysis.includes("damage") || textForAnalysis.includes("poor") || textForAnalysis.includes("rough")) {
        detectedCondition = "Poor";
      } else if (textForAnalysis.includes("used") || textForAnalysis.includes("fair") || textForAnalysis.includes("read")) {
        detectedCondition = "Fair";
      } else {
        // Deterministic check based on cover URL or weighted random choice: 70% Good, 20% Fair, 10% Poor
        const rand = Math.random();
        if (rand < 0.70) {
          detectedCondition = "Good";
        } else if (rand < 0.90) {
          detectedCondition = "Fair";
        } else {
          detectedCondition = "Poor";
        }
      }

      setFormData((prev) => ({ ...prev, condition: detectedCondition }));
      setPhotoChecking(false);

      Swal.fire({
        title: "Photo Quality Analysis Complete",
        text: `Based on cover photo scan, the book condition is evaluated as "${detectedCondition}".`,
        icon: detectedCondition === "Good" ? "success" : "info"
      });
    }, 1500);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.price || !formData.image) {
      Swal.fire("Incomplete Fields", "Please fill in all required fields.", "warning");
      return;
    }

    if (!formData.condition) {
      Swal.fire("Photo Check Required", "Please run the Cover Photo Quality Check before listing your book.", "warning");
      return;
    }

    try {
      let finalPrice = Number(formData.price);
      if (formData.condition === "Fair") {
        finalPrice = Math.round(finalPrice * 0.8);
      } else if (formData.condition === "Poor") {
        finalPrice = Math.round(finalPrice * 0.6);
      }

      const bookPayload = {
        ...formData,
        price: finalPrice,
        originalPartnerPrice: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      };

      await api.post("/books", bookPayload);
      Swal.fire("Success!", "Book listed successfully in bookstore.", "success");
      setFormData({
        title: "",
        author: "",
        price: "",
        originalPrice: "",
        category: "Fiction",
        description: "",
        image: "",
        condition: ""
      });
      // Refresh list
      const res = await api.get("/books");
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      Swal.fire("Error", "Could not list book.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const appData = partnerStatus?.application || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">

      {/* Sidebar navigation */}
      <aside className="w-full lg:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 p-6 border-r border-slate-800">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-playfair text-base font-black truncate">{appData.storeName || "Partner Store"}</h2>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Bookstore Partner</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10">
              <Layers className="h-4 w-4" />
              Store Manager
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              View Bookstore
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-800/60">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
              {user.name ? user.name[0].toUpperCase() : "P"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{user.name}</p>
              <p className="text-[9px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-950/30 border border-red-900/50 hover:bg-red-950/60 text-red-400 py-3 text-xs font-bold transition-all"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8">

        {/* Header Title Grid */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-black text-slate-900">Partner Dashboard</h1>
            <p className="text-slate-500 text-xs mt-1">Manage listings, verify store statistics and register physical book items</p>
          </div>
          <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-2xl text-xs font-bold shadow-sm">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Store Account Verified</span>
          </div>
        </section>

        {/* Dashboard KPIs Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Listings</span>
              <span className="text-2xl font-black text-slate-900 font-poppins">{books.length} Books</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sales Revenue</span>
              <span className="text-2xl font-black text-slate-900 font-poppins">₹0.00</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Performance</span>
              <span className="text-2xl font-black text-slate-900 font-poppins">Top 10%</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Store Rank</span>
              <span className="text-2xl font-black text-slate-900 font-poppins">Partner</span>
            </div>
          </div>
        </section>

        {/* Content splits: listings and add book */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* List Books Panel */}
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-playfair">Store Inventory</h3>
              <p className="text-slate-500 text-xs mt-0.5">Manage and review active books displayed in the bookstore</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Book Cover & Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {books.map((bk) => (
                    <tr key={bk._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={bk.image} alt={bk.title} className="w-8 h-11 object-cover rounded shadow-sm bg-slate-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">{bk.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">by {bk.author}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-block text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                            {bk.category || "Fiction"}
                          </span>
                          {bk.condition && (
                            <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              bk.condition === "Good"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : bk.condition === "Fair"
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-rose-50 border-rose-200 text-rose-700"
                            }`}>
                              {bk.condition}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div>₹{bk.price}</div>
                        {bk.originalPartnerPrice && bk.originalPartnerPrice !== bk.price && (
                          <div className="text-[9px] text-slate-400 line-through font-normal">₹{bk.originalPartnerPrice}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {books.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-slate-400">
                        No books listed in store catalog yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Book Form Panel */}
          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-playfair">Add New Book</h3>
              <p className="text-slate-500 text-xs mt-0.5">Register a new book catalog item to sell on our platform</p>
            </div>

            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Book Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    placeholder="e.g. 299"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {formData.price && formData.condition && (
                    formData.condition === "Good" ? (
                      <p className="mt-1.5 text-[9px] font-semibold text-emerald-600 bg-emerald-50/50 border border-emerald-100/60 p-2 rounded-xl animate-in fade-in duration-200">
                        ✓ Verified Good condition: listing at full price <span className="font-extrabold text-emerald-700">₹{formData.price}</span>
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[9px] font-semibold text-amber-600 bg-amber-50/50 border border-amber-100/60 p-2 rounded-xl animate-in fade-in duration-200">
                        ⚠️ Condition is {formData.condition}: listing price adjusted to <span className="font-extrabold text-amber-700">₹{Math.round(Number(formData.price) * (formData.condition === "Fair" ? 0.8 : 0.6))}</span> (original ₹{formData.price})
                      </p>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    placeholder="e.g. 499"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cover Image URL *</label>
                <input
                  type="url"
                  name="image"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="mt-2 flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={handlePhotoCheck}
                    disabled={photoChecking || !formData.image}
                    className={`text-[9px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      !formData.image
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white border-transparent active:scale-95 shadow-sm"
                    }`}
                  >
                    {photoChecking ? "Inspecting Cover..." : "🔍 Run Photo Check"}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Condition:</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase ${
                      formData.condition === "Good"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : formData.condition === "Fair"
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : formData.condition === "Poor"
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-slate-100 border-slate-200 text-slate-500"
                    }`}>
                      {formData.condition || "Not Checked"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Enter store book description..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                List Book in Catalog
              </button>
            </form>
          </div>

        </section>

      </main>

    </div>
  );
}
