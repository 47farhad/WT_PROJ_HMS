import React from "react";

interface Medicine {
    _id: string;
    name: string;
    picture?: string;
    price: number;
    dosage: number;
    requiresPrescription: boolean;
}

interface CartItem {
    medicine: string;
    quantity: number;
}

interface CartItemCardProps {
    cartItem: CartItem;
    medicine: Medicine;
    increaseQuantity: (id: string) => void;
    decreaseQuantity: (id: string) => void;
    removeFromCart: (id: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
    cartItem,
    medicine,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
}) => {
    return (
        <div
            key={cartItem.medicine}
            className="flex items-start p-4 border border-gray-200 rounded-lg"
        >
            {/* Medicine Image */}
            <div className="w-20 h-20 bg-gray-100 rounded-md mr-4 flex-shrink-0 overflow-hidden">
                {medicine.picture ? (
                    <img
                        src={medicine.picture}
                        alt={medicine.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                            className="w-8 h-8"
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
                    </div>
                )}
            </div>

            <div className="flex-grow">
                <h3 className="font-medium text-gray-900">{medicine.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                    ${medicine.price.toFixed(2)} per item • {medicine.dosage}mg
                </p>
                {medicine.requiresPrescription && (
                    <p className="text-xs text-red-500 mb-2 flex items-center">
                        <svg
                            className="w-3 h-3 mr-1"
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
                        Requires prescription
                    </p>
                )}

                <div className="flex items-center">
                    <button
                        onClick={() => decreaseQuantity(cartItem.medicine)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md"
                        disabled={cartItem.quantity <= 1}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 12H4"
                            />
                        </svg>
                    </button>
                    <span className="mx-3 w-8 text-center">{cartItem.quantity}</span>
                    <button
                        onClick={() => increaseQuantity(cartItem.medicine)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="ml-4 flex flex-col items-end">
                <p className="font-medium">
                    ${(medicine.price * cartItem.quantity).toFixed(2)}
                </p>
                <button
                    onClick={() => removeFromCart(cartItem.medicine)}
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default CartItemCard;