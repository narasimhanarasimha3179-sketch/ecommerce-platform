import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllProducts,
  updateProduct,
} from "../../services/adminProductService";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    image: "",
    featured: false,
    isNewProduct: true,
  });

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const data = await getAllProducts();

      const products = data.products || data;

      const product = products.find((p) => p._id === id);

      if (!product) {
        alert("Product not found");
        navigate("/admin");
        return;
      }

      setFormData({
        ...product,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProduct(id, {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        discount: Number(formData.discount),
        stock: Number(formData.stock),
      });

      alert("Product Updated Successfully");

      navigate("/admin");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-8">
        Edit Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <textarea
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="originalPrice"
          value={formData.originalPrice}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="discount"
          value={formData.discount}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
          />
          Featured Product
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isNewProduct"
            checked={formData.isNewProduct}
            onChange={handleChange}
          />
          New Product
        </label>

        <button
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}

export default EditProduct;