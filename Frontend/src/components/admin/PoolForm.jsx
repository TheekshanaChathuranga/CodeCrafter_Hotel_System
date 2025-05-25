import React from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import ImageUploader from "./ImageUploader";
import TimeInput from "./TimeInput";

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
  selectedPool,
  onDelete,
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
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
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

              {/* Status as Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="poolStatus"
                      value="Available"
                      checked={form.poolStatus === "Available"}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      required
                    />
                    <span className="ml-2 text-gray-700">Available</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="poolStatus"
                      value="Not Available"
                      checked={form.poolStatus === "Not Available"}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Not Available</span>
                  </label>
                </div>
              </div>

              {/* Date Range Selector (shown only when Not Available is selected) */}
              {form.poolStatus === "Not Available" && (
                <div className="col-span-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="date"
                        name="unavailablePeriod.start"
                        value={form.unavailablePeriod?.start || ""}
                        onChange={(e) =>
                          onChange({
                            target: {
                              name: "unavailablePeriod",
                              value: {
                                ...form.unavailablePeriod,
                                start: e.target.value,
                              },
                            },
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        name="unavailablePeriod.end"
                        value={form.unavailablePeriod?.end || ""}
                        min={form.unavailablePeriod?.start || undefined}
                        onChange={(e) =>
                          onChange({
                            target: {
                              name: "unavailablePeriod",
                              value: {
                                ...form.unavailablePeriod,
                                end: e.target.value,
                              },
                            },
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

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

              {/* Price Per Person/Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Person/Hour (LKR) *
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">LKR</span>
                  </div>
                  <input
                    name="pricePerPersonHour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pricePerPersonHour || ""}
                    onChange={onChange}
                    placeholder="100.00"
                    className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pool Images (Max 5)
              </label>
              <ImageUploader
                previewImages={previewImages}
                onImageChange={previewImages.length >= 5 ? undefined : onImageChange}
                onRemoveImage={onRemoveImage}
              />
              {previewImages.length >= 5 && (
                <p className="mt-1 text-sm text-yellow-600">Maximum 5 images allowed. Remove an image to add another.</p>
              )}
            </div>

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
