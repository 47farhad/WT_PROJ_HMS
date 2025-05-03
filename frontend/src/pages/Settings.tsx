import { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import TagInput from "../components/TagInput";
import ConfirmationModal from "../components/ConfirmationModal";
import { formatDateForInput } from "../util/formateDate";

function Settings() {
    const { authUser, updateProfile } = useAuthStore();
    const fileInputRef = useRef(null);

    // Personl info states
    const [firstName, setFirstName] = useState(authUser.firstName);
    const [lastName, setLastName] = useState(authUser.lastName);
    const [contact, setContact] = useState(authUser.contact);
    const [emergencyContact, setEmergencyContact] = useState(authUser.emergencyContact);
    const [address, setAddress] = useState(authUser.address);
    const [profilePic, setProfilePic] = useState(authUser.profilePic);

    // Medical info states
    const [bloodType, setBloodType] = useState(authUser.medicalInfo?.bloodType || '');
    const [dateOfBirth, setDateOfBirth] = useState(authUser.medicalInfo?.dateOfBirth || '');
    const [height, setHeight] = useState(authUser.medicalInfo?.height || '');
    const [weight, setWeight] = useState(authUser.medicalInfo?.weight || '');
    const [allergies, setAllergies] = useState(authUser.medicalInfo?.allergies || []);
    const [chronicConditions, setChronicConditions] = useState(authUser.medicalInfo?.chronicConditions || []);
    const [currentMedications, setCurrentMedications] = useState(authUser.medicalInfo?.currentMedications || []);
    const [primaryPhysician, setPrimaryPhysician] = useState(authUser.medicalInfo?.primaryPhysician || '');
    const [physicianContact, setPhysicianContact] = useState(authUser.medicalInfo?.physicianContact || '');
    const [insuranceProvider, setInsuranceProvider] = useState(authUser.medicalInfo?.insuranceProvider || '');
    const [policyNumber, setPolicyNumber] = useState(authUser.medicalInfo?.policyNumber || '');
    const [smokingStatus, setSmokingStatus] = useState(authUser.medicalInfo?.smokingStatus || '');
    const [alcoholConsumption, setAlcoholConsumption] = useState(authUser.medicalInfo?.alcoholConsumption || '');
    const [exerciseFrequency, setExerciseFrequency] = useState(authUser.medicalInfo?.exerciseFrequency || '');
    const [dietaryRestrictions, setDietaryRestrictions] = useState(authUser.medicalInfo?.dietaryRestrictions || '');
    const [additionalNotes, setAdditionalNotes] = useState(authUser.medicalInfo?.additionalNotes || '');

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingData, setPendingData] = useState({ personalInfo: null, medicalData: null });

    const handleSave = () => {
        const personalInfo = {
            firstName,
            lastName,
            contact,
            emergencyContact,
            address,
            profilePic: (profilePic === authUser.profilePic ? '' : profilePic)
        };

        const medicalData = {
            bloodType,
            dateOfBirth,
            height,
            weight,
            allergies,
            chronicConditions,
            currentMedications,
            primaryPhysician,
            physicianContact,
            insuranceProvider,
            policyNumber,
            smokingStatus,
            alcoholConsumption,
            exerciseFrequency,
            dietaryRestrictions,
            additionalNotes
        };

        // Store the data and show confirmation
        setPendingData({ personalInfo, medicalData });
        setShowConfirmation(true);
    };

    const handleConfirm = async () => {
        try {
            await updateProfile(pendingData.personalInfo, pendingData.medicalData);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        }
        setShowConfirmation(false);
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setPendingData({ personalInfo: null, medicalData: null });
    };

    const handleDiscard = () => {
        setFirstName(authUser.firstName);
        setLastName(authUser.lastName);
        setContact(authUser.contact);
        setEmergencyContact(authUser.emergencyContact);
        setAddress(authUser.address);
        setProfilePic(authUser.profilePic);
        setBloodType(authUser.medicalInfo?.bloodType || '');
        setDateOfBirth(authUser.medicalInfo?.dateOfBirth || '');
        setHeight(authUser.medicalInfo?.height || '');
        setWeight(authUser.medicalInfo?.weight || '');
        setAllergies(authUser.medicalInfo?.allergies || []);
        setChronicConditions(authUser.medicalInfo?.chronicConditions || []);
        setCurrentMedications(authUser.medicalInfo?.currentMedications || []);
        setPrimaryPhysician(authUser.medicalInfo?.primaryPhysician || '');
        setPhysicianContact(authUser.medicalInfo?.physicianContact || '');
        setInsuranceProvider(authUser.medicalInfo?.insuranceProvider || '');
        setPolicyNumber(authUser.medicalInfo?.policyNumber || '');
        setSmokingStatus(authUser.medicalInfo?.smokingStatus || '');
        setAlcoholConsumption(authUser.medicalInfo?.alcoholConsumption || '');
        setExerciseFrequency(authUser.medicalInfo?.exerciseFrequency || '');
        setDietaryRestrictions(authUser.medicalInfo?.dietaryRestrictions || '');
        setAdditionalNotes(authUser.medicalInfo?.additionalNotes || '');
    };

    const handleProfilePicClick = () => {
        fileInputRef.current?.click();
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePic(reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex flex-col items-center border-t-2 mx-5 border-gray-100 py-5 max-h-full overflow-y-scroll">
            {/* Top part, profile pic on left, personal/contact info on right */}
            <div className="flex flex-row w-full">
                {/* Profile pic & displaying fullname and email */}
                <div className="flex flex-col w-[30%] items-center py-5">
                    <div
                        className="relative size-55 rounded-full flex items-center justify-center hover:bg-blue-300 hover:cursor-pointer"
                        onClick={handleProfilePicClick}
                    >
                        <img
                            className="size-[95%] rounded-full"
                            src={profilePic}
                            alt="Profile"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePicChange}
                            accept="image/*"
                            className="hidden"
                        />

                        {/* Reset button that appears when profile pic is changed */}
                        {profilePic !== authUser.profilePic && (
                            <button
                                className="absolute bottom-2 right-10 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-center text-white font-bold hover:bg-red-600 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setProfilePic(authUser.profilePic);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                            >
                                <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="text-white"
                                >
                                    <path
                                        d="M1 1L13 13M13 1L1 13"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    <p className="text-5xl font-medium mt-3 text-gray-900 text-center">
                        {authUser.firstName + ' ' + authUser.lastName}
                    </p>
                    <p className="text-md mt-5 text-gray-700 text-center">
                        {authUser.email}
                    </p>
                    <span className={`text-md ${(authUser.userType == "Patient") ? "bg-[#DFF9FA]" : (authUser.userType == "Doctor") ? "bg-[#FFE1E1]" : "bg-[#D6DCFF]"} px-2 rounded-sm mt-4`}>
                        {authUser.userType}
                    </span>
                </div>

                {/* personal/contact info */}
                <div className="flex flex-col w-[70%] space-y-4 p-5">
                    {/* First name and Last name */}
                    <div className="flex flex-row space-x-4">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-1">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-1">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Contact and Emergency Contact */}
                    <div className="flex flex-row space-x-4 mt-3">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="contact" className="text-sm font-medium text-gray-700 mb-1">
                                Contact Number
                            </label>
                            <input
                                id="contact"
                                type="tel"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor="emContact" className="text-sm font-medium text-gray-700 mb-1">
                                Emergency Contact
                            </label>
                            <input
                                id="emContact"
                                type="tel"
                                value={emergencyContact}
                                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                                onChange={(e) => setEmergencyContact(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="flex flex-col mt-3">
                        <label htmlFor="address" className="text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows={5}
                            className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom part, medical info. Only for patients */}
            {(authUser.userType === 'Patient') &&
                (<div className="flex flex-col w-full border-t-2 border-gray-100 py-5 px-5">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical Information</h2>

                    {/* Personal Health Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-700 col-span-full">Personal Health Details</h3>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                            <select
                                value={bloodType}
                                onChange={(e) => setBloodType(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Blood Type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                value={formatDateForInput(dateOfBirth)}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                            <input
                                type="number"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Health Status */}
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-700">Health Status</h3>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Known Allergies</label>
                            <TagInput
                                tags={allergies}
                                setTags={setAllergies}
                                placeholder="Add allergy (press Enter/Tab/Comma)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Example: Peanuts, Penicillin, Latex</p>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
                            <TagInput
                                tags={chronicConditions}
                                setTags={setChronicConditions}
                                placeholder="Add condition (press Enter/Tab/Comma)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Example: Diabetes, Hypertension, Asthma</p>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                            <TagInput
                                tags={currentMedications}
                                setTags={setCurrentMedications}
                                placeholder="Add medication (press Enter/Tab/Comma)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Example: Metformin 500mg, Lisinopril 10mg</p>
                        </div>
                    </div>

                    {/* Emergency Medical Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-700 col-span-full">Emergency Medical Details</h3>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Primary Care Physician</label>
                            <input
                                type="text"
                                value={primaryPhysician}
                                onChange={(e) => setPrimaryPhysician(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Physician Contact</label>
                            <input
                                type="tel"
                                value={physicianContact}
                                onChange={(e) => setPhysicianContact(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Health Insurance Provider</label>
                            <input
                                type="text"
                                value={insuranceProvider}
                                onChange={(e) => setInsuranceProvider(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                            <input
                                type="text"
                                value={policyNumber}
                                onChange={(e) => setPolicyNumber(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Lifestyle Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-700 col-span-full">Lifestyle Factors</h3>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Smoking Status</label>
                            <select
                                value={smokingStatus}
                                onChange={(e) => setSmokingStatus(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select</option>
                                <option value="never">Never smoked</option>
                                <option value="former">Former smoker</option>
                                <option value="current">Current smoker</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Alcohol Consumption</label>
                            <select
                                value={alcoholConsumption}
                                onChange={(e) => setAlcoholConsumption(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select</option>
                                <option value="never">Never</option>
                                <option value="occasional">Occasionally</option>
                                <option value="regular">Regularly</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Exercise Frequency</label>
                            <select
                                value={exerciseFrequency}
                                onChange={(e) => setExerciseFrequency(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select</option>
                                <option value="none">None</option>
                                <option value="light">1-2 times/week</option>
                                <option value="moderate">3-4 times/week</option>
                                <option value="heavy">5+ times/week</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                            <input
                                type="text"
                                value={dietaryRestrictions}
                                onChange={(e) => setDietaryRestrictions(e.target.value)}
                                placeholder="Vegetarian, gluten-free, etc."
                                className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="flex flex-col mb-8">
                        <label className="text-sm font-medium text-gray-700 mb-1">Additional Medical Notes</label>
                        <textarea
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            rows={4}
                            placeholder="Any other important medical information"
                            className="border border-gray-300 rounded-md px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>)}

            <div className="flex flex-row items-center justify-end gap-2 self-end mr-5">
                {/* Discard Button */}
                <div className="flex justify-end">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        onClick={handleDiscard}>
                        Discard
                    </button>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirmation}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                title="Confirm Changes"
                message="Are you sure you want to save these changes to your profile?"
            />
        </div>
    );
}

export default Settings;