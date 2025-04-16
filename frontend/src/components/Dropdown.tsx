import { useState, useRef, useEffect } from "react";
import arrowIcon from '/svgs/downarrow-icon.svg'
import logoutIcon from '/svgs/logout-icon.svg'
import settingsIcon from '/svgs/settings-icon.svg'
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

interface Props{
    username: string,
    profilePic: string
}

function Dropdown(p: Props) {

    const {isLoggingOut, logout} = useAuthStore();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Button */}
            <button
                className="bg-[#F5F5F5] rounded-xl pl-2 pr-2 h-12 flex justify-center items-center hover:bg-[#dfdfdf] transition-colors duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={p.profilePic} className="w-7 h-7 mr-2" />
                {p.username}
                <img src={arrowIcon} className="w-7 h-7" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 border border-gray-200 overflow-hidden">
                    <ul>
                        <li>
                            <button
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 flex flex-row items-center"
                                onClick={() => {
                                    navigate("/Settings")
                                }}
                            >
                                <img src={settingsIcon} className="w-5 h-5 mr-2" />
                                Settings
                            </button>
                        </li>
                        <li>
                            <button
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-200 text-red-500 flex flex-row items-center"
                                onClick={() => {
                                    logout();
                                }}
                                disabled={isLoggingOut}
                            >
                                <img src={logoutIcon} className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Dropdown