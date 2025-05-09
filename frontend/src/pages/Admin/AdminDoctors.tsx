import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios'; 
import { format, parseISO } from 'date-fns';

// Components
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

// Types
interface Schedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  profileImage?: string;
  bio?: string;
  gender: 'male' | 'female' | 'other';
  experience: number;
  department: string;
  commissionRate: number;
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  isActive: boolean;
  isOnLeave: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  schedule?: Schedule[];
}

interface DoctorRequest {
  _id: string;
  doctorId: string;
  doctorName: string;
  type: 'leave' | 'commission_change';
  status: 'pending' | 'approved' | 'rejected';
  leaveDetails?: {
    startDate: string;
    endDate: string;
    reason: string;
  };
  commissionDetails?: {
    currentRate: number;
    requestedRate: number;
    justification: string;
  };
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility Functions
const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch (error) {
    return timeString;
  }
};

const getStatusLabel = (isActive: boolean, isOnLeave: boolean): { label: string; color: string } => {
  if (!isActive) {
    return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
  }
  if (isOnLeave) {
    return { label: 'On Leave', color: 'bg-orange-100 text-orange-800' };
  }
  return { label: 'Active', color: 'bg-green-100 text-green-800' };
};

const getDaysOfWeek = (): string[] => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
};

// Sub-components
const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <svg 
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

// Main Component
const AdminDoctors: React.FC = () => {
  // State for doctors
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for requests
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DoctorRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DoctorRequest | null>(null);
  const [requestStatus, setRequestStatus] = useState<'approved' | 'rejected' | ''>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  
  // UI state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDoctorModal, setShowDoctorModal] = useState<boolean>(false);
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('profile');
  
  // Filter state
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Available departments and specialties
  const [departments, setDepartments] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/admin/doctors');
        setDoctors(response.data.data);
        setFilteredDoctors(response.data.data);
        
        // Extract unique departments and specialties
        const uniqueDepartments = [...new Set(response.data.data.map((doc: Doctor) => doc.department))] as string[];
        const uniqueSpecialties = [...new Set(response.data.data.map((doc: Doctor) => doc.specialty))] as string[];
        
        setDepartments(uniqueDepartments);
        setSpecialties(uniqueSpecialties);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch doctors');
        setLoading(false);
      }
    };
    
    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/requests?status=pending');
        setPendingRequests(response.data.data);
      } catch (err) {
        console.error('Failed to fetch pending requests:', err);
      }
    };
    
    fetchDoctors();
    fetchPendingRequests();
  }, []);
  
  // Filter doctors based on search and filters
  useEffect(() => {
    let results = [...doctors];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.department.toLowerCase().includes(query) ||
        doctor.email.toLowerCase().includes(query)
      );
    }
    
    // Apply department filter
    if (selectedDepartment) {
      results = results.filter(doctor => doctor.department === selectedDepartment);
    }
    
    // Apply specialty filter
    if (selectedSpecialty) {
      results = results.filter(doctor => doctor.specialty === selectedSpecialty);
    }
    
    // Apply status filter
    if (selectedStatus) {
      switch (selectedStatus) {
        case 'active':
          results = results.filter(doctor => doctor.isActive && !doctor.isOnLeave);
          break;
        case 'onLeave':
          results = results.filter(doctor => doctor.isActive && doctor.isOnLeave);
          break;
        case 'inactive':
          results = results.filter(doctor => !doctor.isActive);
          break;
      }
    }
    
    setFilteredDoctors(results);
  }, [doctors, searchQuery, selectedDepartment, selectedSpecialty, selectedStatus]);
  
  // Handle doctor selection and view details
  const handleViewDoctor = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    
    try {
      const response = await axiosInstance.get(`/api/admin/requests/doctor/${doctor._id}`);
      setDoctorRequests(response.data.data);
    } catch (err) {
      console.error('Failed to fetch doctor requests:', err);
    }
    
    setShowDoctorModal(true);
    setActiveTab('profile');
  };
  
  // Handle view request details
  const handleViewRequest = (request: DoctorRequest) => {
    setSelectedRequest(request);
    setRequestStatus('');
    setAdminNotes('');
    setShowRequestModal(true);
  };
  
  // Handle request status update
  const handleUpdateRequestStatus = async () => {
    if (!selectedRequest || !requestStatus) return;
    
    try {
      await axiosInstance.patch(`/api/admin/requests/${selectedRequest._id}/status`, {
        status: requestStatus,
        adminNotes
      });
      
      // Refetch requests to update state
      const doctorResponse = await axiosInstance.get(`/api/admin/requests/doctor/${selectedRequest.doctorId}`);
      setDoctorRequests(doctorResponse.data.data);
      
      const pendingResponse = await axiosInstance.get('/api/admin/requests?status=pending');
      setPendingRequests(pendingResponse.data.data);
      
      // If request was approved, update doctor status
      if (requestStatus === 'approved') {
        // Refetch doctors to get updated status
        const doctorsResponse = await axiosInstance.get('/api/admin/doctors');
        setDoctors(doctorsResponse.data.data);
        
        // If selected doctor is the one being updated, update it
        if (selectedDoctor && selectedDoctor._id === selectedRequest.doctorId) {
          const doctorResponse = await axiosInstance.get(`/api/admin/doctors/${selectedRequest.doctorId}`);
          setSelectedDoctor(doctorResponse.data.data);
        }
      }
      
      setShowRequestModal(false);
    } catch (err) {
      setError('Failed to update request status');
    }
  };
  
  // Handle filter apply
  const handleApplyFilters = () => {
    // Filters are already applied via useEffect
  };
  
  // Handle filter reset
  const handleResetFilters = () => {
    setSelectedDepartment('');
    setSelectedSpecialty('');
    setSelectedStatus('');
    setSearchQuery('');
  };
  
  // DoctorDetailsContent component - Shows details in modal
  const DoctorDetailsContent: React.FC = () => {
    if (!selectedDoctor) return null;
    
    return (
      <div className="p-1">
        {/* Tabs */}
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
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'performance'
                ? 'border-b-2 border-[#243954] text-[#243954]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'financial'
                ? 'border-b-2 border-[#243954] text-[#243954]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('financial')}
          >
            Financial
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === 'requests'
                ? 'border-b-2 border-[#243954] text-[#243954]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
            {doctorRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full px-2 py-0.5">
                {doctorRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="max-h-[60vh] overflow-y-auto p-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-20 w-20">
                  {selectedDoctor.profileImage ? (
                    <img
                      className="h-20 w-20 rounded-full object-cover"
                      src={selectedDoctor.profileImage}
                      alt={selectedDoctor.name}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-2xl">{selectedDoctor.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedDoctor.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
                  <RatingStars rating={selectedDoctor.averageRating} />
                  <p className="text-sm text-gray-500 mt-1">
                    Joined {formatDate(selectedDoctor.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm">{selectedDoctor.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">About</h4>
                <p className="text-sm text-gray-600">{selectedDoctor.bio || 'No bio available'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Department</h4>
                  <p className="text-sm">{selectedDoctor.department}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Experience</h4>
                  <p className="text-sm">{selectedDoctor.experience} years</p>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && selectedDoctor.schedule && (
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Weekly Schedule</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="grid grid-cols-1 gap-3">
                  {getDaysOfWeek().map((day, index) => {
                    const schedule = selectedDoctor.schedule?.find(
                      s => s.day.toLowerCase() === day.toLowerCase()
                    );
                    
                    return (
                      <div key={day} className="flex justify-between items-center p-2 border-b border-gray-200 last:border-0">
                        <div className="font-medium">{day}</div>
                        <div>
                          {schedule?.isAvailable ? (
                            <div className="text-sm">
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                                Available
                              </span>
                              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                            </div>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Total Appointments</p>
                  <p className="text-2xl font-bold text-blue-900">{selectedDoctor.totalAppointments}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Average Rating</p>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-bold text-green-900 mr-2">
                      {selectedDoctor.averageRating.toFixed(1)}
                    </span>
                    <RatingStars rating={selectedDoctor.averageRating} />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">Total Reviews</p>
                  <p className="text-2xl font-bold text-purple-900">{selectedDoctor.totalReviews}</p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Current Commission Rate</p>
                  <p className="text-2xl font-bold text-green-900">{selectedDoctor.commissionRate}%</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Est. Monthly Earnings</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${(selectedDoctor.totalAppointments / 12 * 100 * (selectedDoctor.commissionRate / 100)).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Based on average appointment value of $100</p>
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {doctorRequests.length === 0 ? (
                <p className="text-sm text-gray-500">No requests found for this doctor</p>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">All Requests</h3>
                  <div className="space-y-3">
                    {doctorRequests.map((request) => (
                      <div 
                        key={request._id} 
                        className="bg-gray-50 p-3 rounded-md hover:bg-gray-100 cursor-pointer transition"
                        onClick={() => handleViewRequest(request)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium
                                ${request.type === 'leave' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}
                              >
                                {request.type === 'leave' ? 'Leave Request' : 'Commission Change'}
                              </span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium
                                ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  'bg-red-100 text-red-800'}`}
                              >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                            
                            {request.type === 'leave' && request.leaveDetails && (
                              <p className="text-sm mt-2">
                                Leave from {formatDate(request.leaveDetails.startDate)} to {formatDate(request.leaveDetails.endDate)}
                              </p>
                            )}
                            
                            {request.type === 'commission_change' && request.commissionDetails && (
                              <p className="text-sm mt-2">
                                Rate change from {request.commissionDetails.currentRate}% to {request.commissionDetails.requestedRate}%
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="mt-2 flex justify-end">
                            <button 
                              className="px-3 py-1 bg-[#243954] text-white text-xs rounded-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRequest(request);
                              }}
                            >
                              Review Request
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // RequestModalContent component - Shows request details and action buttons
  const RequestModalContent: React.FC = () => {
    if (!selectedRequest) return null;
    
    return (
      <div className="p-4">
        <div className="mb-4">
          <h3 className="font-medium text-gray-800">
            {selectedRequest.doctorName}
          </h3>
          <p className="text-sm text-gray-500">
            Requested on {formatDate(selectedRequest.createdAt)}
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          {selectedRequest.type === 'leave' && selectedRequest.leaveDetails && (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">Leave Period</p>
              </div>
              <p className="text-sm">
                From: <span className="font-medium">{formatDate(selectedRequest.leaveDetails.startDate)}</span>
              </p>
              <p className="text-sm">
                To: <span className="font-medium">{formatDate(selectedRequest.leaveDetails.endDate)}</span>
              </p>
              <p className="text-sm mt-3">
                <span className="font-medium">Reason:</span> {selectedRequest.leaveDetails.reason}
              </p>
            </div>
          )}
          
          {selectedRequest.type === 'commission_change' && selectedRequest.commissionDetails && (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">Commission Change</p>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-600">{selectedRequest.commissionDetails.currentRate}%</span>
                <svg className="w-5 h-5 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="text-sm font-medium text-green-600">{selectedRequest.commissionDetails.requestedRate}%</span>
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                  +{selectedRequest.commissionDetails.requestedRate - selectedRequest.commissionDetails.currentRate}%
                </span>
              </div>
              <p className="text-sm mt-3">
                <span className="font-medium">Justification:</span> {selectedRequest.commissionDetails.justification}
              </p>
            </div>
          )}
        </div>
        
        {selectedRequest.status === 'pending' ? (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decision
              </label>
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 border rounded-md ${
                    requestStatus === 'approved'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setRequestStatus('approved')}
                >
                  Approve
                </button>
                <button
                  className={`px-4 py-2 border rounded-md ${
                    requestStatus === 'rejected'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setRequestStatus('rejected')}
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                rows={3}
                placeholder="Enter any notes or reasons for your decision..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRequestStatus}
                disabled={!requestStatus}
                className={`px-4 py-2 rounded-md text-white ${
                  !requestStatus
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#243954] hover:bg-blue-700'
                }`}
              >
                Submit Decision
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedRequest.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedRequest.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                on {formatDate(selectedRequest.updatedAt)}
              </span>
            </div>
            
            {selectedRequest.adminNotes && (
              <div>
                <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                <p className="text-sm">{selectedRequest.adminNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-[#243954] mb-4 md:mb-0">Doctor Management</h2>
          
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none w-full md:w-64"
            />
            <button
              onClick={handleApplyFilters}
              className="bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Pending Requests Summary */}
        {pendingRequests.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Pending Requests ({pendingRequests.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.slice(0, 2).map((request) => (
                <div 
                  key={request._id}
                  className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewRequest(request)}
                >
                  <div>
                    <p className="font-medium">{request.doctorName}</p>
                    <p className="text-sm text-gray-600">
                      {request.type === 'leave' ? 'Leave Request' : 'Commission Change'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Requested on {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <button className="bg-[#243954] text-white px-3 py-1 rounded text-sm">
                    Review
                  </button>
                </div>
              ))}
            </div>
            {pendingRequests.length > 2 && (
              <button 
                className="mt-3 text-[#243954] font-medium text-sm hover:underline"
                onClick={() => {
                  // Redirect to a requests view or open a modal showing all requests
                  // For now, we'll just log a message
                  console.log('View all pending requests');
                }}
              >
                View all {pendingRequests.length} pending requests
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-[#243954] mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="onLeave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#243954] text-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Specialty
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Commission
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No doctors found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => {
                    const statusInfo = getStatusLabel(doctor.isActive, doctor.isOnLeave);
                    const hasPending = pendingRequests.some(req => req.doctorId === doctor._id);
                    
                    return (
                      <tr key={doctor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {doctor.profileImage ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={doctor.profileImage}
                                  alt={doctor.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-gray-600">{doctor.name.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {doctor.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doctor.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.specialty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <RatingStars rating={doctor.averageRating} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.commissionRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          {hasPending && (
                            <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending Request
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDoctor(doctor)}
                            className="text-[#243954] hover:text-blue-700"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Doctor Details Modal */}
        {showDoctorModal && selectedDoctor && (
          <Modal
            isOpen={showDoctorModal}
            onClose={() => setShowDoctorModal(false)}
            title={selectedDoctor.name}
          >
            <DoctorDetailsContent />
          </Modal>
        )}

        {/* Request Approval Modal */}
        {showRequestModal && selectedRequest && (
          <Modal
            isOpen={showRequestModal}
            onClose={() => setShowRequestModal(false)}
            title={`${selectedRequest.type === 'leave' ? 'Leave Request' : 'Commission Change Request'}`}
          >
            <RequestModalContent />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AdminDoctors;