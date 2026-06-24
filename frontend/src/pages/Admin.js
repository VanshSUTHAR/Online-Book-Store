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
  Info
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
  const [showTrendingBooks, setShowTrendingBooks] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);
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

  // Drag over states
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
      text: 'You will not be able to recover this book details!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
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
      showToastMsg("Error deleting book details.");
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
      text: 'Are you sure you want to remove this admin privileges?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#EF4444'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/auth/admins/${adminId}`);
      showToastMsg("Admin privileges removed.");
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
      showToastMsg("Error adding book details.");
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
      showToastMsg("Failed to send reply message.");
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Sidebar Control Panel */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="font-playfair text-base font-bold text-white tracking-tight">
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

          {/* Nav Buttons */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => triggerTab("addAdmin")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                showAddAdmin ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <UserPlus className="h-4.5 w-4.5" />
              Add Admin
            </button>
            <button
              onClick={() => triggerTab("addBook")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                showAddBook ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Add Book
            </button>
            <button
              onClick={() => triggerTab("trending")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                showTrendingBooks ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <Flame className="h-4.5 w-4.5" />
              Trending Books
            </button>
            <button
              onClick={() => triggerTab("bookList")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                showBookList ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              View Books ({books.length})
            </button>
            <button
              onClick={() => triggerTab("messages")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-colors ${
                showMessages ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              Customer Messages
            </button>
          </nav>
        </div>

        {/* Exit link bottom */}
        <div className="p-4 border-t border-slate-800 hidden md:block">
          <button
            onClick={handleCloseAdminPanel}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white py-2.5 text-xs font-bold transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bookstore
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Floating toast notification */}
        {toast && (
          <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200">
            <Info className="h-4 w-4 text-blue-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* 1. Add Admin Tab */}
        {showAddAdmin && !editingBook && (
          <div className="max-w-2xl space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="font-playfair text-2xl font-black text-slate-950">Add New Admin</h2>
              <p className="text-slate-400 text-xs mt-1">Assign admin roles to new operators</p>
            </div>
            
            <form onSubmit={handleAddAdmin} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid grid-cols-1 gap-4 sm:grid-cols-3">
              <input
                type="text"
                name="name"
                required
                placeholder="Admin name"
                value={adminData.name}
                onChange={handleAdminChange}
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Admin email"
                value={adminData.email}
                onChange={handleAdminChange}
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                required
                placeholder="Create password"
                value={adminData.password}
                onChange={handleAdminChange}
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="sm:col-span-3 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition-colors"
              >
                Add Admin
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="font-poppins font-bold text-slate-900 text-sm">Current Operators list</h3>
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <ul className="divide-y divide-slate-100">
                  {admins.map((adm) => (
                    <li key={adm._id || adm.id} className="flex items-center justify-between p-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{adm.name}</p>
                        <p className="text-slate-400 mt-0.5">{adm.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAdmin(adm._id || adm.id)}
                        className="text-red-500 hover:text-red-700 font-bold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                  {admins.length === 0 && (
                    <li className="p-4 text-center text-slate-400">No admin accounts found.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. Add Book / Edit Book Tab */}
        {(showAddBook || editingBook) && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-5xl">
            {/* Form */}
            <div className="lg:col-span-8 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="font-playfair text-2xl font-black text-slate-950">
                  {editingBook ? "Edit Book details" : "Add New Book"}
                </h2>
                <p className="text-slate-400 text-xs mt-1">Specify catalog listings pricing and categories</p>
              </div>

              <form onSubmit={editingBook ? handleUpdateBook : handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Learn Javascript"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    required
                    placeholder="Author name"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    placeholder="499"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    placeholder="699"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    placeholder="25"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none bg-white"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none bg-white"
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Image Cover URL *
                  </label>
                  <input
                    type="url"
                    name="image"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                    Book Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Write detailed book contents information..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex gap-3 pt-3 border-t border-slate-100 mt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition-colors"
                  >
                    {editingBook ? "Update Book" : "Add Book"}
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
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="font-poppins font-bold text-slate-900 text-sm">Card Preview</h3>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative max-w-xs mx-auto">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center mb-4">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <h4 className="font-poppins font-bold text-slate-900 text-sm truncate">
                  {formData.title || "Book Title"}
                </h4>
                <p className="text-slate-400 text-xs">by {formData.author || "Author"}</p>
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
        )}

        {/* 3. Drag and Drop Trending Zone Tab */}
        {showTrendingBooks && !editingBook && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="font-playfair text-2xl font-black text-slate-950">Manage Trending Listings</h2>
              <p className="text-slate-400 text-xs mt-1">
                Drag books from the catalog list and drop them inside the yellow zone to assign them to Trending.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Catalog list (Draggable) */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="font-poppins font-bold text-slate-900 text-sm">Available Bookstore Catalog</h3>
                <div className="max-h-[70vh] overflow-y-auto border border-slate-200 bg-white rounded-2xl p-4 space-y-3 shadow-inner">
                  {books.map((bk) => (
                    <div
                      key={bk._id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("bookId", bk._id)}
                      className="flex items-center gap-3 border border-slate-100 rounded-xl p-3 bg-slate-50 cursor-grab hover:bg-slate-100 active:cursor-grabbing hover:border-slate-200 transition-all select-none"
                    >
                      <img src={bk.image} alt={bk.title} className="w-12 h-16 rounded object-cover shadow-sm shrink-0 bg-slate-100" />
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-slate-900 truncate">{bk.title}</h4>
                        <p className="text-slate-400 truncate">by {bk.author}</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                        {bk.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Zone (Drop Target) */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-poppins font-bold text-slate-900 text-sm">Trending Collection Dropzone</h3>
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
                      showToastMsg("This book is already flagged trending.");
                      return;
                    }

                    // Strict verification of ObjectId
                    const cleanedList = [...trendingBooks, id]
                      .map(tid => String(tid))
                      .filter(tid => /^[a-fA-F0-9]{24}$/.test(tid));

                    try {
                      await api.post('/trending', { bookIds: cleanedList });
                      showToastMsg("✓ Added to trending list successfully!");
                      fetchTrendingBooks();
                    } catch {
                      showToastMsg("Error saving trending collection.");
                    }
                  }}
                  className={`min-h-[350px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all ${
                    isDraggingOver
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-amber-400 bg-amber-50/40"
                  }`}
                >
                  {trendingBooks.length === 0 ? (
                    <div className="text-center text-amber-500 text-xs max-w-xs space-y-2">
                      <Flame className="h-10 w-10 text-amber-400 mx-auto animate-pulse" />
                      <p className="font-bold">Drag and drop books here</p>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Select a book from the left panel and drop it inside this window.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full space-y-3">
                      {trendingBooks.map((tid) => {
                        const book = books.find(b => b._id === tid);
                        if (!book) return null;
                        return (
                          <div
                            key={tid}
                            className="flex items-center justify-between gap-3 border border-amber-100 rounded-2xl p-3 bg-white shadow-sm relative"
                          >
                            <img src={book.image} alt={book.title} className="w-10 h-14 rounded object-cover shadow-sm bg-slate-100 shrink-0" />
                            <div className="flex-1 min-w-0 text-[11px] text-left">
                              <h4 className="font-bold text-slate-800 truncate">{book.title}</h4>
                              <p className="text-slate-400 truncate">by {book.author}</p>
                            </div>
                            <button
                              onClick={async () => {
                                const cleanedList = trendingBooks
                                  .map(item => String(item))
                                  .filter(item => item !== tid && /^[a-fA-F0-9]{24}$/.test(item));

                                try {
                                  await api.post('/trending', { bookIds: cleanedList });
                                  showToastMsg("Removed from trending.");
                                  fetchTrendingBooks();
                                } catch {
                                  showToastMsg("Error saving trending collection.");
                                }
                              }}
                              className="p-1 rounded text-red-500 hover:bg-red-50"
                              aria-label="Remove trending item"
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

        {/* 4. View Books Catalog List Tab */}
        {showBookList && !editingBook && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="font-playfair text-2xl font-black text-slate-950">Book Library Catalog</h2>
              <p className="text-slate-400 text-xs mt-1">Manage database records of books</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((bk) => (
                <div
                  key={bk._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow relative flex gap-3.5"
                >
                  <img src={bk.image} alt={bk.title} className="w-16 h-24 rounded-lg object-cover shadow-sm shrink-0 bg-slate-100" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 truncate">{bk.title}</h4>
                      <p className="text-slate-400 truncate">by {bk.author}</p>
                      <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1.5 uppercase tracking-wide">
                        {bk.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-4 border-t border-slate-50 pt-2.5">
                      <button
                        onClick={() => handleEditBook(bk)}
                        className="flex-1 inline-flex items-center justify-center gap-1 border border-slate-200 hover:bg-slate-50 py-1.5 rounded-lg font-bold text-slate-700 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(bk._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 border border-red-150 hover:bg-red-50 py-1.5 rounded-lg font-bold text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {books.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400">
                  No books stored in catalog. Click "Add Book" to create entries.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Customer Messages / Contact Inbox Tab */}
        {showMessages && !showAddAdmin && !editingBook && (
          <div className="max-w-3xl space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="font-playfair text-2xl font-black text-slate-950">Customer Messages Inbox</h2>
              <p className="text-slate-400 text-xs mt-1">Review contact inquiries and send replies</p>
            </div>

            <div className="space-y-4">
              {contactMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-poppins font-bold text-slate-900 text-sm">{msg.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">{msg.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ID: {msg._id.slice(-6)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 leading-relaxed border border-slate-100">
                    {msg.message}
                  </p>

                  {/* Replies list logs */}
                  {msg.replies && msg.replies.length > 0 && (
                    <div className="space-y-2.5 pl-4 border-l-2 border-blue-500/35">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Response Logs
                      </span>
                      {msg.replies.map((rep, idx) => (
                        <div key={rep._id || `${msg._id}-${idx}`} className="text-xs">
                          <p className="font-bold text-blue-600">
                            {rep.fromAdmin ? "Online Books Store" : msg.name}
                          </p>
                          <p className="text-slate-600 mt-0.5">{rep.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {new Date(rep.date).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Action Reply triggers */}
                  {selectedMessageId === msg._id ? (
                    <div className="space-y-3 pt-2">
                      <textarea
                        rows={3}
                        placeholder="Write message reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendReply(msg._id)}
                          className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition-colors"
                        >
                          Send Response
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMessageId(null);
                            setReplyText("");
                          }}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedMessageId(msg._id)}
                      className="rounded-lg border border-blue-200 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 text-xs transition-colors"
                    >
                      Reply to Inquiry
                    </button>
                  )}
                </div>
              ))}
              {contactMessages.length === 0 && (
                <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white">
                  Message inbox is empty.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}