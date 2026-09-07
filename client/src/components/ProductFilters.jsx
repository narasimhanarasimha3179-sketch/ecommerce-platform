function ProductFilters({
  category,
  setCategory,
  brand,
  setBrand,
  sort,
  setSort,
}) {
  const categories = [
    "Mobiles",
    "Laptops",
    "Headphones",
    "Gaming",
    "Cameras",
    "Fashion",
    "Furniture",
    "Home Appliances",
    "Keyboards",
    "Kitchen",
    "Mouse",
    "Printers",
    "Refrigerators",
    "Speakers",
    "Tablets",
    "Televisions",
    "Washing Machines",
    "Watches",
    "Air Conditioners",
    "Accessories",
  ];

  const brands = [
    "Apple",
    "Samsung",
    "OnePlus",
    "Xiaomi",
    "Realme",
    "Vivo",
    "Dell",
    "HP",
    "Lenovo",
    "ASUS",
    "Sony",
    "JBL",
    "Boat",
    "Canon",
    "Nikon",
    "Nike",
    "Adidas",
    "Puma",
    "Logitech",
    "LG",
  ];

  return (
    <div className="bg-white shadow rounded-xl p-5 sticky top-24">
      <h2 className="text-xl font-bold mb-6">Filters</h2>

      <div className="mb-6">
        <label className="font-semibold">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded mt-2 p-2"
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="font-semibold">Brand</label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full border rounded mt-2 p-2"
        >
          <option value="">All Brands</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-semibold">Sort By</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full border rounded mt-2 p-2"
        >
          <option value="">Default</option>
          <option value="priceAsc">Price Low → High</option>
          <option value="priceDesc">Price High → Low</option>
          <option value="rating">Highest Rating</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );
}

export default ProductFilters;
