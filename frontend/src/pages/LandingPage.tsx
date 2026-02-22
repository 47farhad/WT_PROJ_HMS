import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { FaUserMd, FaUserInjured, FaUserShield, FaCode, FaServer, FaDatabase } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import Spinner from "../components/common/Spinner";

function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const { login } = useAuthStore();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.2, duration: 0.8 } }
  };

  const popUp = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, duration: 0.6 } }
  };

  // Roles with credentials for direct login
  const demoRoles = [
    {
      id: 'admin',
      title: "Admin Portal",
      email: "admin@email.com",
      pass: "12345678",
      icon: <FaUserShield className="text-5xl text-[#243954] mb-4" />,
      desc: "Manage users, view system analytics, and oversee all hospital operations.",
      color: "border-blue-500"
    },
    {
      id: 'doctor',
      title: "Doctor Dashboard",
      email: "doctor1@email.com",
      pass: "12345678",
      icon: <FaUserMd className="text-5xl text-[#243954] mb-4" />,
      desc: "Manage appointments, view patient histories, and update medical records.",
      color: "border-green-500"
    },
    {
      id: 'patient',
      title: "Patient Experience",
      email: "patient1@email.com",
      pass: "12345678",
      icon: <FaUserInjured className="text-5xl text-[#243954] mb-4" />,
      desc: "Book appointments, view lab results, and handle medical payments securely.",
      color: "border-purple-500"
    }
  ];

  // Direct login handler
  const handleDirectLogin = async (email: string, pass: string, roleId: string) => {
    setLoadingRole(roleId);
    try {
      await login({ email, password: pass });
      navigate('/Dashboard');
    } catch (error) {
      console.error(`Failed to login as ${roleId}:`, error);
      setLoadingRole(null);
    }
  };

  // Technical Features
  const techFeatures = [
    {
      icon: <FaCode className="text-3xl text-white" />,
      title: "Modern Frontend",
      desc: "Built with React, styled with Tailwind CSS, and state managed by Zustand."
    },
    {
      icon: <FaServer className="text-3xl text-white" />,
      title: "Robust Backend",
      desc: "Powered by Node.js and Express with secure, JWT-authenticated REST APIs."
    },
    {
      icon: <FaDatabase className="text-3xl text-white" />,
      title: "Scalable Data",
      desc: "Utilizing MongoDB Atlas for flexible schema design and fast querying."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-['Inter'] bg-gray-50 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="w-full h-16 bg-white shadow-sm flex items-center justify-between px-6 md:px-12 z-20">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="text-2xl text-[#243954] font-['Red_Hat_Display'] font-bold tracking-tight cursor-pointer">
            MedX
          </span>
          <span className="hidden md:inline-block ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
            v1.0 • Portfolio Project
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate("/Login")}
            className="text-[#243954] font-medium hover:text-blue-700 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/Signup")}
            className="hidden md:block px-4 py-2 bg-[#243954] text-white font-medium rounded hover:bg-[#3a5a82] transition-colors"
          >
            Create Account
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-[#243954] mb-6 tracking-tight">
              Hospital Management, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Engineered for Scale.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              MedX is a full-stack academic project demonstrating role-based access control, real-time database management, and secure API architecture in a healthcare context.
            </motion.p>
          </motion.div>
        </div>

        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Demo Access Section */}
      <section className="py-16 px-6 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#243954] mb-4">Explore the Platform</h2>
            <p className="text-gray-600">Select a role below to bypass login and instantly test the interfaces.</p>
          </div>

          <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {demoRoles.map((role) => (
              <motion.div 
                key={role.id}
                variants={popUp}
                whileHover={{ y: -8 }}
                className={`bg-white rounded-2xl p-8 shadow-lg border-t-4 ${role.color} flex flex-col items-center text-center transition-all`}
              >
                {role.icon}
                <h3 className="text-2xl font-bold text-[#243954] mb-3">{role.title}</h3>
                <p className="text-gray-600 mb-8 flex-grow">{role.desc}</p>
                
                {/* Direct Login Button */}
                <button 
                  disabled={loadingRole !== null}
                  onClick={() => handleDirectLogin(role.email, role.pass, role.id)}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-[#243954] hover:bg-[#3a5a82] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loadingRole === role.id ? (
                    <>
                      <Spinner size="sm" /> Logging in...
                    </>
                  ) : (
                    `Login as ${role.title.split(' ')[0]}`
                  )}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-6 bg-[#243954]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Under the Hood</h2>
            <p className="text-blue-200">Built with modern web technologies and best practices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {techFeatures.map((tech, i) => (
              <div key={i} className="bg-[#2c4463] p-6 rounded-xl border border-[#3a5a82]">
                <div className="bg-[#3a5a82] w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-inner">
                  {tech.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tech.title}</h3>
                <p className="text-blue-100/80 leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="text-xl font-bold text-[#243954]">MedX</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-800 font-medium">Computer Science Capstone Project</p>
            <p className="text-sm text-gray-500 mt-1">
              Developed by Ayesha Arshad, Farhad Khan, and Humna Tariq © 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;