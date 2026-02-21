import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useNotesStore } from "../../store/useNotesStore";
import { format, parseISO } from 'date-fns';
import '../../css/hideScroll.css';
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { usePatientLabTestStore } from "../../store/usePatientLabTestStore";

function DoctorPatientDetails() {
    const { authUser } = useAuthStore();
    const { patientId } = useParams();
    const { getPatientDetails, patient } = useAdminStore();
    const { patientDetailsAppointments, getPatientDetailsAppointments } = useAppointmentStore();
    const { patientDetailsReports, getDetailsReport } = usePatientLabTestStore();
    const { getNotesbyPatientId, patientNotes, isNotesLoading } = useNotesStore();


    useEffect(() => {
        const fetchAllData = async () => {
            if (patientId) {
                try {
                    await Promise.all([
                        getPatientDetails(patientId),
                        getNotesbyPatientId(patientId),
                        getPatientDetailsAppointments(patientId),
                        getDetailsReport(patientId)
                    ]);
                } catch (error) {
                    console.error("Failed to fetch patient data:", error);
                }
            }
        };

        fetchAllData();
    }, [patientId, getPatientDetails, getNotesbyPatientId, getPatientDetailsAppointments, getDetailsReport]);

    const handleDownload = (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `test-result.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return (
        (patient) &&
        (<>
            <div className="flex flex-row mx-5 mb-5 h-full">
                {/* Entire left side, patient info, notes, medical info and health statuses */}
                <div className="flex flex-col w-[80%] h-full items-center">
                    {/* Big card with name and pfp */}
                    <div className="w-full px-6 py-5 bg-[#F5F5F5] rounded-2xl flex flex-row items-center">
                        <div className="flex flex-row h-full border-r-1 pr-8 border-[#C4C4C4] items-center">
                            <img src={(patient.profilePic ? patient.profilePic : null)} className="size-20 rounded-xl" />

                            <div className="flex flex-col ml-5 h-full justify-between py-1 flex-1">
                                <span className="text-4xl text-[#233855] flex justify-start">
                                    {patient.firstName + ' ' + patient.lastName}
                                </span>
                                <div className="flex justify-start">
                                    <span className="text-sm text-[#87888A]">
                                        Patient Id:
                                    </span>
                                    <span className="ml-1 text-sm text-[#4C4D4F] truncate">
                                        {patient._id}
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
                                    {patient.contact}
                                </span>

                                <span className="text-sm text-[#88898B] font-sans text-left mt-1">
                                    Email
                                </span>
                                <span className="text-md font-semibold text-[#4B4C4E] font-sans text-left">
                                    {patient.email}
                                </span>
                            </div>

                            <div className="flex flex-col pr-2 ml-2">
                                <span className="text-sm text-[#88898B] font-sans text-left">
                                    Emergency Contact
                                </span>
                                <span className="text-md font-semibold text-[#4B4C4E] font-sans text-left mb-1">
                                    {patient.emergencyContact}
                                </span>

                                <span className="text-sm text-[#88898B] font-sans text-left mt-1">
                                    Address
                                </span>
                                <span className="text-md font-semibold text-[#4B4C4E] font-sans text-left">
                                    {patient?.address.street}
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* Div with notes on left, General info and patient notes on right */}
                    <div className="flex flex-row w-full mt-5 h-[48%]">
                        {/* Notes Section - Updated */}
                        <div className="flex flex-col w-[33%] border-2 border-[#E6E6E8] rounded-2xl p-4 h-full overflow-hidden">
                            <span className="text-lg font-semibold text-[#04080B] font-sans text-center border-b-1 border-[#E6E6E8] pb-2 mb-3">
                                Notes
                            </span>
                            {isNotesLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#243954]"></div>
                                </div>
                            ) : patientNotes && patientNotes[patientId] && patientNotes[patientId].length > 0 ? (
                                <div className="overflow-y-auto scrollbar-hide space-y-3">
                                    {patientNotes[patientId].map(note => (
                                        <div key={note._id} className="bg-white p-3 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-md font-semibold text-[#243954]">
                                                    {note.header}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {note.createdAt && format(new Date(note.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-line">
                                                {note.text}
                                            </p>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Appointment: {note.appointmentId}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-center">No notes available for this patient</p>
                                </div>
                            )}
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
                    <div className="flex flex-col border-2 border-[#E6E6E8] rounded-2xl h-full w-full mt-5 px-5 py-2">
                        <div className="flex flex-row justify-between">
                            <span className="text-lg font-semibold text-[#04080B] font-sans">
                                Medical Info
                            </span>

                            <span className="text-sm text-[#88898B] font-sans">
                                {`Last updated ${format(new Date(patient.medicalInfo.updatedAt), 'd MMMM yyyy')}`}
                            </span>
                        </div>

                        {/* Grid with all the info */}
                        <div className="flex w-full h-full flex-row items-center justify-between">
                            <div className="grid grid-rows-2 grid-cols-3 items-center h-full w-[60%]">
                                <div className="flex flex-row w-fit">
                                    <div className="size-18 rounded-lg bg-[#A2F2EF] flex items-center justify-center">
                                        <svg className="size-[70%]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.0002 6L11.0064 9M16.5 6C17.8978 6 18.5967 6 19.1481 6.22836C19.8831 6.53284 20.4672 7.11687 20.7716 7.85195C21 8.40326 21 9.10218 21 10.5V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V10.5C3 9.10218 3 8.40326 3.22836 7.85195C3.53284 7.11687 4.11687 6.53284 4.85195 6.22836C5.40326 6 6.10218 6 7.5 6M10 17H14M10.5415 3H13.4588C14.5397 3 15.0802 3 15.4802 3.18541C16.0136 3.43262 16.4112 3.90199 16.5674 4.46878C16.6845 4.89387 16.5957 5.42698 16.418 6.4932C16.2862 7.28376 16.2203 7.67904 16.0449 7.98778C15.8111 8.39944 15.4388 8.71481 14.9943 8.87778C14.661 9 14.2602 9 13.4588 9H10.5415C9.74006 9 9.33933 9 9.00596 8.87778C8.56146 8.71481 8.18918 8.39944 7.95536 7.98778C7.77999 7.67904 7.71411 7.28376 7.58235 6.4932C7.40465 5.42698 7.3158 4.89387 7.43291 4.46878C7.58906 3.90199 7.98669 3.43262 8.52009 3.18541C8.92014 3 9.46061 3 10.5415 3Z" stroke="#243956" strokeWidth="1.152" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>

                                    </div>
                                    <div className="flex flex-col pb-2 ml-2 text-left justify-between">
                                        <span className="text-md text-[#88898B] font-sans">
                                            Body weight
                                        </span>
                                        <span className="text-xl font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.weight + ' Kg'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-row w-fit">
                                    <div className="size-18 rounded-lg bg-[#A2F2EF] flex items-center justify-center">
                                        <svg className="size-[70%]" fill="#243956" height="256px" width="256px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.3 489.3"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M181.95,62.7c0,34.6,28.1,62.7,62.7,62.7s62.7-28.1,62.7-62.7S279.25,0,244.65,0S181.95,28.1,181.95,62.7z M244.65,24.5 c21.1,0,38.2,17.1,38.2,38.2s-17.1,38.2-38.2,38.2s-38.2-17.1-38.2-38.2S223.55,24.5,244.65,24.5z"></path> <path d="M196.25,138.5c-34.3,0-62.2,27.9-62.2,62.2v79.7c0,23,12.9,44,32.8,54.7v104.7c0,27.3,22.2,49.5,49.5,49.5h56.6 c27.3,0,49.5-22.2,49.5-49.5V335c19.9-10.7,32.8-31.7,32.8-54.7v-79.7c0-34.3-27.9-62.2-62.2-62.2h-96.8V138.5z M330.75,200.6 v79.7c0,15.7-9.9,29.9-24.7,35.3c-4.8,1.8-8,6.4-8,11.5v112.6c0,13.8-11.2,25-25,25h-56.6c-13.8,0-25-11.2-25-25V327.2 c0-5.1-3.2-9.7-8-11.5c-14.8-5.4-24.7-19.6-24.7-35.3v-79.8c0-20.8,16.9-37.7,37.7-37.7h96.8 C313.85,163,330.75,179.9,330.75,200.6z"></path> </g> </g> </g></svg>

                                    </div>
                                    <div className="flex flex-col pb-2 ml-2 text-left justify-between">
                                        <span className="text-md text-[#88898B] font-sans">
                                            Body height
                                        </span>
                                        <span className="text-xl font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.height + ' cm'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-row w-fit">
                                    <div className="size-18 rounded-lg bg-[#A2F2EF] flex items-center justify-center">
                                        <svg className="size-[70%]" fill="#243956" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#243956" strokeWidth="0.00024000000000000003"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21,15c0-7.415-8.057-13.543-8.4-13.8a1,1,0,0,0-1.2,0C11.057,1.457,3,7.585,3,15c0,3.649,1.562,8,9,8S21,18.649,21,15Zm-9,6c-4.841,0-7-1.851-7-6C5,9.668,10.205,4.806,12,3.287,13.8,4.8,19,9.657,19,15,19,19.149,16.841,21,12,21Zm0-2a1,1,0,0,1-1,1,4.821,4.821,0,0,1-5-5A1,1,0,0,1,8,15,2.853,2.853,0,0,0,11,18,1,1,0,0,1,12,19Z"></path></g></svg>

                                    </div>
                                    <div className="flex flex-col pb-2 ml-2 text-left justify-between">
                                        <span className="text-md text-[#88898B] font-sans">
                                            Blood group
                                        </span>
                                        <span className="text-xl font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.bloodType}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-row w-fit">
                                    <div className="size-18 rounded-lg bg-[#A2F2EF] flex items-center justify-center">
                                        <svg className="size-[70%]" fill="#243956" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" stroke="#243956" strokeWidth="3.072"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M826.614 337.92c56.55 0 102.4 45.85 102.4 102.4 0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48c0-79.171-64.189-143.36-143.36-143.36-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48z"></path><path d="M820.224 296.96h-367.36c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48h367.36c11.311 0 20.48-9.169 20.48-20.48s-9.169-20.48-20.48-20.48zM972.8 684.49c5.657 0 10.24-4.583 10.24-10.24V552.097c0-5.657-4.583-10.24-10.24-10.24H51.2a10.238 10.238 0 00-10.24 10.24V674.25c0 5.657 4.583 10.24 10.24 10.24h921.6zm0 40.96H51.2c-28.278 0-51.2-22.922-51.2-51.2V552.097c0-28.278 22.922-51.2 51.2-51.2h921.6c28.278 0 51.2 22.922 51.2 51.2V674.25c0 28.278-22.922 51.2-51.2 51.2z"></path><path d="M225.242 521.375v181.443c0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48V521.375c0-11.311-9.169-20.48-20.48-20.48s-20.48 9.169-20.48 20.48zm636.638 0v181.443c0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48V521.375c0-11.311-9.169-20.48-20.48-20.48s-20.48 9.169-20.48 20.48z"></path></g></svg>

                                    </div>
                                    <div className="flex flex-col pb-2 ml-2 text-left justify-between">
                                        <span className="text-md text-[#88898B] font-sans">
                                            Smoking
                                        </span>
                                        <span className="text-xl font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.smokingStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-row w-fit">
                                    <div className="size-18 rounded-lg bg-[#A2F2EF] flex items-center justify-center">
                                        <svg className="size-[70%]" viewBox="-10 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#243956"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>wine</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" strokeWidth="0.00032" fill="none" fillRule="evenodd"> <g id="Icon-Set" transform="translate(-578.000000, -411.000000)" fill="#243956"> <path d="M588,441 L580,441 L580,427 C580,425.896 580.896,425 582,425 L586,425 C587.104,425 588,425.896 588,427 L588,441 L588,441 Z M583,417 L585,417 L585,423 L583,423 L583,417 Z M583,413 L585,413 L585,415 L583,415 L583,413 Z M587.014,423 L587,423 L587,412 C587,411.448 586.553,411 586,411 L582,411 C581.447,411 581,411.448 581,412 L581,423 L580.987,423 C578.969,423 578,424.791 578,427 L578,443 L590,443 L590,427 C590,424.791 588.98,423 587.014,423 L587.014,423 Z" id="wine"> </path> </g> </g> </g></svg>

                                    </div>
                                    <div className="flex flex-col pb-2 ml-2 text-left justify-between">
                                        <span className="text-md text-[#88898B] font-sans">
                                            Alcohol
                                        </span>
                                        <span className="text-xl font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.alcoholConsumption}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-row w-fit">
                                    <div className="size-18 rounded-lg bg-[#A2F2EF] flex items-center justify-center">
                                        <svg className="size-[70%]" fill="#243956" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" stroke="#243956" strokeWidth="8.192"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M957.442 547.84h56.32c11.311 0 20.48-9.169 20.48-20.48s-9.169-20.48-20.48-20.48h-56.32c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48zm-630.79 0h389.13c11.311 0 20.48-9.169 20.48-20.48s-9.169-20.48-20.48-20.48h-389.13c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48zm-295.932 0h56.32c11.311 0 20.48-9.169 20.48-20.48s-9.169-20.48-20.48-20.48H30.72c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48z"></path><path d="M788.48 788.48c-39.471 0-71.68-32.209-71.68-71.68V337.92c0-39.471 32.209-71.68 71.68-71.68s71.68 32.209 71.68 71.68V716.8c0 39.471-32.209 71.68-71.68 71.68zm0-40.96c16.849 0 30.72-13.871 30.72-30.72V337.92c0-16.849-13.871-30.72-30.72-30.72s-30.72 13.871-30.72 30.72V716.8c0 16.849 13.871 30.72 30.72 30.72z"></path><path d="M890.88 650.24c-39.471 0-71.68-32.209-71.68-71.68v-102.4c0-39.471 32.209-71.68 71.68-71.68s71.68 32.209 71.68 71.68v102.4c0 39.471-32.209 71.68-71.68 71.68zm0-40.96c16.849 0 30.72-13.871 30.72-30.72v-102.4c0-16.849-13.871-30.72-30.72-30.72s-30.72 13.871-30.72 30.72v102.4c0 16.849 13.871 30.72 30.72 30.72zM256 747.52c16.849 0 30.72-13.871 30.72-30.72V337.92c0-16.849-13.871-30.72-30.72-30.72s-30.72 13.871-30.72 30.72V716.8c0 16.849 13.871 30.72 30.72 30.72zm0 40.96c-39.471 0-71.68-32.209-71.68-71.68V337.92c0-39.471 32.209-71.68 71.68-71.68s71.68 32.209 71.68 71.68V716.8c0 39.471-32.209 71.68-71.68 71.68z"></path><path d="M153.6 609.28c16.849 0 30.72-13.871 30.72-30.72v-102.4c0-16.849-13.871-30.72-30.72-30.72s-30.72 13.871-30.72 30.72v102.4c0 16.849 13.871 30.72 30.72 30.72zm0 40.96c-39.471 0-71.68-32.209-71.68-71.68v-102.4c0-39.471 32.209-71.68 71.68-71.68s71.68 32.209 71.68 71.68v102.4c0 39.471-32.209 71.68-71.68 71.68z"></path></g></svg>

                                    </div>
                                    <div className="flex flex-col pb-2 ml-2 text-left justify-between">
                                        <span className="text-md text-[#88898B] font-sans">
                                            Exercise frequency
                                        </span>
                                        <span className="text-xl font-semibold text-[#4B4C4E] font-sans">
                                            {patient.medicalInfo.exerciseFrequency}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-full w-[40%]">
                                <span className="text-md font-semibold text-[#88898B] font-sans py-1 text-left">
                                    Additional Info
                                </span> <br />
                                <p className="text-lg text-[#4B4C4E] font-sans mt-1 text-left flex flex-col justify-start overflow-hidden"
                                    title={patient.medicalInfo.additionalNotes}>
                                    {patient.medicalInfo.additionalNotes}
                                </p>

                            </div>
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

                        <div className="flex flex-col items-center">
                            {(patientDetailsReports) &&
                                (patientDetailsReports.map((report) => (
                                    <div key={report._id} className="flex flex-row items-center justify-between w-full p-3 my-3 bg-white rounded-xl">
                                        <div className="flex items-center">
                                            <div className="bg-[#A2F2EF] rounded-xl size-12 text-lg flex items-center justify-center font-sans font-bold">
                                                PDF
                                            </div>
                                            <span className="ml-3 font-sans font-semibold text-md">
                                                {report.testName}
                                            </span>
                                        </div>
                                        <button
                                            className="bg-gray-100 rounded-xl size-10 flex items-center justify-center hover:cursor-pointer hover:bg-gray-200 transition-colors ml-auto"
                                            onClick={() => handleDownload(report.resultUrl)}
                                        >
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="text-gray-500"
                                            >
                                                <path
                                                    d="M9 18L15 12L9 6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                )))}
                        </div>
                    </div>


                    {/* Appointments */}
                    <div className="bg-[#F5F5F5] rounded-2xl h-[65%] p-5 flex flex-col gap-5">
                        <span className="text-lg font-semibold text-[#04080B] font-sans">
                            Appointments
                        </span>

                        <span className="text-md text-[#88898B] font-sans text-left">
                            Upcoming
                        </span>

                        {/* upcoming appointment - Only show if doctor matches */}
                        {(patientDetailsAppointments && patientDetailsAppointments.upcoming &&
                            patientDetailsAppointments.upcoming.doctorId._id === authUser._id) && (
                                <div className="flex flex-col items-baseline w-full bg-white rounded-2xl p-3 gap-1">
                                    <span className="text-[#223A54] font-sans font-semibold text-sm truncate max-w-full">
                                        {patientDetailsAppointments.upcoming.description}
                                    </span>
                                    <span className="text-[#05090C] font-sans font-semibold text-xl">
                                        {"Dr. " + patientDetailsAppointments.upcoming.doctorId.firstName + " " + patientDetailsAppointments.upcoming.doctorId.lastName}
                                    </span>
                                    <div className="flex flex-row items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#4B4C4E" viewBox="0 0 24 24">
                                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                                        </svg>
                                        <span className="text-[#4B4C4E] font-sans font-semibold text-sm">
                                            {format(parseISO(patientDetailsAppointments.upcoming.datetime), 'EEEE, dd MMMM yyyy - hh:mm a', { timeZone: 'UTC' })}
                                        </span>
                                    </div>
                                </div>
                            )}

                        <span className="text-md text-[#88898B] font-sans text-left">
                            Past
                        </span>

                        {(patientDetailsAppointments && patientDetailsAppointments.past[0]) &&
                            (<div className="flex flex-col items-baseline w-full bg-white rounded-2xl p-3 gap-1">
                                <span className="text-[#223A54] font-sans font-semibold text-sm">
                                    {patientDetailsAppointments.past[0].description}
                                </span>
                                <span className="text-[#05090C] font-sans font-semibold text-xl">
                                    {"Dr. " + patientDetailsAppointments.past[0].doctorId.firstName + " " + patientDetailsAppointments.past[0].doctorId.lastName}
                                </span>
                                <div className="flex flex-row items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#4B4C4E" viewBox="0 0 24 24">
                                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                                    </svg>
                                    <span className="text-[#4B4C4E] font-sans font-semibold text-sm">
                                        {format(parseISO(patientDetailsAppointments.past[0].datetime), 'EEEE, dd MMMM yyyy - hh:mm a', { timeZone: 'UTC' })}
                                    </span>
                                </div>
                            </div>)}

                        {(patientDetailsAppointments && patientDetailsAppointments.past[1]) &&
                            (<div className="flex flex-col items-baseline w-full bg-white rounded-2xl p-3 gap-1">
                                <span className="text-[#223A54] font-sans font-semibold text-sm">
                                    {patientDetailsAppointments.past[1].description}
                                </span>
                                <span className="text-[#05090C] font-sans font-semibold text-xl">
                                    {"Dr. " + patientDetailsAppointments.past[1].doctorId.firstName + " " + patientDetailsAppointments.past[1].doctorId.lastName}
                                </span>
                                <div className="flex flex-row items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="#4B4C4E" viewBox="0 0 24 24">
                                        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                                    </svg>
                                    <span className="text-[#4B4C4E] font-sans font-semibold text-sm">
                                        {format(parseISO(patientDetailsAppointments.past[1].datetime), 'EEEE, dd MMMM yyyy - hh:mm a', { timeZone: 'UTC' })}
                                    </span>
                                </div>
                            </div>)}
                    </div>
                </div>
            </div>

        </>)
    )
}

export default DoctorPatientDetails