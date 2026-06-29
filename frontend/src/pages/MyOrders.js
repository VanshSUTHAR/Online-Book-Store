import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";
import { Package, Clock, CheckCircle, Search, ArrowLeft, ExternalLink } from "lucide-react";

export default function MyOrders() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // If not logged in, redirect to login
    if (!user) {
      navigate("/login", { state: { from: "/my-orders" } });
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/orders/my-orders", {
          headers: { Authorization: localStorage.getItem("token") }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 pt-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <button 
              onClick={() => navigate("/")}
              className="flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Store
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              My Orders
            </h1>
            <p className="text-slate-500 mt-2">
              View and track all your past purchases.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex items-center max-w-sm w-full">
            <Search className="h-5 w-5 text-slate-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-slate-700 outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-center border border-red-100 shadow-sm">
            <span className="bg-red-100 p-1 rounded-full mr-3"><Clock className="h-4 w-4" /></span>
            {error}
          </div>
        )}

        {/* Orders List */}
        {!error && orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center justify-center animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              It looks like you haven't made any purchases yet. Start exploring our collection to find your next great read!
            </p>
            <button
              onClick={() => navigate("/all-books")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-95"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <div 
                key={order._id || idx} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Order Header */}
                <div className="bg-slate-50/50 border-b border-slate-100 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full text-sm">
                    <div>
                      <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-[10px]">Order Placed</p>
                      <p className="font-semibold text-slate-800">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric"
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-[10px]">Total</p>
                      <p className="font-semibold text-slate-800">${Number(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-[10px]">Ship To</p>
                      <p className="font-semibold text-blue-600 truncate">{order.buyerName || user.name}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 sm:text-right">
                      <p className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-[10px]">Order ID</p>
                      <p className="font-mono text-xs text-slate-600 break-all">{order._id}</p>
                    </div>
                  </div>
                </div>

                {/* Order Status & Body */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-bold text-slate-900 text-lg">
                      Payment Successful
                    </span>
                    <span className="ml-3 inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                      Paid
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    {(order.books?.length > 0 ? order.books : order.products)?.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors">
                        <div className="h-24 w-16 sm:h-32 sm:w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm flex items-center justify-center relative">
                          {item.image || (item.bookId && item.bookId.image) ? (
                            <img 
                              src={item.image || (item.bookId && item.bookId.image)} 
                              alt={item.title || "Book"}
                              className="h-full w-full object-cover"
                              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Cover" }}
                            />
                          ) : (
                            <Package className="h-8 w-8 text-slate-300" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2">
                                {item.title || (item.bookId && item.bookId.title) || "Unknown Book"}
                              </h4>
                              <p className="font-bold text-blue-600 ml-4">${Number(item.price || 0).toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-slate-500 line-clamp-1">
                              {item.author || (item.bookId && item.bookId.author) || "Unknown Author"}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                              Qty: {item.quantity || 1}
                            </span>
                            
                            {item.bookId && (
                              <button 
                                onClick={() => navigate(`/book/${item.bookId._id || item.bookId}`)}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                View Book <ExternalLink className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
