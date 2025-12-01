import React, { useState, useEffect } from "react";
import countiesData from "../data/counties.json";

export default function LocationSelector({ value, onChange, required = false }) {
  const [selectedCounty, setSelectedCounty] = useState(value?.county || "");
  const [selectedSubcounty, setSelectedSubcounty] = useState(value?.subcounty || "");
  const [selectedTown, setSelectedTown] = useState(value?.town || "");

  useEffect(() => {
    if (value) {
      setSelectedCounty(value.county || "");
      setSelectedSubcounty(value.subcounty || "");
      setSelectedTown(value.town || "");
    }
  }, [value]);

  const handleCountyChange = (e) => {
    const county = e.target.value;
    setSelectedCounty(county);
    setSelectedSubcounty("");
    setSelectedTown("");
    onChange({ county, subcounty: "", town: "" });
  };

  const handleSubcountyChange = (e) => {
    const subcounty = e.target.value;
    setSelectedSubcounty(subcounty);
    setSelectedTown("");
    onChange({ county: selectedCounty, subcounty, town: "" });
  };

  const handleTownChange = (e) => {
    const town = e.target.value;
    setSelectedTown(town);
    onChange({ county: selectedCounty, subcounty: selectedSubcounty, town });
  };

  const selectedCountyData = countiesData.counties.find(c => c.county === selectedCounty);
  const selectedSubcountyData = selectedCountyData?.subcounties.find(s => s.name === selectedSubcounty);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">County *</label>
        <select
          value={selectedCounty}
          onChange={handleCountyChange}
          className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
          required={required}
        >
          <option value="">Select County</option>
          {countiesData.counties.map(county => (
            <option key={county.county} value={county.county}>{county.county}</option>
          ))}
        </select>
      </div>

      {selectedCounty && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subcounty *</label>
          <select
            value={selectedSubcounty}
            onChange={handleSubcountyChange}
            className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
            required={required && selectedCounty}
          >
            <option value="">Select Subcounty</option>
            {selectedCountyData?.subcounties.map(sub => (
              <option key={sub.name} value={sub.name}>{sub.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSubcounty && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Town *</label>
          <select
            value={selectedTown}
            onChange={handleTownChange}
            className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:border-green-500 outline-none"
            required={required && selectedSubcounty}
          >
            <option value="">Select Town</option>
            {selectedSubcountyData?.towns.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

