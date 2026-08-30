import { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { Search, Store, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

export const AdminSellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getSellers(params);
      setSellers(res.data.data.sellers);
      setTotalPages(res.data.meta?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [statusFilter, page]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminApi.updateSellerStatus(id, newStatus);
      setSellers(sellers.map(s => s._id === id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case 'pending': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3"/> Pending</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3"/> Rejected</span>;
      case 'suspended': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"><AlertTriangle className="w-3 h-3"/> Suspended</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Store className="text-gray-400 w-5 h-5" />
          <span className="text-gray-600 font-medium">Filter by Status:</span>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium">Store Name</th>
                <th className="p-4 font-medium">Owner Email</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading sellers...</td></tr>
              ) : sellers.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No sellers found</td></tr>
              ) : (
                sellers.map(seller => (
                  <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{seller.storeName}</span>
                        <span className="text-xs text-gray-500">Slug: {seller.storeSlug}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{seller.user?.email || 'N/A'}</td>
                    <td className="p-4">{getStatusBadge(seller.status)}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(seller.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <select
                        className="text-sm border-gray-300 rounded focus:ring-red-500 py-1"
                        value={seller.status}
                        onChange={(e) => handleStatusUpdate(seller._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approve</option>
                        <option value="suspended">Suspend</option>
                        <option value="rejected">Reject</option>
                      </select>
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
