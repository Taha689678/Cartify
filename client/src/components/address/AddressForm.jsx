import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const INITIAL_STATE = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Pakistan',
  isDefault: false,
};

export const AddressForm = ({ initialData, onSubmit, onCancel, loading, error }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        state: initialData.state || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || 'Pakistan',
        isDefault: initialData.isDefault || false,
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setFieldErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    if (!formData.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.country.trim()) errors.country = 'Country is required.';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    onSubmit(formData);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border transition-all outline-none bg-gray-50 focus:bg-white ${
      fieldErrors[field]
        ? 'border-red-400 focus:ring-2 focus:ring-red-300'
        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="mb-5 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Ahmed Khan"
              className={inputClass('fullName')}
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +92 300 1234567"
              className={inputClass('phone')}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="Street address, P.O. box"
            className={inputClass('addressLine1')}
          />
          {fieldErrors.addressLine1 && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.addressLine1}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Address Line 2{' '}
            <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </label>
          <input
            type="text"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Apartment, suite, unit, building, floor, etc."
            className={inputClass('addressLine2')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Lahore"
              className={inputClass('city')}
            />
            {fieldErrors.city && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              State / Province{' '}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="e.g. Punjab"
              className={inputClass('state')}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Postal Code{' '}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g. 54000"
              className={inputClass('postalCode')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g. Pakistan"
            className={inputClass('country')}
          />
          {fieldErrors.country && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.country}</p>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
            Set as default address
          </span>
        </label>
      </div>

      <div className="mt-7 flex items-center gap-3 pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : initialData ? (
            'Save Changes'
          ) : (
            'Add Address'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
