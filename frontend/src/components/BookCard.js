import React, { useState } from "react";
import { ShoppingBag, Eye, Heart, Star, Check } from "lucide-react";

export default function BookCard({ book, onQuickAdd, onQuickView }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(book);
    } else {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart.push(book);
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("Failed to add to cart", err);
      }
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div className="group relative bg-white rounded-lg border border-slate-200/70 shadow-editorial hover:shadow-editorial-hover transition-all duration-400 flex flex-col justify-between overflow-hidden h-full">
      {/* Media Container with Hover-Zoom (scale 1.03 with 0.4s ease transition) */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onQuickView && onQuickView(book)}>
        {/* Animated Skeleton Loader while loading image */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton z-10" aria-hidden="true" />
        )}

        <img
          src={book.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"}
          alt={book.title ? `Cover of ${book.title}` : "Book edition cover"}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transform transition-transform duration-400 ease-out group-hover:scale-[1.03] ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Category / Badge */}
        {book.category && (
          <div className="absolute top-3 left-3 z-20">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-[10px] font-sans font-semibold tracking-wider text-slate-800 uppercase rounded-md shadow-sm">
              {book.category}
            </span>
          </div>
        )}

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          aria-label="Bookmark edition"
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-600 hover:text-red-600 hover:bg-white transition-all shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-600 text-red-600" : ""}`} />
        </button>

        {/* Hidden Quick-Add Action Tray revealing on Hover */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out flex items-center justify-center space-x-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center space-x-1.5 shadow-md ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-terracotta hover:bg-terracotta-hover text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(book);
              }}
              aria-label="Quick view edition details"
              className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-md transition-colors shadow-md"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content & Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div>
          <div className="flex items-center space-x-1 text-amber-500 mb-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-semibold font-sans text-slate-700">
              {book.rating || "4.9"}
            </span>
            <span className="text-[11px] text-slate-400 font-sans">
              ({book.reviewsCount || "128"})
            </span>
          </div>

          <h3 className="font-serif text-base font-bold text-slate-rich line-clamp-2 leading-snug group-hover:text-terracotta transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-1 truncate">
            {book.author ? `By ${book.author}` : "Curated Edition"}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-lg font-bold font-sans text-slate-rich">
              ${Number(book.price || 0).toFixed(2)}
            </span>
            {book.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-sans">
                ${Number(book.originalPrice).toFixed(2)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            aria-label={`Add ${book.title} to cart`}
            className="sm:hidden p-2 text-terracotta hover:bg-red-50 rounded-full transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
