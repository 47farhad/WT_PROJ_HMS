interface PastOrderItemCardProps {
    item: {
        quantity: number;
        medicine: {
            name: string;
            price: number;
            dosage: number;
            picture?: string;
        };
    };
}

export default function PastOrderItemCard({ item }: PastOrderItemCardProps) {
    const { medicine, quantity } = item;

    return (
        <div className="flex items-start p-4 border border-gray-200 rounded-lg">
            <div className="w-20 h-20 bg-gray-100 rounded-md mr-4 flex-shrink-0 overflow-hidden">
                {medicine.picture ? (
                    <img
                        src={medicine.picture}
                        alt={medicine.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm text-gray-700">Qty: {quantity}</p>
            </div>

            <div className="ml-4 flex flex-col items-end">
                <p className="font-medium">${(medicine.price * quantity).toFixed(2)}</p>
            </div>
        </div>
    );
}
