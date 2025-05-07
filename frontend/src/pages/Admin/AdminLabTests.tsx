import AdminLabTestCard from "../../components/AdminLabTestCard"
import "../../css/hideScroll.css"

function AdminLabTests() {
    return (
        <div className="flex flex-col">
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-5 overflow-y-scroll scrollbar-hide">
                <AdminLabTestCard />
                <AdminLabTestCard />
                <AdminLabTestCard />
                <AdminLabTestCard />
                <AdminLabTestCard />
                <AdminLabTestCard />
            </div>
        </div>
    )
}

export default AdminLabTests