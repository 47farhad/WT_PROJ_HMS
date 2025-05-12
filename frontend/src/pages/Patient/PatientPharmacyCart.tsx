import { useEffect, useState } from 'react';
import { useCartStore } from '../../store/useCartStore';
import { usePharmacyStore } from '../../store/usePharmacyStore';
import CartItemCard from '../../components/CartItemCard';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import "../../css/hideScroll.css"

function PatientPharmacyCart() {
    const {
        cartItems,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        loadCartFromStorage,
        handleOrder
    } = useCartStore();

    const { offeredMedicines, getOfferedMedicines, isOfferedMedicinesLoading } = usePharmacyStore();
    const navigate = useNavigate();
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        showLoading: false,
        onConfirm: () => { }
    });

    useEffect(() => {
        loadCartFromStorage();
        getOfferedMedicines();
    }, [loadCartFromStorage, getOfferedMedicines]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const medicine = offeredMedicines.find(m => m._id === item.medicine);
            if (!medicine) return total;
            return total + (medicine.price * item.quantity);
        }, 0);
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleCheckout = () => {
        setModalConfig({
            isOpen: true,
            title: 'Confirm Order',
            message: 'Are you sure you want to proceed with this order?',
            showLoading: false,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, showLoading: true }));
                await handleOrder(cartItems);
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                navigate('/Pharmacy');
            }
        });
    };

    if (isOfferedMedicinesLoading) {
        return (
            <div>
                Loading
            </div>
        )
    }

    return (
        <div className="w-full h-full max-h-[calc(100vh-88px)] flex justify-center">
            <div className="w-full max-w-2xl flex flex-col p-4 pt-0">
                <div className='flex flex-row items-center justify-between bg-white z-10 sticky top-0 px-1'>
                    <button
                        onClick={() => navigate('/Pharmacy')}
                        className="text-blue-600 hover:underline flex items-center justify-start"
                    >
                        ← Back to Pharmacy
                    </button>

                    <button
                        onClick={() => navigate('/Pharmacy')}
                        className="text-blue-600 hover:underline flex items-center justify-end"
                    >
                        Past Orders
                    </button>
                </div>

                {/* Scrollable Cart Items */}
                <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 scrollbar-hide">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-10">
                            <svg
                                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <p className="text-lg text-gray-600">Your cart is empty</p>
                            <p className="text-gray-500">Add medicines to get started</p>
                        </div>
                    ) : (
                        cartItems.map(cartItem => {
                            const medicine = offeredMedicines.find(m => m._id === cartItem.medicine);
                            if (!medicine) return null;

                            return (
                                <CartItemCard
                                    key={cartItem.medicine}
                                    cartItem={cartItem}
                                    medicine={medicine}
                                    increaseQuantity={increaseQuantity}
                                    decreaseQuantity={decreaseQuantity}
                                    removeFromCart={removeFromCart}
                                />
                            );
                        })
                    )}
                </div>

                {/* Fixed Footer */}
                {cartItems.length > 0 && (
                    <div className="bg-white sticky bottom-0 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>

                        <button
                            className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={modalConfig.isOpen}
                    onConfirm={modalConfig.onConfirm}
                    onCancel={closeModal}
                    title={modalConfig.title}
                    message={modalConfig.message}
                    showLoading={modalConfig.showLoading}
                />
            </div>
        </div>
    );
}

export default PatientPharmacyCart;