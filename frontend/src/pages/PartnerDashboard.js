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
    image: ""
  });

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.price || !formData.image) {
      Swal.fire("Incomplete Fields", "Please fill in all required fields.", "warning");
      return;
    }

    try {
      const bookPayload = {
        ...formData,
        price: Number(formData.price),
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
        image: ""
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
                        <span className="inline-block text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          {bk.category || "Fiction"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">₹{bk.price}</td>
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
