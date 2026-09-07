import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Synonym dictionary matching common user search terms to catalog terms
const SYNONYMS = {
  mobile: ["smartphone", "phone", "apple", "samsung", "electronics"],
  mobiles: ["smartphone", "phone", "apple", "samsung", "electronics"],
  phone: ["smartphone", "mobile", "apple", "samsung"],
  phones: ["smartphone", "mobile", "apple", "samsung"],
  fridge: ["refrigerator", "appliances", "double door", "frost free"],
  fridges: ["refrigerator", "appliances", "frost free"],
  tv: ["smart tv", "television", "sony", "oled", "4k"],
  ac: ["air conditioner", "inverter split ac", "cooling", "daikin", "voltas"],
  shoes: ["footwear", "sneakers", "running", "nike", "adidas", "puma"],
  laptop: ["electronics", "macbook", "notebook", "dell"],
  clothes: ["fashion", "shirt", "jeans", "jacket", "denim"],
};

export default function SearchWithSuggestions({ allProducts = [], onSelectProduct }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute suggestions as user types
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Expand search keywords using synonyms
    const searchTerms = [trimmed];
    Object.entries(SYNONYMS).forEach(([key, aliases]) => {
      if (trimmed.includes(key) || key.includes(trimmed)) {
        searchTerms.push(...aliases);
      }
    });

    const matches = allProducts.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const brand = (item.brand || "").toLowerCase();
      const category = (item.category || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();

      return searchTerms.some(
        (term) =>
          name.includes(term) ||
          brand.includes(term) ||
          category.includes(term) ||
          desc.includes(term)
      );
    });

    // Limit to top 6 instant suggestions
    setSuggestions(matches.slice(0, 6));
    setIsOpen(matches.length > 0);
  }, [query, allProducts]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery(item.name);
    if (onSelectProduct) {
      onSelectProduct(item);
    } else {
      navigate(`/product/${item._id}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search products, brands, 'mobiles', 'fridges', 'shoes'..."
          className="w-full px-5 py-3.5 pr-28 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Auto-Suggestions Popover */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-50 animate-in fade-in">
          <div className="px-4 py-2 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
            <span>Product Suggestions</span>
            <span>{suggestions.length} items found</span>
          </div>

          {suggestions.map((item) => (
            <div
              key={item._id}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-blue-50/60 cursor-pointer flex items-center gap-4 transition group"
            >
              <img
                src={item.image || (item.images && item.images[0])}
                alt={item.name}
                className="w-12 h-12 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100 flex-shrink-0 group-hover:scale-105 transition"
              />

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">
                    {item.brand}
                  </span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] font-medium text-gray-500">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">
                  {item.name}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-sm font-extrabold text-gray-900 block">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] font-bold text-emerald-600">
                  ★ {Number(item.rating || 4.5).toFixed(1)}
                </span>
              </div>
            </div>
          ))}

          <div
            onClick={handleSubmit}
            className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-center text-xs font-semibold text-blue-600 cursor-pointer transition"
          >
            See all results for &ldquo;{query}&rdquo; →
          </div>
        </div>
      )}
    </div>
  );
}