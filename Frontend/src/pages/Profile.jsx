import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/UserAuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
      });
      // Always use getProfileImage for previewImage
      setPreviewImage(
        getProfileImage(user.profilePicture || "/img/default-profile.png")
      );
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
        // Use getProfileImage for preview
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        imageUrl = uploadRes.data.profilePicture;
      }

      const updatedUser = {
        ...formData,
        profilePicture: imageUrl,
      };

      const userAfterUpdate = await updateUser(updatedUser);
      setPreviewImage(
        getProfileImage(userAfterUpdate.profilePicture || "/img/default-profile.png")
      );
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile. Try again.");
    }
  };

  // Helper to get correct image URL (copied from Navbar)
  const getProfileImage = (imgPath) => {
    if (!imgPath || imgPath === "/img/default-profile.png")
      return "/img/default-profile.png";
    if (imgPath.startsWith("/uploads/")) {
      return (
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }`.replace(/\/api$/, "") + imgPath
      );
    }
    return imgPath;
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
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar - Profile Overview */}
        <div className="bg-white rounded-2xl shadow p-6 sticky top-10 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative group w-40 h-40">
              <img
                src={getProfileImage(previewImage)}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border-4 border-white shadow"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/img/default-profile.png";
                }}
              />
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
              <h1 className="text-xl font-semibold">
                {user.fullName ||
                  user.username ||
                  formData.fullName ||
                  "No Name"}
              </h1>
              <p className="text-xs text-gray-500">Full Name</p>
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      {user.fullName ||
                        user.username ||
                        formData.fullName ||
                        "Not provided"}
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