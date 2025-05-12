import { useState } from 'react';
import { usePharmacyStore } from '../store/usePharmacyStore';
import ConfirmationModal from './ConfirmationModal';

interface Props {
    id: string;
    name: string;
    description: string;
    price: number;
    dosage: number;
    status: 'available' | 'unavailable';
    requiresPrescription: boolean;
    stock: number;
    picture: string;
}

function AdminMedicineCard({
    id,
    name,
    description,
    price,
    dosage,
    status,
    requiresPrescription,
    stock,
    picture
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name,
        description,
        price,
        dosage,
        requiresPrescription,
        stock,
        picture
    });

    const { deleteMedicine, updateMedicine, isDeletingMedicine, isUpdatingMedicine } = usePharmacyStore();

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        showLoading: false,
        onConfirm: () => { }
    });
    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 :
                type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                    value
        }));
    };

    const handleCancel = () => {
        setFormData({ name, description, price, dosage, requiresPrescription, stock, picture });
        setIsEditing(false);
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                setPreviewUrl(imageUrl);
                setFormData(prev => ({
                    ...prev,
                    picture: imageUrl
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const showSaveConfirmation = async () => {
        setModalConfig({
            isOpen: true,
            title: 'Confirm Changes',
            message: 'Are you sure you want to save these changes?',
            showLoading: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, showLoading: true }));
                await updateMedicine(id, formData);
                setIsEditing(false);
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const showDeleteConfirmation = async () => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Medicine',
            message: 'Are you sure you want to permanently delete this medicine?',
            showLoading: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, showLoading: true }));
                await deleteMedicine(id)
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const showActivationConfirmation = async () => {
        setModalConfig({
            isOpen: true,
            title: `${status === 'available' ? 'Hold' : 'Activate'} Medicine`,
            message: status === 'available'
                ? 'Are you sure you want to Hold this medicine? This will make it unavailable to the patients'
                : 'Are you sure you want to Activate this medicine? This will make it available to the patients',
            showLoading: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, showLoading: true }));
                await updateMedicine(id, { status: status === 'available' ? 'unavailable' : 'available' });
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <>
            <div className="flex flex-col h-full bg-white border border-gray-300 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {modalConfig.isOpen && (
                    <div className="absolute inset-0 bg-opacity-30 backdrop-blur-sm z-10"></div>
                )}
                {isEditing ? (
                    <div className="p-6 flex-grow">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Image</label>
                            <div className="flex items-center">
                                {(previewUrl || formData.picture) && (
                                    <img
                                        src={previewUrl || formData.picture}
                                        alt="Preview"
                                        className="h-20 w-20 object-cover rounded-md mr-4"
                                    />
                                )}
                                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md text-sm font-medium text-gray-700">
                                    Change Image
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="text-xl font-semibold text-[#243954] w-full border-b border-gray-300 focus:border-[#243954] focus:outline-none mb-4"
                        />

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="text-gray-600 mb-4 w-full border-b border-gray-300 focus:border-[#243954] focus:outline-none resize-none"
                            rows={3}
                        />

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full border-b border-gray-300 focus:border-[#243954] focus:outline-none"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage (mg)</label>
                                <input
                                    type="number"
                                    name="dosage"
                                    value={formData.dosage}
                                    onChange={handleInputChange}
                                    className="w-full border-b border-gray-300 focus:border-[#243954] focus:outline-none"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className="w-full border-b border-gray-300 focus:border-[#243954] focus:outline-none"
                                    min="0"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="requiresPrescription"
                                    checked={formData.requiresPrescription}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-[#243954] focus:ring-[#243954] border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Requires Prescription
                                </label>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-5 pb-2 flex-grow">
                        {(
                            <div className="mb-4 h-40 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                                {picture ? (
                                    <img
                                        src={picture}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-12 w-12"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span className="mt-2 text-sm">No image available</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-semibold text-[#243954]">{name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {status}
                            </span>
                        </div>

                        <p className="text-gray-600 mb-4">{description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Price</p>
                                <p className="font-semibold text-lg text-[#243954]">${price.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Dosage</p>
                                <p className="font-semibold text-lg text-[#243954]">{dosage}mg</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Stock</p>
                                <p className="font-semibold text-lg text-[#243954]">{stock}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Prescription</p>
                                <p className="font-semibold text-lg text-[#243954]">
                                    {requiresPrescription ? 'Required' : 'Not Required'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 pt-0">
                    {isEditing ? (
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showSaveConfirmation}
                                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 py-2 bg-[#243954] text-white rounded-lg hover:bg-[#1a2c42] transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                className="flex-1 py-2 bg-[#243954] text-white rounded-lg hover:bg-[#1a2c42] transition-colors"
                                onClick={showActivationConfirmation}
                            >
                                {status === 'available' ? 'Hold' : 'Activate'}
                            </button>
                            <button className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                onClick={showDeleteConfirmation}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onConfirm={modalConfig.onConfirm}
                onCancel={closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                showLoading={modalConfig.showLoading}
            />
        </>
    );
}

export default AdminMedicineCard;