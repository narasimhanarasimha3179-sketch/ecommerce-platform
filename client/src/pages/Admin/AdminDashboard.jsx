import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-4xl font-bold mb-10">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Link
          to="/admin/products"
          className="bg-white shadow rounded-xl p-6 hover:shadow-lg"
        >
          <h2 className="text-2xl font-bold">
            Products
          </h2>

          <p className="text-gray-500 mt-2">
            Manage Products
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white shadow rounded-xl p-6 hover:shadow-lg"
        >
          <h2 className="text-2xl font-bold">
            Orders
          </h2>

          <p className="text-gray-500 mt-2">
            Manage Orders
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-white shadow rounded-xl p-6 hover:shadow-lg"
        >
          <h2 className="text-2xl font-bold">
            Users
          </h2>

          <p className="text-gray-500 mt-2">
            Manage Users
          </p>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-white shadow rounded-xl p-6 hover:shadow-lg"
        >
          <h2 className="text-2xl font-bold">
            Analytics
          </h2>

          <p className="text-gray-500 mt-2">
            Sales Dashboard
          </p>
        </Link>

      </div>
    </div>
  );
}

export default AdminDashboard;