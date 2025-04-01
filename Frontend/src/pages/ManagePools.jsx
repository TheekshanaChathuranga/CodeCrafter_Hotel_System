import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus, FiX, FiUpload, FiClock } from "react-icons/fi";

const AdminPools = () => {
  const [pools, setPools] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: "",
    poolStatus: "Available",
    openingTime: "08:00",
    closingTime: "20:00",
    images: []
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/pools");
      setPools(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch pools");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleTimeChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPG, PNG, and WEBP are allowed.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length + form.images.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setForm({ ...form, images: [...form.images, ...validFiles] });
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...form.images];
    const newPreviews = [...previewImages];
    
    // If it's an existing image (not a newly uploaded one)
    if (index < previewImages.length - newImages.length) {
      const imagePath = previewImages[index].replace('http://localhost:5000', '');
      setDeletedImages([...deletedImages, imagePath]);
    }
    
    // Remove from previews and form images
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    newImages.splice(index, 1);
    
    setPreviewImages(newPreviews);
    setForm({...form, images: newImages});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.name || !form.description || !form.capacity || !form.openingTime || !form.closingTime) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    const numericCapacity = parseInt(form.capacity);
    
    if (isNaN(numericCapacity)) {
      setError("Capacity must be a valid number");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("capacity", numericCapacity);
      formData.append("poolStatus", form.poolStatus);
      formData.append("openingTime", form.openingTime);
      formData.append("closingTime", form.closingTime);
      formData.append("deletedImages", JSON.stringify(deletedImages));
      
      form.images.forEach((image) => {
        formData.append("images", image);
      });

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/pools/update/${selectedPool._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/pools/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      fetchPools();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save pool");
      console.error("Error saving pool:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pool) => {
    setForm({
      name: pool.name,
      description: pool.description,
      capacity: pool.capacity.toString(),
      poolStatus: pool.poolStatus,
      openingTime: pool.openingTime,
      closingTime: pool.closingTime,
      images: []
    });
    setSelectedPool(pool);
    setPreviewImages(pool.images.map(img => `http://localhost:5000${img}`));
    setShowForm(true);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedPool.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/pools/delete/${selectedPool._id}`);
      fetchPools();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete pool");
      console.error("Error deleting pool:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      capacity: "",
      poolStatus: "Available",
      openingTime: "08:00",
      closingTime: "20:00",
      images: []
    });
    setPreviewImages([]);
    setDeletedImages([]);
    setSelectedPool(null);
    setIsEditing(false);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Pool Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" /> Add Pool
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}

      {loading && !showForm && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-500/75 transition-opacity flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isEditing ? "Edit Pool" : "Add New Pool"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pool Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Main Pool"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity *
                    </label>
                    <input
                      name="capacity"
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="poolStatus"
                      value={form.poolStatus}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time *
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        name="openingTime"
                        value={form.openingTime}
                        onChange={(e) => handleTimeChange("openingTime", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <FiClock className="absolute right-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time *
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        name="closingTime"
                        value={form.closingTime}
                        onChange={(e) => handleTimeChange("closingTime", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <FiClock className="absolute right-3 top-3 text-gray-400" />
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
                    onChange={handleChange}
                    rows="3"
                    placeholder="Pool features and details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images (Max 5)
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
                          onClick={() => removeImage(index)}
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
                      onChange={handleImageChange}
                      multiple
                      accept="image/jpeg, image/png, image/webp"
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                      disabled={loading}
                    >
                      <FiTrash2 className="mr-2" /> Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
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
                        {isEditing ? "Update Pool" : "Save Pool"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {pools.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No pools found. Add your first pool to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pools.map((pool) => (
            <div
              key={pool._id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleEdit(pool)}
            >
              {pool.images?.[0] && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`http://localhost:5000${pool.images[0]}`}
                    alt={`${pool.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {pool.images.length} {pool.images.length === 1 ? 'image' : 'images'}
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{pool.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    pool.poolStatus === 'Available' ? 'bg-green-100 text-green-800' :
                    pool.poolStatus === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {pool.poolStatus}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">
                  • Capacity: {pool.capacity} people
                </p>
                <p className="text-gray-600 mb-1 flex items-center">
                  <FiClock className="mr-1" /> {pool.openingTime} - {pool.closingTime}
                </p>
                {pool.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{pool.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPools;