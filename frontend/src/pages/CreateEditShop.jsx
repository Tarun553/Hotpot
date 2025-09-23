import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaUtensils } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/axios";
const CreateEditShop = ({ shopData, onSuccess }) => {
  const navigate = useNavigate();
    const dispatch = useDispatch();
  // Get city, state, address from Redux
  const reduxCity = useSelector((state) => state.user.city);
  const reduxState = useSelector((state) => state.user.currentState);
  const reduxAddress = useSelector((state) => state.user.currentAddress);

  const [form, setForm] = useState({
    name: shopData?.name || "",
    city: shopData?.city || reduxCity || "",
    state: shopData?.state || reduxState || "",
    address: shopData?.address || reduxAddress || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(shopData?.image || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Autofill city/state/address if Redux changes and form is empty
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      city: shopData?.city || reduxCity || "",
      state: shopData?.state || reduxState || "",
      address: shopData?.address || reduxAddress || "",
    }));
    // eslint-disable-next-line
  }, [reduxCity, reduxState, reduxAddress]);

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
      formData.append("city", form.city);
      formData.append("state", form.state);
      formData.append("address", form.address);
      if (imageFile) formData.append("image", imageFile);
      // Add phone if needed
      // formData.append("phone", form.phone);
      const res = await apiClient.post('/api/shop/create-edit', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(setMyShopData(res.data.shop));
      console.log(res.data.shop);
      toast.success("Shop saved successfully!");
      navigate("/");
      if (onSuccess) onSuccess(res.data.shop);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-orange-50">
      <Card className="w-full max-w-md p-8 rounded-xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <FaUtensils className="text-5xl text-orange-600 mb-2" />
          <h2 className="text-2xl font-bold mb-1">Edit Shop</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="image">Shop Image</Label>
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
                alt="Shop Preview"
                className="w-full h-48 object-cover rounded mt-2"
              />
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
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

export default CreateEditShop;