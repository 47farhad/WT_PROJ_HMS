interface Props {
    name: string,
    description: string,
    price: number,
    requirements: [string],
    status: string
}

function AdminLabTestCard(p: Props) {
    return (
        <div className="flex flex-col p-5 border-2 border-[#C4C4C4] rounded-xl w-50 md:w-60 lg:w-70 aspect-[3/4]">
            Admin Pharmacy
        </div>
    )
}

export default AdminLabTestCard