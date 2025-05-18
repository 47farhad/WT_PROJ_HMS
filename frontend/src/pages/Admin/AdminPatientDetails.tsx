import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { useAdminStore } from "../../store/useAdminStore";
import { format } from 'date-fns';

import '../../css/hideScroll.css'
import ConfirmationModal from "../../components/ConfirmationModal";

// Define interface for medical info
interface MedicalInfo {
    dateOfBirth?: string;
    gender?: string;
    insuranceProvider?: string;
    policyNumber?: string;
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    [key: string]: any;
}

// Define interface for patient
interface PatientDetails {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic?: string;
    contact?: string;
    emergencyContact?: string;
    address?: string;
    medicalInfo: MedicalInfo;
    [key: string]: any;
}

function AdminPatientDetails() {
    const { patientId } = useParams<{ patientId: string }>();
    const { getPatientDetails, patient, convertToDoctor, convertToAdmin, isConvertingPatient } = useAdminStore();

    const [showConvertButton, setShowConvertButton] = useState(false);
    const [doctorConfirmationShown, setDoctorConfirmationShown] = useState(false);
    const [adminConfirmationShown, setAdminConfirmationShown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (patientId) {
            getPatientDetails(patientId);
        }
    }, [getPatientDetails, patientId]);

    const handleConvert = async () => {
        if (!patientId) return;

        if(doctorConfirmationShown){
            await convertToDoctor(patientId);
        }
        else {
            await convertToAdmin(patientId);
        }

        navigate('Patients')
    };

    // Loading state UI
    const renderLoadingState = () => {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-lg text-gray-600">Loading patient details...</div>
            </div>
        );
    };

    if (!patient) {
        return renderLoadingState();
    }

    // Safe type casting since we know patient is not null at this point
    const typedPatient = patient as unknown as PatientDetails;
    
    return (
        <>
            <div className="flex flex-row mx-5 mb-5 h-full">
                {/* Entire left side, patient info, notes, medical info and health statuses */}
                <div className="flex flex-col w-[80%] h-full items-center">
                    {/* Big card with name and pfp */}
                    <div className="w-full px-6 py-5 bg-[#F5F5F5] rounded-2xl flex flex-row items-center">
                        <div className="flex flex-row h-full border-r-1 pr-8 border-[#C4C4C4] items-center">
                            <img src={typedPatient.profilePic} className="size-20 rounded-xl" alt="Patient profile" />

                            <div className="flex flex-col ml-5 h-full justify-between py-1 flex-1">
                                <span className="text-4xl text-[#233855] flex justify-start">
                                    {typedPatient.firstName + ' ' + typedPatient.lastName}
                                </span>
                                <div className="flex justify-start">
                                    <span className="text-sm text-[#87888A]">
                                        Patient Id:
                                    </span>
                                    <span className="ml-1 text-sm text-[#4C4D4F] truncate">
                                        {typedPatient._id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact info */}
                        <div className="flex flex-row ml-5">
                            <div className="flex flex-col pr-5 border-r-1 border-[#C4C4C4]">
                                <span className="text-sm text-[#88898B] font-sans text-left">
                                    Phone Number
                                </span>
                                <span className="text-md font-semibold text-[#4B4C4E] font-sans text-left mb-1">
                                    {typedPatient.contact || '-'}
                                </span>

                                <span className="text-sm text-[#88898B] font-sans text-left mt-1">
                                    Email
                                </span>
                                <span className="text-md font-semibold text-[#4B4C4E] font-sans text-left">
                                    {typedPatient.email}
                                </span>
                            </div>

                            <div className="flex flex-col pr-2 ml-2">
                                <span className="text-sm text-[#88898B] font-sans text-left">
                                    Emergency Contact
                                </span>
                                <span className="text-md font-semibold text-[#4B4C4E] font-sans text-left mb-1">
                                    {typedPatient.emergencyContact || '-'}
                                </span>

                                <span className="text-sm text-[#88898B] font-sans text-left mt-1">
                                    Address
                                </span>
                                <span className="text-md font-semibold text-[#4B4C4E] font-sans text-left">
                                    {typedPatient.address || '-'}
                                </span>
                            </div>

                        </div>

                        <button
                            className="flex w-13 h-12 bg-white rounded-lg ml-auto hover:bg-[#FCFCFC] hover:cursor-pointer items-center justify-center relative"
                            onClick={() => setShowConvertButton(!showConvertButton)}>
                            <svg
                                width="16"
                                height="4"
                                viewBox="0 0 16 4"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="2" cy="2" r="2" fill="#243954" />
                                <circle cx="8" cy="2" r="2" fill="#243954" />
                                <circle cx="14" cy="2" r="2" fill="#243954" />
                            </svg>

                            {showConvertButton && (
                                <div className="absolute right-0 top-full mt-1 w-auto min-w-[120px] bg-white rounded-md shadow-lg z-10 border border-gray-100">
                                    <div
                                        className="py-2 px-4 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 whitespace-nowrap"
                                        onClick={() => { setShowConvertButton(false); setDoctorConfirmationShown(true) }}
                                    >
                                        Convert to Doctor
                                    </div>
                                    <div
                                        className="py-2 px-4 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 whitespace-nowrap"
                                        onClick={() => { setShowConvertButton(false); setAdminConfirmationShown(true) }}
                                    >
                                        Convert to Admin
                                    </div>
                                </div>
                            )}
                        </button>

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
                                                {typedPatient.medicalInfo?.gender || '-'}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="text-sm text-[#88898B] font-sans w-[40%]">
                                                Age
                                            </span>
                                            <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                                {typedPatient.medicalInfo?.dateOfBirth ? (
                                                    (() => {
                                                        const dob = new Date(typedPatient.medicalInfo.dateOfBirth);
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
                                                {typedPatient.medicalInfo?.dateOfBirth 
                                                    ? format(new Date(typedPatient.medicalInfo.dateOfBirth), 'dd-MM-yyyy') 
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-start ml-10 border-[#C4C4C4] gap-3 w-[50%]">
                                        <div className="flex items-center">
                                            <span className="text-sm text-[#88898B] font-sans w-[50%]">
                                                Insurance Provider
                                            </span>
                                            <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                                {typedPatient.medicalInfo?.insuranceProvider || '-'}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="text-sm text-[#88898B] font-sans w-[50%]">
                                                Insurance Number
                                            </span>
                                            <span className="text-md font-semibold text-[#4B4C4E] font-sans">
                                                {typedPatient.medicalInfo?.policyNumber || '-'}
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
                                            {typedPatient.medicalInfo?.allergies && typedPatient.medicalInfo.allergies.length > 0 ? (
                                                typedPatient.medicalInfo.allergies.map((allergy: string, index: number) => (
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
                                            {typedPatient.medicalInfo?.chronicConditions && typedPatient.medicalInfo.chronicConditions.length > 0 ? (
                                                typedPatient.medicalInfo.chronicConditions.map((condition: string, index: number) => (
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
                                            {typedPatient.medicalInfo?.currentMedications && typedPatient.medicalInfo.currentMedications.length > 0 ? (
                                                typedPatient.medicalInfo.currentMedications.map((medication: string, index: number) => (
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
                <div className="flex flex-col w-[20%] h-full ml-5 gap-5">
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
            </div>

            <ConfirmationModal 
                isOpen={doctorConfirmationShown || adminConfirmationShown}
                onConfirm={() => {handleConvert(); setDoctorConfirmationShown(false); setAdminConfirmationShown(false);}}
                onCancel={() => {setDoctorConfirmationShown(false); setAdminConfirmationShown(false);}}
                title={`Convert to ${doctorConfirmationShown ? 'Doctor' : 'Admin'}`}
                message={`Are you sure you want to convert this account to a ${doctorConfirmationShown ? 'Doctor' : 'Admin'}? This change is irreversible.`}
                showLoading={isConvertingPatient}
            />
        </>
    )
}

export default AdminPatientDetails