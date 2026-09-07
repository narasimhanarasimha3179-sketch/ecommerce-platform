import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBox,
  FaTimes,
} from "react-icons/fa";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { searchProducts } from "../services/searchService";

const SYNONYMS = {
  mobile: "smartphones phone",
  mobiles: "smartphones phone",
  phone: "smartphone mobile",
  phones: "smartphone mobile",
  fridge: "refrigerator double door frost free",
  fridges: "refrigerator double door frost free",
  refrigerator: "fridge frost free",
  tv: "television oled 4k bravia",
  ac: "air conditioner inverter split",
  shoes: "sneakers running footwear pegasus superstar",
  laptop: "notebook macbook dell",
};

function Navbar() {
  const { wishlist = [] } = useWishlist();
  const { cartCount = 0 } = useCart();
  const { userInfo, logout } = useAuth();

  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced auto-suggest with synonym support
  useEffect(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);

        // Resolve search query with synonyms if matched
        let targetQuery = trimmed;
        for (const [key, alias] of Object.entries(SYNONYMS)) {
          if (trimmed === key || trimmed.includes(key)) {
            targetQuery = `${trimmed} ${alias}`;
            break;
          }
        }

        const data = await searchProducts(targetQuery);
        const list = Array.isArray(data) ? data : data?.products || [];
        setResults(list.slice(0, 7));
        setIsOpen(list.length > 0);
      } catch (error) {
        console.error("Auto-suggest error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) return;

    setIsOpen(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight flex-shrink-0"
          >
            ShopEase
          </Link>

          {/* Unified Global Auto-Suggest Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search products, brands, 'mobiles', 'fridges'..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => results.length > 0 && setIsOpen(true)}
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-24 py-2.5 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setResults([]);
                    setIsOpen(false);
                  }}
                  className="absolute right-12 text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center text-xs font-semibold transition"
              >
                <FaSearch />
              </button>
            </form>

            {/* Suggestions Overlay */}
            {isOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-50">
                <div className="px-4 py-2 bg-gray-50 flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>Suggestions</span>
                  {loading && <span className="text-blue-600">Searching...</span>}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {results.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={() => {
                        setSearch("");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-blue-50/60 transition group"
                    >
                      <img
                        src={product.image || (product.images && product.images[0])}
                        alt={product.name}
                        className="w-11 h-11 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-blue-600 block">
                          {product.brand} · {product.category}
                        </span>
                        <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
                          {product.name}
                        </h4>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900 block">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600">
                          ★ {Number(product.rating || 4.5).toFixed(1)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full text-center py-2.5 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-blue-600 transition"
                >
                  View all results for &ldquo;{search}&rdquo; →
                </button>
              </div>
            )}
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-5 sm:gap-6 text-gray-700">
            <Link
              to="/products"
              className="text-sm font-semibold hover:text-blue-600 transition"
            >
              Products
            </Link>

            <Link
              to="/orders"
              className="flex items-center gap-1.5 text-sm font-semibold hover:text-blue-600 transition"
            >
              <FaBox className="text-gray-500" />
              <span className="hidden sm:inline">Orders</span>
            </Link>

            <Link
              to="/wishlist"
              className="relative p-1 hover:text-red-500 transition"
            >
              <FaHeart className="text-lg" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center px-1">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative p-1 hover:text-blue-600 transition"
            >
              <FaShoppingCart className="text-lg" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-blue-600 text-white rounded-full min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {!userInfo ? (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
                    <FaUser />
                  </div>
                  <span className="text-sm font-bold text-gray-800 hidden lg:inline max-w-[120px] truncate">
                    {userInfo.name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;