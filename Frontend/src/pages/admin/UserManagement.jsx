import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { useSnackbar } from "notistack";

const API_URL = import.meta.env.VITE_API_URL;

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
  const [usersPerPage, setUsersPerPage] = useState(9); // Make this configurable
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    status: "active",
    notice: "",
  });
  const [editingUser, setEditingUser] = useState(null);

  const handleSaveUser = async () => {
    if (
      !newUser.username ||
      !newUser.email ||
      (!editingUser && !newUser.password)
    ) {
      enqueueSnackbar("Username, email and password are required", {
        variant: "warning",
      });
      return;
    }
    try {
      setLoading(true);
      if (editingUser) {
        const payload = { ...newUser };
        if (!payload.password) delete payload.password;
        // Include notice in payload
        await axios.put(`${API_URL}/manage/users/${editingUser._id}`, payload);
        enqueueSnackbar("User updated successfully", { variant: "success" });
      } else {
        await axios.post(`${API_URL}/manage/users`, newUser);
        enqueueSnackbar("User created successfully", { variant: "success" });
      }
      setAddDialogOpen(false);
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "user",
        status: "active",
        notice: "",
      });
      setEditingUser(null);
      fetchUsers(currentPage);
    } catch (err) {
      console.error("Save user error:", err);
      const msg =
        err.response?.data?.message || err.message || "Failed to save user";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      password: "", // don't prefill password
      role: user.role || "user",
      status: user.status || "active",
      notice: user.notice || "",
    });
    setAddDialogOpen(true);
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/manage/users`, {
        params: {
          page,
          limit: usersPerPage,
          search,
          role: roleFilter || undefined, // Only send role if it's set
        },
      });

      setUsers(res.data.users || []);
      setTotalUsers(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching users:", err);
      enqueueSnackbar("Failed to fetch users", { variant: "error" });
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
      await axios.delete(`${API_URL}/manage/users/${userToDelete._id}`);

      // If we're on the last page with only one user, go to previous page
      if (users.length === 1 && currentPage > 1) {
        fetchUsers(currentPage - 1);
      } else {
        fetchUsers(currentPage);
      }

      enqueueSnackbar("User deleted successfully", { variant: "success" });
    } catch (err) {
      console.error("Delete error details:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete user";
      enqueueSnackbar(errorMessage, { variant: "error" });
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
  }, [search, roleFilter, usersPerPage]); // Add usersPerPage to dependencies

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = Math.min(startIndex + usersPerPage, totalUsers);

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          Showing {startIndex + 1} to {endIndex} of {totalUsers} results
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                disabled={loading}
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              disabled={loading}
              className={`px-3 py-2 text-sm font-medium ${
                currentPage === number
                  ? "bg-[#16A085] text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                disabled={loading}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Generate page numbers for pagination - REMOVED, now using renderPagination function

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label
              htmlFor="usersPerPage"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Show:
            </label>
            <select
              id="usersPerPage"
              value={usersPerPage}
              onChange={(e) => setUsersPerPage(Number(e.target.value))}
              className="px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            >
              <option value={5}>5</option>
              <option value={9}>9</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
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
          <button
            onClick={() => setAddDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75]"
          >
            <Plus className="w-4 h-4" />
            Add Users
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
          {search || roleFilter
            ? "No matching users found"
            : "No users available"}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700">
            <div className="col-span-3 md:col-span-3">Username</div>
            <div className="col-span-3 md:col-span-3">Email</div>
            <div className="col-span-1 md:col-span-1">Role</div>
            <div className="col-span-2 md:col-span-2">Status</div>
            <div className="col-span-2 md:col-span-2">Notice</div>
            <div className="col-span-1 md:col-span-1 text-right">Actions</div>
          </div>

          {users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-12 p-4 border-t hover:bg-gray-50 items-center"
            >
              <div className="col-span-3 md:col-span-3 font-medium text-gray-800 truncate">
                {user.username}
              </div>
              <div className="col-span-3 md:col-span-3 text-gray-600 truncate">
                {user.email}
              </div>
              <div className="col-span-1 md:col-span-1">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "editor"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="col-span-2 md:col-span-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <div className="col-span-2 md:col-span-2 text-gray-600 truncate">
                {user.notice || "—"}
              </div>
              <div className="col-span-1 md:col-span-1 flex justify-end gap-2">
                <button
                  onClick={() => openEditDialog(user)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Edit user"
                >
                  <Pencil className="w-5 h-5" />
                </button>
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
      {renderPagination()}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {userToDelete?.username}'s account?
            This action cannot be undone.
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

      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingUser ? "Edit User" : "Add Users"}</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <input
              type="text"
              placeholder="Username"
              autoComplete="off"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            />
            <input
              type="email"
              placeholder="Email"
              autoComplete="off"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            >
              <option value="user">User</option>
              <option value="receptionist">Receptionist</option>
            </select>
            <select
              value={newUser.status}
              onChange={(e) =>
                setNewUser({ ...newUser, status: e.target.value })
              }
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Optional notice field, shown when status is inactive */}
            {newUser.status === "inactive" && (
              <input
                type="text"
                placeholder="Inactive notice (optional)"
                autoComplete="off"
                value={newUser.notice}
                onChange={(e) =>
                  setNewUser({ ...newUser, notice: e.target.value })
                }
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
              />
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;
