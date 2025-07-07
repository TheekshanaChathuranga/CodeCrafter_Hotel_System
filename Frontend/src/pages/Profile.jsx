import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/UserAuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    bio: "",
    location: "",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false); // NEW: confirmation dialog state
  const [pendingSubmit, setPendingSubmit] = useState(false); // NEW: to prevent double submit

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        fullName: user.fullName || "",
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
      });
      // Use the same helper as Navbar to get the correct image URL
      let profilePic = user.profilePicture;
      if (!profilePic || profilePic === "/img/default-profile.png") {
        setPreviewImage("/img/default-profile.png");
      } else if (profilePic.startsWith("/uploads/")) {
        // Use VITE_API_URL for absolute path if needed
        setPreviewImage(
          (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
            /\/api$/,
            ""
          ) + profilePic
        );
      } else if (
        profilePic.startsWith("http://") ||
        profilePic.startsWith("https://") ||
        profilePic.startsWith("data:")
      ) {
        setPreviewImage(profilePic);
      } else {
        // If it's just a filename, treat as upload
        setPreviewImage(
          (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
            /\/api$/,
            ""
          ) +
            "/uploads/" +
            profilePic
        );
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // NEW: Confirm dialog logic
  const handleSaveClick = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setPendingSubmit(true);
    try {
      let imageUrl = user.profilePicture || "";
      if (profileImage) {
        const imageForm = new FormData();
        imageForm.append("profileImage", profileImage);
        const uploadRes = await axios.post(
          "/api/profile/upload-profile-image",
          imageForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        imageUrl = uploadRes.data.imageUrl;
      }
      // Robustly resolve image path for saving
      if (imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "") {
        if (
          imageUrl.startsWith("data:") ||
          imageUrl.startsWith("http://") ||
          imageUrl.startsWith("https://")
        ) {
          // do nothing
        } else if (imageUrl.startsWith("/uploads/")) {
          // do nothing
        } else {
          imageUrl = `/uploads/${imageUrl}`;
        }
      } else {
        imageUrl = "/img/default-profile.png";
      }
      const updatedUser = {
        ...formData,
        profilePicture: imageUrl,
      };
      await updateUser(updatedUser);
      // Immediately update previewImage after save
      setPreviewImage(imageUrl);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile. Try again.");
    } finally {
      setPendingSubmit(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to change your details?
            </h2>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={pendingSubmit}
              >
                Yes, Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                disabled={pendingSubmit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar - Profile Overview */}
        <div className="bg-white rounded-2xl shadow p-6 sticky top-10 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative group w-40 h-40">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/img/default-profile.png";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full border-4 border-white shadow">
                  <span className="text-gray-500 text-lg">No Image</span>
                </div>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={triggerFileInput}
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    Change
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="mt-4 space-y-1">
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="text-xl font-semibold text-center bg-gray-100 px-2 py-1 rounded"
                />
              ) : (
                <h1 className="text-xl font-semibold">{user.username}</h1>
              )}
              <p className="text-gray-600 text-sm">{user.email}</p>
              <p className="text-sm text-blue-600 capitalize">{user.role}</p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isEditing
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow p-6">
            {isEditing ? (
              <form onSubmit={handleSaveClick} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 w-full border rounded-md p-2 bg-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1 w-full border rounded-md p-2 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 w-full border rounded-md p-2 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 w-full border rounded-md p-2 bg-gray-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    disabled={pendingSubmit}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Bio</h2>
                  <p className="text-gray-700 mt-1">
                    {user.bio || "No bio yet"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Full Name
                    </h3>
                    <p className="mt-1 text-lg">
                      {user.fullName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="mt-1 text-lg">
                      {user.location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-lg">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Joined
                    </h3>
                    <p className="mt-1 text-lg">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
