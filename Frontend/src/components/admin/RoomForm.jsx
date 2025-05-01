import React from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import ImageUploader from './ImageUploader';

const RoomForm = ({
  form,
  isEditing,
  loading,
  previewImages,
  onClose,
  onSubmit,
  onChange,
  onImageChange,
  onRemoveImage,
  onDelete
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500/75 transition-opacity flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditing ? "Edit Room" : "Add New Room"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number *
                </label>
                <input
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={onChange}
                  placeholder="101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AC Option *
                </label>
                <select
                  name="acOption"
                  value={form.acOption}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Option</option>
                  <option value="AC">AC Only</option>
                  <option value="Non-AC">Non-AC Only</option>
                  <option value="Both">Flexible (Can be AC or Non-AC)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (per night) *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">LKR</span>
                  </div>
                  <input
                    name="pricePerNight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pricePerNight}
                    onChange={onChange}
                    placeholder="100.00"
                    className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (per day) *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">LKR</span>
                  </div>
                  <input
                    name="pricePerDay"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pricePerDay}
                    onChange={onChange}
                    placeholder="100.00"
                    className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Status *</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="roomStatus"
                      value="Available"
                      checked={form.roomStatus === "Available"}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Available</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="roomStatus"
                      value="Not Available"
                      checked={form.roomStatus === "Not Available"}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Not Available</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows="3"
                placeholder="Room features and details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <ImageUploader 
              previewImages={previewImages}
              onImageChange={onImageChange}
              onRemoveImage={onRemoveImage}
            />

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
                className="px-4 py-2 bg-[#ECF0F1] text-[#333333] rounded-md hover:bg-[#BDC3C7]"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    {isEditing ? "Update Room" : "Save Room"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomForm;