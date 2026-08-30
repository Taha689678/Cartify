import { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import { MessageSquare, Star, Trash2, CheckCircle, EyeOff, Flag } from "lucide-react";

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getReviews(params);
      setReviews(res.data.data.reviews);
      setTotalPages(res.data.meta?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, page]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminApi.updateReviewStatus(id, status);
      setReviews(reviews.map(r => r._id === id ? { ...r, status } : r));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update review status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review permanently? The product rating will be recalculated.")) return;
    try {
      await adminApi.deleteReview(id);
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published': return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800"><CheckCircle className="w-3 h-3"/> Published</span>;
      case 'hidden': return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800"><EyeOff className="w-3 h-3"/> Hidden</span>;
      case 'flagged': return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800"><Flag className="w-3 h-3"/> Flagged</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-gray-400 w-5 h-5" />
          <span className="text-gray-600 font-medium">Filter by Status:</span>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Reviews</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-medium w-1/4">Product & User</th>
                <th className="p-4 font-medium">Review Content</th>
                <th className="p-4 font-medium w-32">Status</th>
                <th className="p-4 font-medium text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading reviews...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No reviews found</td></tr>
              ) : (
                reviews.map(review => (
                  <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 align-top">
                      <p className="font-medium text-gray-900 line-clamp-2" title={review.product?.name}>
                        {review.product?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span className="font-medium text-gray-700">{review.user?.name || 'Unknown User'}</span>
                      </p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex text-yellow-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">{review.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3" title={review.comment}>{review.comment}</p>
                    </td>
                    <td className="p-4 align-top">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="p-4 align-top text-right space-y-2">
                      <select
                        className="text-sm border-gray-300 rounded focus:ring-red-500 py-1 w-full"
                        value={review.status}
                        onChange={(e) => handleStatusUpdate(review._id, e.target.value)}
                      >
                        <option value="published">Publish</option>
                        <option value="hidden">Hide</option>
                        <option value="flagged">Flag</option>
                      </select>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="w-full flex justify-center items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
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
