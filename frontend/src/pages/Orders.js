import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";
import {
  Package,
  Calendar,
  MapPin,
  User,
  ShoppingBag,
  ArrowRight,
  BookOpen,
  RefreshCw,
  AlertCircle,
  CreditCard,
} from "lucide-react";

export default function Orders() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token && !user) {
        setLoading(false);
        return;
      }

      const res = await api.get("/orders/my-orders", {
        headers: { Authorization: token || "" }
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching my orders:", err);
      setError("Unable to load your orders. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!user && !localStorage.getItem("userId") && !localStorage.getItem("token")) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center bg-slate-50/50 py-12">
        <div className="h-20 w-20 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-xl shadow-blue-500/10">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 font-poppins mb-3">
          Access Your Orders
        </h2>
        <p className="text-slate-600 max-w-md mb-8 text-sm leading-relaxed">
          Please log in to view your verified orders, track delivery schedules, and access purchase details.
        </p>
        <Link
          to="/login"
          state={{ from: "/orders" }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-[1.02]"
        >
          Sign In to Account <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Helper styling for order status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "Shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      case "Processing":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Confirmed":
        return "bg-teal-50 text-teal-700 border-teal-200/60";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Package className="h-3.5 w-3.5" /> Customer Portal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-poppins">
              My Orders
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track your purchased books, payment receipts, and real-time delivery status
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <div className="bg-slate-100 rounded-2xl px-4 py-2.5 text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
              <span className="text-xl font-black text-slate-900 font-poppins">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm animate-pulse space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
                  <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="h-24 w-18 bg-slate-200 rounded-xl shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/2 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 w-1/3 bg-slate-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm my-6">
            <div className="h-24 w-24 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 font-poppins mb-2">
              No Orders Found
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
              You haven't placed any book orders yet. Explore our huge collection of trending & bestselling books!
            </p>
            <Link
              to="/all-books"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Explore Books Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const orderIdFormatted = order._id ? `#ORD-${order._id.slice(-6).toUpperCase()}` : "#ORD-BUY";
              const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              // Combine products or books array for display
              const itemsList = (order.products && order.products.length > 0)
                ? order.products
                : (order.books || []);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Top Header Bar */}
                  <div className="bg-slate-50/80 p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Order Ref ID</span>
                        <span className="font-bold text-slate-900 font-mono">{orderIdFormatted}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Order Date
                        </span>
                        <span className="font-semibold text-slate-800">{orderDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Payment Status Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200/60">
                        <CreditCard className="h-3.5 w-3.5" /> {order.paymentStatus || "Paid"}
                      </span>
                      {/* Order Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.orderStatus)}`}>
                        <Tag className="h-3.5 w-3.5" /> {order.orderStatus || "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products List (2 Cols) */}
                    <div className="lg:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Items Purchased ({itemsList.length})
                      </h4>
                      {itemsList.map((item, idx) => {
                        const bookObj = item.productId && typeof item.productId === "object" ? item.productId : (item.bookId || item);
                        const title = item.title || bookObj.title || "Book Title";
                        const image = item.image || bookObj.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80";
                        const price = item.price ?? bookObj.price ?? 0;
                        const qty = item.quantity || 1;

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <img
                              src={image}
                              alt={title}
                              className="h-20 w-16 object-cover rounded-xl shadow-sm bg-slate-200 shrink-0"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-900 text-sm truncate mb-1">
                                {title}
                              </h5>
                              <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span className="font-semibold bg-slate-200/60 px-2 py-0.5 rounded">
                                  Qty: {qty}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="font-bold text-blue-600">
                                  ₹{price} / item
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Item Total</span>
                              <span className="font-extrabold text-slate-900 text-sm">
                                ₹{price * qty}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Delivery & Summary Column (1 Col) */}
                    <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-100 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                            Estimated Delivery Time
                          </h4>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-900">
                            <Truck className="h-5 w-5 text-blue-600 shrink-0" />
                            <div>
                              <span className="block text-[10px] uppercase font-extrabold text-blue-600">Expected Delivery</span>
                              <span className="text-sm font-extrabold">{order.estimatedDelivery || "1 Day"}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Shipping Details
                          </h4>
                          <div className="space-y-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                            <div className="flex items-start gap-2">
                              <User className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] font-bold uppercase">Recipient</span>
                                <span className="font-bold text-slate-800">{order.buyerName || "Customer"}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <div>
                                <span className="text-slate-400 block text-[9px] font-bold uppercase">Address</span>
                                <span className="font-semibold text-slate-700 leading-snug block">{order.buyerAddress || "Not Provided"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Amount</span>
                        <span className="text-2xl font-black text-blue-600 font-poppins">
                          ₹{order.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
