import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((previousCart) => {
      const existingProduct = previousCart.find(
        (item) => item._id === product._id
      );

      if (existingProduct) {
        return previousCart.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: (item.quantity || 1) + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartItem = (productId, quantity) => {
    const newQuantity = Number(quantity);

    if (newQuantity <= 0) {
      removeCartItem(productId);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  };

  const removeCartItem = (productId) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item._id !== productId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cart]);

  const shipping = subtotal > 0 && subtotal < 500 ? 50 : 0;

  const total = subtotal + shipping;

  const cartCount = useMemo(() => {
    return cart.reduce(
      (count, item) => count + Number(item.quantity || 1),
      0
    );
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        shipping,
        total,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

export default CartContext;