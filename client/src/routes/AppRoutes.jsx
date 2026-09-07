import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Search from "../pages/search/Search";
import Categories from "../pages/Categories/Categories";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Wishlist from "../pages/Wishlist/Wishlist";
import Cart from "../pages/Cart/Cart";

import Checkout from "../pages/Checkout/Checkout";
import Profile from "../pages/Profile/Profile";
import Orders from "../pages/Orders/Orders";
import OrderDetails from "../pages/OrderDetails/OrderDetails";
import CancelOrder from "../pages/CancelOrder/CancelOrder";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import AddProduct from "../pages/Admin/AddProduct";
import EditProduct from "../pages/Admin/EditProduct";
import ProductsTable from "../pages/Admin/ProductsTable";
import AdminOrders from "../pages/Admin/AdminOrders";
import Analytics from "../pages/Admin/Analytics";
import Users from "../pages/Admin/Users";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/search" element={<Search />} />
      <Route path="/categories" element={<Categories />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />

        {/* Both singular and plural routes to prevent 404 / blank screens */}
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/orders/:id/cancel" element={<CancelOrder />} />
        <Route path="/order/:id/cancel" element={<CancelOrder />} />

        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute admin />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ProductsTable />} />
        <Route path="/admin/add-product" element={<AddProduct />} />
        <Route path="/admin/edit-product/:id" element={<EditProduct />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/users" element={<Users />} />
      </Route>

      {/* Fallback route: redirect unmapped URLs to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;