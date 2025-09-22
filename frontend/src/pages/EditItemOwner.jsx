import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { serverUrl } from "../utils/constants";

const categories = [
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

const EditItemOwner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "",
    foodType: "veg",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${serverUrl}/api/items/${id}`, { withCredentials: true });
        console.log(res.data);
        const item = res.data.item;
        setForm({
          name: item.name || "",
          price: item.price || 0,
          category: item.category || "",
          foodType: item.foodType || "veg",
          image: item.image || "",
        });
        setImagePreview(item.image || "");
      } catch (err) {
        setError("Failed to fetch item");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

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
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("foodType", form.foodType);
      if (imageFile) formData.append("image", imageFile);
      const res = await axios.put(`${serverUrl}/api/items/edit-item/${id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(-1); // Go back to dashboard
    } catch (err) {
      setError("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-orange-50">
      <Card className="w-full max-w-md p-8 rounded-xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold mb-1 text-orange-600">Edit Food Item</h2>
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
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="foodType">Select Food Type</Label>
            <select
              id="foodType"
              name="foodType"
              value={form.foodType}
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
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditItemOwner;