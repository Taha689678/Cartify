import { useState, useEffect } from "react";
import { productApi } from "../api/productApi.js";

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = async (currentParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getAll(currentParams);
      if (currentParams.page > 1) {
        setProducts(prev => {
          // Prevent duplicates if react strict mode double fires
          const newProducts = response.data.data.products.filter(p => !prev.some(existing => existing._id === p._id));
          return [...prev, ...newProducts];
        });
      } else {
        setProducts(response.data.data.products);
      }
      setMeta(response.data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(params);
  }, [JSON.stringify(params)]);

  const refetch = () => fetchProducts(params);

  return { products, meta, loading, error, setParams, refetch };
};

