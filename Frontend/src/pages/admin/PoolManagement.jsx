import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus } from "react-icons/fi";
import { useSnackbar } from "notistack";
import ErrorDisplay from "../../components/ErrorDisplay";
import LoadingSpinner from "../../components/LoadingSpinner";
import PoolForm from "../../components/admin/PoolForm";
import PoolList from "../../components/admin/PoolList";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography
} from '@mui/material';


const PoolManagement = () => {
  const [pools, setPools] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    capacity: "",
    poolStatus: "Available",
    openingTime: "08:00",
    closingTime: "20:00",
    pricePerPersonHour: "",
    unavailablePeriod: { start: "", end: "" },
    images: []
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);


  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/pools");
      setPools(response.data);
    } catch (error) {
      handleError(error, "Failed to fetch pools");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "unavailablePeriod.start" || name === "unavailablePeriod.end") {
      setForm((prev) => ({
        ...prev,
        unavailablePeriod: {
          ...prev.unavailablePeriod,
          [name.split(".")[1]]: value,
        },
      }));
    } else {
      setForm({ ...form, [name]: value });
    }
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
      formData.append("pricePerPersonHour", form.pricePerPersonHour);
      if (form.poolStatus === "Not Available") {
        formData.append(
          "unavailablePeriod",
          JSON.stringify({
            start: form.unavailablePeriod.start,
            end: form.unavailablePeriod.end,
          })
        );
      }
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
        enqueueSnackbar("Pool updated successfully", { variant: 'success' });
      } else {
        await axios.post(
          "http://localhost:5000/api/pools/add",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        enqueueSnackbar("Pool added successfully", { variant: 'success' });
      }

      fetchPools();
      resetForm();
    } catch (error) {
      handleError(error, "Failed to save pool");
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
      pricePerPersonHour: pool.pricePerPersonHour?.toString() || "",
      unavailablePeriod: pool.unavailablePeriod
        ? {
            start: pool.unavailablePeriod.start
              ? pool.unavailablePeriod.start.slice(0, 10)
              : "",
            end: pool.unavailablePeriod.end
              ? pool.unavailablePeriod.end.slice(0, 10)
              : "",
          }
        : { start: "", end: "" },
      images: []
    });
    setSelectedPool(pool);
    setPreviewImages(pool.images.map(img => `http://localhost:5000${img}`));
    setShowForm(true);
    setIsEditing(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      console.log("handleDeleteConfirmed : ",selectedPool._id);
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/pools/delete/${selectedPool._id}`);
      enqueueSnackbar("Pool deleted successfully", { variant: 'success' });
      fetchPools();
      resetForm();
    } catch (error) {
      handleError(error, "Failed to delete pool");
    } finally {
      setLoading(false);
      setConfirmOpen(false); // Close dialog
    }
  };

  const handleDeleteClick = (pool) => {
    setSelectedPool(pool);
    setConfirmOpen(true); // Open dialog
  };

  const handleError = (error, defaultMessage) => {
    const message = error.response?.data?.error || defaultMessage;
    setError(message);
    enqueueSnackbar(message, { variant: 'error' });
    console.error(message, error);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      capacity: "",
      poolStatus: "Available",
      openingTime: "08:00",
      closingTime: "20:00",
      pricePerPersonHour: "",
      unavailablePeriod: { start: "", end: "" },
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
          className="bg-[#16A085] hover:bg-[#138D75] text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="mr-2" /> Add Pool
        </button>
      </div>

      <ErrorDisplay error={error} />
      
      {loading && !showForm && <LoadingSpinner />}

      {showForm && (
        <PoolForm 
          form={form}
          isEditing={isEditing}
          loading={loading}
          previewImages={previewImages}
          onClose={resetForm}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onTimeChange={handleTimeChange}
          onImageChange={handleImageChange}
          onRemoveImage={removeImage}
          selectedPool={selectedPool} // <-- Add this
          onDelete={() => handleDeleteClick(selectedPool)}
        />
      )}

      <PoolList 
        pools={pools}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedPool?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="error" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PoolManagement;