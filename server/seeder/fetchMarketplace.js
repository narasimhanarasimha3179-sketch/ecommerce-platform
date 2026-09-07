import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import Product from "../models/Product.js";

dotenv.config();

// Marketplace categories to pull from live API feeds
const TARGET_FEEDS = [
  { endpoint: "smartphones", category: "Electronics" },
  { endpoint: "laptops", category: "Electronics" },
  { endpoint: "tablets", category: "Electronics" },
  { endpoint: "mobile-accessories", category: "Electronics" },
  { endpoint: "mens-shoes", category: "Footwear" },
  { endpoint: "womens-shoes", category: "Footwear" },
  { endpoint: "mens-shirts", category: "Fashion" },
  { endpoint: "womens-dresses", category: "Fashion" },
  { endpoint: "sunglasses", category: "Fashion" },
  { endpoint: "mens-watches", category: "Fashion" },
  { endpoint: "furniture", category: "Home" },
  { endpoint: "home-decoration", category: "Home" },
  { endpoint: "kitchen-accessories", category: "Appliances" },
];

// Additional authentic Indian appliance models (Flipkart & Amazon bestsellers)
const DOMESTIC_APPLIANCES = [
  {
    name: "LG 242L 3-Star Smart Inverter Frost-Free Double Door Refrigerator (GL-I292RPZX)",
    brand: "LG",
    category: "Appliances",
    description: "Multi Air Flow cooling with Smart Connect and toughened glass shelves.",
    price: 25990,
    originalPrice: 33990,
    rating: 4.4,
    reviews: 2450,
    stock: 25,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&auto=format&fit=crop&q=80",
    specifications: { Type: "Double Door", Capacity: "242 L", Star: "3 Star" }
  },
  {
    name: "Samsung 236L 3-Star Digital Inverter Frost Free Double Door Refrigerator (RT28C3053S8)",
    brand: "Samsung",
    category: "Appliances",
    description: "All-around cooling with digital inverter compressor and deodorizing filter.",
    price: 26490,
    originalPrice: 37990,
    rating: 4.5,
    reviews: 3120,
    stock: 20,
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80",
    specifications: { Type: "Double Door", Capacity: "236 L", Star: "3 Star" }
  },
  {
    name: "Whirlpool 265L 3-Star IntelliFresh Inverter Double Door Refrigerator (IF INV CNV 278)",
    brand: "Whirlpool",
    category: "Appliances",
    description: "Convertible 10-in-1 modes with Microblock technology and Zeolite moisture lock.",
    price: 27990,
    originalPrice: 39150,
    rating: 4.3,
    reviews: 1870,
    stock: 18,
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    specifications: { Type: "Double Door", Capacity: "265 L", Modes: "10-in-1" }
  },
  {
    name: "Haier 325L 3-Star Triple Inverter Bottom Mount Refrigerator (HEB-333DS-P)",
    brand: "Haier",
    category: "Appliances",
    description: "14-in-1 convertible bottom mounted refrigerator, 2x bigger vegetable crisper.",
    price: 34990,
    originalPrice: 48990,
    rating: 4.4,
    reviews: 980,
    stock: 14,
    image: "https://images.unsplash.com/photo-1590725140246-20acdee442be?w=800&auto=format&fit=crop&q=80",
    specifications: { Type: "Bottom Mounted", Capacity: "325 L", Compressor: "Triple Inverter" }
  },
  {
    name: "IFB 8kg 5-Star AI Powered Front Load Washing Machine (Senator Smart)",
    brand: "IFB",
    category: "Appliances",
    description: "Aqua Energie water softening with 9-swirl wash and steam refresh cycle.",
    price: 37490,
    originalPrice: 47990,
    rating: 4.6,
    reviews: 1430,
    stock: 10,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80",
    specifications: { Type: "Front Load", Capacity: "8 Kg", Star: "5 Star" }
  },
  {
    name: "Voltas 1.5 Ton 3-Star Adjustable Inverter Split AC (183V Vectra Prism)",
    brand: "Voltas",
    category: "Appliances",
    description: "Adjustable 4-in-1 cooling modes with 100% copper condenser and anti-dust filter.",
    price: 32990,
    originalPrice: 62990,
    rating: 4.2,
    reviews: 4210,
    stock: 30,
    image: "https://images.unsplash.com/photo-1614633833026-062040439d09?w=800&auto=format&fit=crop&q=80",
    specifications: { Capacity: "1.5 Ton", Condenser: "100% Copper", Filter: "Anti-Dust" }
  }
];

const fetchLiveProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB database...");

    const allFetched = [];

    // 1. Fetch live market categories from API
    for (const feed of TARGET_FEEDS) {
      try {
        console.log(`Fetching ${feed.category} (${feed.endpoint})...`);
        const res = await axios.get(`https://dummyjson.com/products/category/${feed.endpoint}`);
        const items = res.data?.products || [];

        for (const item of items) {
          // Convert USD to INR (approx 85)
          const inrPrice = Math.round(item.price * 85);
          const originalPrice = Math.round(inrPrice * (1 + (item.discountPercentage || 15) / 100));

          allFetched.push({
            name: `${item.brand || "Brand"} ${item.title}`,
            brand: item.brand || item.title.split(" ")[0],
            category: feed.category,
            description: item.description,
            price: inrPrice,
            originalPrice,
            discount: Math.round(item.discountPercentage || 10),
            stock: item.stock || 20,
            rating: item.rating || 4.5,
            reviews: Math.floor(Math.random() * 400) + 50,
            image: item.thumbnail || (item.images && item.images[0]),
            images: item.images?.length ? item.images : [item.thumbnail],
            specifications: {
              SKU: item.sku || `SKU-${item.id}`,
              Weight: `${item.weight || 1} kg`,
              Warranty: item.warrantyInformation || "1 Year Manufacturer Warranty",
              Availability: item.availabilityStatus || "In Stock",
            },
            featured: item.rating >= 4.5,
          });
        }
      } catch (catErr) {
        console.warn(`Could not load category ${feed.endpoint}:`, catErr.message);
      }
    }

    // 2. Add high-demand appliances
    DOMESTIC_APPLIANCES.forEach((app) => {
      const discount = Math.round(((app.originalPrice - app.price) / app.originalPrice) * 100);
      allFetched.push({
        ...app,
        discount,
        images: [app.image],
        featured: app.rating >= 4.5,
      });
    });

    console.log(`Total live products fetched: ${allFetched.length}`);

    // 3. Clear database and insert
    await Product.deleteMany();
    console.log("Cleared old database collection...");

    await Product.insertMany(allFetched);
    console.log(`Successfully populated MongoDB with ${allFetched.length} marketplace products and models!`);

    process.exit(0);
  } catch (err) {
    console.error("Marketplace Sync Error:", err);
    process.exit(1);
  }
};

fetchLiveProducts();