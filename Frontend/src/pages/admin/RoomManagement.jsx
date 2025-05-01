import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import RoomForm from "../../components/admin/RoomForm";
import RoomList from "../../components/admin/RoomList";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FiPlus } from "react-icons/fi";
import ErrorDisplay from "../../components/ErrorDisplay";
import { SnackbarProvider, useSnackbar } from 'notistack'

const RoomManagement = () => {
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
  const { enqueueSnackbar } = useSnackbar();

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
    
    if (index < previewImages.length - newImages.length) {
      const imagePath = previewImages[index].replace('http://localhost:5000', '');
      setDeletedImages([...deletedImages, imagePath]);
    }
    
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
        enqueueSnackbar("Login successful!", { variant: "success" });
      });

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/rooms/update/${selectedRoom._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        enqueueSnackbar("Room updated successfully", {variant: "success",});

      } else {
        await axios.post(
          "http://localhost:5000/api/rooms/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        enqueueSnackbar("Room added successfully", {variant: "success",});
      }

      fetchRooms();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to save room");
      console.error("Error saving room:", error);
      enqueueSnackbar("Failed to save room", { variant: "error" });
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
      enqueueSnackbar("Room deleted successfully", {variant: "success",});
      fetchRooms();
      resetForm();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete room");
      console.error("Error deleting room:", error);
      enqueueSnackbar("Failed to delete room", { variant: "error" });

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
    setDeletedImages([]);
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

      <ErrorDisplay error={error} />
      
      {loading && !showForm && <LoadingSpinner />}

      {showForm && (
        <RoomForm 
          form={form}
          isEditing={isEditing}
          loading={loading}
          previewImages={previewImages}
          onClose={resetForm}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          onDelete={handleDelete}
        />
      )}

      <RoomList 
        rooms={rooms}
        loading={loading}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default RoomManagement;
