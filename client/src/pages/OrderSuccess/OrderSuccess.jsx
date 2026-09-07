import { Link, useLocation } from "react-router-dom";
import {
  FaCheckCircle,
  FaShoppingBag,
} from "react-icons/fa";

import MainLayout from "../../layouts/MainLayout";

function OrderSuccess() {
  const location = useLocation();

  const order = location.state?.order;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-16 px-6">

        <div className="bg-white rounded-2xl shadow-md p-8 text-center">

          <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6" />

          <h1 className="text-3xl font-bold text-gray-800">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500 mt-3">
            Thank you for shopping with us.
          </p>

          {order?._id && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">

              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <p className="font-semibold text-gray-800 break-all">
                {order._id}
              </p>

            </div>
          )}

          {order?.total !== undefined && (
            <div className="mt-4">

              <p className="text-gray-500">
                Order Total
              </p>

              <p className="text-2xl font-bold text-blue-600">
                ₹{order.total}
              </p>

            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">

            <Link
              to="/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View My Orders
            </Link>

            <Link
              to="/products"
              className="border border-gray-300 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
            >
              <FaShoppingBag />
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>
    </MainLayout>
  );
}

export default OrderSuccess;