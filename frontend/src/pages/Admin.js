import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";
import Swal from 'sweetalert2';
import {
  UserPlus,
  PlusCircle,
  Flame,
  BookOpen,
  MessageSquare,
  Trash2,
  Edit2,
  ArrowLeft,
  X,
  Info,
  Package,
  Star,
  Users,
  TrendingUp
} from "lucide-react";

export default function Admin() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Sidebar Tabs
  const [showAddAdmin, setShowAddAdmin] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showTrendingBooks, setShowTrendingBooks] = useState(false);
  const [showBookList, setShowBookList] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Core Lists States
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    originalPrice: "",
    discount: "",
    rating: "5",
    category: "",
    description: "",
    image: ""
  });
  
  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
    name: ""
  });

  const [toast, setToast] = useState("");
  const [replyText, setReplyText] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  // Drag over state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fetchTrendingBooks = async () => {
    try {
      const res = await api.get("/trending");
      setTrendingBooks(Array.isArray(res.data) ? res.data : []);
      localStorage.setItem('trendingBooks', JSON.stringify(res.data));
    } catch {
      setTrendingBooks([]);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/auth/admins");
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAdmins([]);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get("/admin/messages");
      setContactMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchAdmins();
    fetchTrendingBooks();
  }, []);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleCloseAdminPanel = () => {
    navigate("/");
  };

  const handleDeleteBook = async (bookId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This book will be deleted permanently from the library catalog.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#94A3B8'
    });
    if (!result.isConfirmed) {
      return;
    }
    try {
      await api.delete(`/books/${bookId}`);
      showToastMsg("✓ Book deleted successfully");
      fetchBooks();
    } catch {
      showToastMsg("Error deleting book.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!adminData.email || !adminData.password || !adminData.name) {
      showToastMsg("Please fill in all admin fields");
      return;
    }

    try {
      await api.post("/auth/add-admin", adminData);
      showToastMsg("✓ New admin added successfully!");
      setAdminData({ email: "", password: "", name: "" });
      fetchAdmins();
    } catch (error) {
      showToastMsg(error.response?.data?.message || "Error adding admin");
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    const result = await Swal.fire({
      title: 'Remove Admin?',
      text: 'This user will lose all admin privileges.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/auth/admins/${adminId}`);
      showToastMsg("Admin removed.");
      fetchAdmins();
    } catch {
      showToastMsg("Error removing admin.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.price || !formData.image) {
      showToastMsg("Please fill in all required fields.");
      return;
    }

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        discount: formData.discount ? Number(formData.discount) : 0,
        rating: Number(formData.rating),
        category: formData.category,
        description: formData.description,
        image: formData.image
      };

      await api.post("/books", bookData);
      showToastMsg("✓ Book added successfully!");
      setFormData({
        title: "", author: "", price: "", originalPrice: "", discount: "",
        rating: "5", category: "", description: "", image: ""
      });
      fetchBooks();
    } catch {
      showToastMsg("Error adding book.");
    }
  };

  const sendReply = async (contactId) => {
    if (!replyText.trim()) return;

    try {
      await api.post("/admin/reply", {
        contactId,
        replyMessage: replyText
      });

      showToastMsg("✓ Reply sent successfully!");
      setReplyText("");
      setSelectedMessageId(null);
      fetchMessages();
    } catch (error) {
      showToastMsg("Failed to send reply.");
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowAddBook(false);
    setShowBookList(false);
    setShowAddAdmin(false);
    setShowTrendingBooks(false);
    setShowMessages(false);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      originalPrice: book.originalPrice || "",
      discount: book.discount || "",
      rating: String(book.rating),
      category: book.category || "",
      description: book.description || "",
      image: book.image
    });
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        discount: formData.discount ? Number(formData.discount) : 0,
        rating: Number(formData.rating),
        category: formData.category,
        description: formData.description,
        image: formData.image
      };
      await api.put(`/books/${editingBook._id}`, bookData);
      showToastMsg("✓ Book updated successfully!");
      setEditingBook(null);
      setFormData({
        title: "", author: "", price: "", originalPrice: "", discount: "",
        rating: "5", category: "", description: "", image: ""
      });
      fetchBooks();
      setShowBookList(true);
    } catch {
      showToastMsg("Error updating book.");
    }
  };

  const triggerTab = (tabName) => {
    setEditingBook(null);
    setShowAddAdmin(tabName === "addAdmin");
    setShowAddBook(tabName === "addBook");
    setShowTrendingBooks(tabName === "trending");
    setShowBookList(tabName === "bookList");
    setShowMessages(tabName === "messages");
    if (tabName === "messages") {
      fetchMessages();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Logo brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-playfair text-lg font-bold text-white tracking-tight">
                Admin Console
              </span>
            </div>
            <button
              onClick={handleCloseAdminPanel}
              className="text-xs text-slate-400 hover:text-white md:hidden border border-slate-700 px-2 py-1 rounded"
            >
              Exit
            </button>
          </div>

          {/* Navigation link pills */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => triggerTab("addAdmin")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                showAddAdmin ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Add Admin
            </button>
            <button
              onClick={() => triggerTab("addBook")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                showAddBook ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Add Book
            </button>
            <button
              onClick={() => triggerTab("trending")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                showTrendingBooks ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <Flame className="h-4 w-4" />
              Trending Books
            </button>
            <button
              onClick={() => triggerTab("bookList")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                showBookList ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              View Books ({books.length})
            </button>
            <button
              onClick={() => triggerTab("messages")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                showMessages ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Customer Messages
            </button>
          </nav>
        </div>

        {/* Return to bookstore trigger */}
        <div className="p-4 border-t border-slate-800 hidden md:block">
          <button
            onClick={handleCloseAdminPanel}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white py-3 text-xs font-bold transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bookstore
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8">
        
        {/* TOP METRICS SUMMARY STRIP (KPIs) */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Books</span>
              <span className="text-2xl font-black text-slate-900 font-poppins mt-0.5 block">{books.length}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Operators</span>
              <span className="text-2xl font-black text-slate-900 font-poppins mt-0.5 block">{admins.length}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Inquiries</span>
              <span className="text-2xl font-black text-slate-900 font-poppins mt-0.5 block">{contactMessages.length}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Trending</span>
              <span className="text-2xl font-black text-slate-900 font-poppins mt-0.5 block">{trendingBooks.length}</span>
            </div>
          </div>
        </section>

        {/* Floating toast notification */}
        {toast && (
          <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
            <Info className="h-4 w-4 text-blue-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Tab content renderer */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm min-h-[500px]">
          
          {/* TAB 1: ADD ADMIN */}
          {showAddAdmin && !editingBook && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-playfair text-2xl font-black text-slate-900">Operator Directory</h2>
                <p className="text-slate-500 text-xs mt-1">Register new administrative operators and manage active accounts</p>
              </div>

              <form onSubmit={handleAddAdmin} className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-4xl bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter full name"
                    value={adminData.name}
                    onChange={handleAdminChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="email@example.com"
                    value={adminData.email}
                    onChange={handleAdminChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={adminData.password}
                    onChange={handleAdminChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="sm:col-span-3 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/10 active:scale-95 mt-2"
                >
                  Create Operator Account
                </button>
              </form>

              {/* Admins listing */}
              <div className="space-y-3.5 max-w-4xl pt-4">
                <h3 className="font-poppins font-bold text-slate-900 text-sm">Active Administrator Accounts</h3>
                <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Operator Name</th>
                        <th className="px-6 py-3.5">Email Address</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {admins.map((adm) => (
                        <tr key={adm._id || adm.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{adm.name}</td>
                          <td className="px-6 py-4 text-slate-500">{adm.email}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveAdmin(adm._id || adm.id)}
                              className="text-red-500 hover:text-red-700 font-bold border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      {admins.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                            No operator accounts registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADD BOOK / EDIT BOOK FORM */}
          {(showAddBook || editingBook) && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-playfair text-2xl font-black text-slate-900">
                  {editingBook ? `Edit: ${editingBook.title}` : "Catalog Addition"}
                </h2>
                <p className="text-slate-500 text-xs mt-1">Specify catalog pricing, discount rates, image covers, and descriptions</p>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Form fields */}
                <form
                  onSubmit={editingBook ? handleUpdateBook : handleSubmit}
                  className="lg:col-span-8 grid grid-cols-1 gap-4 sm:grid-cols-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Book Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      placeholder="e.g. Creative Coding"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Author *</label>
                    <input
                      type="text"
                      name="author"
                      required
                      placeholder="e.g. George Orwell"
                      value={formData.author}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      required
                      placeholder="499"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      name="originalPrice"
                      placeholder="699"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Discount (%)</label>
                    <input
                      type="number"
                      name="discount"
                      min="0"
                      max="100"
                      placeholder="28"
                      value={formData.discount}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Rating</label>
                    <select
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none bg-white"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Category *</label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Technology">Technology</option>
                      <option value="Business">Business</option>
                      <option value="Self-Help">Self-Help</option>
                      <option value="Children">Children</option>
                      <option value="Academic">Academic</option>
                      <option value="Manga">Manga</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Image Cover URL *</label>
                    <input
                      type="url"
                      name="image"
                      required
                      placeholder="https://example.com/cover.jpg"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Book Description</label>
                    <textarea
                      name="description"
                      rows={4}
                      placeholder="Detailed content synopsis and chapters data..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-3 border-t border-slate-200 mt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition-colors"
                    >
                      {editingBook ? "Update Book details" : "Add Book"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingBook) {
                          setEditingBook(null);
                          setShowBookList(true);
                        }
                        setFormData({
                          title: "", author: "", price: "", originalPrice: "", discount: "",
                          rating: "5", category: "", description: "", image: ""
                        });
                      }}
                      className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 py-3 text-xs font-bold text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Preview Panel Card */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Cover Preview</h3>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md max-w-xs mx-auto">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-4">
                      {formData.image ? (
                        <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen className="h-10 w-10 text-slate-300" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase self-start">
                      {formData.category || "Unassigned"}
                    </span>
                    <h4 className="font-poppins font-bold text-slate-900 text-sm truncate mt-2">
                      {formData.title || "Untitled Book"}
                    </h4>
                    <p className="text-slate-400 text-xs">by {formData.author || "Unknown"}</p>
                    <div className="flex items-baseline gap-1.5 mt-3 text-xs font-bold text-slate-900">
                      <span>₹{formData.price || "0"}</span>
                      {formData.originalPrice && (
                        <span className="text-slate-400 line-through font-semibold text-[10px]">
                          ₹{formData.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRENDING BOOKS DRAG & DROP ZONE */}
          {showTrendingBooks && !editingBook && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-playfair text-2xl font-black text-slate-900">Trending Manager</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Drag and drop books between the catalog directory and the trending collector to flag their visibility.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Catalog items draggable list */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Catalog Directory</h3>
                  <div className="max-h-[60vh] overflow-y-auto border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-2.5 shadow-inner">
                    {books.map((bk) => (
                      <div
                        key={bk._id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("bookId", bk._id)}
                        className="flex items-center justify-between gap-3 border border-slate-200 bg-white rounded-xl p-3 cursor-grab hover:bg-slate-50 hover:border-slate-300 transition-all select-none group shadow-sm active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-3">
                          <img src={bk.image} alt={bk.title} className="w-10 h-14 rounded object-cover shadow-sm bg-slate-100 shrink-0" />
                          <div className="text-xs">
                            <h4 className="font-bold text-slate-900 truncate max-w-[200px] md:max-w-xs">{bk.title}</h4>
                            <p className="text-slate-400">by {bk.author}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                          {bk.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drop zone targets */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-poppins font-bold text-slate-900 text-sm">Trending Flag Dropzone</h3>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      const id = e.dataTransfer.getData("bookId");
                      if (!id) return;

                      if (trendingBooks.includes(id)) {
                        showToastMsg("Book already flagged trending.");
                        return;
                      }

                      // Ensure 24-character hex ID validation
                      const cleaned = [...trendingBooks, id]
                        .map(item => String(item))
                        .filter(item => /^[a-fA-F0-9]{24}$/.test(item));

                      try {
                        await api.post('/trending', { bookIds: cleaned });
                        showToastMsg("✓ Added to trending");
                        fetchTrendingBooks();
                      } catch {
                        showToastMsg("Error saving trending collection.");
                      }
                    }}
                    className={`min-h-[350px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all duration-300 ${
                      isDraggingOver
                        ? "border-blue-500 bg-blue-50/50 shadow-lg scale-102"
                        : "border-amber-400 bg-amber-50/20"
                    }`}
                  >
                    {trendingBooks.length === 0 ? (
                      <div className="text-center text-amber-600 text-xs max-w-xs space-y-2">
                        <Flame className="h-10 w-10 text-amber-500 mx-auto animate-pulse" />
                        <p className="font-bold text-slate-700">Drag books here</p>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Grab any item card from the catalog directory and drop it inside this window.
                        </p>
                      </div>
                    ) : (
                      <div className="w-full space-y-3.5">
                        {trendingBooks.map((tid) => {
                          const book = books.find(b => b._id === tid);
                          if (!book) return null;
                          return (
                            <div
                              key={tid}
                              className="flex items-center justify-between gap-3 border border-amber-200/60 rounded-2xl p-3 bg-white shadow-sm hover:shadow-md transition-shadow relative"
                            >
                              <div className="flex items-center gap-3">
                                <img src={book.image} alt={book.title} className="w-9 h-12 rounded object-cover shadow-sm bg-slate-100 shrink-0" />
                                <div className="text-[11px] text-left">
                                  <h4 className="font-bold text-slate-900 truncate max-w-[150px]">{book.title}</h4>
                                  <p className="text-slate-400 truncate">by {book.author}</p>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  const cleaned = trendingBooks
                                    .map(item => String(item))
                                    .filter(item => item !== tid && /^[a-fA-F0-9]{24}$/.test(item));

                                  try {
                                    await api.post('/trending', { bookIds: cleaned });
                                    showToastMsg("Removed from trending.");
                                    fetchTrendingBooks();
                                  } catch {
                                    showToastMsg("Error saving trending collection.");
                                  }
                                }}
                                className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                                aria-label="Remove item"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIEW BOOKS CATALOG TABLE LAYOUT */}
          {showBookList && !editingBook && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-playfair text-2xl font-black text-slate-900">Catalog Database</h2>
                <p className="text-slate-500 text-xs mt-1">Review active books, selling prices, categories, and ratings database logs</p>
              </div>

              <div className="overflow-hidden border border-slate-200 rounded-3xl shadow-sm bg-white">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Book Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Selling Price</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {books.map((bk) => (
                      <tr key={bk._id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={bk.image} alt={bk.title} className="w-9 h-12 rounded object-cover shadow-sm bg-slate-100 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{bk.title}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">by {bk.author}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {bk.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-baseline gap-1 font-bold text-slate-900">
                            <span>₹{bk.price}</span>
                            {bk.originalPrice && (
                              <span className="text-slate-400 text-[10px] line-through font-semibold">
                                ₹{bk.originalPrice}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < bk.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleEditBook(bk)}
                              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 p-2 rounded-lg transition-colors"
                              title="Edit book details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(bk._id)}
                              className="text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 p-2 rounded-lg transition-colors"
                              title="Delete book from database"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {books.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                          Catalog database is empty.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUPPORT TICKETS & CUSTOMER MESSAGES */}
          {showMessages && !showAddAdmin && !editingBook && (
            <div className="space-y-6 max-w-4xl">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="font-playfair text-2xl font-black text-slate-900">Support Tickets Feed</h2>
                <p className="text-slate-500 text-xs mt-1">Review user messages and write direct customer support email replies</p>
              </div>

              <div className="space-y-5">
                {contactMessages.map((msg) => {
                  const hasReplied = msg.replies && msg.replies.length > 0;
                  return (
                    <div
                      key={msg._id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                    >
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 text-white text-xs font-bold font-poppins">
                            {msg.name ? msg.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <h4 className="font-poppins font-bold text-slate-900 text-xs">{msg.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{msg.email}</p>
                          </div>
                        </div>

                        {/* Status capsules */}
                        {hasReplied ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Pending Response
                          </span>
                        )}
                      </div>

                      {/* Ticket query text */}
                      <p className="text-xs text-slate-600 bg-slate-50/70 border border-slate-100 rounded-2xl p-4 leading-relaxed">
                        {msg.message}
                      </p>

                      {/* Reply threads log history */}
                      {hasReplied && (
                        <div className="space-y-2.5 pl-4 border-l-2 border-blue-500/25 mt-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                            Support History Thread
                          </span>
                          {msg.replies.map((rep, idx) => (
                            <div key={rep._id || `${msg._id}-${idx}`} className="text-xs space-y-1">
                              <p className="font-bold text-blue-600 text-[11px]">
                                {rep.fromAdmin ? "Online Books Support" : msg.name}
                              </p>
                              <p className="text-slate-600 leading-relaxed">{rep.message}</p>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                {new Date(rep.date).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Direct inline support ticket reply field input */}
                      {selectedMessageId === msg._id ? (
                        <div className="space-y-3.5 pt-2">
                          <textarea
                            rows={3}
                            placeholder="Write message reply here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => sendReply(msg._id)}
                              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition-colors"
                            >
                              Send Response
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMessageId(null);
                                setReplyText("");
                              }}
                              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedMessageId(msg._id)}
                          className="rounded-xl border border-blue-200 text-blue-600 font-bold hover:bg-blue-50/50 px-4 py-2 text-xs transition-colors"
                        >
                          Reply to Inquiry
                        </button>
                      )}
                    </div>
                  );
                })}
                {contactMessages.length === 0 && (
                  <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white">
                    Messages inbox is empty.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}