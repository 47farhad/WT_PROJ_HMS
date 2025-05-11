import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

interface Props {
    id: string;
    name: string;
    description: string;
    price: number;
    dosage: number;
    requiresPrescription: boolean;
    picture: string;
}

function PatientMedicineCard({
    id,
    name,
    description,
    price,
    dosage,
    requiresPrescription,
    picture,
}: Props) {

    const { addToCart } = useCartStore();

    const handleAddToCart = () => {
        addToCart(id)
        toast.success("Added to cart")
    }

    return (
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Medicine Image */}
            <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                {picture ? (
                    <img
                        src={picture}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center text-gray-400 p-4">
                        <svg
                            className="w-12 h-12 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-sm text-center">No medicine image available</span>
                    </div>
                )}
            </div>

            {/* Medicine Details */}
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                    <p className="text-lg font-bold text-blue-600">${price.toFixed(2)}</p>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <p className="text-xs text-gray-500">Dosage</p>
                        <p className="text-sm font-medium">{dosage}mg</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Prescription</p>
                        <p className={`text-sm font-medium ${requiresPrescription ? 'text-red-500' : 'text-green-500'}`}>
                            {requiresPrescription ? (
                                <span className="inline-flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    Required
                                </span>
                            ) : (
                                <span className="inline-flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Not Required
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Add to Cart Button */}
            <div className="px-4 pb-4">
                <button
                    onClick={handleAddToCart}
                    disabled={requiresPrescription}
                    className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${requiresPrescription
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        } transition-colors`}
                >
                    <>
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        {requiresPrescription ? 'Need Prescription' : 'Add to Cart'}
                    </>
                </button>
            </div>
        </div>
    );
}

export default PatientMedicineCard;