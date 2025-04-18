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
import AdminInventory from './Admin/AdminInventory.tsx'
import PatientPharmacy from './Patient/PatientPharmacy.tsx'
import PatientLabtests from './Patient/PatientLabtests.tsx'
import AdminPatients from './Admin/AdminPatients.tsx'
import DoctorPatients from './Doctor/DoctorPatients.tsx'
import DoctorStats from './Doctor/DoctorStats.tsx'

import bellIcon from '/svgs/bell-icon.svg'
import Dropdown from '../components/Dropdown.tsx'
import Settings from './Settings.tsx'


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

      <div className='flex flex-col w-full'>
        <div className='flex flex-row w-full items-center p-5'>
          <span className='text-3xl flex-grow font-medium'>
            {selectedNavPage}
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
          <Route path='Appointments/*' element={userType === 'Admin' ? <AdminAppointments /> : userType === 'Doctor' ? <DoctorSchedule /> : userType === 'Patient' ? <PatientAppointments /> : <Navigate to={'/404'} replace />} />
          <Route path='Payments/*' element={userType === 'Admin' ? <AdminPayments /> : userType === 'Patient' ? <PatientPayments /> : <Navigate to={'/404'} replace />} />
          <Route path='Doctors/*' element={userType === 'Admin' ? <AdminDoctors /> : <Navigate to={'/404'} replace />} />
          <Route path='Schedule/*' element={userType === 'Admin' ? <AdminSchedule /> : <Navigate to={'/404'} replace />} />
          <Route path='Inventory/*' element={userType === 'Admin' ? <AdminInventory /> : <Navigate to={'/404'} replace />} />
          <Route path='Pharmacy/*' element={userType === 'Patient' ? <PatientPharmacy /> : <Navigate to={'/404'} replace />} />
          <Route path='Labtests/*' element={userType === 'Patient' ? <PatientLabtests /> : <Navigate to={'/404'} replace />} />
          <Route path='Stats/*' element={userType === 'Doctor' ? <DoctorStats /> : <Navigate to={'/404'} replace />} />
          <Route path='Patients/*' element={userType === 'Admin' ? <AdminPatients /> : userType === 'Doctor' ? <DoctorPatients /> : <Navigate to={'/404'} replace />} />

          <Route path='/*' element={<Navigate to={'/404'} />} />

        </Routes>
      </div>
    </div>
  )
}

export default MainPage