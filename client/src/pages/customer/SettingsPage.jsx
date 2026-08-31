import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Key, ShieldCheck, CreditCard, Bell, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-500">Manage your account preferences, security, and personal information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
          </div>
          <div className="space-y-4 mb-6 flex-grow">
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</span>
              <span className="text-gray-900 font-medium">{user?.name || 'Not provided'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Username</span>
              <span className="text-gray-900 font-medium">{user?.username || 'Not provided'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
              <span className="text-gray-900 font-medium flex items-center gap-2">
                {user?.email}
                {user?.isEmailVerified ? (
                  <ShieldCheck size={16} className="text-green-500" title="Verified" />
                ) : (
                  <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Unverified</span>
                )}
              </span>
            </div>
          </div>
          <Link to="/profile" className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm">
            Edit Profile
          </Link>
        </motion.div>

        {/* Security Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Security & Password</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6 flex-grow">
            Update your password and secure your account. We recommend changing your password periodically and not reusing passwords across different sites.
          </p>
          <div className="space-y-3">
            <Link to="/settings/password" className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors text-sm">
              <Key size={16} />
              Change Password
            </Link>
          </div>
        </motion.div>

        {/* Account Status / Roles */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Account Status</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <span className="block font-semibold text-gray-900">Role</span>
              <span className="text-sm text-gray-500 capitalize">{user?.role || 'Customer'} Account</span>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full uppercase tracking-wide">
              Active
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
