import { useEffect } from "react"
import { useCartStore } from "../../store/useCartStore"
import { useNavigate, useParams } from "react-router-dom";
import PastOrderItemCard from "../../components/PastOrderItemCard";

function PatientOrderDetails() {

    const { orderId } = useParams();
    const navigate = useNavigate();
    const { detailedOrder, isLoadingDetailedOrder, getOrderDetails } = useCartStore();

    useEffect(() => {
        getOrderDetails(orderId);
    }, [getOrderDetails, orderId]);

    if (isLoadingDetailedOrder || !detailedOrder) {
        return (
            <div>
                Loading
            </div>
        )
    }

    const { items, transaction } = detailedOrder;

    return (
        <div className="w-full h-full max-h-[calc(100vh-88px)] flex justify-center">
            <div className="w-full max-w-2xl flex flex-col p-4 pt-0">
                <div className="flex flex-row items-center justify-between bg-white z-10 sticky top-0 px-1">
                    <button
                        onClick={() => navigate("/Orders")}
                        className="text-blue-600 hover:underline flex items-center justify-start"
                    >
                        ← Back to Orders
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 scrollbar-hide">
                    {items.map((item, i) => (
                        <PastOrderItemCard key={i} item={item} />
                    ))}
                </div>

                {/* Footer with total */}
                <div className="bg-white sticky bottom-0 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${transaction.amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientOrderDetails