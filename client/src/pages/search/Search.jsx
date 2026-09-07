import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import ProductCard from "../../components/ProductCard";
import { getProducts } from "../../services/productService";

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const data = await getProducts(1, 40, query);
        setProducts(data.products || []);
      } catch (error) {
        console.error("Search error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [query]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-8">
          Search Results{query ? ` for "${query}"` : ""}
        </h1>

        {loading ? (
          <p className="text-center py-16 text-xl">Searching...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              No relevant products found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Search;
