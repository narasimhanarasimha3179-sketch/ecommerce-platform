import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import Hero from "../../components/Hero";
import ProductCard from "../../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // Points directly to the backend API
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const { data } = await axios.get(`${apiUrl}/products`);

      // Handles both direct array responses and paginated { products: [...] } formats
      const productList = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : [];

      setProducts(productList);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(
        err.response?.data?.message ||
          "Could not connect to backend server. Make sure port 5000 is running."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Hero />

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <span className="text-sm font-semibold text-gray-500">
            {products.length} {products.length === 1 ? "item" : "items"} available
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700">Loading Products...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200">
            <h3 className="text-xl font-bold text-red-600 mb-2">Connection Error</h3>
            <p className="text-gray-600 text-sm max-w-md mx-auto">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-500 text-sm">
              Please check your database connection or re-run the seed script.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}