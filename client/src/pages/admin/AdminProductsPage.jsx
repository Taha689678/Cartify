import { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { Search, Package, Trash2, Check, X } from "lucide-react";

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getProducts(params);
      setProducts(res.data.data.products);
      setTotalPages(res.data.meta?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter, page]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await adminApi.updateProductStatus(id, !currentStatus);
      setProducts(products.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await adminApi.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name or brand..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Seller</th>
                <th className="p-4 font-medium">Price/Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No products found</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].url || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 m-auto text-gray-400 mt-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {product.seller?.storeName || 'Unknown'}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-medium text-gray-900">Rs {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</div>
                      <div className="text-gray-500">{product.stock} in stock</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isActive ? <Check className="w-3 h-3"/> : <X className="w-3 h-3"/>}
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => toggleStatus(product._id, product.isActive)}
                        className={`text-sm px-3 py-1.5 rounded font-medium transition-colors ${
                          product.isActive 
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" 
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {product.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-gray-300 rounded text-sm bg-white disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-gray-300 rounded text-sm bg-white disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};
