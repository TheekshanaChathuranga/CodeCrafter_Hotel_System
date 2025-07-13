import React, { useState } from "react";
import { FiX, FiTrash2 } from "react-icons/fi";
import ImageUploader from "./ImageUploader";

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
  onDelete,
  error = {},
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
              aria-label="Close form"
            >
              <FiX size={24} />
            </button>
          </div>

          {error.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error.general}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Room Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number *
                </label>
                <input
                  name="roomNumber"
                  value={form.roomNumber}
                  onChange={onChange}
                  placeholder="101"
                  className={`w-full px-3 py-2 border ${
                    error.roomNumber ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {error.roomNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {error.roomNumber}
                  </p>
                )}
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border ${
                    error.type ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                </select>
                {error.type && (
                  <p className="mt-1 text-sm text-red-600">{error.type}</p>
                )}
              </div>

              {/* AC Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AC Option *
                </label>
                <select
                  name="acOption"
                  value={form.acOption}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border ${
                    error.acOption ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select Option</option>
                  <option value="AC">AC Only</option>
                  <option value="Non-AC">Non-AC Only</option>
                  <option value="Flexible">Flexible (Can be AC or Non-AC)</option>
                </select>
                {error.acOption && (
                  <p className="mt-1 text-sm text-red-600">{error.acOption}</p>
                )}
              </div>

              {/* Price Per Night */}
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
                    className={`block w-full pl-12 pr-3 py-2 border ${
                      error.pricePerNight ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                {error.pricePerNight && (
                  <p className="mt-1 text-sm text-red-600">
                    {error.pricePerNight}
                  </p>
                )}
              </div>

              {/* Price Per Day */}
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
                    className={`block w-full pl-12 pr-3 py-2 border ${
                      error.pricePerDay ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
                {error.pricePerDay && (
                  <p className="mt-1 text-sm text-red-600">
                    {error.pricePerDay}
                  </p>
                )}
              </div>

              {/* Room Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Status *
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="roomStatus"
                      value="Available"
                      checked={form.roomStatus === "Available"}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      required
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

                {/* Date Range Selector (shown only when Not Available is selected) */}
                {form.roomStatus === "Not Available" && (
                  <div className="mt-4">
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

                {error.roomStatus && (
                  <p className="mt-1 text-sm text-red-600">
                    {error.roomStatus}
                  </p>
                )}
              </div>

              {/* Floor Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor *
                </label>
                <select
                  name="floor"
                  value={form.floor || ""}
                  onChange={onChange}
                  className={`w-full px-3 py-2 border ${
                    error.floor ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select Floor</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
                {error.floor && (
                  <p className="mt-1 text-sm text-red-600">{error.floor}</p>
                )}
              </div>

              {/* Facilities Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facilities
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="facilities"
                      value="Mini Fridge"
                      checked={form.facilities?.includes("Mini Fridge")}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2">Mini Fridge</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="facilities"
                      value="TV"
                      checked={form.facilities?.includes("TV")}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2">TV</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="facilities"
                      value="WiFi"
                      checked={form.facilities?.includes("WiFi")}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2">Wi-Fi</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="facilities"
                      value="Balcony"
                      checked={form.facilities?.includes("Balcony")}
                      onChange={onChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2">Balcony</span>
                  </label>
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
                rows="3"
                placeholder="Room features and details..."
                className={`w-full px-3 py-2 border ${
                  error.description ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {error.description && (
                <p className="mt-1 text-sm text-red-600">{error.description}</p>
              )}
            </div>

            {/* Image Uploader */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Images (Max 5)
              </label>
              <ImageUploader
                previewImages={previewImages}
                onImageChange={previewImages.length >= 5 ? undefined : onImageChange}
                onRemoveImage={onRemoveImage}
              />
              {previewImages.length >= 5 && (
                <p className="mt-1 text-sm text-yellow-600">Maximum 5 images allowed. Remove an image to add another.</p>
              )}
              {error.images && (
                <p className="mt-1 text-sm text-red-600">{error.images}</p>
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
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75]"
                disabled={loading}
                aria-label={isEditing ? "Update room" : "Save room"}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : isEditing ? (
                  "Update Room"
                ) : (
                  "Save Room"
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
