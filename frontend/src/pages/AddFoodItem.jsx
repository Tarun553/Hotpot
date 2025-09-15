import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
const categories = [
    "select Category",
    "snacks",
    "main course",
    "pizza",
    "burger",
    "sandwich",
    "desserts",
    "beverages",
    "fast food",
    "north indian",
    "south indian",
    "chinese",
    "italian",
    "others",
];

const AddFoodItem = ({ onSuccess }) => {
    const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "select Category",
    type: "veg",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // TODO: Replace with your API call
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("foodType", form.type);
      if (imageFile) formData.append("image", imageFile);
      const result = await axios.post(`${serverUrl}/api/items/add-item`, formData, { withCredentials: true });
      console.log(result);
      dispatch(setMyShopData(result.data));
    
      if (onSuccess) onSuccess(form);
    } catch (err) {
      setError("Failed to add food item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-orange-50">
      <Card className="w-full max-w-md p-8 rounded-xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <FaUtensils className="text-5xl text-orange-600 mb-2" />
          <h2 className="text-2xl font-bold mb-1">Add Food</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter Food Name"
              required
            />
          </div>
          <div>
            <Label htmlFor="image">Food Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Food Preview"
                className="w-full h-40 object-cover rounded mt-2"
              />
            )}
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Select Category</Label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="type">Select Food Type</Label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
              required
            >
              <option value="veg">veg</option>
              <option value="non-veg">non-veg</option>
            </select>
          </div>
          {error && (
            <div className="text-center text-red-600 text-sm font-medium py-1">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 mt-4"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddFoodItem;
