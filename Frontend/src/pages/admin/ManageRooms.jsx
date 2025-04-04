import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus, FiX, FiUpload } from "react-icons/fi";

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomNumber: "",
    type: "",
    pricePerNight: "",
    pricePerDay: "",
    roomStatus: "Available",
    description: "",
    acOption: "",
    images: []
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/rooms");
      setRooms(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
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

    if (validFiles.length + form.images.length > 3) {
      setError("Maximum 3 images allowed");
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

    if (!form.roomNumber || !form.type || !form.acOption || !form.pricePerNight || !form.pricePerDay || !form.description) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    const numericPricePerNight = parseFloat(form.pricePerNight);
    const numericPricePerDay = parseFloat(form.pricePerDay);
    
    if (isNaN(numericPricePerNight) || numericPricePerNight < 0 || isNaN(numericPricePerDay) || numericPricePerDay < 0) {
      setError("Prices must be valid positive numbers");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("roomNumber", form.roomNumber);
      formData.append("type", form.type);
      formData.append("acOption", form.acOption);
      formData.append("pricePerNight", numericPricePerNight);
      formData.append("pricePerDay", numericPricePerDay);
      formData.append("roomStatus", form.roomStatus);
      formData.append("description", form.description);
      formData.append("deletedImages", JSON.stringify(deletedImages));
      
      form.images.forEach((image) => {
        formData.append("images", image);
      });

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/rooms/update/${selectedRoom._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/rooms/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      fetchRooms();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save room");
      console.error("Error saving room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setForm({
      roomNumber: room.roomNumber,
      type: room.type,
      acOption: room.acOption,
      pricePerNight: room.pricePerNight.toString(),
      pricePerDay: room.pricePerDay.toString(),
      roomStatus: room.roomStatus,
      description: room.description,
      images: []
    });
    setSelectedRoom(room);
    setPreviewImages(room.images.map(img => `http://localhost:5000${img}`));
    setShowForm(true);
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete Room ${selectedRoom.roomNumber}?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/rooms/delete/${selectedRoom._id}`);
      fetchRooms();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete room");
      console.error("Error deleting room:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      roomNumber: "",
      type: "",
      pricePerNight: "",
      pricePerDay: "",
      description: "",
      acOption: "",
      status: "Available",
      images: []
    });
    setPreviewImages([]);
    setDeletedImages([]); // Reset deleted images
    setSelectedRoom(null);
    setIsEditing(false);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Room Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#16A085] hover:bg-[#138D75] text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" /> Add Room
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
                  {isEditing ? "Edit Room" : "Add New Room"}
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
                      Room Number *
                    </label>
                    <input
                      name="roomNumber"
                      value={form.roomNumber}
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                        onChange={handleChange}
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
                        onChange={handleChange}
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
                          onChange={handleChange}
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
                          onChange={handleChange}
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
                    onChange={handleChange}
                    rows="3"
                    placeholder="Room features and details..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

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
      )}

      {rooms.length === 0 && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No rooms found. Add your first room to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleEdit(room)}
            >
              {room.images?.[0] && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`http://localhost:5000${room.images[0]}`}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {room.images.length} {room.images.length === 1 ? 'image' : 'images'}
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    room.roomStatus === 'Available' ? 'bg-green-100 text-green-800' :
                    room.roomStatus === 'Not Available' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.roomStatus}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">
                • {room.type} • {room.acOption === 'Both' ? 'AC/Non-AC' : room.acOption}
                </p>
                <p className="text-gray-600 mb-1">
                • LKR {room.pricePerNight.toFixed(2)}/night 
                  • LKR {room.pricePerDay.toFixed(2)}/day
                </p>
                {room.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{room.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRooms;