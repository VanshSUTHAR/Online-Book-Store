import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../services/api";
import {
  clearCartItems,
  fetchCartItems,
  getLocalCart,
  removeCartItem,
  updateCartItemQuantity
} from "../services/cartService";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useUser } from "../context/UserContext";
import {
  Trash2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  X,
  Info,
  Plus,
} from "lucide-react";

// Stripe element shared style
const STRIPE_STYLE = {
  style: {
    base: {
      fontSize: "15px",
      color: "#0f172a",
      fontFamily: "Inter, system-ui, sans-serif",
      letterSpacing: "0.04em",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#ef4444" },
  },
};

// Input-box wrapper style shared by all Stripe elements
const inputBoxStyle = {
  border: "1.5px solid #e2e8f0",
  borderRadius: "10px",
  background: "#fff",
  padding: "11px 14px",
  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
  transition: "border-color 0.2s",
};

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const [items, setItems] = useState(() => {
    return getLocalCart();
  });

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyerName, setBuyerName]           = useState("");
  const [buyerAddress, setBuyerAddress]     = useState("");
  const [toast, setToast]                   = useState("");
  const [isProcessing, setIsProcessing]     = useState(false);
  const [cardError, setCardError]           = useState("");

  const stripe   = useStripe();
  const elements = useElements();

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [items]
  );

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  useEffect(() => {
    let isMounted = true;

    const syncCart = () => fetchCartItems().then((cartItems) => {
      if (isMounted) {
        setItems(cartItems);
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncCart();
      }
    };

    syncCart();
    window.addEventListener("focus", syncCart);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const interval = setInterval(syncCart, localStorage.getItem("token") ? 3000 : 10000);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", syncCart);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [user]);

  const clearCart = async () => {
    const nextItems = await clearCartItems();
    setItems(nextItems);
    showToastMsg("Shopping cart cleared.");
  };

  const removeItem = async (index) => {
    const nextItems = await removeCartItem(index);
    setItems(nextItems);
    showToastMsg("Item removed from cart.");
  };

  const changeItemQuantity = async (index, quantity) => {
    const nextItems = await updateCartItemQuantity(index, quantity);
    setItems(nextItems);
  };

  const openCheckout = () => {
    const loggedInUserId = user?._id || user?.id || localStorage.getItem("userId");
    if (!loggedInUserId) {
      showToastMsg("Please login first to proceed with checkout.");
      navigate("/login", { state: { from: "/cart", openCheckout: true } });
      return;
    }
    if (items.length === 0) {
      showToastMsg("Your cart is empty.");
      return;
    }
    setBuyerName("");
    setBuyerAddress("");
    setCardError("");
    setIsCheckoutOpen(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.state?.openCheckout) {
      const loggedInUserId = user?._id || user?.id || localStorage.getItem("userId");
      if (loggedInUserId) {
        setBuyerName("");
        setBuyerAddress("");
        setIsCheckoutOpen(true);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, user, navigate, location.pathname]);

  const confirmOrder = async () => {
    if (!buyerName.trim() || !buyerAddress.trim()) {
      showToastMsg("Please enter your name and address.");
      return;
    }
    if (!stripe || !elements) {
      showToastMsg("Stripe is still loading. Please wait a moment.");
      return;
    }
    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      showToastMsg("Please enter your card details.");
      return;
    }

    setIsProcessing(true);
    setCardError("");

    try {
      const userId = user?._id || localStorage.getItem("userId");

      const productsPayload = items.map((book) => ({
        productId: book._id || book.id || book.bookId,
        title:     book.title,
        price:     Number(book.price),
        image:     book.image,
        quantity:  Number(book.quantity || 1),
      }));

      const payment = await api.post("/payment/create-payment-intent", {
        amount: subtotal,
      });

      if (!payment?.data?.clientSecret) {
        showToastMsg("Payment failed. Your order has not been placed.");
        return;
      }

      const result = await stripe.confirmCardPayment(payment.data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name:    buyerName,
            address: { line1: buyerAddress },
          },
        },
      });

      if (result.error || result.paymentIntent?.status !== "succeeded") {
        showToastMsg("Payment failed. Your order has not been placed.");
        return;
      }

      // Order created ONLY after verified successful Stripe payment
      const orderPayload = {
        userId,
        products: productsPayload,
        books: items.map((book) => ({
          bookId:   book._id || book.id || book.bookId,
          title:    book.title,
          price:    Number(book.price),
          quantity: Number(book.quantity || 1),
          image:    book.image,
          author:   book.author,
          category: book.category,
        })),
        buyerName,
        buyerAddress,
        totalAmount: subtotal,
        paymentIntentId: result.paymentIntent.id,
        paymentStatus: "Paid"
      };

      const res = await api.post("/orders/create", orderPayload, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      if (res.status === 201 || res.data) {
        // Add notification for navbar
        const notification = {
          title: "Order Placed Successfully!",
          message: `Your order of ${itemCount} book(s) has been placed. Total: ₹${subtotal}`,
          time: new Date().toLocaleString(),
          read: false,
          orderDetails: {
            books: items,
            totalAmount: subtotal,
            buyerName,
            buyerAddress
          }
        };
        const existingNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
        existingNotifications.push(notification);
        localStorage.setItem("notifications", JSON.stringify(existingNotifications));
        window.dispatchEvent(new Event("notificationAdded"));

        const nextItems = await clearCartItems();
        setItems(nextItems);
        setIsCheckoutOpen(false);
        showToastMsg("Payment successful. Your order has been placed.");
        setTimeout(() => {
          navigate("/");
        }, 1200);
      } else {
        showToastMsg("Payment failed. Your order has not been placed.");
      }
    } catch (err) {
      console.error("Stripe payment error:", err);
      showToastMsg("Payment failed. Your order has not been placed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Cart Title Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-black text-slate-900 md:text-4xl">
              Shopping Cart
            </h1>
            <p className="text-slate-500 text-xs mt-1.5 font-medium">
              You have {itemCount} book(s) in your basket.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors border border-red-200/50 hover:bg-red-50/50 px-3.5 py-1.5 rounded-lg"
            >
              Clear Basket
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-3xl bg-white max-w-xl mx-auto shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4 animate-bounce">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <h2 className="font-poppins font-bold text-slate-900 text-lg">Your Cart is Empty</h2>
            <p className="text-slate-400 text-xs mt-2 max-w-xs leading-normal">
              Looks like you haven't added any books to your cart yet. Visit our categories and fill it up!
            </p>
            <Link
              to="/all-books"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 transition-colors"
            >
              Browse Catalog
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          /* Two-column layout */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

            {/* Left — Item list */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item._id || item.id || item.title}-${index}`}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow relative"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-24 w-18 rounded-lg object-cover shadow-sm bg-slate-100 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-8">
                    <div>
                      <h3 className="font-poppins font-bold text-slate-950 text-sm truncate">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-xs">by {item.author}</p>
                      <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase mt-2 tracking-wide">
                        {item.category || "General"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="text-base font-extrabold text-slate-900">
                        ₹{Number(item.price || 0) * Number(item.quantity || 1)}
                      </div>
                      <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => changeItemQuantity(index, Number(item.quantity || 1) - 1)}
                          disabled={Number(item.quantity || 1) <= 1}
                          className="h-8 w-8 text-sm font-bold text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="flex h-8 min-w-9 items-center justify-center border-x border-slate-200 bg-white px-2 text-xs font-bold text-slate-900">
                          {Number(item.quantity || 1)}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeItemQuantity(index, Number(item.quantity || 1) + 1)}
                          className="h-8 w-8 text-sm font-bold text-slate-600 hover:bg-white"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      removeItem(index);
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add more books */}
              <button
                onClick={() => navigate("/all-books")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-400 py-4 text-sm font-bold text-blue-600 transition-all active:scale-[0.98] group"
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Add More Books
              </button>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24 space-y-6">
                <h3 className="font-poppins font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2.5">
                  Order Summary
                </h3>
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Count</span>
                    <span className="font-semibold text-slate-800">{itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="font-semibold text-green-600 uppercase text-[10px] tracking-wide">
                      Free Shipping
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3 text-sm text-slate-900 font-extrabold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{subtotal}</span>
                  </div>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white transition-all shadow-md shadow-blue-500/10 active:scale-95"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secure Transaction
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl bg-slate-900 border border-slate-800 text-white px-5 py-3.5 shadow-2xl text-xs font-bold flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-3xl bg-white p-5 sm:p-6 shadow-2xl ring-1 ring-slate-200 overflow-y-auto flex flex-col md:flex-row gap-6 my-auto">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left — Card payment */}
            <div className="md:w-1/2 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100">
              <h3 className="font-poppins font-bold text-slate-900 text-sm mb-2 text-center">
                Payment Details
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold mb-4">
                Securely pay ₹{subtotal} with your card
              </span>

              <div className="w-full space-y-3">

                {/* Card Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                    Card Number
                  </label>
                  <div style={inputBoxStyle}>
                    <CardNumberElement
                      options={{ ...STRIPE_STYLE, showIcon: true }}
                      onChange={(e) => setCardError(e.error?.message || "")}
                    />
                  </div>
                </div>

                {/* Expiry + CVC */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      Expiry Date
                    </label>
                    <div style={inputBoxStyle}>
                      <CardExpiryElement
                        options={STRIPE_STYLE}
                        onChange={(e) => setCardError(e.error?.message || "")}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                      CVC
                    </label>
                    <div style={inputBoxStyle}>
                      <CardCvcElement
                        options={STRIPE_STYLE}
                        onChange={(e) => setCardError(e.error?.message || "")}
                      />
                    </div>
                  </div>
                </div>

                {cardError && (
                  <p className="text-[10px] font-semibold text-red-500">{cardError}</p>
                )}

                <p className="text-[10px] text-slate-400 text-center leading-normal pt-1">
                  Your payment is processed securely through Stripe. No card data is stored on this site.
                </p>
              </div>
            </div>

            {/* Right — Billing information */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-poppins font-bold text-slate-900 text-sm mb-4">
                  Billing Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Recipient's name"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Shipping Address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Complete street address details..."
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmOrder}
                  disabled={!stripe || isProcessing}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition-colors shadow-md shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing ? "Processing..." : "Confirm Purchase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
