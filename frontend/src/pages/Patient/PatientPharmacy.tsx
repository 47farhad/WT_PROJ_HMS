import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/axios";

interface Medicine {
  _id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  description: string;
}

const PatientPharmacy: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      // Dummy data for medicines
      const dummyData: Medicine[] = [
        {
          _id: "1",
          name: "Paracetamol",
          brand: "PharmaCorp",
          price: 5.99,
          stock: 50,
          description: "Used to treat pain and fever.",
        },
        {
          _id: "2",
          name: "Ibuprofen",
          brand: "HealthPlus",
          price: 8.49,
          stock: 30,
          description: "Anti-inflammatory medication for pain relief.",
        },
        {
          _id: "3",
          name: "Amoxicillin",
          brand: "MediCare",
          price: 12.99,
          stock: 20,
          description: "Antibiotic used to treat bacterial infections.",
        },
        {
          _id: "4",
          name: "Cetirizine",
          brand: "AllerEase",
          price: 4.99,
          stock: 100,
          description: "Antihistamine for allergy relief.",
        },
        {
          _id: "5",
          name: "Metformin",
          brand: "DiabeCare",
          price: 15.99,
          stock: 40,
          description: "Used to treat type 2 diabetes.",
        },
        {
          _id: "6",
          name: "Aspirin",
          brand: "PainAway",
          price: 6.49,
          stock: 60,
          description: "Used to reduce pain, fever, or inflammation.",
        },
        {
          _id: "7",
          name: "Omeprazole",
          brand: "GastroFix",
          price: 9.99,
          stock: 25,
          description: "Used to treat acid reflux and ulcers.",
        },
        {
          _id: "8",
          name: "Losartan",
          brand: "HeartCare",
          price: 18.49,
          stock: 35,
          description: "Used to treat high blood pressure.",
        },
        {
          _id: "9",
          name: "Atorvastatin",
          brand: "CholestrolEase",
          price: 14.99,
          stock: 45,
          description: "Used to lower cholesterol levels.",
        },
        {
          _id: "10",
          name: "Salbutamol",
          brand: "BreathEasy",
          price: 7.99,
          stock: 15,
          description: "Used to treat asthma and breathing disorders.",
        },
      ];
      setMedicines(dummyData);
    } catch (err) {
      setError("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = (medicine: Medicine) => {
    // Implement order logic or open order modal here
    alert(`Order placed for ${medicine.name}`);
  };

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#243954] mb-4">Pharmacy</h1>
        <input
          type="text"
          placeholder="Search medicines..."
          className="w-1/5 mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <div className="text-center py-8">Loading medicines...</div>
        ) : null}

        <div className="overflow-y-auto max-h-98 rounded-xl shadow-lg border border-gray-300">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-[#243954] text-white">
              <tr className="bg-[#243954] text-white ">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-center font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading medicines...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No medicines found.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr key={medicine._id} className="text-center border-b hover:bg-blue-50 ">
                    <td className="py-3 px-4">{medicine.name}</td>
                    <td className="py-3 px-4">{medicine.brand}</td>
                    <td className="py-3 px-4">{medicine.description}</td>
                    <td className="py-3 px-4">${medicine.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{medicine.stock > 0 ? medicine.stock : "Out of stock"}</td>
                    <td className="py-3 px-4">
                      <button
                        className="bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-[#1a2c42] disabled:opacity-50"
                        onClick={() => handleOrder(medicine)}
                        disabled={medicine.stock === 0}
                      >
                        Order
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientPharmacy;