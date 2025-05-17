import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrescriptionStore } from "../../store/usePrescriptionStore"
import { usePharmacyStore } from "../../store/usePharmacyStore";
import { toast } from "react-hot-toast";

function PrescriptionForm() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { createPrescription, isCreatingPrescription } = usePrescriptionStore();
  const { getOfferedMedicines, offeredMedicines, isOfferedMedicinesLoading } = usePharmacyStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    getOfferedMedicines();
  }, [getOfferedMedicines]);

  const filteredMedicines = offeredMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    medicine.requiresPrescription
  );

  const addMedicineToCart = (medicine) => {
    if (selectedMedicines.some(item => item._id === medicine._id)) {
      toast.warning("This medicine is already in the prescription");
      return;
    }
    
    setSelectedMedicines([
      ...selectedMedicines,
      {
        ...medicine,
        dosage: "",
        frequency: "",
        duration: "",
        instructions: ""
      }
    ]);
  };

  const removeMedicineFromCart = (index) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines.splice(index, 1);
    setSelectedMedicines(updatedMedicines);
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index][field] = value;
    setSelectedMedicines(updatedMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMedicines.length === 0) {
        toast.error("Please add at least one medicine to the prescription");
        return;
    }
    
    if (!expiryDate) {
        toast.error("Please set an expiry date for the prescription");
        return;
    }
    
    try {
        // Correct way to call createPrescription
        await createPrescription(appointmentId, {
            items: selectedMedicines.map(med => ({
                medicineId: med._id,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                instructions: med.instructions
            })),
            expiryDate
        });
        navigate(`/appointments/${appointmentId}`);
    } catch (error) {
        console.error("Error creating prescription:", error);
        // Error toast is already handled in the store
    }
};
  return (
    <div className="flex flex-col mx-5 mb-5 overflow-y-auto" style={{zoom:"133%"}}>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-5">
        <h1 className="text-2xl font-bold text-[#243954] mb-6">Create Prescription</h1>
        
        <form onSubmit={handleSubmit}>
          {/* Medicine Selection Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#243954] mb-4 border-b pb-2">
              Select Medicines (Prescription Required Only)
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Medicines</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search for medicines..."
                />
                {isOfferedMedicinesLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </div>
            
            {searchTerm && filteredMedicines.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-60 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available Medicines</h3>
                <ul className="space-y-2">
                  {filteredMedicines.map(medicine => (
                    <li key={medicine._id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
                      <div>
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({medicine.category})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addMedicineToCart(medicine)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add to Prescription
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {searchTerm && filteredMedicines.length === 0 && !isOfferedMedicinesLoading && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center text-gray-500">
                No prescription-required medicines found matching your search.
              </div>
            )}
          </div>
          
          {/* Selected Medicines Section */}
          {selectedMedicines.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#243954] mb-4 border-b pb-2">
                Prescription Details
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescription Expiry Date*</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The date until which this prescription is valid</p>
              </div>
              
              {selectedMedicines.map((medicine, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 relative border border-gray-200">
                  <button
                    type="button"
                    onClick={() => removeMedicineFromCart(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800">{medicine.name}</h3>
                    <p className="text-sm text-gray-600">{medicine.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dosage*</label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency*</label>
                      <select
                        value={medicine.frequency}
                        onChange={(e) => handleMedicineChange(index, "frequency", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="Every 12 hours">Every 12 hours</option>
                        <option value="As needed">As needed</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration*</label>
                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                      <textarea
                        value={medicine.instructions}
                        onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="e.g., Take with food, Avoid alcohol, etc."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingPrescription || selectedMedicines.length === 0}
              className="px-6 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1e2e4a] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingPrescription ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PrescriptionForm;