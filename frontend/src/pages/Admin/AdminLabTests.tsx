import { useState } from "react"
import AdminLabTestCard from "../../components/AdminLabTestCard"
import "../../css/hideScroll.css"

function AdminLabTests() {

    const [searchQuery, setSearchQuery] = useState('');

    const labTests = [
        {
            id: 1,
            name: "Complete Blood Count (CBC)",
            description: "Evaluates overall health and detects disorders like anemia and infection",
            price: 28.99,
            requirements: ["No fasting required"],
            status: "available"
        },
        {
            id: 2,
            name: "Basic Metabolic Panel",
            description: "Measures glucose, calcium, electrolytes and kidney function",
            price: 42.50,
            requirements: ["Fasting for 10-12 hours"],
            status: "available"
        },
        {
            id: 3,
            name: "Lipid Panel",
            description: "Measures cholesterol and triglyceride levels",
            price: 38.75,
            requirements: ["12-hour fasting", "No alcohol 24h prior"],
            status: "available"
        },
        {
            id: 4,
            name: "Liver Function Test",
            description: "Assesses liver health through enzyme measurements",
            price: 55.00,
            requirements: ["Fasting for 10-12 hours"],
            status: "unavailable"
        },
        {
            id: 5,
            name: "Thyroid Panel (TSH, T3, T4)",
            description: "Evaluates thyroid gland function",
            price: 89.99,
            requirements: ["Morning test preferred"],
            status: "available"
        },
        {
            id: 6,
            name: "Hemoglobin A1C",
            description: "Measures average blood sugar over 3 months",
            price: 45.25,
            requirements: ["No fasting required"],
            status: "available"
        },
        {
            id: 7,
            name: "Vitamin D Test",
            description: "Measures vitamin D levels in blood",
            price: 65.50,
            requirements: [],
            status: "available"
        },
        {
            id: 8,
            name: "Prothrombin Time (PT/INR)",
            description: "Evaluates blood clotting ability",
            price: 35.75,
            requirements: ["Inform about blood thinners"],
            status: "unavailable"
        },
        {
            id: 9,
            name: "Urinalysis",
            description: "Analyzes urine for various disorders",
            price: 22.99,
            requirements: ["First morning urine preferred"],
            status: "available"
        },
        {
            id: 10,
            name: "PSA Test",
            description: "Prostate-specific antigen screening",
            price: 59.99,
            requirements: ["No ejaculation 48h prior"],
            status: "available"
        },
        {
            id: 11,
            name: "HIV Test",
            description: "Screens for HIV infection",
            price: 75.00,
            requirements: ["Consent form required"],
            status: "available"
        },
        {
            id: 12,
            name: "Hepatitis Panel",
            description: "Tests for hepatitis A, B, and C",
            price: 120.50,
            requirements: [],
            status: "unavailable"
        },
        {
            id: 13,
            name: "C-Reactive Protein",
            description: "Measures inflammation in the body",
            price: 39.99,
            requirements: [],
            status: "available"
        },
        {
            id: 14,
            name: "Allergy Blood Test",
            description: "Identifies allergy triggers",
            price: 150.75,
            requirements: ["No antihistamines 3 days prior"],
            status: "available"
        },
        {
            id: 15,
            name: "Genetic Testing (BRCA)",
            description: "Assesses breast cancer risk",
            price: 299.99,
            requirements: ["Genetic counseling required"],
            status: "unavailable"
        },
        {
            id: 16,
            name: "Stool Culture",
            description: "Tests for gastrointestinal infections",
            price: 85.25,
            requirements: ["Special collection kit needed"],
            status: "available"
        },
        {
            id: 17,
            name: "Cortisol Test",
            description: "Measures stress hormone levels",
            price: 62.50,
            requirements: ["Morning sample required"],
            status: "available"
        },
        {
            id: 18,
            name: "Ferritin Test",
            description: "Assesses iron storage levels",
            price: 45.99,
            requirements: [],
            status: "available"
        },
        {
            id: 19,
            name: "Troponin Test",
            description: "Detects heart muscle damage",
            price: 78.00,
            requirements: [],
            status: "unavailable"
        },
        {
            id: 20,
            name: "Hb Electrophoresis",
            description: "Diagnoses blood disorders like thalassemia",
            price: 95.50,
            requirements: [],
            status: "available"
        }
    ];

    return (
        <div className="flex flex-col max-h-[calc(100vh-88px)]">
            {/* Fixed Search Bar */}
            <div className="sticky top-0 z-10 bg-white px-5 pb-3 flex flex-row justify-between">
                <div className="flex flex-row justify-start">
                    <div className="flex items-center justify-start w-70 h-10 rounded-md bg-[#F2F3F5] px-3">
                        {/* Search Icon SVG */}
                        <svg
                            className="w-6 h-6 mr-2 text-[#87888A]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>

                        {/* Search Input */}
                        <input
                            className="w-full bg-transparent text-md border-none focus:outline-none placeholder-[#87888A]"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value) }}
                            placeholder="Search tests"
                        />
                    </div>
                </div>
                <button className="flex justify-end px-3 py-2 bg-[#243954] text-white text-sm md:text-md lg:text-base rounded-lg hover:bg-[#1a2c42] transition-colors">
                    Create New Test
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 px-5 pb-5 overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {labTests
                        .filter(test =>
                            test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            test.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((test) => (
                            <AdminLabTestCard
                                key={test.id}
                                name={test.name}
                                description={test.description}
                                price={test.price}
                                requirements={test.requirements}
                                status={test.status as 'available' | 'unavailable'}
                            />
                        ))}
                </div>
            </div>
        </div>
    )
}

export default AdminLabTests