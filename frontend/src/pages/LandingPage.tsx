import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { FaUserMd, FaCalendarCheck, FaHeartbeat } from "react-icons/fa";
import { MdSecurity, MdOutlineHealthAndSafety } from "react-icons/md";
import { motion } from "framer-motion";

function LandingPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Enhanced animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
        duration: 0.8
      }
    }
  };

  const popUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        duration: 0.6 
      }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" 
      }
    }
  };

  const features = [
    {
      id: 1,
      icon: <FaUserMd className="text-4xl text-white" />,
      title: "Expert Doctors",
      description: "Access our network of highly qualified healthcare professionals."
    },
    {
      id: 2,
      icon: <FaCalendarCheck className="text-4xl text-white" />,
      title: "Easy Scheduling",
      description: "Book appointments online anytime, anywhere with just a few clicks."
    },
    {
      id: 3,
      icon: <MdOutlineHealthAndSafety className="text-4xl text-white" />,
      title: "Comprehensive Care",
      description: "From preventive care to specialized treatments, we cover all your needs."
    },
    {
      id: 4,
      icon: <FaHeartbeat className="text-4xl text-white" />,
      title: "Health Monitoring",
      description: "Track your health metrics and receive personalized insights."
    },
    {
      id: 5,
      icon: <MdSecurity className="text-4xl text-white" />,
      title: "Secure Records",
      description: "Your medical data is encrypted and stored with the highest security standards."
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Aisha Khan",
      role: "Patient",
      content: "MedX transformed my healthcare experience. Booking appointments is now effortless, and the doctors are truly exceptional.",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg"
    },
    {
      id: 2,
      name: "Fahad Mahmood",
      role: "Patient",
      content: "The convenience of managing all my medical needs in one place has been life-changing. Highly recommend MedX!",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Dr. Sana Ahmed",
      role: "Cardiologist",
      content: "As a doctor, I appreciate how MedX streamlines patient management and makes healthcare more accessible.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex flex-col h-screen w-full overflow-hidden">
        {/* Navbar */}
        <div className="w-screen h-10 md:h-16 bg-white flex items-center justify-between font-[Inter] z-10">
          {/* Logo */}
          <div className="flex flex-row items-center justify-center gap-3 mb-3 p-2 ml-1 mt-3">
            <Logo size={40} />
            <span className="text-4xl text-[#243954] font-['Red_Hat_Display'] font-bold hover:cursor-pointer">
              MedX
            </span>
          </div>

          <div className="text-right">
            <button
              className="mr-2 md:mr-7 h-6 md:h-11 w-12 md:w-25 text-sm md:text-xl font-semibold rounded-3xl hover:cursor-pointer text-white bg-gradient-to-r from-[#243954] to-[#3a5a82] transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md px-4"
              onClick={() => {
                navigate("/Login");
              }}
            >
              Login
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex-1 bg-gray-100 w-full relative">
          {/* Container for text, signup button and image */}
          <div className="relative z-10 flex flex-col md:flex-row items-center">
            {/* Text content */}
            <div className="w-full md:w-1/2 ml-2 mr-2 mt-10 md:ml-20 md:mr-0 md:mt-20 text-4xl md:text-7xl font-[Inter] font-semibold">
              <motion.p 
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="mb-2"
              >
                Get Better Care For
              </motion.p>
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <span>Your</span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#243954] to-[#3a5a82]">
                  Health
                </span>
              </motion.div>

              <motion.p 
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
                className="text-lg md:text-2xl mt-7 font-sans font-medium text-gray-700"
              >
                Your well-being is our priority. With expert doctors, advanced treatments
                <br />
                and compassionate support, we're here to help you heal faster and safer.
                <br />
                Join thousands of patients who trust us with their care.
              </motion.p>

              <motion.button
                variants={popUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                className="
                  font-['Inter'] font-bold text-white
                  text-xl md:text-2xl mt-8
                  px-8 py-3 rounded-full
                  bg-gradient-to-r from-[#243954] to-[#3a5a82]
                  shadow-md hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-300
                  transition-all duration-300 hover:cursor-pointer
                "
                onClick={() => {
                  navigate("/Signup");
                }}
              >
                Get Started Now
              </motion.button>
            </div>

            {/* Hero image */}
            <motion.div 
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              className="w-full md:w-1/2 p-5 md:p-0 mt-10 md:mt-0"
            >
              <img
                src="https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg"
                alt="Healthcare professionals"
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </div>

          {/* Decorative elements */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3, transition: { duration: 1.5 } }}
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#243954] to-[#3a5a82] rounded-full filter blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3, transition: { duration: 1.5, delay: 0.5 } }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#243954] to-[#3a5a82] rounded-full filter blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2"
          ></motion.div>

          {/* Gradient to white */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(to bottom, transparent 80%, white 100%)",
            }}
          />
        </div>
      </div>

      {/* Features Section */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-white py-16 px-4 md:px-20"
      >
        <motion.h2 
          variants={fadeInUp}
          className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#243954]"
        >
          Why Choose MedX
        </motion.h2>
        <motion.p 
          variants={fadeInUp}
          className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto"
        >
          We combine cutting-edge technology with compassionate care to provide you with the best healthcare experience
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={popUp}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
              className="bg-gradient-to-br from-[#243954] to-[#3a5a82] p-6 rounded-xl shadow-md text-white"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-100">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16 px-4 md:px-20">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-[#243954]">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Don't take our word for it — hear from people who have transformed their healthcare experience with MedX
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={popUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
              className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#243954]"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-[#243954] to-[#3a5a82] text-white py-14 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              variants={popUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-2">5000+</h3>
              <p className="text-gray-300">Happy Patients</p>
            </motion.div>
            <motion.div
              variants={popUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-2">100+</h3>
              <p className="text-gray-300">Skilled Doctors</p>
            </motion.div>
            <motion.div
              variants={popUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-2">25+</h3>
              <p className="text-gray-300">Medical Specialties</p>
            </motion.div>
            <motion.div
              variants={popUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-4xl md:text-5xl font-bold mb-2">98%</h3>
              <p className="text-gray-300">Satisfaction Rate</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <div className="bg-white py-16 px-4 md:px-20 text-center">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#243954]">
            Ready to Experience Better Healthcare?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of patients who trust MedX with their health journey. Sign up today and take the first step towards better care.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)" }}
              className="px-8 py-3 bg-gradient-to-r from-[#243954] to-[#3a5a82] text-white font-bold rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => {
                navigate("/Signup");
              }}
            >
              Create Account
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)" }}
              className="px-8 py-3 bg-white text-[#243954] font-bold rounded-full text-lg shadow-md border border-[#243954] hover:shadow-lg transition-all duration-300"
              onClick={() => {
                navigate("/Login");
              }}
            >
              Login
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#243954] to-[#3a5a82] text-white py-8 px-4 md:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Logo size={30} />
                <span className="text-2xl font-bold">MedX</span>
              </div>
              <p className="text-gray-300">
                Advanced healthcare at your fingertips. We're committed to providing the best care possible.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Doctors</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Appointments</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Lab Tests</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Prescriptions</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Health Records</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">Email: info@medx.com</li>
                <li className="text-gray-300">Phone: +92 51 111 222 333</li>
                <li className="text-gray-300">Address: Islamabad, Pakistan</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
            <p>Created by Ayesha Arshad, Farhad Khan and Humna Tariq © 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;