const categories = [
  "Mobiles",
  "Laptops",
  "Fashion",
  "Shoes",
  "Electronics",
  "Watches",
  "Beauty",
  "Home",
];

const brands = [
  "Apple",
  "Samsung",
  "Dell",
  "HP",
  "Lenovo",
  "Nike",
  "Adidas",
  "Sony",
  "Boat",
  "Puma",
];

const images = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
  "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600",
];

const products = [];

for (let i = 1; i <= 500; i++) {
  products.push({
    name: `Product ${i}`,
    description: `Premium quality Product ${i} with excellent features and modern design.`,
    category:
      categories[Math.floor(Math.random() * categories.length)],
    brand:
      brands[Math.floor(Math.random() * brands.length)],
    image:
      images[Math.floor(Math.random() * images.length)],
    price: Math.floor(Math.random() * 90000) + 500,
    originalPrice: Math.floor(Math.random() * 100000) + 1000,
    stock: Math.floor(Math.random() * 100) + 1,
    rating: (Math.random() * 5).toFixed(1),
    numReviews: Math.floor(Math.random() * 500),
    featured: Math.random() > 0.8,
  });
}

export default products;