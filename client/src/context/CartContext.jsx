import React, { createContext, useContext, useState, useEffect } from "react";
import { cartApi } from "../api/cartApi.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await cartApi.getCart();
      setCart(res.data.data.cart);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId, quantity) => {
    if (!user) {
      setError("Please login to add items to cart");
      throw new Error("unauthenticated");
    }
    try {
      setLoading(true);
      const res = await cartApi.addToCart(productId, quantity);
      setCart(res.data.data.cart);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add item to cart";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      const res = await cartApi.updateCartItem(productId, quantity);
      setCart(res.data.data.cart);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update quantity";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    try {
      setLoading(true);
      const res = await cartApi.removeCartItem(productId);
      setCart(res.data.data.cart);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove item";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const res = await cartApi.clearCart();
      setCart(res.data.data.cart);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to clear cart";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  
  const subtotal = cart?.items?.reduce((total, item) => {
    // Safely get price, either from the cart item's snapshot or fallback to current product price
    const price = item.price || item.product?.price || 0;
    return total + price * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        cartItemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
