import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import MainLayout from "../../layouts/MainLayout";

const CATEGORY_BRAND_MAP = {
  Appliances: ["LG", "Samsung", "Whirlpool", "Haier", "Bosch", "Daikin", "Panasonic"],
  Electronics: ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Sony", "Dell", "Logitech"],
  Footwear: ["Nike", "Adidas", "Puma", "New Balance", "Timberland", "Vans"],
  Fashion: ["Levi's", "Zara", "Ray-Ban", "Fossil"],
  Home: ["IKEA", "Marshall", "Dyson", "ComfortPlus"],
};

const SYNONYMS = {
  mobile: ["iphone", "galaxy", "phone", "smartphone", "oneplus", "pixel", "xiaomi"],
  mobiles: ["iphone", "galaxy", "phone", "smartphone", "oneplus", "pixel", "xiaomi"],
  phone: ["iphone", "galaxy", "smartphone", "oneplus", "pixel", "xiaomi"],
  phones: ["iphone", "galaxy", "smartphone", "oneplus", "pixel", "xiaomi"],
  fridge: ["refrigerator", "double door", "frost free"],
  fridges: ["refrigerator", "double door", "frost free"],
  ac: ["air conditioner", "split ac", "inverter ac"],
  shoes: ["running", "sneakers", "boots", "superstar", "pegasus"],
};

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParam = searchParams.get("search") || "";
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts(1, 200, "", "", "", "");
        const list = Array.isArray(data) ? data : data?.products || [];
        setRawProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
        setRawProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setBrand(searchParams.get("brand") || "");
    setSort(searchParams.get("sort") || "");
  }, [searchParams]);

  // Update query params without conflicting states
  const updateFilters = (newCat, newBrand, newSort) => {
    const params = {};
    if (searchParam) params.search = searchParam;
    if (newCat) params.category = newCat;
    if (newBrand) params.brand = newBrand;
    if (newSort) params.sort = newSort;
    setSearchParams(params);
  };

  // Deduplicate brands using Set so duplicate keys (like Samsung) never occur
  const availableBrands = useMemo(() => {
    if (!category) {
      return [...new Set(Object.values(CATEGORY_BRAND_MAP).flat())];
    }
    return CATEGORY_BRAND_MAP[category] || [];
  }, [category]);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    const validBrand = cat && CATEGORY_BRAND_MAP[cat]?.includes(brand) ? brand : "";
    if (!validBrand) setBrand("");
    updateFilters(cat, validBrand, sort);
  };

  const handleBrandSelect = (b) => {
    setBrand(b);
    updateFilters(category, b, sort);
  };

  const handleSortSelect = (s) => {
    setSort(s);
    updateFilters(category, brand, s);
  };

  const handleClearAll = () => {
    setCategory("");
    setBrand("");
    setSort("");
    setSearchParams({});
  };

  // Filter products cleanly across all items
  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    if (category) {
      list = list.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }

    if (brand) {
      list = list.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    }

    if (searchParam.trim()) {
      const q = searchParam.trim().toLowerCase();
      const terms = [q];
      Object.entries(SYNONYMS).forEach(([key, aliases]) => {
        if (q.includes(key) || key.includes(q)) {
          terms.push(...aliases);
        }
      });

      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const b = (p.brand || "").toLowerCase();
        const c = (p.category || "").toLowerCase();
        const d = (p.description || "").toLowerCase();

        return terms.some(
          (t) => name.includes(t) || b.includes(t) || c.includes(t) || d.includes(t)
        );
      });
    }

    if (sort === "price-asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === "price-desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === "rating") list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

    return list;
  }, [rawProducts, category, brand, searchParam, sort]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* Single Top Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Dropdown */}
            <div className="w-full sm:w-48">
              <select
                value={category}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Categories</option>
                {Object.keys(CATEGORY_BRAND_MAP).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Dropdown with guaranteed unique key */}
            <div className="w-full sm:w-48">
              <select
                value={brand}
                onChange={(e) => handleBrandSelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={`brand-${b}`} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full sm:w-48">
              <select
                value={sort}
                onChange={(e) => handleSortSelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {(category || brand || sort || searchParam) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Browse:</span>
            {["All", ...Object.keys(CATEGORY_BRAND_MAP)].map((cat) => {
              const active = (cat === "All" && !category) || category === cat;
              return (
                <button
                  key={`browse-badge-${cat}`}
                  type="button"
                  onClick={() => handleCategorySelect(cat === "All" ? "" : cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {searchParam ? `Results for "${searchParam}"` : "Product Catalog"}
            </h1>
            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length} items
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center">
            <p className="text-gray-700 font-bold mb-1">No products found</p>
            <p className="text-gray-400 text-sm mb-5">
              Try clicking &ldquo;Reset All&rdquo; to browse all available categories.
            </p>
            <button
              onClick={handleClearAll}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition flex flex-col group overflow-hidden"
              >
                <div className="h-48 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
                  <img
                    src={item.image || (item.images && item.images[0])}
                    alt={item.name}
                    className="h-full w-full object-contain group-hover:scale-105 transition duration-300"
                  />
                  {item.discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {item.discount}% OFF
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                    {item.brand} · {item.category}
                  </span>

                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition">
                    {item.name}
                  </h3>

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-gray-900">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      ★ {Number(item.rating || 4.5).toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Products;