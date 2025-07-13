import React from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

const ImageUploader = ({ previewImages, onImageChange, onRemoveImage }) => {
  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event to reuse onImageChange
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files,
        },
      };
      onImageChange(syntheticEvent);
    }
  };

  return (
    <div className="mb-6">
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
      <div
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">JPG, PNG, WEBP (MAX. 5MB each, up to 5 images)</p>
          </div>
          <input
            type="file"
            name="images"
            onChange={onImageChange}
            multiple
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            max={5}
          />
        </label>
      </div>
    </div>
  );
};

export default ImageUploader;