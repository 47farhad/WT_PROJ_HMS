import { useEffect } from "react";
import { useParams } from "react-router-dom"
import { useAdminStore } from "../../store/useAdminStore";
import { format, parseISO } from 'date-fns';

import '../../css/hideScroll.css'

function AdminPatientDetails() {

    const { patientId } = useParams();
    const { getPatientDetails, patient } = useAdminStore();

    useEffect(() => {
        getPatientDetails(patientId);
    }, [getPatientDetails, patientId]);

    return (
        (patient) &&
        (<div className="flex flex-row mx-5 mb-5 h-full">
            {/* Entire left side, patient info, notes, medical info and health statuses */}
            <div className="flex flex-col w-[75%] h-full items-center">
                {/* Big card with name and pfp */}
                <div className="w-full px-6 py-5 bg-[#F5F5F5] rounded-2xl flex flex-row">
                    <div className="flex flex-row h-full border-r-1 pr-8 border-[#C4C4C4]">
                        <img src={patient.profilePic} className="size-20 rounded-xl" />

                        <div className="flex flex-col ml-5 h-full justify-between py-1 flex-1">
                            <span className="text-4xl text-[#233855] flex justify-start">
                                {patient.firstName + ' ' + patient.lastName}
                            </span>
                            <div className="flex justify-start">
                                <span className="text-sm text-[#87888A]">
                                    Patient Id:
                                </span>
                                <span className="ml-1 text-sm text-[#4C4D4F]">
                                    {patient._id}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-row ml-5">
                        <div className="flex flex-col items-center justify-center pr-5 border-r-1 border-[#C4C4C4]">
                            <span className="text-sm text-[#88898B] font-sans text-center">
                                Phone Number
                            </span>
                            <span className="text-md font-semibold text-[#4B4C4E] font-sans text-center">
                                {patient.contact}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center pr-5 ml-2 border-r-1 border-[#C4C4C4]">
                            <span className="text-sm text-[#88898B] font-sans text-center">
                                Email
                            </span>
                            <span className="text-md font-semibold text-[#4B4C4E] font-sans text-center">
                                {patient.email}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center pr-5 ml-2 border-r-1 border-[#C4C4C4]">
                            <span className="text-sm text-[#88898B] font-sans text-center">
                                Emergency Contact
                            </span>
                            <span className="text-md font-semibold text-[#4B4C4E] font-sans text-center">
                                {patient.emergencyContact}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center ml-2">
                            <span className="text-sm text-[#88898B] font-sans text-center">
                                Address
                            </span>
                            <span className="text-md font-semibold text-[#4B4C4E] font-sans text-center">
                                {patient.address}
                            </span>
                        </div>

                    </div>
                </div>

                {/* Div with notes on left, General info and patient notes on right */}
                <div className="flex flex-row w-full mt-5 h-[48%]">
                    {/* Notes */}
                    <div className="flex flex-col w-[33%] border-2 border-[#E6E6E8] rounded-2xl p-1 h-full">
                        <span className="text-lg font-semibold text-[#04080B] font-sans text-center border-b-1 border-[#E6E6E8]">
                            Notes
                        </span>
                    </div>

                    {/* General Info and Allergies/Conditions/Medication */}
                    <div className="flex flex-col ml-5 gap-5 w-full">
                        {/* General Info */}
                        <div className="bg-[#F5F5F5] rounded-2xl h-[50%] flex flex-col p-5 pb-10 flex-1 w-full">
                            <span className="text-lg font-semibold text-[#04080B] font-sans mb-4">
                                General Info
                            </span>

                            <div className="flex flex-row justify-between w-full">
                                <div className="flex flex-col justify-start border-r border-[#C4C4C4] gap-2 w-[50%]">
                                    <div className="flex items-center">
                                        <span className="text-sm text-[#88898B] font-sans w-[40%]">
                                            Gender
                                        </span>
                                        <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.gender}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="text-sm text-[#88898B] font-sans w-[40%]">
                                            Age
                                        </span>
                                        <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo?.dateOfBirth ? (
                                                (() => {
                                                    const dob = new Date(patient.medicalInfo.dateOfBirth);
                                                    const today = new Date();
                                                    let age = today.getFullYear() - dob.getFullYear();
                                                    const monthDiff = today.getMonth() - dob.getMonth();
                                                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                                                        age--;
                                                    }
                                                    return age;
                                                })()
                                            ) : (
                                                '-'
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="text-sm text-[#88898B] font-sans w-[40%]">
                                            Date of Birth
                                        </span>
                                        <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.dateOfBirth ? format(parseISO(patient.medicalInfo.dateOfBirth), 'dd-MM-yyyy') : '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-start ml-10 border-[#C4C4C4] gap-3 w-[50%]">
                                    <div className="flex items-center">
                                        <span className="text-sm text-[#88898B] font-sans w-[50%]">
                                            Insurance Provider
                                        </span>
                                        <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.insuranceProvider}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="text-sm text-[#88898B] font-sans w-[50%]">
                                            Insurance Number
                                        </span>
                                        <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.policyNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Allergies, Conditions and Medications */}
                        <div className="flex flex-row gap-5 h-[50%]">
                            {/* Allergies */}
                            <div className="border-2 border-[#E6E6E8] rounded-2xl h-full w-1/3 flex flex-col">
                                <div className="p-5 pb-0 mb-2">
                                    <span className="text-sm text-[#88898B] font-sans">
                                        Allergies
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-hide">
                                    <ul className="text-md font-semibold text-[#4B4C4E] font-sans list-disc pl-6 space-y-1">
                                        {patient.medicalInfo?.allergies?.length > 0 ? (
                                            patient.medicalInfo.allergies.map((allergy, index) => (
                                                <li key={`allergy-${index}`}>{allergy}</li>
                                            ))
                                        ) : (
                                            <li className="text-[#88898B] font-normal">No allergies recorded</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Conditions */}
                            <div className="border-2 border-[#E6E6E8] rounded-2xl h-full w-1/3 flex flex-col">
                                <div className="p-5 pb-0 mb-2">
                                    <span className="text-sm text-[#88898B] font-sans">
                                        Chronic Conditions
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-hide">
                                    <ul className="text-md font-semibold text-[#4B4C4E] font-sans list-disc pl-6 space-y-1">
                                        {patient.medicalInfo?.chronicConditions?.length > 0 ? (
                                            patient.medicalInfo.chronicConditions.map((condition, index) => (
                                                <li key={`condition-${index}`}>{condition}</li>
                                            ))
                                        ) : (
                                            <li className="text-[#88898B] font-normal">No conditions recorded</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Medication */}
                            <div className="border-2 border-[#E6E6E8] rounded-2xl h-full w-1/3 flex flex-col">
                                <div className="p-5 pb-0 mb-2">
                                    <span className="text-sm text-[#88898B] font-sans">
                                        Current Medication
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-hide">
                                    <ul className="text-md font-semibold text-[#4B4C4E] font-sans list-disc pl-6 space-y-1">
                                        {patient.medicalInfo?.currentMedications?.length > 0 ? (
                                            patient.medicalInfo.currentMedications.map((medication, index) => (
                                                <li key={`medication-${index}`}>{medication}</li>
                                            ))
                                        ) : (
                                            <li className="text-[#88898B] font-normal">No medication recorded</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Info */}
                <div className="border-2 border-[#E6E6E8] rounded-2xl h-full w-full mt-5 px-5 py-2">
                    <span className="text-lg font-semibold text-[#04080B] font-sans">
                        Medical Info
                    </span>

                    {/* Grid with all the info */}
                    <div>

                    </div>
                </div>
            </div>

            {/* Right side, reports and appointments */}
            <div className="flex flex-col w-[25%] h-full ml-5 gap-5">
                {/* Lab Reports */}
                <div className="bg-[#F5F5F5] rounded-2xl h-[35%] p-5">
                    <span className="text-lg font-semibold text-[#04080B] font-sans">
                        Lab Reports
                    </span>
                </div>


                {/* Appointments */}
                <div className="bg-[#F5F5F5] rounded-2xl h-[65%] p-5">
                    <span className="text-lg font-semibold text-[#04080B] font-sans">
                        Appointments
                    </span>
                </div>
            </div>
        </div>)
    )
}

export default AdminPatientDetails