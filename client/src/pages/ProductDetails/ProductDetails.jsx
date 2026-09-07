import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaCheckCircle, FaExchangeAlt, FaShieldAlt, FaShoppingCart, FaStar, FaTruck } from "react-icons/fa";
import { getProductById } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import MainLayout from "../../layouts/MainLayout";
import ReviewForm from "../../components/Reviews/ReviewForm";
import ReviewList from "../../components/Reviews/ReviewList";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshReviews, setRefreshReviews] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
      const initialImg = (Array.isArray(data?.images) && data.images[0]) || data?.image || FALLBACK_IMAGE;
      setSelectedImage(initialImg);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = () => {
    setRefreshReviews((prev) => !prev);
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add product to cart.");
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart(product);
      navigate("/checkout");
    } catch (error) {
      console.error(error);
      alert("Failed to proceed to checkout.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-32 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Product Details...</h2>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto py-28 text-center px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The requested item could not be found or has been removed.</p>
          <Link
            to="/products"
            className="inline-block bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Products
          </Link>
        </div>
      </MainLayout>
    );
  }

  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || FALLBACK_IMAGE];

  const stock = Number(product.stock || 0);
  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || 0);
  const rating = Number(product.rating || 4.5);
  const reviewsCount = Number(product.reviews || 0);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <nav className="text-xs md:text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-blue-600">Products</Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold">{product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-4">
            <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center p-6 shadow-sm min-h-[420px] max-h-[500px]">
              <img
                src={selectedImage || FALLBACK_IMAGE}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full max-h-[440px] object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-2">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-white p-1 transition ${
                      selectedImage === img
                        ? "border-blue-600 ring-2 ring-blue-100 scale-95"
                        : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`thumbnail-${idx}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {product.brand || "Brand"} · {product.category}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {stock > 0 ? `In Stock (${stock} units)` : "Out of Stock"}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3 leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                <FaStar className="text-[11px]" /> {rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">
                {reviewsCount.toLocaleString("en-IN")} Customer Ratings & Reviews
              </span>
            </div>

            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-baseline gap-4">
              <span className="text-3xl font-black text-gray-900">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {originalPrice > price && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {product.discount || Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 mt-5 leading-relaxed text-sm md:text-base">
              {product.description}
            </p>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-5">
                <h3 className="text-sm font-bold uppercase text-gray-900 mb-3">Product Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="bg-white border border-gray-100 p-2.5 rounded-lg">
                      <span className="text-gray-500 block text-xs">{key}</span>
                      <span className="font-semibold text-gray-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                disabled={stock <= 0}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                  stock > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-[0.99]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <FaShoppingCart />
                Add to Cart
              </button>

              <button
                type="button"
                disabled={stock <= 0}
                onClick={handleBuyNow}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold transition ${
                  stock > 0
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg active:scale-[0.99]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-200 text-center">
              <div className="flex flex-col items-center">
                <FaTruck className="text-xl text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-gray-800">Free Express Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <FaExchangeAlt className="text-xl text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-gray-800">7-Day Replacement</span>
              </div>
              <div className="flex flex-col items-center">
                <FaShieldAlt className="text-xl text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-gray-800">100% Authentic Brand</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-10">
          <ReviewForm
            productId={product._id}
            onReviewAdded={handleReviewAdded}
          />
          <ReviewList
            key={refreshReviews}
            productId={product._id}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default ProductDetails;