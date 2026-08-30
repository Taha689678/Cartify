import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../api/sellerApi';

export const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await sellerApi.getProducts();
      setProducts(res.data?.products || res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await sellerApi.updateProductStatus(id, !currentStatus);
      setProducts(products.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  const updateStock = async (id, currentStock, change) => {
    const newStock = Math.max(0, currentStock + change);
    if (newStock === currentStock) return;
    try {
      await sellerApi.updateProductStock(id, newStock);
      setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      console.error('Failed to update stock', err);
      alert('Failed to update stock');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border rounded p-4 flex flex-col gap-4 shadow-sm animate-pulse">
              <div className="w-full h-40 bg-gray-200 rounded"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link
          to="/seller/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded border">
          <p className="text-gray-500 mb-4">You have no products yet.</p>
          <Link
            to="/seller/products/new"
            className="text-blue-600 hover:underline font-medium"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col bg-white">
              <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]?.url || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 font-medium mb-4">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Stock:</span>
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateStock(product._id, product.stock, -1)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200">-</button>
                      <span className="px-3 py-1 text-sm">{product.stock}</span>
                      <button onClick={() => updateStock(product._id, product.stock, 1)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200">+</button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(product._id, product.isActive)}
                      className="flex-1 py-1.5 px-3 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
                    >
                      {product.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link
                      to={`/seller/products/${product._id}/edit`}
                      className="flex-1 py-1.5 px-3 bg-gray-100 text-center rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
