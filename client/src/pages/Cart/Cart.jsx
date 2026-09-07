import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTrash,
} from "react-icons/fa";

import MainLayout from "../../layouts/MainLayout";
import { useCart } from "../../context/CartContext";

function Cart() {
  const {
    cart,
    subtotal,
    shipping,
    total,
    updateCartItem,
    removeCartItem,
  } = useCart();

  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-20 px-6 text-center">
          <FaShoppingCart className="text-gray-300 text-7xl mx-auto mb-6" />

          <h1 className="text-3xl font-bold text-gray-800">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mt-3">
            You have no products in your shopping cart.
          </p>

          <Link
            to="/products"
            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md p-5"
              >
                <div className="flex gap-5">
                  {/* Product Image */}
                  <div className="w-28 h-28 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-800">
                      {product.name}
                    </h2>

                    <p className="text-blue-600 font-semibold mt-1">
                      ₹{product.price}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartItem(
                            product._id,
                            (product.quantity || 1) - 1
                          )
                        }
                        className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                      >
                        <FaMinus />
                      </button>

                      <span className="font-semibold text-lg w-8 text-center">
                        {product.quantity || 1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateCartItem(
                            product._id,
                            (product.quantity || 1) + 1
                          )
                        }
                        className="w-9 h-9 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(product._id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="border-t mt-5 pt-4 flex justify-between">
                  <span className="text-gray-600">Item Total</span>

                  <span className="font-bold">
                    ₹
                    {Number(product.price || 0) *
                      Number(product.quantity || 1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    ₹{subtotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Shipping
                  </span>

                  <span className="font-medium">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                <div className="border-t pt-4 flex justify-between">
                  <span className="text-xl font-bold">
                    Total
                  </span>

                  <span className="text-xl font-bold text-blue-600">
                    ₹{total}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full mt-6 bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="block w-full mt-3 border border-gray-300 text-gray-700 text-center py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Cart;