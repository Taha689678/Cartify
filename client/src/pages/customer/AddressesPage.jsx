import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Star,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { addressApi } from '../../api/addressApi.js';
import { AddressForm } from '../../components/address/AddressForm.jsx';

export const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await addressApi.getAddresses();
      setAddresses(res.data.data.addresses || res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (address) => {
    setEditingAddress(address);
    setFormError(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormError(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setSaving(true);
      setFormError(null);
      if (editingAddress) {
        await addressApi.updateAddress(editingAddress._id, formData);
      } else {
        await addressApi.createAddress(formData);
      }
      await fetchAddresses();
      handleCloseForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressApi.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete address.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressApi.setDefaultAddress(id);
      await fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default address.');
    }
  };

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse bg-gray-50 rounded-2xl border border-gray-100 p-5 h-44" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────────────
  if (error && addresses.length === 0) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center h-64">
        <AlertCircle size={40} className="mb-4 text-red-400" />
        <h3 className="text-lg font-bold mb-2">Error Loading Addresses</h3>
        <p className="mb-6 text-sm">{error}</p>
        <button
          onClick={fetchAddresses}
          className="bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Header ── */}
      <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-gray-500 mt-1">Manage your saved delivery addresses.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 self-start sm:self-auto"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {/* ── Inline Form Panel ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                {editingAddress ? 'Edit Address' : 'New Address'}
              </h2>
              <AddressForm
                initialData={editingAddress}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                loading={saving}
                error={formError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State ── */}
        {addresses.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 border border-gray-100">
              <MapPin size={38} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No saved addresses</h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Add a delivery address to speed up your checkout experience.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Plus size={18} />
              Add Address
            </button>
          </div>
        )}

        {/* ── Address Grid ── */}
        {addresses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {addresses.map((address) => (
                <motion.div
                  key={address._id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className={`relative bg-white rounded-2xl border shadow-sm flex flex-col gap-2 p-5 transition-shadow hover:shadow-md ${
                    address.isDefault ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
                  }`}
                >
                  {/* Default Badge */}
                  {address.isDefault && (
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      <CheckCircle size={12} />
                      DEFAULT
                    </span>
                  )}

                  {/* Address Info */}
                  <div className="flex items-start gap-3 pr-20">
                    <MapPin size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-900">{address.fullName}</p>
                      <p className="text-sm text-gray-500">{address.phone}</p>
                      <p className="text-sm text-gray-700 mt-1">{address.addressLine1}</p>
                      {address.addressLine2 && (
                        <p className="text-sm text-gray-700">{address.addressLine2}</p>
                      )}
                      <p className="text-sm text-gray-700">
                        {[address.city, address.state, address.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p className="text-sm text-gray-700">{address.country}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                    <button
                      onClick={() => handleOpenEdit(address)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      title="Edit address"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      title="Delete address"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address._id)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                        title="Set as default"
                      >
                        <Star size={15} />
                        Set as Default
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
