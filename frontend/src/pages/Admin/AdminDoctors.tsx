import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios directly like in AdminDashboard.tsx
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import ScheduleEditorModal from './ScheduleEditorModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Define API base URL (matching AdminDashboard.tsx)
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Define types for our data
interface WorkScheduleItem {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface DoctorInfo {
  specialization?: string;
  department?: string;
  experience?: number;
  commission?: number;
  isAvailable?: boolean;
  workSchedule?: WorkScheduleItem[];
  averageRating?: number;
  ratings?: {
    rating: number;
    review?: string;
    date: Date;
  }[];
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePic?: string;
  doctorInfo?: DoctorInfo;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Edit form type
interface EditDoctorForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  isActive: boolean;
}

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [departments, setDepartments] = useState<string[]>([]);
  
  // Simple form state for editing
  const [editForm, setEditForm] = useState<EditDoctorForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    department: '',
    isActive: true
  });
  
  // Fetch doctors - Modified to match successful pattern from AdminDashboard
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        console.log('Fetching doctors...');
        
        // Use direct axios call with withCredentials like in AdminDashboard
        const response = await axios.get(`${API_BASE_URL}/admin/doctors`, {
          withCredentials: true
        });
        
        console.log('Doctors response:', response.data);
        
        const doctorsData = response.data.data || [];
        console.log(`Found ${doctorsData.length} doctors`);
        
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
        
        // Extract unique departments
        const uniqueDepartments = Array.from(new Set<string>(doctorsData.map((doc: Doctor) => 
          doc.doctorInfo?.department || 'Unassigned'
        )));
        setDepartments(uniqueDepartments);
      } catch (err: any) {
        console.error('Failed to fetch doctors:', err);
        setError(`Failed to fetch doctors: ${err.message || 'Unknown error'}`);
        toast.error('Failed to fetch doctors data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);
  
  // Apply filters when searchQuery, departmentFilter, or statusFilter changes
  useEffect(() => {
    let results = [...doctors];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(doctor => 
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(query) ||
        doctor.email.toLowerCase().includes(query) ||
        (doctor.doctorInfo?.specialization || '').toLowerCase().includes(query)
      );
    }
    
    // Apply department filter
    if (departmentFilter) {
      results = results.filter(doctor => 
        doctor.doctorInfo?.department === departmentFilter
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      switch (statusFilter) {
        case 'active':
          results = results.filter(doctor => doctor.isActive && !(doctor.doctorInfo?.isAvailable === false));
          break;
        case 'onLeave':
          results = results.filter(doctor => doctor.isActive && doctor.doctorInfo?.isAvailable === false);
          break;
        case 'inactive':
          results = results.filter(doctor => !doctor.isActive);
          break;
      }
    }
    
    setFilteredDoctors(results);
  }, [searchQuery, departmentFilter, statusFilter, doctors]);
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setStatusFilter('');
  };
  
  // Refresh data - Updated to match the fetch function
  const handleRefreshData = async () => {
    try {
      setLoading(true);
      console.log('Refreshing doctors data...');
      
      const response = await axios.get(`${API_BASE_URL}/admin/doctors`, {
        withCredentials: true
      });
      
      const doctorsData = response.data.data || [];
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
      
      toast.success('Data refreshed successfully');
    } catch (err: any) {
      console.error('Failed to refresh data:', err);
      setError(`Failed to refresh data: ${err.message || 'Unknown error'}`);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };
  
  // View doctor details - Updated to use direct axios
  const handleViewDoctor = async (doctorId: string) => {
    try {
      console.log(`Fetching details for doctor ID: ${doctorId}`);
      const response = await axios.get(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
        withCredentials: true
      });
      
      console.log('Doctor details response:', response.data);
      setSelectedDoctor(response.data.data);
      setShowDetailsModal(true);
    } catch (err: any) {
      console.error('Failed to load doctor details:', err);
      setError(`Failed to load doctor details: ${err.message || 'Unknown error'}`);
      toast.error('Failed to load doctor details');
    }
  };
  
  // Initialize edit form
  const handleEditDoctor = (doctor: Doctor) => {
    setEditForm({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone || '',
      specialty: doctor.doctorInfo?.specialization || '',
      department: doctor.doctorInfo?.department || '',
      isActive: doctor.isActive
    });
    setSelectedDoctor(doctor);
    setShowEditModal(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Save doctor changes - Updated to use direct axios
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;
    
    try {
      console.log(`Updating doctor ID: ${selectedDoctor._id}`, editForm);
      
      await axios.put(`${API_BASE_URL}/admin/doctors/${selectedDoctor._id}`, editForm, {
        withCredentials: true
      });
      
      // Refresh the doctors list
      const response = await axios.get(`${API_BASE_URL}/admin/doctors`, {
        withCredentials: true
      });
      
      const doctorsData = response.data.data || [];
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
      
      setShowEditModal(false);
      toast.success('Doctor updated successfully');
    } catch (err: any) {
      console.error('Failed to update doctor:', err);
      setError(`Failed to update doctor: ${err.message || 'Unknown error'}`);
      toast.error('Failed to update doctor');
    }
  };
  
  // Update doctor schedule - Updated to use direct axios
  const handleUpdateSchedule = async (doctorId: string, workSchedule: WorkScheduleItem[]) => {
    try {
      console.log(`Updating schedule for doctor ID: ${doctorId}`);
      
      await axios.put(`${API_BASE_URL}/admin/schedule/doctors/${doctorId}/workschedule`, 
        { workSchedule }, 
        { withCredentials: true }
      );
      
      setShowScheduleModal(false);
      toast.success('Schedule updated successfully');
      
      // Refresh doctor details if this is the currently selected doctor
      if (selectedDoctor && selectedDoctor._id === doctorId) {
        const response = await axios.get(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
          withCredentials: true
        });
        setSelectedDoctor(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to update schedule:', err);
      setError(`Failed to update schedule: ${err.message || 'Unknown error'}`);
      toast.error('Failed to update schedule');
    }
  };
  
  // Get status badge color
  const getStatusBadge = (isActive: boolean, isOnLeave?: boolean) => {
    if (!isActive) {
      return "bg-gray-100 text-gray-800";
    }
    if (isOnLeave) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-green-100 text-green-800";
  };
  
  // Get status label
  const getStatusLabel = (isActive: boolean, isOnLeave?: boolean) => {
    if (!isActive) {
      return "Inactive";
    }
    if (isOnLeave) {
      return "On Leave";
    }
    return "Active";
  };

  return (
    <div className="w-full p-6">
      <div className="max-w-screen-xl mx-auto">
        {/* Filters section */}
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="onLeave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Total doctors count */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-[#243954] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span className="font-medium">Total doctors: {doctors.length}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-[#243954] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            <span className="font-medium">Filtered doctors: {filteredDoctors.length}</span>
          </div>
        </div>

        {/* Debug error message for development */}
        {error && (
          <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Doctors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 flex justify-center">
              <Spinner />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No doctors found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#243954] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Specialty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doctor) => {
                    const isOnLeave = doctor.doctorInfo?.isAvailable === false;
                    
                    return (
                      <tr key={doctor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {doctor.profilePic ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={doctor.profilePic} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-[#243954] text-white flex items-center justify-center">
                                  <span>{doctor.firstName[0]}</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{doctor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doctor.doctorInfo?.specialization || 'Not set'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doctor.doctorInfo?.department || 'Not assigned'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(doctor.isActive, isOnLeave)}`}>
                            {getStatusLabel(doctor.isActive, isOnLeave)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDoctor(doctor._id)}
                            className="text-blue-600 hover:text-blue-900 mr-3 hover:underline hover:font-bold transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditDoctor(doctor)}
                            className="text-green-600 hover:text-green-900 hover:underline hover:font-bold transition-all"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Doctor Details Modal */}
        {showDetailsModal && selectedDoctor && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
          >
            <div className="p-4">
              {/* Styled tabs */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-b-2 border-[#243954] text-[#243954]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'schedule'
                      ? 'border-b-2 border-[#243954] text-[#243954]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('schedule')}
                >
                  Schedule
                </button>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-16 w-16">
                      {selectedDoctor.profilePic ? (
                        <img className="h-16 w-16 rounded-full object-cover" src={selectedDoctor.profilePic} alt="" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-[#243954] text-white flex items-center justify-center text-xl">
                          {selectedDoctor.firstName[0]}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
                      <p className="text-sm text-gray-500">{selectedDoctor.doctorInfo?.specialization || 'No specialty'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm">{selectedDoctor.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-sm">{selectedDoctor.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Department</h4>
                      <p className="text-sm">{selectedDoctor.doctorInfo?.department || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Experience</h4>
                      <p className="text-sm">{selectedDoctor.doctorInfo?.experience || 0} years</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusBadge(
                          selectedDoctor.isActive,
                          selectedDoctor.doctorInfo?.isAvailable === false
                        )
                      }`}>
                        {getStatusLabel(
                          selectedDoctor.isActive,
                          selectedDoctor.doctorInfo?.isAvailable === false
                        )}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Joined On</h4>
                      <p className="text-sm">{format(new Date(selectedDoctor.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEditDoctor(selectedDoctor)}
                      className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1a2a40] transition-colors"
                    >
                      Edit Doctor
                    </button>
                  </div>
                </div>
              )}

              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <div>
                  <div className="mb-4">
                    {selectedDoctor.doctorInfo?.workSchedule?.length ? (
                      <div className="bg-gray-50 p-4 rounded-md space-y-3">
                        {selectedDoctor.doctorInfo.workSchedule.map((schedule) => (
                          <div key={schedule.day} className="flex justify-between items-center p-2 border-b border-gray-200 last:border-0">
                            <span className="font-medium">{schedule.day}</span>
                            <span className={schedule.isWorking 
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                            }>
                              {schedule.isWorking 
                                ? `${schedule.startTime} - ${schedule.endTime}`
                                : 'Not Available'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                        No schedule set
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1a2a40] transition-colors"
                    >
                      Edit Schedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Edit Doctor Modal */}
        {showEditModal && selectedDoctor && (
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Edit Doctor"
          >
            <form onSubmit={handleSaveDoctor} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    value={editForm.specialty}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={editForm.department}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#243954] focus:ring-[#243954] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm">Active</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1a2a40] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Schedule Editor Modal */}
        {showScheduleModal && selectedDoctor && (
          <ScheduleEditorModal
            doctors={[selectedDoctor]}
            onClose={() => setShowScheduleModal(false)}
            onUpdate={handleUpdateSchedule}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;