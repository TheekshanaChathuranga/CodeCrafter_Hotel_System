import React from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

const ImageUploader = ({ previewImages, onImageChange, onRemoveImage }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Images (Max 3)
      </label>
      <div className="flex flex-wrap gap-4 mb-4">
        {previewImages.map((img, index) => (
          <div key={index} className="relative group">
            <img
              src={img}
              alt={`Preview ${index + 1}`}
              className="h-32 w-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">JPG, PNG, WEBP (MAX. 5MB each)</p>
        </div>
        <input
          type="file"
          name="images"
          onChange={onImageChange}
          multiple
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
        />
      </label>
    </div>
  );
};

export default ImageUploader;