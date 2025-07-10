import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/700.css";
import { useEffect } from "react";
import foodService from "../services/foodService";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Trash2 } from 'lucide-react';

const categories = [
  "Appetizers",
  "Main Courses",
  "Desserts",
  "Beverages",
];

export default function MenuManagement() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", unitType: "", unitPrice: "", category: categories[0] });
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', unitType: '', unitPrice: '', category: categories[0] });
  const [addSaving, setAddSaving] = useState(false);

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      unitType: item.unitType,
      unitPrice: item.unitPrice,
      category: item.category || categories[0],
    });
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditForm({ name: "", unitType: "", unitPrice: "", category: categories[0] });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/fooditems/${editItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) throw new Error("Failed to update item");
      // Update local state
      setItems((prev) => prev.map((item) => item._id === editItem._id ? { ...item, ...editForm } : item));
      closeEdit();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setAddForm({ name: '', unitType: '', unitPrice: '', category: categories[0] });
    setAddOpen(true);
  };
  const closeAdd = () => {
    setAddOpen(false);
    setAddForm({ name: '', unitType: '', unitPrice: '', category: categories[0] });
  };
  const handleAddChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };
  const saveAdd = async () => {
    setAddSaving(true);
    try {
      const response = await fetch('/api/fooditems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const newItem = await response.json();
      setItems((prev) => [...prev, newItem]);
      closeAdd();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    try {
      const response = await fetch(`/api/fooditems/${item._id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      setItems((prev) => prev.filter((i) => i._id !== item._id));
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    setLoading(true);
    foodService.getAllFoodItems()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Only show items matching the selected category
  const filteredItems = items.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center py-10 px-4 font-['Public_Sans',sans-serif]">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-[32px] font-bold text-[#141414] leading-tight tracking-tight">Menu Management</h1>
          <p className="text-[#737373] text-[14px] mt-1 font-normal">Manage your menu items and pricing</p>
        </div>

        {/* Category Tabs (UI only for now) */}
        <div className="flex gap-3 mt-8 mb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-7 py-2 rounded-lg font-bold text-[14px] transition-colors border-b-4 focus:outline-none ${
                selectedCategory === cat
                  ? "border-[#141414] text-[#141414] bg-[#F5F5F5]"
                  : "border-transparent text-[#737373] hover:text-[#141414] hover:bg-[#F5F5F5]"
              }`}
              style={{ fontFamily: 'Public Sans, sans-serif' }}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Section Title */}
        <div className="mt-8 mb-2">
          <h2 className="text-[18px] font-bold text-[#141414]">{selectedCategory}</h2>
        </div>

        {/* Menu Table */}
        <Card className="mb-6 shadow-sm rounded-xl border border-[#DBDBDB] bg-[#FAFAFA]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-[#737373]">Loading menu items...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2 text-[#141414] font-medium text-[14px]">Item</TableHead>
                    <TableHead className="w-1/4 text-[#141414] font-medium text-[14px]">Unit Type</TableHead>
                    <TableHead className="w-1/4 text-[#141414] font-medium text-[14px]">Price</TableHead>
                    <TableHead className="w-1/4 text-[#737373] font-medium text-[14px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item._id} className="border-b border-[#E5E8EB] last:border-0">
                      <TableCell className="text-[#141414] font-normal text-[14px]">{item.name}</TableCell>
                      <TableCell className="text-[#737373] font-normal text-[14px]">{item.unitType}</TableCell>
                      <TableCell className="text-[#737373] font-normal text-[14px]">LKR {item.unitPrice}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          {/* Edit Dialog */}
                          <Dialog open={editItem?._id === item._id} onOpenChange={(open) => !open && closeEdit()}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-[#E5E8EB] text-[#737373] font-bold px-4 py-2 rounded-lg" onClick={() => openEdit(item)}>Edit</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Menu Item</DialogTitle>
                              </DialogHeader>
                              <div className="flex flex-col gap-4 py-2">
                                <div>
                                  <Label>Name</Label>
                                  <Input value={editForm.name} onChange={e => handleEditChange("name", e.target.value)} />
                                </div>
                                <div>
                                  <Label>Unit Type</Label>
                                  <Input value={editForm.unitType} onChange={e => handleEditChange("unitType", e.target.value)} />
                                </div>
                                <div>
                                  <Label>Unit Price</Label>
                                  <Input type="number" value={editForm.unitPrice} onChange={e => handleEditChange("unitPrice", e.target.value)} />
                                </div>
                                <div>
                                  <Label>Category</Label>
                                  <Select value={editForm.category} onValueChange={val => handleEditChange("category", val)}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={saveEdit} disabled={saving} className="bg-[#000] text-[#FAFAFA] px-6 py-2 rounded-lg font-bold text-[14px] shadow-md hover:bg-[#222] transition-colors">
                                  {saving ? "Saving..." : "Save"}
                                </Button>
                                <Button variant="outline" onClick={closeEdit} disabled={saving}>Cancel</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {/* Delete Button */}
                          <Button variant="outline" size="sm" className="border-[#E5E8EB] text-[#737373] px-2 py-2 rounded-lg" onClick={() => deleteItem(item)} aria-label="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add New Item Button */}
        <div className="flex justify-end">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#000] text-[#FAFAFA] px-8 py-2 rounded-lg font-bold text-[14px] shadow-md hover:bg-[#222] transition-colors" onClick={openAdd}>Add New Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
                <DialogDescription>Fill in the details and save to add a new menu item.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div>
                  <Label>Name</Label>
                  <Input value={addForm.name} onChange={e => handleAddChange('name', e.target.value)} />
                </div>
                <div>
                  <Label>Unit Type</Label>
                  <Input value={addForm.unitType} onChange={e => handleAddChange('unitType', e.target.value)} />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input type="number" value={addForm.unitPrice} onChange={e => handleAddChange('unitPrice', e.target.value)} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={addForm.category} onValueChange={val => handleAddChange('category', val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={saveAdd} disabled={addSaving} className="bg-[#000] text-[#FAFAFA] px-6 py-2 rounded-lg font-bold text-[14px] shadow-md hover:bg-[#222] transition-colors">
                  {addSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={closeAdd} disabled={addSaving}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
