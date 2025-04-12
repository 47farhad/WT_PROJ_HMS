import { useAuthStore } from "../store/useAuthStore";
import Logo from "./Logo";
import NavbarItem from "./NavbarItem";

const dashIcon = "/svgs/dash-icon.svg";
const dashIconH = "/svgs/dash-icon-h.svg";
const chatIcon = "/svgs/chat-icon.svg";
const chatIconH = "/svgs/chat-icon-h.svg";
const appointmentIcon = "/svgs/appointment-icon.svg"
const appointmentIconH = "/svgs/appointment-icon-h.svg"
const paymentIcon = "/svgs/payment-icon.svg"
const paymentIconH = "/svgs/payment-icon-h.svg"

function Navbar() {

    const { authUser } = useAuthStore();
    const userType = authUser.userType;

    return (
        <div className="bg-[#F5F5F5] w-0 h-screen md:w-30 lg:w-60 flex flex-col gap-2">
            {/* Logo with text */}
            <div className="mt-6 flex flex-row items-center gap-3 mb-6 p-2 ml-1">
                <Logo size={50} />
                <span className="text-5xl text-[#243954] font-['Red_Hat_Display'] font-bold">
                    MedX
                </span> <br />
            </div>

            {/* Everything on the Navbar. Conditionally rendered depending on user type */}
            <NavbarItem imageURI={dashIcon} imageURIH={dashIconH} text="Dashboard"/>
            <NavbarItem imageURI={appointmentIcon} imageURIH={appointmentIconH} text="Appointments"/>
            {(userType === 'Patient' || userType === 'Admin') && (<NavbarItem imageURI={paymentIcon} imageURIH={paymentIconH} text="Payments"/>)}
            {(userType === 'Admin') && (<NavbarItem imageURI={''} imageURIH={''} text="Doctors"/>)}
            {(userType === 'Admin') && (<NavbarItem imageURI={''} imageURIH={''} text="Schedule"/>)}
            {(userType === 'Admin') && (<NavbarItem imageURI={''} imageURIH={''} text="Inventory"/>)}
            {(userType === 'Patient') && (<NavbarItem imageURI={''} imageURIH={''} text="Pharmacy"/>)}
            {(userType === 'Patient') && (<NavbarItem imageURI={''} imageURIH={''} text="Labtests"/>)}
            {(userType === 'Doctor' || userType === 'Admin') && (<NavbarItem imageURI={''} imageURIH={''} text="Patients"/>)}
            <NavbarItem imageURI={chatIcon} imageURIH={chatIconH} text="Messages"/>
            {(userType === 'Doctor') && (<NavbarItem imageURI={''} imageURIH={''} text="Stats"/>)}
        </div>
    )
}

export default Navbar;