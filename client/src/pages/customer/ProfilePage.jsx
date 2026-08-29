import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { userApi } from "../../api/userApi.js";
import { CheckCircle, AlertCircle, Loader2, Camera, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getProfile();
      const userData = res.data.data.user;
      setProfile(userData);
      setFormData({
        name: userData.name || "",
        username: userData.username || "",
        phone: userData.phone || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const res = await userApi.updateProfile(formData);
      setProfile(res.data.data.user);
      setSuccess("Profile updated successfully");
      setIsEditing(false);
      
      // Update global auth context state (in case name changed in header)
      await refreshUser();
      
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
              <div className="h-12 bg-gray-100 rounded-xl w-full max-w-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center h-64">
        <AlertCircle size={40} className="mb-4 text-red-400" />
        <h3 className="text-lg font-bold mb-2">Error Loading Profile</h3>
        <p className="mb-6">{error}</p>
        <button 
          onClick={fetchProfile}
          className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
          <p className="text-gray-500 mt-1">Manage your account details and preferences.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-5 py-2.5 rounded-xl font-bold transition-colors self-start sm:self-auto"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="p-6 sm:p-8">
        {error && isEditing && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle size={18} />
            {Array.isArray(error) ? error[0] : error}
          </div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle size={18} />
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="max-w-2xl">
          {/* Avatar Area (Visual only for now unless file upload implemented later) */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-4xl shadow-inner border-4 border-white">
                {profile?.name?.charAt(0) || profile?.username?.charAt(0) || "?"}
              </div>
              {isEditing && (
                <button type="button" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors border-2 border-white" title="Change Photo (Coming Soon)">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{profile?.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                  {profile?.role}
                </span>
                {profile?.isVerified ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-md">
                    <ShieldCheck size={14} /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600 text-xs font-bold bg-orange-50 px-2.5 py-1 rounded-md">
                    <ShieldAlert size={14} /> Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                    required
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 border border-transparent">{profile?.name}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                    required
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 border border-transparent">@{profile?.username}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                {/* Email is protected, so always show as non-editable */}
                <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500 border border-transparent flex items-center justify-between cursor-not-allowed">
                  <span>{profile?.email}</span>
                  <span className="text-xs text-gray-400">Locked</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 555-123-4567"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 border border-transparent">
                    {profile?.phone || <span className="text-gray-400 italic">Not provided</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  // Reset form data to original profile
                  setFormData({
                    name: profile.name || "",
                    username: profile.username || "",
                    phone: profile.phone || "",
                  });
                }}
                disabled={saving}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
