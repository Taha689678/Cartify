import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sellerApplicationApi } from "../../api/sellerApplicationApi";
import { useAuth } from "../../context/AuthContext";
import { Store, AlertCircle, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const BecomeSellerPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: ""
  });

  useEffect(() => {
    fetchMyApplication();
  }, []);

  const fetchMyApplication = async () => {
    try {
      setLoading(true);
      const res = await sellerApplicationApi.getMyApplication();
      setApplication(res.data.data.application);
      
      // If user is already approved and the user object doesn't reflect it, redirect or update
      if (res.data.data.application.status === "approved" && user?.role !== "seller") {
        await refreshUser();
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError("Failed to load application status.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await sellerApplicationApi.submitApplication(formData);
      setApplication(res.data.data.application);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Already a seller or admin
  if (user?.role === "seller" || user?.role === "admin") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You are already a Seller!</h2>
          <p className="text-gray-600 mb-6">Your account has full seller privileges.</p>
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors"
          >
            Go to Seller Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Has existing application
  if (application && application.status !== "rejected") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          {application.status === "pending" ? (
            <>
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
              <p className="text-gray-600 mb-6">
                Thank you for applying, <strong>{user?.name}</strong>! Your application for <strong>{application.storeName}</strong> is currently being reviewed by our team. We'll notify you once a decision is made.
              </p>
            </>
          ) : application.status === "approved" ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Approved!</h2>
              <p className="text-gray-600 mb-6">
                Congratulations! Your seller application has been approved. You can now start selling.
              </p>
              <Link
                to="/seller/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors"
              >
                Go to Seller Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : application.status === "suspended" ? (
            <>
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
              <p className="text-gray-600 mb-6">
                Your seller account has been suspended by an administrator. Please contact support for more information.
              </p>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // Application form (First time or Rejected)
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <Store className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
        <p className="mt-2 text-lg text-gray-600">Join our marketplace and start selling your products today.</p>
      </div>

      {application?.status === "rejected" && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">Previous Application Rejected</h3>
            <p className="text-red-700 mt-1">
              Your last application was not approved. 
              {application.rejectionReason && (
                <span className="block mt-2 font-medium">Reason: {application.rejectionReason}</span>
              )}
            </p>
            <p className="text-sm text-red-600 mt-3">You may update your details below and submit a new application.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">This will be your unique brand name on the platform.</p>
            <input
              type="text"
              id="storeName"
              required
              minLength={2}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Acme Electronics"
              value={formData.storeName}
              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Store Description
            </label>
            <p className="text-xs text-gray-500 mb-2">Tell customers what you sell and why they should buy from you.</p>
            <textarea
              id="storeDescription"
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-y"
              placeholder="We specialize in high-quality..."
              value={formData.storeDescription}
              onChange={(e) => setFormData({...formData, storeDescription: e.target.value})}
            />
          </div>

          <div className="bg-blue-50 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>
              By submitting this application, you agree to our Seller Terms of Service. 
              Your contact email (<strong>{user?.email}</strong>) and phone number will be used for official communication.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
