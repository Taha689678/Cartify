import { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { Search, Store, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

export const AdminSellerApplicationsPage = () => {
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
      setError("Failed to load seller applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [statusFilter, page]);

  const handleStatusUpdate = async (id, newStatus) => {
    let payload = { status: newStatus };

    if (newStatus === "rejected") {
      const reason = window.prompt("Optional: Enter a rejection reason for the applicant:");
      if (reason === null) return; // User cancelled
      payload.rejectionReason = reason;
    } else if (newStatus === "approved") {
      if (!window.confirm("Approve this application? This will grant the user seller access.")) return;
    }

    try {
      await adminApi.updateSellerStatus(id, payload.status, payload.rejectionReason);
      setSellers(sellers.map(s => s._id === id ? { ...s, status: newStatus, rejectionReason: payload.rejectionReason || "" } : s));
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
        <h1 className="text-2xl font-bold text-gray-900">Seller Applications</h1>
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
          <option value="">All Applications</option>
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
                <th className="p-4 font-medium">Applicant Info</th>
                <th className="p-4 font-medium">Store Details</th>
                <th className="p-4 font-medium">Status & Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading applications...</td></tr>
              ) : sellers.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No applications found</td></tr>
              ) : (
                sellers.map(seller => (
                  <tr key={seller._id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{seller.user?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{seller.user?.email || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{seller.storeName}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 max-w-xs">{seller.storeDescription}</p>
                    </td>
                    <td className="p-4">
                      <div className="mb-2">{getStatusBadge(seller.status)}</div>
                      <p className="text-xs text-gray-500">Applied: {new Date(seller.createdAt).toLocaleDateString()}</p>
                      {seller.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 max-w-[150px] truncate" title={seller.rejectionReason}>
                          Reason: {seller.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {seller.status === "pending" ? (
                        <div className="flex flex-col gap-2 items-end">
                          <button
                            onClick={() => handleStatusUpdate(seller._id, "approved")}
                            className="w-24 px-3 py-1.5 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(seller._id, "rejected")}
                            className="w-24 px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
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
                      )}
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
