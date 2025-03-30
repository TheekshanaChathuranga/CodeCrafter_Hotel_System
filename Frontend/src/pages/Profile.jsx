import { useState, useEffect } from "react";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [newPhone, setNewPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setPreviewImage(data.image || "default-profile.png"); // Default image
      });
  }, []);

  const handleUpdate = () => {
    fetch("http://localhost:5000/api/profile/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: newPhone }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setEditing(false);
      });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file)); // Preview before upload
    }
  };

  const handleImageUpload = () => {
    const formData = new FormData();
    formData.append("image", selectedImage);

    fetch("http://localhost:5000/api/profile/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile({ ...profile, image: data.image });
        setPreviewImage(data.image);
      });
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Profile Details</h2>
      <img
        src={previewImage}
        alt="Profile"
        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
      />
      <input type="file" onChange={handleImageChange} className="mb-2" />
      {selectedImage && (
        <button
          className="bg-green-500 text-white px-2 py-1 rounded"
          onClick={handleImageUpload}
        >
          Upload
        </button>
      )}
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Designation:</strong> {profile.designation}</p>
      <p>
        <strong>Phone:</strong>{" "}
        {editing ? (
          <>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="border p-1"
            />
            <button
              className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
              onClick={handleUpdate}
            >
              Save
            </button>
          </>
        ) : (
          <>
            {profile.phone}{" "}
            <button
              className="ml-2 text-blue-500 underline"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          </>
        )}
      </p>
    </div>
  );
}
