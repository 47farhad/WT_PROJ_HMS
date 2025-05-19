import { useEffect } from "react";
import { usePrescriptionStore } from "../../store/usePrescriptionStore";
import { useParams, useNavigate } from "react-router-dom";

function PrescriptionDetails() {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();
    const {
        detailedPrescription,
        getPrescriptionDetails,
        isDetailedPrescriptionLoading
    } = usePrescriptionStore();

    useEffect(() => {
        getPrescriptionDetails(prescriptionId);
    }, [getPrescriptionDetails, prescriptionId]);

    if (isDetailedPrescriptionLoading) {
        return (
            <div className="h-full w-full p-5 pt-0 flex items-center justify-center">
                <div>Loading prescription details...</div>
            </div>
        );
    }

    if (!detailedPrescription) {
        return (
            <div className="h-full w-full p-5 pt-0 flex items-center justify-center">
                <div>Prescription not found</div>
            </div>
        );
    }

    const statusColor = {
        'available': 'bg-green-100 text-green-800',
        'used': 'bg-blue-100 text-blue-800',
        'expired': 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="h-full w-full p-5 pt-0 overflow-y-auto text-base">
            <div className="w-full mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#243954]">Prescription Details</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-200 text-[#243954] rounded-md hover:bg-gray-300"
                    >
                        Back to List
                    </button>
                </div>

                {/* Prescription Summary Card */}
                <div className="bg-white rounded-xl shadow border border-gray-300 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Doctor Information */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-[#243954]">Prescribed By</h3>
                            <p className="text-gray-700">
                                Dr. {detailedPrescription.doctorDetails.firstName} {detailedPrescription.doctorDetails.lastName}
                            </p>
                        </div>

                        {/* Dates */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-[#243954]">Dates</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Issued</p>
                                    <p className="text-gray-700">
                                        {new Date(detailedPrescription.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Expires</p>
                                    <p className="text-gray-700">
                                        {new Date(detailedPrescription.expiryDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-[#243954]">Status</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[detailedPrescription.status]}`}>
                                {detailedPrescription.status}
                            </span>
                            <p className="text-sm text-gray-500">
                                {detailedPrescription.activeData.overallStatus.remainingTotal} of {detailedPrescription.activeData.overallStatus.totalPrescribed} remaining
                            </p>
                        </div>
                    </div>
                </div>

                {/* Medicines Table */}
                <div className="bg-white rounded-xl shadow border border-gray-300 overflow-hidden">
                    <table className="min-w-full table-auto bg-white text-sm">
                        <thead className="sticky top-0 bg-[#243954] text-white">
                            <tr>
                                <th className="py-3 px-4 text-left">Medicine</th>
                                <th className="py-3 px-4 text-left">Description</th>
                                <th className="py-3 px-4 text-center">Prescribed</th>
                                <th className="py-3 px-4 text-center">Used</th>
                                <th className="py-3 px-4 text-center">Remaining</th>
                                <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {detailedPrescription.items.map((item) => {
                                const medicineStatus = detailedPrescription.activeData.medicines.find(
                                    med => med.medicineId === item.medicineId.toString()
                                );
                                return (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-left">
                                            {item.medicineName || 'Unknown Medicine'}
                                        </td>
                                        <td className="py-3 px-4 text-left">
                                            {item.medicineDescription || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {item.quantity}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {medicineStatus?.orderedQuantity || 0}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {medicineStatus?.remainingQuantity || item.quantity}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${medicineStatus?.isUsedUp ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {medicineStatus?.isUsedUp ? 'Used' : 'Available'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Usage Summary */}
                <div className="bg-white rounded-xl shadow border border-gray-300 p-6">
                    <h3 className="text-lg font-semibold text-[#243954] mb-4">Usage Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Prescribed</p>
                            <p className="text-2xl font-bold text-green-600">
                                {detailedPrescription.activeData.overallStatus.totalPrescribed}
                            </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Used</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {detailedPrescription.activeData.overallStatus.totalOrdered}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Remaining</p>
                            <p className="text-2xl font-bold text-gray-600">
                                {detailedPrescription.activeData.overallStatus.remainingTotal}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrescriptionDetails;