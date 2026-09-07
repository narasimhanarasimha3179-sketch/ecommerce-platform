import { useEffect, useState } from "react";
import {
  getAllProducts,
  deleteProduct,
} from "../../services/adminProductService";
import { Link } from "react-router-dom";

function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();

      if (data.products) {
        setProducts(data.products);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading Products...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Products
        </h2>

        <Link
          to="/admin/add-product"
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          + Add Product
        </Link>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3">Image</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product._id}
              className="border-b"
            >
              <td className="p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </td>

              <td>{product.name}</td>

              <td>{product.brand}</td>

              <td>₹{product.price}</td>

              <td>{product.stock}</td>

              <td className="space-x-3">
                <Link
                  to={`/admin/edit-product/${product._id}`}
                  className="text-blue-600 font-semibold"
                >
                  Edit
                </Link>

                <button
                  onClick={() =>
                    handleDelete(product._id)
                  }
                  className="text-red-600 font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductsTable;