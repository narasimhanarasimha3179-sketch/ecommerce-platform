import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

function ProductCard({ product }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist ? useWishlist() : {};
  const { addToCart } = useCart ? useCart() : {};

  const gallery = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : [product?.image || FALLBACK_IMAGE];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const inWishlist = isInWishlist ? isInWishlist(product?._id) : false;
  const stock = Number(product?.stock || 0);
  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || 0);
  const rating = Number(product?.rating || 0);
  const reviews = Number(product?.reviews || 0);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist && removeFromWishlist) {
      removeFromWishlist(product._id);
    } else if (addToWishlist) {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock > 0 && addToCart) {
      addToCart(product);
    }
  };

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div className="relative w-full bg-gray-50 flex flex-col items-center">
        <Link to={`/product/${product._id}`} className="block w-full overflow-hidden">
          <img
            src={gallery[activeImageIndex] || FALLBACK_IMAGE}
            alt={product.name}
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) {
                e.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discount > 0 && (
            <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
              {product.discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Featured
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle Wishlist"
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm w-9 h-9 rounded-full shadow-sm flex items-center justify-center text-gray-600 hover:text-rose-500 hover:scale-110 active:scale-95 transition"
        >
          {inWishlist ? <FaHeart className="text-rose-500 text-base" /> : <FaRegHeart className="text-base" />}
        </button>

        {gallery.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-2 px-3 w-full bg-white/70 backdrop-blur-xs border-t border-gray-100">
            {gallery.slice(0, 4).map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onMouseEnter={() => setActiveImageIndex(idx)}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImageIndex(idx);
                }}
                className={`w-7 h-7 rounded-md overflow-hidden border transition ${
                  activeImageIndex === idx
                    ? "border-blue-600 ring-2 ring-blue-100 scale-105"
                    : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`thumbnail-${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {gallery.length > 4 && (
              <span className="text-[10px] text-gray-500 font-semibold pl-1">
                +{gallery.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 uppercase font-semibold tracking-wider">
            <span>{product.brand || "General"}</span>
            <span className="text-gray-400">·</span>
            <span>{product.category || "Item"}</span>
          </div>

          <Link to={`/product/${product._id}`} className="block mt-1.5">
            <h2 className="text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h2>
          </Link>

          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-2 py-0.5 rounded">
              ★ {rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({reviews.toLocaleString("en-IN")} reviews)
            </span>
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(product.specifications)
                .slice(0, 2)
                .map(([key, val]) => (
                  <span
                    key={key}
                    className="inline-block text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                  >
                    {key}: <strong>{val}</strong>
                  </span>
                ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-gray-900">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <span
              className={`text-xs font-semibold ${
                stock > 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {stock > 0 ? `${stock} left` : "Out of stock"}
            </span>
          </div>

          <button
            type="button"
            disabled={stock <= 0}
            onClick={handleAddToCart}
            className={`w-full mt-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              stock > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FaShoppingCart className="text-sm" />
            <span>{stock > 0 ? "Add to Cart" : "Out of Stock"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;