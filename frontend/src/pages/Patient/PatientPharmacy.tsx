import { useEffect, useState } from "react";
import { usePharmacyStore } from "../../store/usePharmacyStore";
import PatientMedicineCard from "../../components/PatientMedicineCard";
import { useNavigate } from "react-router-dom";

// Define interfaces for our types
interface Medicine {
  _id: string;
  name: string;
  description: string;
  price: number;
  dosage: number;
  requiresPrescription: boolean;
  picture?: string;
  status?: string;
  [key: string]: any;
}

interface PharmacyStore {
  offeredMedicines: Medicine[];
  getOfferedMedicines: () => Promise<void>;
  isOfferedMedicinesLoading: boolean;
}

function PatientPharmacy() {
  const { offeredMedicines, getOfferedMedicines, isOfferedMedicinesLoading } = usePharmacyStore() as PharmacyStore;
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getOfferedMedicines();
  }, [getOfferedMedicines]);

  if (isOfferedMedicinesLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-gray-600">Loading medicines...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-88px)]">
      {/* Fixed Search Bar */}
      <div className="sticky top-0 z-10 bg-white px-5 pb-3 flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start">
          <div className="flex items-center justify-start w-70 h-10 rounded-md bg-[#F2F3F5] px-3">
            {/* Search Icon SVG */}
            <svg
              className="w-6 h-6 mr-2 text-[#87888A]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {/* Search Input */}
            <input
              className="w-full bg-transparent text-md border-none focus:outline-none placeholder-[#87888A]"
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value) }}
              placeholder="Search medicine"
            />
          </div>
        </div>

        {/* Cart Button with Badge */}
        <button
          className="relative p-2 text-[#87888A] hover:text-[#243954] transition-colors"
          onClick={() => navigate('/Cart')}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 px-5 pb-5 overflow-y-auto scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {offeredMedicines
            .filter((medicine: Medicine) =>
              medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              medicine.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((medicine: Medicine) => (
              <PatientMedicineCard
                id={medicine._id}
                key={medicine._id}
                name={medicine.name}
                description={medicine.description}
                price={medicine.price}
                dosage={medicine.dosage}
                requiresPrescription={medicine.requiresPrescription}
                picture={medicine.picture || ""}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default PatientPharmacy;