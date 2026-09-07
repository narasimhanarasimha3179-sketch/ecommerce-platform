import { useEffect, useState } from "react";
import api from "../../api/axios";

function Analytics() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/api/products?limit=1"),
      api.get("/api/orders"),
      api.get("/api/users"),
    ]).then(([products, orders, users]) => {
      const paidOrders = orders.data.filter((order) => order.paymentStatus === "Paid" || order.paymentMethod === "Cash on Delivery");
      setStats({ products: products.data.total || 0, orders: orders.data.length, users: users.data.length, revenue: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0) });
    }).catch(console.error);
  }, []);

  return <div className="max-w-7xl mx-auto py-10 px-6"><h1 className="text-4xl font-bold mb-10">Analytics Dashboard</h1><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{[["Products",stats.products],["Orders",stats.orders],["Users",stats.users],["Revenue",`₹${stats.revenue.toLocaleString("en-IN")}`]].map(([label,value])=><div key={label} className="bg-white shadow rounded-xl p-6"><h3 className="text-gray-500">{label}</h3><p className="text-3xl font-bold mt-2">{value}</p></div>)}</div></div>;
}
export default Analytics;
