import { useState } from 'react';
import TagInput from '../components/TagInput';
import ConfirmationModal from './ConfirmationModal';

interface Props {
    name: string;
    description: string;
    price: number;
    requirements: string[];
    status: 'available' | 'unavailable';
}

function AdminLabTestCard({ name, description, price, requirements, status }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name,
        description,
        price,
        requirements
    });

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });
    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value
        }));
    };

    const handleRequirementsChange = (tags: string[]) => {
        setFormData(prev => ({
            ...prev,
            requirements: tags
        }));
    };

    const handleSave = () => {
        //onSave?.({ ...formData, id });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({ name, description, price, requirements });
        setIsEditing(false);
    };

    const showSaveConfirmation = () => {
        setModalConfig({
            isOpen: true,
            title: 'Confirm Changes',
            message: 'Are you sure you want to save these changes?',
            onConfirm: () => {
                //onSave?.({ ...formData, id });
                setIsEditing(false);
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const showDeleteConfirmation = () => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Test',
            message: 'Are you sure you want to permanently delete this test?',
            onConfirm: () => {
                //onDelete?.();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const showActivationConfirmation = () => {
        setModalConfig({
            isOpen: true,
            title: `${status === 'available' ? 'Hold' : 'Activate'} Test`,
            message: status === 'available'
                ? 'Are you sure you want to Hold this test? This will make it unavailable to the patients'
                : 'Are you sure you want to Activate this test? This will make it available to the patients',
            onConfirm: () => {
                //onStatusChange?.();
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

                        <div className="mb-4">
                            <span className="font-semibold text-lg text-[#243954]">$</span>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="font-semibold text-lg text-[#243954] w-20 border-b border-gray-300 focus:border-[#243954] focus:outline-none"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">Requirements:</h4>
                            <TagInput
                                tags={formData.requirements}
                                onChange={handleRequirementsChange}
                                placeholder="Add requirement..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="p-5 pb-2 flex-grow">
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

                        <div className="mb-4">
                            <p className="font-semibold text-lg text-[#243954]">${price.toFixed(2)}</p>
                        </div>

                        <div className="mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">Requirements:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>
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
            />
        </>
    );
}

export default AdminLabTestCard;