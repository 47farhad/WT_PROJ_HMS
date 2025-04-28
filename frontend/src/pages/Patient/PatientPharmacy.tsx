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
      const { data } = await axiosInstance.get("/medicines");
      setMedicines(data);
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
    <div className="min-h-screen w-full p-6" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)" }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#243954] mb-8">Pharmacy</h1>
        <input
          type="text"
          placeholder="Search medicines..."
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <div className="text-center py-8">Loading medicines...</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-[#243954] text-white">
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Brand</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Stock</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
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
                  <tr key={medicine._id} className="border-b hover:bg-blue-50">
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