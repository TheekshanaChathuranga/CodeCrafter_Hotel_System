// import React, { useState } from "react";
// import { useAuth } from "../context/UserAuthContext";
// import ProfileEditModal from "../components/ProfileEditModal";
// import * as userApi from "../api/user";

// const Profile = () => {
//   const { user, login } = useAuth();
//   const [editOpen, setEditOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [profile, setProfile] = useState(user);

//   const handleEdit = () => setEditOpen(true);
//   const handleClose = () => setEditOpen(false);

//   const handleSave = async (formData) => {
//     setLoading(true);
//     setError("");
//     try {
//       const token = localStorage.getItem("token");
//       // Only send allowed fields
//       const data = {
//         username: formData.username,
//         fullName: formData.fullName,
//       };
//       if (formData.profilePicture) {
//         data.profilePicture = formData.profilePicture;
//       }
//       const updated = await userApi.updateUser(user._id, data, token);
//       setProfile(updated);
//       await login({ email: updated.email, password: undefined }); // refresh context
//       setEditOpen(false);
//     } catch (e) {
//       setError(e.message || "Update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper to get correct image URL
//   const getProfileImage = (imgPath) => {
//     if (!imgPath || imgPath === "/img/default-profile.png") return "/img/default-profile.png";
//     if (imgPath.startsWith("/uploads/")) {
//       return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`.replace(/\/api$/, '') + imgPath;
//     }
//     return imgPath;
//   };

//   if (!user) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-pulse text-gray-500">Loading profile...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto">
//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           {/* Profile Header */}
//           <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-8 text-white">
//             <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
//               <div className="relative">
//                 <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
//                   <img
//                     src={getProfileImage(profile.profilePicture)}
//                     alt="Profile"
//                     className="object-cover w-full h-full"
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = "/img/default-profile.png";
//                     }}
//                   />
//                 </div>
//                 <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
//                   <div className="bg-green-500 rounded-full w-6 h-6"></div>
//                 </div>
//               </div>
//               <div className="text-center sm:text-left">
//                 <h1 className="text-2xl sm:text-3xl font-bold">
//                   {profile.username || "No Name"}
//                 </h1>
//                 <p className="text-blue-100">{profile.email}</p>
//                 <p className="text-blue-100 mt-1 capitalize font-semibold">{profile.role}</p>
//               </div>
//             </div>
//           </div>

//           {/* Profile Details */}
//           <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
//                 <p className="mt-1 text-lg font-semibold">
//                   {profile.fullName || "Not provided"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">
//                   Joined Date
//                 </h3>
//                 <p className="mt-1 text-lg font-semibold">
//                   {new Date(profile.createdAt).toLocaleDateString() || "Unknown"}
//                 </p>
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Location</h3>
//                 <p className="mt-1 text-lg font-semibold">
//                   {profile.location || "Not specified"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-sm font-medium text-gray-500">Website</h3>
//                 <p className="mt-1 text-lg font-semibold text-blue-600 hover:text-blue-800">
//                   {profile.website ? (
//                     <a
//                       href={profile.website}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       {profile.website}
//                     </a>
//                   ) : (
//                     "Not provided"
//                   )}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
//             <div className="flex justify-around">
//               <div className="text-center">
//                 <p className="text-sm font-medium text-gray-500">Posts</p>
//                 <p className="text-xl font-bold">42</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-sm font-medium text-gray-500">Following</p>
//                 <p className="text-xl font-bold">128</p>
//               </div>
//               <div className="text-center">
//                 <p className="text-sm font-medium text-gray-500">Followers</p>
//                 <p className="text-xl font-bold">256</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Edit Profile Button */}
//         <div className="mt-6 flex justify-end">
//           <button
//             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition duration-150 ease-in-out"
//             onClick={handleEdit}
//             disabled={loading}
//           >
//             Edit Profile
//           </button>
//         </div>
//         {editOpen && (
//           <ProfileEditModal
//             user={profile}
//             open={editOpen}
//             onClose={handleClose}
//             onSave={handleSave}
//           />
//         )}
//         {error && <div className="text-red-500 mt-4">{error}</div>}
//       </div>
//     </div>
//   );
// };

// export default Profile;

// import React, { useState, useEffect, useRef } from "react";
// import { useAuth } from "../context/UserAuthContext";
// import { toast } from "react-toastify";
// import axios from "axios";

// const Profile = () => {
//   const { user, updateUser } = useAuth();
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     username: "",
//     fullName: "",
//     bio: "",
//     location: "",
//     phone: ""
//   });
//   const [profileImage, setProfileImage] = useState(null);
//   const [previewImage, setPreviewImage] = useState("");
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         username: user.username || "",
//         fullName: user.fullName || "",
//         bio: user.bio || "",
//         location: user.location || "",
//         phone: user.phone || ""
//       });
//       setPreviewImage(user.profilePicture || "/img/default-profile.png");
//     }
//   }, [user]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setProfileImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       let imageUrl = user.profilePicture || "";

//       // Upload image if changed
//       if (profileImage) {
//         const imageForm = new FormData();
//         imageForm.append("profileImage", profileImage);
//         const uploadRes = await axios.post(
//           "/api/users/upload-profile-image",
//           imageForm,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//               Authorization: `Bearer ${localStorage.getItem("token")}`
//             }
//           }
//         );
//         imageUrl = uploadRes.data.imageUrl;
//       }

//       const updatedUser = {
//         ...formData,
//         profilePicture: imageUrl
//       };

//       await updateUser(updatedUser);
//       toast.success("Profile updated successfully!");
//       setIsEditing(false);
//     } catch (error) {
//       console.error("Update failed:", error);
//       toast.error("Failed to update profile. Try again.");
//     }
//   };

//   if (!user) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-gray-500 animate-pulse">Loading profile...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-8 px-4">
//       <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
//         {/* Header */}
//         <div className="relative">
//           <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600" />
//           <div className="px-6 pb-6 -mt-16 sm:-mt-20">
//             <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
//               {/* Profile Image */}
//               <div className="relative group">
//                 <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-md">
//                   <img
//                     src={previewImage}
//                     alt="Profile"
//                     className="object-cover w-full h-full"
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = "/img/default-profile.png";
//                     }}
//                   />
//                 </div>
//                 {isEditing && (
//                   <>
//                     <button
//                       onClick={triggerFileInput}
//                       className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-8 w-8 text-white"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path d="M3 9a2 2 0 012-2h1l1-1.5A2 2 0 0110 4h4a2 2 0 011.7.9L17 7h1a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                         <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                     </button>
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleImageChange}
//                       accept="image/*"
//                       className="hidden"
//                     />
//                   </>
//                 )}
//               </div>

//               {/* User Info */}
//               <div className="flex-1">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     {isEditing ? (
//                       <input
//                         type="text"
//                         name="username"
//                         value={formData.username}
//                         onChange={handleInputChange}
//                         className="text-2xl sm:text-3xl font-bold bg-gray-100 rounded px-2 py-1 w-full"
//                       />
//                     ) : (
//                       <h1 className="text-2xl sm:text-3xl font-bold">
//                         {user.username}
//                       </h1>
//                     )}
//                     <p className="text-gray-600 mt-1">{user.email}</p>
//                   </div>
//                   <button
//                     onClick={() => setIsEditing(!isEditing)}
//                     className={`px-4 py-2 rounded-lg font-medium ${
//                       isEditing
//                         ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
//                         : "bg-blue-600 text-white hover:bg-blue-700"
//                     }`}
//                   >
//                     {isEditing ? "Cancel" : "Edit Profile"}
//                   </button>
//                 </div>
//                 {isEditing ? (
//                   <textarea
//                     name="bio"
//                     value={formData.bio}
//                     onChange={handleInputChange}
//                     placeholder="Tell us about yourself..."
//                     className="mt-2 w-full bg-gray-100 rounded px-2 py-1"
//                     rows="2"
//                   />
//                 ) : (
//                   <p className="mt-2 text-gray-700">
//                     {user.bio || "No bio yet"}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Details Section */}
//         <div className="px-6 py-6 border-t border-gray-200">
//           {isEditing ? (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       name="fullName"
//                       value={formData.fullName}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Location
//                     </label>
//                     <input
//                       type="text"
//                       name="location"
//                       value={formData.location}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Phone
//                     </label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleInputChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsEditing(false)}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg"
//                 >
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
//                   <p className="mt-1 text-lg">{user.fullName || "Not provided"}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Joined Date</h3>
//                   <p className="mt-1 text-lg">
//                     {new Date(user.createdAt).toLocaleDateString("en-US", {
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric"
//                     })}
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Location</h3>
//                   <p className="mt-1 text-lg">{user.location || "Not specified"}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Phone</h3>
//                   <p className="mt-1 text-lg">{user.phone || "Not provided"}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500">Role</h3>
//                   <p className="mt-1 text-lg capitalize">{user.role}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;

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
    phone: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        fullName: user.fullName || "",
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || ""
      });
      setPreviewImage(user.profilePicture || "/img/default-profile.png");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = user.profilePicture || "";

      if (profileImage) {
        const imageForm = new FormData();
        imageForm.append("profileImage", profileImage);
        const uploadRes = await axios.post(
          "/api/users/upload-profile-image",
          imageForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        imageUrl = uploadRes.data.imageUrl;
      }

      const updatedUser = {
        ...formData,
        profilePicture: imageUrl
      };

      await updateUser(updatedUser);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile. Try again.");
    }
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
                src={previewImage}
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
                  <p className="text-gray-700 mt-1">{user.bio || "No bio yet"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-lg">{user.fullName || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1 text-lg">{user.location || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="mt-1 text-lg">{user.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Joined</h3>
                    <p className="mt-1 text-lg">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
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
