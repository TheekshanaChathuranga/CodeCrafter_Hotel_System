import React from 'react';
import { FiX, FiTrash2, FiClock } from 'react-icons/fi';
import ImageUploader from './ImageUploader';
import TimeInput from './TimeInput';

const PoolForm = ({
  form,
  isEditing,
  loading,
  previewImages,
  onClose,
  onSubmit,
  onChange,
  onTimeChange,
  onImageChange,
  onRemoveImage,
  onDelete
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500/75 transition-opacity flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Form header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? "Edit Pool" : "Add New Pool"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Pool Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pool Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <input
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  name="poolStatus"
                  value={form.poolStatus}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              {/* Time Inputs */}
              <TimeInput 
                label="Opening Time"
                name="openingTime"
                value={form.openingTime}
                onChange={(value) => onTimeChange("openingTime", value)}
              />
              
              <TimeInput 
                label="Closing Time"
                name="closingTime"
                value={form.closingTime}
                onChange={(value) => onTimeChange("closingTime", value)}
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Image Uploader */}
            <ImageUploader 
              previewImages={previewImages}
              onImageChange={onImageChange}
              onRemoveImage={onRemoveImage}
              maxImages={5}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              {isEditing && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                  disabled={loading}
                >
                  <FiTrash2 className="mr-2" /> Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75]"
                disabled={loading}
              >
                {isEditing ? "Update Pool" : "Save Pool"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PoolForm;