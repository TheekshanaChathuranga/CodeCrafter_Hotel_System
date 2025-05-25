import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import RoomForm from "../../components/admin/RoomForm";
import RoomList from "../../components/admin/RoomList";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FiPlus } from "react-icons/fi";
import ErrorDisplay from "../../components/ErrorDisplay";
import { SnackbarProvider, useSnackbar } from "notistack";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomNumber: "",
    type: "",
    pricePerNight: "",
    pricePerDay: "",
    roomStatus: "Available",
    unavailablePeriod: {
      start: "",
      end: "",
    },
    description: "",
    acOption: "",
    images: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // State for search functionality
  const [filters, setFilters] = useState({
    type: "",
    acOption: "",
    roomStatus: "",
  });

  const getFilteredRooms = () => {
    return rooms.filter((room) => {
      return (
        (filters.type === "" || room.type === filters.type) &&
        (filters.acOption === "" || room.acOption === filters.acOption) &&
        (filters.roomStatus === "" || room.roomStatus === filters.roomStatus)
      );
    });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/rooms");
      setRooms(response.data);
    } catch (error) {
      setError({
        general: error.response?.data?.error || "Failed to fetch rooms",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear specific error when field changes
    if (error[name]) {
      setError((prev) => {
        const newError = { ...prev };
        delete newError[name];
        return newError;
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = {};

    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        newErrors.images = `Invalid file type: ${file.name}. Only JPG, PNG, and WEBP are allowed.`;
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        newErrors.images = `File too large: ${file.name}. Maximum size is 5MB.`;
        return false;
      }
      return true;
    });

    if (validFiles.length + form.images.length > 3) {
      newErrors.images = "Maximum 3 images allowed";
      setError((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setError((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setForm({ ...form, images: [...form.images, ...validFiles] });

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...form.images];
    const newPreviews = [...previewImages];

    if (index < previewImages.length - newImages.length) {
      const imagePath = previewImages[index].replace(
        "http://localhost:5000",
        ""
      );
      setDeletedImages([...deletedImages, imagePath]);
    }

    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    newImages.splice(index, 1);

    setPreviewImages(newPreviews);
    setForm({ ...form, images: newImages });

    // Clear image errors when removing images
    if (error.images) {
      setError((prev) => {
        const newError = { ...prev };
        delete newError.images;
        return newError;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setLoading(true);

    // Basic validation
    const errors = {};

    if (!form.roomNumber.trim()) {
      errors.roomNumber = "Room number is required";
    }

    if (!form.type) {
      errors.type = "Room type is required";
    }

    if (!form.acOption) {
      errors.acOption = "AC option is required";
    }

    const numericPricePerNight = parseFloat(form.pricePerNight);
    if (isNaN(numericPricePerNight)) {
      errors.pricePerNight = "Price must be a valid number";
    } else if (numericPricePerNight < 0) {
      errors.pricePerNight = "Price cannot be negative";
    }

    const numericPricePerDay = parseFloat(form.pricePerDay);
    if (isNaN(numericPricePerDay)) {
      errors.pricePerDay = "Price must be a valid number";
    } else if (numericPricePerDay < 0) {
      errors.pricePerDay = "Price cannot be negative";
    }

    if (form.roomStatus === "Not Available") {
      if (!form.unavailablePeriod?.start || !form.unavailablePeriod?.end) {
        setError({
          ...error,
          unavailablePeriod:
            "Date range is required when status is Not Available",
        });
        return;
      }

      // Validate end date is after start date
      if (
        new Date(form.unavailablePeriod.end) <
        new Date(form.unavailablePeriod.start)
      ) {
        setError({
          ...error,
          unavailablePeriod: "End date must be after start date",
        });
        return;
      }
    }

    if (!form.description.trim()) {
      errors.description = "Description is required";
    }

    if (Object.keys(errors).length > 0) {
      setError(errors);
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

      if (form.roomStatus === "Not Available") {
        formData.append(
          "unavailablePeriod",
          JSON.stringify({
            start: form.unavailablePeriod.start,
            end: form.unavailablePeriod.end,
          })
        );
      }

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/rooms/update/${selectedRoom._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        enqueueSnackbar("Room updated successfully", { variant: "success" });
      } else {
        await axios.post("http://localhost:5000/api/rooms/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        enqueueSnackbar("Room added successfully", { variant: "success" });
      }

      fetchRooms();
      resetForm();
    } catch (error) {
      const serverErrors = error.response?.data?.errors || {};
      if (Object.keys(serverErrors).length > 0) {
        setError(serverErrors);
      } else {
        setError({
          general: error.response?.data?.error || "Failed to save room",
        });
      }
      console.error("Error saving room:", error);
      enqueueSnackbar(error.response?.data?.error || "Failed to save room", {
        variant: "error",
      });
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
      unavailablePeriod: room.unavailablePeriod
        ? {
            start: room.unavailablePeriod.start
              ? room.unavailablePeriod.start.slice(0, 10)
              : "",
            end: room.unavailablePeriod.end
              ? room.unavailablePeriod.end.slice(0, 10)
              : "",
          }
        : { start: "", end: "" },
      description: room.description,
      images: [],
    });
    setSelectedRoom(room);
    setPreviewImages(room.images.map((img) => `http://localhost:5000${img}`));
    setShowForm(true);
    setIsEditing(true);
    setError({});
  };

  const handleDeleteConfirmed = async () => {
    try {
      console.log("handleDeleteConfirmed : ", selectedRoom._id);
      setLoading(true);
      await axios.delete(
        `http://localhost:5000/api/rooms/delete/${selectedRoom._id}`
      );
      enqueueSnackbar("Room deleted successfully", { variant: "success" });
      fetchRooms();
      resetForm();
    } catch (error) {
      handleError(error, "Failed to delete room");
    } finally {
      setLoading(false);
      setConfirmOpen(false); // Close dialog
    }
  };

  const handleDeleteClick = (room) => {
    setSelectedRoom(room);
    setConfirmOpen(true); // Open dialog
  };

  const resetForm = () => {
    setForm({
      roomNumber: "",
      type: "",
      pricePerNight: "",
      pricePerDay: "",
      description: "",
      acOption: "",
      roomStatus: "Available",
      unavailablePeriod: { start: "", end: "" },
      images: [],
    });
    setPreviewImages([]);
    setDeletedImages([]);
    setSelectedRoom(null);
    setIsEditing(false);
    setShowForm(false);
    setError({});
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

      <ErrorDisplay error={error.general} />

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
          selectedRoom={selectedRoom} // <-- Add this
          onDelete={() => handleDeleteClick(selectedRoom)}
        />
      )}

      {/* Search and filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AC Option
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.acOption}
              onChange={(e) =>
                setFilters({ ...filters, acOption: e.target.value })
              }
            >
              <option value="">All Options</option>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.roomStatus}
              onChange={(e) =>
                setFilters({ ...filters, roomStatus: e.target.value })
              }
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() =>
              setFilters({ type: "", acOption: "", roomStatus: "" })
            }
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <RoomList
        rooms={getFilteredRooms()}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selectedRoom?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            color="error"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
