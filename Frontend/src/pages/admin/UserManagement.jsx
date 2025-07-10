import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(9); // Should match your default backend limit
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/users`, {
        params: {
          page,
          limit: usersPerPage,
          search,
          role: roleFilter || undefined // Only send role if it's set
        }
      });
      
      setUsers(res.data.users || []);
      setTotalUsers(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching users:", err);
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
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
      
      // If we're on the last page with only one user, go to previous page
      if (users.length === 1 && currentPage > 1) {
        fetchUsers(currentPage - 1);
      } else {
        fetchUsers(currentPage);
      }
      
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    } catch (err) {
      console.error("Delete error details:", err);
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
    // Debounce search to prevent too many requests
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, roleFilter]); // Refetch when search or role filter changes

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = currentPage - half;
      let end = currentPage + half;
      
      if (start < 1) {
        start = 1;
        end = maxVisiblePages;
      }
      
      if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            />
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>
          <button
            onClick={() => fetchUsers(1)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && !users.length ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <RefreshCw className="w-8 h-8 mb-4 animate-spin text-[#16A085]" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {search || roleFilter ? "No matching users found" : "No users available"}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-4 md:col-span-3">Username</div>
            <div className="col-span-5 md:col-span-4">Email</div>
            <div className="col-span-2 md:col-span-3">Role</div>
            <div className="col-span-1 md:col-span-2 text-right">Actions</div>
          </div>
          
          {users.map(user => (
            <div key={user._id} className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center">
              <div className="col-span-4 md:col-span-3 font-medium text-gray-800 truncate">
                {user.username}
              </div>
              <div className="col-span-5 md:col-span-4 text-gray-600 truncate">
                {user.email}
              </div>
              <div className="col-span-2 md:col-span-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : user.role === 'editor'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end">
                <button
                  onClick={() => confirmDelete(user)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                  title="Delete user"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => fetchUsers(1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              title="First Page"
            >
              «
            </button>
            <button
              onClick={() => fetchUsers(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {getPageNumbers().map((number) => (
              <button
                key={number}
                onClick={() => fetchUsers(number)}
                disabled={loading}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === number 
                    ? 'bg-[#16A085] text-white border-[#16A085]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => fetchUsers(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => fetchUsers(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50"
              title="Last Page"
            >
              »
            </button>
          </nav>
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
            Are you sure you want to delete {userToDelete?.username}'s account? This action cannot be undone.
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
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;