import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/axios";

function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/api/products?limit=100")
      .then(({ data }) => {
        const unique = [...new Set((data.products || []).map((product) => product.category))];
        setCategories(unique);
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold mb-8">Categories</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {categories.map((category) => (
            <Link key={category} to={`/products?category=${encodeURIComponent(category)}`} className="bg-white border rounded-xl p-6 text-center font-bold shadow-sm hover:shadow-lg hover:border-blue-400 transition">
              {category}
            </Link>
          ))}
        </div>
        {categories.length === 0 && <p className="text-gray-500">Categories will appear after products are seeded.</p>}
      </div>
    </MainLayout>
  );
}

export default Categories;
