import React, { useEffect, useState } from "react";
import {
  fetchReceptionists,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
} from "../../services/receptionistService";
import { RefreshCw, Trash2, Plus, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useSnackbar } from "notistack";

const ManageReceptionists = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  // dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recToDelete, setRecToDelete] = useState(null);

  // form fields
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    employeeId: "",
    address: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.username.trim()) errs.username = "Name is required";
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[\w.%+-]+@[\w.-]+\.com$/i.test(formData.email)) {
      errs.email = "Email must be valid and end with .com";
    }
    if (!formData.employeeId.trim()) {
      errs.employeeId = "Employee ID is required";
    } else {
      const duplicate = receptionists.find(
        (r) => r.employeeId === formData.employeeId && (!editingRec || r._id !== editingRec._id)
      );
      if (duplicate) {
        errs.employeeId = "Employee ID already exists";
      }
    }

    if (!formData.address.trim()) {
      errs.address = "Address is required";
    } else if (formData.address.length < 3) {
      errs.address = "Address too short";
    }

    if (!formData.phone.trim()) {
      errs.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errs.phone = "Phone must be exactly 10 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const token = localStorage.getItem("token");

  const loadReceptionists = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetchReceptionists(
        { page, limit: perPage, search },
        token
      );
      setReceptionists(res.users || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to load receptionists", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      loadReceptionists(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openAddDialog = () => {
    setEditingRec(null);
    setFormData({
      username: "",
      email: "",
      phone: "",
      employeeId: "",
      address: "",
      isActive: true,
    });
    setFormOpen(true);
  };

  const openEditDialog = (rec) => {
    setEditingRec(rec);
    setFormData({
      username: rec.username || "",
      email: rec.email || "",
      phone: rec.phone || "",
      employeeId: rec.employeeId || "",
      address: rec.address || "",
      isActive: rec.isActive ?? true,
    });
    setFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear error for field
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const saveReceptionist = async () => {
    if (!validate()) {
      enqueueSnackbar("Please correct the highlighted errors", { variant: "warning" });
      return;
    }
    try {
      setLoading(true);
      if (editingRec) {
        await updateReceptionist(editingRec._id, formData, token);
        enqueueSnackbar("Receptionist updated", { variant: "success" });
      } else {
        const payload = { ...formData, password: "reception123" };
        await createReceptionist(payload, token);
        enqueueSnackbar("Receptionist created", { variant: "success" });
      }
      setFormOpen(false);
      loadReceptionists(currentPage);
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err.response?.data?.message || "Operation failed", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (rec) => {
    setRecToDelete(rec);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!recToDelete) return;
    try {
      setLoading(true);
      await deleteReceptionist(recToDelete._id, token);
      enqueueSnackbar("Receptionist deleted", { variant: "success" });
      // adjust page if needed
      if (receptionists.length === 1 && currentPage > 1) {
        loadReceptionists(currentPage - 1);
      } else {
        loadReceptionists(currentPage);
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Delete failed", { variant: "error" });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const pageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisible / 2);
      let start = currentPage - half;
      let end = currentPage + half;
      if (start < 1) {
        start = 1;
        end = maxVisible;
      }
      if (end > totalPages) {
        end = totalPages;
        start = totalPages - maxVisible + 1;
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manage Receptionists</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#16A085]"
            />
            <button
              onClick={() => loadReceptionists(1)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#16A085] text-white rounded-md hover:bg-[#138D75] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <button
            onClick={openAddDialog}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Add Receptionist
          </button>
        </div>
      </div>

      {/* Table */}
      {loading && !receptionists.length ? (
        <div className="flex items-center justify-center h-40">Loading...</div>
      ) : receptionists.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          {search ? "No matching receptionists" : "No receptionists available"}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold text-gray-700 text-sm">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {receptionists.map((rec) => (
            <div
              key={rec._id}
              className="grid grid-cols-12 p-4 border-t items-center hover:bg-gray-50"
            >
              <div className="col-span-3 font-medium truncate">{rec.username}</div>
              <div className="col-span-3 truncate text-gray-600">{rec.email}</div>
              <div className="col-span-2 text-gray-600">{rec.phone || "-"}</div>
              <div className="col-span-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${rec.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {rec.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => openEditDialog(rec)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(rec)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => loadReceptionists(currentPage - 1)}
            className="p-2 border rounded disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => loadReceptionists(num)}
              className={`px-3 py-1 rounded border ${
                num === currentPage ? "bg-[#16A085] text-white" : "bg-white"
              }`}
            >
              {num}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => loadReceptionists(currentPage + 1)}
            className="p-2 border rounded disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRec ? "Edit Receptionist" : "Add Receptionist"}</DialogTitle>
        <DialogContent className="flex flex-col gap-4 py-4">
          <TextField
            label="Full Name"
            name="username"
            variant="outlined"
            value={formData.username}
            onChange={handleFormChange}
            fullWidth
            required
            error={Boolean(errors.username)}
            helperText={errors.username}
          />
          <TextField
            label="Email"
            name="email"
            variant="outlined"
            value={formData.email}
            onChange={handleFormChange}
            fullWidth
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <TextField
            label="Phone"
            name="phone"
            variant="outlined"
            value={formData.phone}
            onChange={handleFormChange}
            fullWidth
            required
            error={Boolean(errors.phone)}
            helperText={errors.phone}
          />
          <TextField
            label="Employee ID"
            name="employeeId"
            variant="outlined"
            value={formData.employeeId}
            onChange={handleFormChange}
            fullWidth
            required
            error={Boolean(errors.employeeId)}
            helperText={errors.employeeId}
          />
          <TextField
            label="Address"
            name="address"
            variant="outlined"
            value={formData.address}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={2}
            required
            error={Boolean(errors.address)}
            helperText={errors.address}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="isActive"
              value={formData.isActive ? "active" : "inactive"}
              label="Status"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.value === "active",
                }))
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={saveReceptionist} variant="contained" color="primary" disabled={loading}>
            {editingRec ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Receptionist</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {recToDelete?.username}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageReceptionists; 