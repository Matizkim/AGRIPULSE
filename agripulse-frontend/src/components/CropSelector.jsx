import React, { useState, useEffect } from "react";
import cropsData from "../data/crops.json";

export default function CropSelector({ value, onChange, required = false }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedCrop, setSelectedCrop] = useState(value || "");

  useEffect(() => {
    // If value is provided, try to find its category/subcategory
    if (value && !selectedCategory) {
      for (const category of cropsData.foods) {
        for (const subcat of category.subcategories) {
          if (subcat.crops.includes(value)) {
            setSelectedCategory(category.category);
            setSelectedSubcategory(subcat.name);
            setSelectedCrop(value);
            break;
          }
        }
      }
    }
  }, [value]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubcategory("");
    setSelectedCrop("");
    onChange("");
  };

  const handleSubcategoryChange = (e) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);
    setSelectedCrop("");
    onChange("");
  };

  const handleCropChange = (e) => {
    const crop = e.target.value;
    setSelectedCrop(crop);
    onChange(crop);
  };

  const selectedCategoryData = cropsData.foods.find(c => c.category === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(s => s.name === selectedSubcategory);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
          required={required}
        >
          <option value="">Select Category</option>
          {cropsData.foods.map(cat => (
            <option key={cat.category} value={cat.category}>{cat.category}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subcategory *</label>
          <select
            value={selectedSubcategory}
            onChange={handleSubcategoryChange}
            className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
            required={required && selectedCategory}
          >
            <option value="">Select Subcategory</option>
            {selectedCategoryData?.subcategories.map(sub => (
              <option key={sub.name} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSubcategory && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Crop *</label>
          <select
            value={selectedCrop}
            onChange={handleCropChange}
            className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
            required={required && selectedSubcategory}
          >
            <option value="">Select Crop</option>
            {selectedSubcategoryData?.crops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

