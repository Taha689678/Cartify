import React, { useState, useEffect } from 'react';
import { Star, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../api/reviewApi';
import ReviewForm from './ReviewForm';

const ReviewSection = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [eligible, setEligible] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchReviewsAndEligibility = async () => {
    setLoading(true);
    try {
      const reviewsRes = await reviewApi.getProductReviews(productId);
      const fetchedReviews = reviewsRes.data?.data?.reviews || [];
      const stats = reviewsRes.data?.data?.stats || { averageRating: 0, numReviews: 0 };
      
      setReviews(fetchedReviews);
      setAverageRating(stats.averageRating || 0);
      setNumReviews(stats.numReviews || 0);

      if (isAuthenticated && user) {
        // Check if user already reviewed
        const userReview = fetchedReviews.find(r => r.user?._id === user._id || r.user === user._id);
        if (userReview) {
          setExistingReview(userReview);
        } else {
          setExistingReview(null);
        }

        // Check eligibility
        try {
          const eligRes = await reviewApi.checkEligibility(productId);
          setEligible(eligRes.data?.data?.eligible || false);
        } catch (e) {
          setEligible(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviewsAndEligibility();
    }
  }, [productId, isAuthenticated, user]);

  const handleCreateReview = async (data) => {
    setFormLoading(true);
    try {
      await reviewApi.createReview({ ...data, productId });
      setShowForm(false);
      fetchReviewsAndEligibility();
    } catch (error) {
      console.error('Failed to create review', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateReview = async (data) => {
    if (!existingReview) return;
    setFormLoading(true);
    try {
      await reviewApi.updateReview(existingReview._id, data);
      setShowForm(false);
      setEditing(false);
      fetchReviewsAndEligibility();
    } catch (error) {
      console.error('Failed to update review', error);
      alert(error.response?.data?.message || 'Failed to update review');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReview) return;
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    
    setLoading(true);
    try {
      await reviewApi.deleteReview(existingReview._id);
      setExistingReview(null);
      fetchReviewsAndEligibility();
    } catch (error) {
      console.error('Failed to delete review', error);
      alert(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  if (loading && reviews.length === 0) {
    return <div className="py-8 text-center text-gray-500">Loading reviews...</div>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(averageRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-medium text-gray-900">
          {averageRating.toFixed(1)} out of 5
        </span>
        <span className="text-gray-500">
          ({numReviews} {numReviews === 1 ? 'review' : 'reviews'})
        </span>
      </div>

      {!showForm && eligible && !existingReview && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
        >
          Write a Review
        </button>
      )}

      {showForm && !editing && (
        <div className="mb-8">
          <ReviewForm
            onSubmit={handleCreateReview}
            onCancel={() => setShowForm(false)}
            loading={formLoading}
          />
        </div>
      )}

      {showForm && editing && (
        <div className="mb-8">
          <ReviewForm
            initialData={existingReview}
            onSubmit={handleUpdateReview}
            onCancel={() => {
              setShowForm(false);
              setEditing(false);
            }}
            loading={formLoading}
          />
        </div>
      )}

      {existingReview && !showForm && (
        <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Your Review</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= existingReview.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(true);
                  setShowForm(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                title="Edit review"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteReview}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {existingReview.title && (
            <h4 className="font-medium text-gray-900 mb-2">{existingReview.title}</h4>
          )}
          <p className="text-gray-600 whitespace-pre-line">{existingReview.comment}</p>
        </div>
      )}

      <div className="space-y-6">
        {reviews.filter(r => r._id !== existingReview?._id).map((review) => (
          <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {review.user?.name || 'Anonymous User'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {review.title && (
              <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
            )}
            <p className="text-gray-600 whitespace-pre-line">{review.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
