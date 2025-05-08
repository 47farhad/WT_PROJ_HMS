import { useEffect, useState } from "react"
import AdminLabTestCard from "../../components/AdminLabTestCard"
import "../../css/hideScroll.css"
import { useLabTestStore } from "../../store/useLabTestStore";

function AdminLabTests() {

    const [searchQuery, setSearchQuery] = useState('');
    const { createLabTest, offeredLabTests, getOfferedLabTest, isOfferedLabTestsLoading, isCreatingLabTest } = useLabTestStore();

    useEffect(() => {
        getOfferedLabTest();
    }, [getOfferedLabTest])

    const handleCreateTest = async () => {
        await createLabTest();
    }

    if(isOfferedLabTestsLoading){
        return (
            <div>
                Loading
            </div>
        )
    }

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
                <button className="flex justify-end px-3 py-2 bg-[#243954] text-white text-sm md:text-md lg:text-base rounded-lg hover:bg-[#1a2c42] transition-colors"
                    onClick={handleCreateTest}
                    disabled={isCreatingLabTest}>
                    Create New Test
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 px-5 pb-5 overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {offeredLabTests
                        .filter(test =>
                            test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            test.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((test) => (
                            <AdminLabTestCard
                                id={test._id}
                                key={test._id}
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