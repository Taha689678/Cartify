import { useState, useEffect } from "react";
import { categoryApi } from "../api/categoryApi.js";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getAll();
      setCategories(response.data.data.categories);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => fetchCategories();

  return { categories, loading, error, refetch };
};

