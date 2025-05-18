import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePrescriptionStore } from "../../store/usePrescriptionStore";
import { usePharmacyStore } from "../../store/usePharmacyStore";
import { toast } from "react-hot-toast";

function PrescriptionForm() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { createPrescription, isCreatingPrescription } = usePrescriptionStore();
  const { getOfferedMedicines, offeredMedicines, isOfferedMedicinesLoading } = usePharmacyStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<any>([]);
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

    setSelectedMedicines(prev => [
      ...prev,
      {
        _id: medicine._id,
        name: medicine.name,
        description: medicine.description,
        quantity: ""
      }
    ]);
  };

  const removeMedicineFromCart = (index) => {
    setSelectedMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, value) => {
    setSelectedMedicines(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: value } : item
    ));
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

    if (selectedMedicines.some(med => !med.quantity || isNaN(med.quantity) || med.quantity <= 0)) {
      toast.error("Please enter valid quantities for all medicines");
      return;
    }

    try {
      await createPrescription(appointmentId, {
        items: selectedMedicines.map(med => ({
          medicineId: med._id,
          quantity: Number(med.quantity)
        })),
        expiryDate
      });
      navigate(`/appointments/${appointmentId}`);
    } catch (error) {
      console.error("Error creating prescription:", error);
    }
  };

  return (
    <div className="flex flex-col mx-5 mb-5 overflow-y-auto" style={{ zoom: "133%" }}>
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

            {searchTerm && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 max-h-60 overflow-y-auto">
                {filteredMedicines.length > 0 ? (
                  <>
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
                            Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-center text-gray-500">
                    {isOfferedMedicinesLoading ? "Loading..." : "No prescription-required medicines found"}
                  </p>
                )}
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
                <div key={`${medicine._id}-${index}`} className="bg-gray-50 p-4 rounded-lg mb-4 relative border border-gray-200">
                  <button
                    type="button"
                    onClick={() => removeMedicineFromCart(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    aria-label="Remove medicine"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <div className="mb-3">
                    <h3 className="font-medium text-gray-800">{medicine.name}</h3>
                    {medicine.description && (
                      <p className="text-sm text-gray-600">{medicine.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                    <input
                      type="number"
                      value={medicine.quantity}
                      onChange={(e) => handleMedicineChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 30"
                      min="1"
                      required
                    />
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
              {isCreatingPrescription ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : "Save Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PrescriptionForm;