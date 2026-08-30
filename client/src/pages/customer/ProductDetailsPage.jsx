import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { productApi } from '../../api/productApi.js';
import { ProductGallery } from '../../components/product/ProductGallery.jsx';
import { ProductInfo } from '../../components/product/ProductInfo.jsx';
import ReviewSection from '../../components/product/ReviewSection.jsx';

export const ProductDetailsPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getBySlug(slug);
      setProduct(response.data.data.product);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Product not found");
      } else {
        setError(err.response?.data?.message || "Failed to load product details. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 mb-8 animate-pulse">
            <div className="w-16 h-5 bg-gray-200 rounded"></div>
            <div className="w-4 h-5 bg-gray-200 rounded"></div>
            <div className="w-24 h-5 bg-gray-200 rounded"></div>
            <div className="w-4 h-5 bg-gray-200 rounded"></div>
            <div className="w-32 h-5 bg-gray-200 rounded"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/2 flex-shrink-0 animate-pulse">
              <div className="w-full aspect-square bg-gray-200 rounded-2xl mb-4"></div>
              <div className="grid grid-cols-5 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 animate-pulse pt-4">
              <div className="w-24 h-6 bg-gray-200 rounded-full mb-4"></div>
              <div className="w-3/4 h-10 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/3 h-6 bg-gray-200 rounded mb-8"></div>
              <div className="w-1/4 h-12 bg-gray-200 rounded mb-8"></div>
              <div className="w-full h-32 bg-gray-200 rounded mb-8"></div>
              <div className="w-full h-14 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-gray-50 min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{error || "Product not found"}</h1>
        <p className="text-gray-500 max-w-md mb-8">
          The product you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex gap-4">
          <Link to="/shop" className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Back to Shop
          </Link>
          {error !== "Product not found" && (
            <button 
              onClick={fetchProduct}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <Link to="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
          {product.categories && product.categories.length > 0 && (
            <>
              <ChevronRight size={16} className="mx-2 flex-shrink-0" />
              <Link to={`/shop?category=${product.categories[0]._id}`} className="hover:text-blue-600 transition-colors">
                {product.categories[0].name}
              </Link>
            </>
          )}
          <ChevronRight size={16} className="mx-2 flex-shrink-0" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-12 flex flex-col lg:flex-row gap-12"
        >
          {/* Gallery (Left) */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Info (Right) */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <ProductInfo product={product} />
          </div>
        </motion.div>

        {/* Review Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 lg:p-12">
          <ReviewSection productId={product._id} />
        </div>
      </div>
    </div>
  );
};
