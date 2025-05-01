import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from "@mui/material";
import { useSnackbar } from 'notistack';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(Array.isArray(res?.data) ? res.data : []);
      enqueueSnackbar('Users loaded successfully', { variant: 'success' });
    } catch (err) {
      console.error("Error fetching users:", err);
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/users/${userToDelete._id}`);
      setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch (err) {
      console.error("Delete error details:", {
        error: err,
        response: err.response,
        request: err.request
      });
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Failed to delete user";
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const username = user.username || '';
    const email = user.email || '';
    const role = user.role || '';
    const searchTerm = search.toLowerCase();
    
    return (
      username.toLowerCase().includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm) ||
      role.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
      />

      {loading && !users.length ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          Loading users...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {search ? "No matching users found" : "No users available"}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user._id} className="p-4 border rounded-lg hover:shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-[#16A085]">{user.role}</p>
                </div>
                <button
                  onClick={() => confirmDelete(user)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Delete {userToDelete?.username}'s account? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={deleteUser}
            color="error"
            disabled={loading}
            autoFocus
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Wrap your component with SnackbarProvider when using it
export default UserManagement;