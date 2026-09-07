import { Link } from "react-router-dom";
import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";
import MainLayout from "../../layouts/MainLayout";
import { useWishlist } from "../../context/WishlistContext";

function Wishlist() {
  const {
    wishlist,
    removeFromWishlist,
  } = useWishlist();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-10 px-6">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaHeart className="text-red-500 text-3xl" />

          <h1 className="text-3xl font-bold text-gray-800">
            My Wishlist
          </h1>

          <span className="text-gray-500">
            ({wishlist.length})
          </span>
        </div>

        {/* Empty Wishlist */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20">

            <FaHeart className="text-gray-300 text-7xl mx-auto mb-6" />

            <h2 className="text-2xl font-semibold text-gray-700">
              Your Wishlist is Empty
            </h2>

            <p className="text-gray-500 mt-3">
              Save your favorite products here.
            </p>

            <Link
              to="/products"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </Link>

          </div>
        ) : (

          /* Wishlist Products */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {wishlist.map((product) => (

              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
              >

                {/* Product Image */}
                <div className="relative">

                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                    />
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() =>
                      removeFromWishlist(product._id)
                    }
                    className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-red-50 transition"
                    aria-label="Remove from wishlist"
                  >
                    <FaTrash className="text-red-500" />
                  </button>

                </div>

                {/* Product Details */}
                <div className="p-5">

                  <p className="text-sm text-gray-500 mb-1">
                    {product.brand}
                  </p>

                  <Link to={`/product/${product._id}`}>
                    <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2">
                      {product.name}
                    </h2>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">

                    <span className="text-yellow-500">
                      ★
                    </span>

                    <span className="text-sm text-gray-600">
                      {product.rating || 0}
                    </span>

                    <span className="text-sm text-gray-400">
                      ({product.reviews || 0})
                    </span>

                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mt-4">

                    <span className="text-2xl font-bold text-gray-900">
                      ₹{product.price}
                    </span>

                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}

                  </div>

                  {/* Add To Cart */}
                  <button
                    type="button"
                    className="w-full mt-5 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Wishlist;