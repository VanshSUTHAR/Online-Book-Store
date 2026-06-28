import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ShoppingBag, ArrowRight, BookOpen } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [items, setItems] = useState([]);

  const syncCart = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
      setItems(cartData);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("cartUpdated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cartUpdated", syncCart);
    };
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [items]);

  const removeItem = (index) => {
    const nextItems = items.filter((_, i) => i !== index);
    setItems(nextItems);
    localStorage.setItem("cart", JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleCheckout = () => {
    onClose();
    const loggedInUserId = user?._id || user?.id || localStorage.getItem("userId");
    if (!loggedInUserId) {
      navigate("/login", { state: { from: "/cart", openCheckout: true } });
    } else {
      navigate("/cart", { state: { openCheckout: true } });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-[#FAF9F6] shadow-2xl flex flex-col justify-between border-l border-slate-200/80"
            >
              {/* Header */}
              <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-terracotta">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-slate-rich">Your Reading Cart</h2>
                    <p className="text-xs text-slate-500 font-sans">{items.length} {items.length === 1 ? 'edition selected' : 'editions selected'}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close cart drawer"
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Body Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <BookOpen className="w-8 h-8 stroke-1" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-slate-800">Your shelf is empty</h3>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                      Explore our curated literary collection and add your next masterpiece.
                    </p>
                    <button
                      onClick={() => { onClose(); navigate('/all-books'); }}
                      className="mt-2 px-6 py-2.5 bg-slate-rich text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-slate-800 transition-colors"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <motion.div
                      key={`${item._id || item.id || index}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="p-4 bg-white rounded-lg border border-slate-200/60 shadow-sm flex items-center space-x-4 group hover:border-slate-300 transition-all"
                    >
                      <div className="w-16 h-22 bg-slate-100 rounded overflow-hidden flex-shrink-0 relative shadow-sm">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                            <BookOpen className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-semibold text-slate-800 text-sm truncate group-hover:text-terracotta transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.author ? `By ${item.author}` : "Literary Edition"}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900 font-sans">
                            ${Number(item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        aria-label={`Remove ${item.title} from cart`}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer Checkout Action */}
              {items.length > 0 && (
                <div className="p-6 bg-white border-t border-slate-200/80 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Shipping & Taxes</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-bold text-slate-rich">
                      <span>Total</span>
                      <span className="text-terracotta font-sans">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-sans text-sm font-semibold rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="text-center">
                    <button
                      onClick={() => { onClose(); navigate('/cart'); }}
                      className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
                    >
                      View Full Shopping Cart Page
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
