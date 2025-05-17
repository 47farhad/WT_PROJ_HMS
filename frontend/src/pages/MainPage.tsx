import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import { useAuthStore } from '../store/useAuthStore.ts'
import { useNavStore } from '../store/useNavStore.ts'

import Navbar from '../components/Navbar.tsx'
import Messages from './Messages.tsx'
import AdminDashboard from './Admin/AdminDashboard.tsx'
import DoctorDashboard from './Doctor/DoctorDashboard.tsx'
import PatientDashboard from './Patient/PatientDashboard.tsx'
import AdminAppointments from './Admin/AdminAppointments.tsx'
import DoctorSchedule from './Doctor/DoctorSchedule.tsx'
import PatientAppointments from './Patient/PatientAppointments.tsx'
import PatientPayments from './Patient/PatientPayments.tsx'
import AdminPayments from './Admin/AdminPayments.tsx'
import AdminDoctors from './Admin/AdminDoctors.tsx'
import AdminSchedule from './Admin/AdminSchedule.tsx'
import AdminInventory from './Admin/AdminPharmacy.tsx'
import PatientPharmacy from './Patient/PatientPharmacy.tsx'
import PatientLabtests from './Patient/PatientLabtests.tsx'
import ViewLabTests from './Patient/ViewLabTests.tsx'
import BookLabTest from './Patient/BookLabTest.tsx'
import AdminPatients from './Admin/AdminPatients.tsx'
import DoctorPatients from './Doctor/DoctorPatients.tsx'
import DoctorStats from './Doctor/DoctorStats.tsx'
import bellIcon from '/svgs/bell-icon.svg'
import Dropdown from '../components/Dropdown.tsx'
import Settings from './Settings.tsx'
import PatientAppointmentDetails from './Patient/PatientAppointmentDetails.tsx'
import DoctorAppointmentDetails from './Doctor/DoctorAppointmentDetails.tsx'
import BookAppointment from './Patient/BookAppointment.tsx'
import UpdateTransaction from './Patient/UpdateTransaction.tsx'
import AdminPatientDetails from './Admin/AdminPatientDetails.tsx'
import DoctorPatientDetails from './Doctor/DoctorPatientDetails.tsx'
import AdminLabTests from './Admin/AdminLabTests.tsx'
import PatientPharmacyCart from './Patient/PatientPharmacyCart.tsx'
import PrescriptionForm from './Doctor/PrescriptionForm.tsx'
import Notes from './Doctor/Notes.tsx'
import NotFoundButton from '../components/NotFoundButton.tsx'
import PatientOrders from './Patient/PatientOrders.tsx'
import PatientOrderDetails from './Patient/PatientOrderDetails.tsx'
import AdminBookedLabTests from './Admin/AdminBookedLabTests.tsx'

function MainPage() {

  const { authUser } = useAuthStore();
  const { selectedNavPage, setSelectedNavPage } = useNavStore();
  const navigate = useNavigate();

  const location = useLocation()
  useEffect(() => {
    setSelectedNavPage(location.pathname.split('/').filter(segment => segment !== '')[0]);

    if (!authUser) {
      navigate('/Login');
    }

  }, [setSelectedNavPage, location.pathname, authUser, navigate])

  if (!authUser) {
    // temp loading, replace this with actual when made
    return <div> Loading </div>;
  }

  const userType = authUser.userType;

  return (
    <div className='flex flex-row w-full'>
      <Navbar />

      <div className='flex flex-col w-full max-h-screen'>
        <div className='flex flex-row w-full items-center p-5'>
          <span className='text-3xl flex-grow font-medium'>
            {String(selectedNavPage)}
          </span>
          <button className='bg-[#F5F5F5] rounded-xl w-12 h-12 flex justify-center items-center hover:bg-[#dfdfdf] transition-colors duration-200 mr-3'>
            <img src={bellIcon} className="w-7 h-7" />
          </button>
          <Dropdown username={authUser.firstName + ' ' + authUser.lastName} profilePic={authUser.profilePic} />
        </div>

        <Routes>

          <Route path='Dashboard/*' element={userType === 'Admin' ? <AdminDashboard /> : userType === 'Doctor' ? <DoctorDashboard /> : <PatientDashboard />} />
          <Route path='Messages/*' element={<Messages />} />
          <Route path='Settings/*' element={<Settings />} />
          <Route path='Appointments/*' element={userType === 'Admin' ? <AdminAppointments /> : userType === 'Doctor' ? <DoctorSchedule /> : userType === 'Patient' ? <PatientAppointments /> : <NotFoundButton />} />
          <Route path='AppointmentDetails/:appointmentId' element={userType === 'Patient' ? <PatientAppointmentDetails /> : <NotFoundButton R/>} />
          <Route path='DoctorAppointmentDetails/:appointmentId' element={userType === 'Doctor' ? <DoctorAppointmentDetails /> : <NotFoundButton />} />
          <Route path="BookAppointment/:doctorId" element={userType === "Patient" ? <BookAppointment /> : <NotFoundButton />} />
          <Route path="BookLabTest/:labTestId" element={userType === "Patient" ? <BookLabTest /> :< NotFoundButton />} />
          <Route path="Cart/" element={userType === "Patient" ? <PatientPharmacyCart /> : <NotFoundButton/>} />
          <Route path='Payments/*' element={userType === 'Admin' ? <AdminPayments /> : userType === 'Patient' ? <PatientPayments /> : <NotFoundButton />} />
          <Route path='UpdateTransaction/:transactionId'element={userType === "Patient" ? <UpdateTransaction /> : <NotFoundButton />}/>
          <Route path='Doctors/*' element={userType === 'Admin' ? <AdminDoctors /> : <NotFoundButton />} />
          <Route path='Schedule/*' element={userType === 'Admin' ? <AdminSchedule /> : <NotFoundButton />} />
          <Route path='Pharmacy/*' element={userType === 'Patient' ? <PatientPharmacy /> : userType == 'Admin' ? <AdminInventory /> : <NotFoundButton />} />
          <Route path="Orders" element={userType === "Patient" ? <PatientOrders /> : <Navigate to={"/404"} replace />} />
          <Route path="Orders/:orderId" element={userType === "Patient" ? <PatientOrderDetails /> : <Navigate to={"/404"} replace />} />
          <Route path='Doctors/*' element={userType === 'Admin' ? <AdminDoctors /> : <Navigate to={'/404'} replace />} />
          <Route path='BookedTests/*' element={userType === 'Admin' ? <AdminBookedLabTests /> : <Navigate to={'/404'} replace />} />
          <Route path='ViewLabTests/*' element={userType === 'Patient' ? <ViewLabTests />  : <Navigate to={'/404'}/>} />
          <Route path='Labtests/*' element={userType === 'Patient' ? <PatientLabtests /> : userType == 'Admin' ? <AdminLabTests /> :<NotFoundButton />} />
          <Route path='Stats/*' element={userType === 'Doctor' ? <DoctorStats /> : <NotFoundButton />} />
          <Route path='notes/:appointmentId' element={userType === 'Doctor' ? <Notes /> : <NotFoundButton />} />
          <Route path='prescriptionform/:appointmentId' element={userType === 'Doctor' ? <PrescriptionForm /> : <NotFoundButton />} />
          <Route path='Patients/*' element={userType === 'Admin' ? <AdminPatients /> : userType === 'Doctor' ? <DoctorPatients /> : <NotFoundButton />} />
          <Route path='Patients/:patientId' element={userType === 'Admin' ? <AdminPatientDetails /> : userType === 'Doctor' ? <DoctorPatientDetails /> : <NotFoundButton />} />
          <Route path='/*' element={<NotFoundButton />} />

        </Routes>
      </div>
    </div>
  )
}

export default MainPage