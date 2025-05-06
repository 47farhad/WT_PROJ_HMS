import { useEffect } from "react";
import { useParams } from "react-router-dom"
import { useAdminStore } from "../../store/useAdminStore";

function AdminPatientDetails() {

    const { patientId } = useParams();
    const { getPatientDetails } = useAdminStore();

    useEffect(() => {
        getPatientDetails(patientId);
    }, [patientId, getPatientDetails]);

    return (
        <div>

        </div>
    )
}

export default AdminPatientDetails