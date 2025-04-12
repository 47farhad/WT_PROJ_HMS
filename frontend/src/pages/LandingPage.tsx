import { useNavigate } from "react-router-dom"

import Logo from "../components/Logo"

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col overflow-hidden">
            <div className="flex flex-col h-screen w-full overflow-hidden">
                {/* Navbar, kinda */}
                <div className="w-screen h-10 md:h-16 bg-white flex items-center justify-between font-[Inter]">
                    {/* Logo */}
                    <div className="flex flex-row items-center justify-center gap-3 mb-3 p-2 ml-1 mt-3">
                        <Logo size={40} />
                        <span className="text-4xl text-[#243954] font-['Red_Hat_Display'] font-bold hover:cursor-pointer">
                            MedX
                        </span> <br />
                    </div>

                    <div className="text-right">
                        <button className="mr-2 md:mr-7 h-6 md:h-11 w-12 md:w-25 text-sm md:text-xl font-semibold rounded-3xl hover:cursor-pointer text-white bg-gradient-to-r from-indigo-500 to-blue-400 transform hover:scale-102 transition-all duration-300 shadow-sm hover:shadow-md"
                        onClick={()=>{navigate('/Login')}}>
                            Login
                        </button>
                    </div>
                </div>

                {/* Main part with text and image */}
                <div className="flex-1 bg-gray-100 w-full">

                    {/* Container for text, signup button and image */}
                    <div className="ml-2 mr-2 mt-15 md:ml-50 md:mr-50 md:mt-55 text-4xl md:text-7xl font-[Inter] font-semibold">
                        <p className="mb-2">Get Better Care For</p>
                        <span>Your</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Health</span> <br />

                        <p className="text-xl md:text-2xl mt-7 font-sans font-medium">
                            Your well-being is our priority. With expert doctors, advanced treatments<br />
                            and compassionate support, we’re here to help you heal faster and safer.<br />
                            Join thousands of patients who trust us with their care.
                        </p>

                        <button className="
                          font-['Inter'] font-bold text-white
                          text-2xl md:text-4xl mt-8
                          px-6 py-3 rounded-4xl
                          bg-gradient-to-r from-blue-600 to-teal-400
                          shadow-md hover:shadow-lg
                          transform hover:scale-105
                          focus:outline-none focus:ring-2 focus:ring-blue-300
                          transition-all duration-300 hover:cursor-pointer
                        "
                        onClick={()=>{navigate('/Signup')}}>
                            Sign Up
                        </button>

                    </div>

                    {/* Gradient to white */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(to bottom, transparent 80%, white 100%)'
                        }}
                    />
                </div>
            </div>
            <div className="bg-white-500 h-screen">

            </div>
        </div>
    )
}

export default LandingPage