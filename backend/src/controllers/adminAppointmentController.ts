// adminAppointmentController.ts
import { Request, Response } from 'express';
import User from '../models/user.model.js';
import Appointment from '../models/appointment.model.js';
import mongoose from 'mongoose';

// Get all appointments with pagination and filtering
export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        console.log('Getting all appointments for admin...');
        
        // Step 1: Get appointments without populate
        const appointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        console.log(`Found ${appointments.length} appointments`);
        
        // Step 2: Extract patientIds and doctorIds from appointments
        const patientIds: mongoose.Types.ObjectId[] = [];
        const doctorIds: mongoose.Types.ObjectId[] = [];
        
        appointments.forEach(appointment => {
            if (appointment.patientId) patientIds.push(appointment.patientId);
            if (appointment.doctorId) doctorIds.push(appointment.doctorId);
        });
        
        console.log(`Found ${patientIds.length} patient IDs and ${doctorIds.length} doctor IDs`);
        
        // Step 3: Fetch user data for these IDs
        const patients = await User.find({ _id: { $in: patientIds } })
            .select('_id firstName lastName');
        
        const doctors = await User.find({ _id: { $in: doctorIds } })
            .select('_id firstName lastName');
        
        console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);
        
        // Step 4: Create lookup maps
        const patientMap: Record<string, { firstName: string; lastName: string; fullName: string }> = {};
        patients.forEach(patient => {
            patientMap[patient._id.toString()] = {
                firstName: patient.firstName,
                lastName: patient.lastName,
                fullName: `${patient.firstName} ${patient.lastName}`.trim()
            };
        });
        
        const doctorMap: Record<string, { firstName: string; lastName: string; fullName: string }> = {};
        doctors.forEach(doctor => {
            doctorMap[doctor._id.toString()] = {
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                fullName: `${doctor.firstName} ${doctor.lastName}`.trim()
            };
        });
        
        // Step 5: Format appointments
        const formattedAppointments = appointments.map(appointment => {
            // Get patient data
            let patientName = 'Unknown Patient';
            if (appointment.patientId) {
                const patientId = appointment.patientId.toString();
                if (patientMap[patientId]) {
                    patientName = patientMap[patientId].fullName;
                }
            }
            
            // Get doctor data
            let doctorName = 'Unknown Doctor';
            if (appointment.doctorId) {
                const doctorId = appointment.doctorId.toString();
                if (doctorMap[doctorId]) {
                    doctorName = doctorMap[doctorId].fullName;
                }
            }
            
            // Format date and time from datetime
            let date = 'No date';
            let time = 'No time';
            if (appointment.datetime) {
                const dt = new Date(appointment.datetime);
                // Format date as: YYYY-MM-DD
                date = dt.toISOString().split('T')[0];
                // Format time as: HH:MM
                time = dt.toTimeString().split(' ')[0].substring(0, 5);
            }
            
            return {
                _id: appointment._id,
                patientId: appointment.patientId,
                patientName: patientName,
                doctorId: appointment.doctorId,
                doctorName: doctorName,
                date: date,
                time: time,
                reason: appointment.description || 'No reason',
                status: appointment.status,
                createdAt: appointment.createdAt,
                updatedAt: appointment.updatedAt
            };
        });
        
        console.log(`Formatted ${formattedAppointments.length} appointments`);
        
        // Step 6: Get total count for pagination
        const total = await Appointment.countDocuments();
        
        // Step 7: Send the response
        res.status(200).json({
            success: true,
            data: formattedAppointments,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Could not retrieve appointments',
            error: (error as Error).message
        });
    }
};

// Get doctor schedules with their appointments
export const getDoctorSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
      return;
    }
    
    // Convert string dates to Date objects with proper range
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    // Get all doctors with their work schedules
    const doctors = await User.find({ 
      userType: 'Doctor',
      'doctorInfo.workSchedule': { $exists: true }
    }).select('firstName lastName profilePic doctorInfo');
    
    // Get appointments within date range
    const appointments = await Appointment.find({
      datetime: {
        $gte: start,
        $lte: end
      }
    }).populate('patientId', 'firstName lastName profilePic');
    
    // Group appointments by doctor with safer ID handling
    const doctorAppointments: { [key: string]: any[] } = {};
    appointments.forEach(appointment => {
      const doctorId = typeof appointment.doctorId === 'object' 
        ? appointment.doctorId.toString() 
        : appointment.doctorId;
      
      if (!doctorAppointments[doctorId]) {
        doctorAppointments[doctorId] = [];
      }
      doctorAppointments[doctorId].push(appointment);
    });
    
    // Create response object with doctors and their appointments
    const response = doctors.map(doctor => {
      const doctorId = doctor._id.toString();
      return {
        doctor: {
          _id: doctorId,
          name: `${doctor.firstName} ${doctor.lastName}`,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialization: doctor.doctorInfo?.specialization,
          department: doctor.doctorInfo?.department,
          profilePic: doctor.profilePic,
          workSchedule: doctor.doctorInfo?.workSchedule || []
        },
        appointments: doctorAppointments[doctorId] || []
      };
    });
    
    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error getting doctor schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve doctor schedules',
      error: (error as Error).message
    });
  }
};

// Update appointment status, time, etc.
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        console.log(`Updating appointment ${id} with status: ${status}`);
        
        // Only update the status field
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return the updated document
        );
        
        if (!updatedAppointment) {
            res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
            return;
        }
        
        // Format the response
        let patientName = 'Unknown Patient';
        let doctorName = 'Unknown Doctor';
        
        // Get patient name if possible
        if (updatedAppointment.patientId) {
            try {
                const patient = await User.findById(updatedAppointment.patientId);
                if (patient) {
                    patientName = `${patient.firstName} ${patient.lastName}`.trim();
                }
            } catch (err) {
                console.error('Error fetching patient:', err);
            }
        }
        
        // Get doctor name if possible
        if (updatedAppointment.doctorId) {
            try {
                const doctor = await User.findById(updatedAppointment.doctorId);
                if (doctor) {
                    doctorName = `${doctor.firstName} ${doctor.lastName}`.trim();
                }
            } catch (err) {
                console.error('Error fetching doctor:', err);
            }
        }
        
        // Format date and time
        let date = 'No date';
        let time = 'No time';
        if (updatedAppointment.datetime) {
            const dt = new Date(updatedAppointment.datetime);
            date = dt.toISOString().split('T')[0];
            time = dt.toTimeString().split(' ')[0].substring(0, 5);
        }
        
        const formattedAppointment = {
            _id: updatedAppointment._id,
            patientId: updatedAppointment.patientId,
            patientName,
            doctorId: updatedAppointment.doctorId,
            doctorName,
            date,
            time,
            reason: updatedAppointment.description || 'No reason',
            status: updatedAppointment.status,
            createdAt: updatedAppointment.createdAt,
            updatedAt: updatedAppointment.updatedAt
        };
        
        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: formattedAppointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Could not update appointment',
            error: (error as Error).message
        });
    }
};

// Update doctor info
export const updateDoctorInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Doctor ID
    const { department, specialization, appointmentCost, experience, isActive } = req.body;
    
    // Validate input
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
      return;
    }
    
    // Find the doctor user
    const doctorUser = await User.findById(id);
    
    if (!doctorUser) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    if (doctorUser.userType !== 'Doctor') {
      res.status(400).json({
        success: false,
        message: 'User is not a doctor'
      });
      return;
    }
    
    // Update doctor info - Using findByIdAndUpdate instead of direct assignment to avoid TS errors
    const updatedDoctor = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(department && { 'doctorInfo.department': department }),
          ...(specialization && { 'doctorInfo.specialization': specialization })
        }
      },
      { new: true }
    );
    
    if (!updatedDoctor) {
      res.status(404).json({
        success: false,
        message: 'Failed to update doctor information'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Doctor information updated successfully',
      data: {
        doctorInfo: {
          _id: updatedDoctor._id,
          name: `${updatedDoctor.firstName} ${updatedDoctor.lastName}`,
          firstName: updatedDoctor.firstName,
          lastName: updatedDoctor.lastName,
          specialization: updatedDoctor.doctorInfo?.specialization,
          department: updatedDoctor.doctorInfo?.department,
          workSchedule: updatedDoctor.doctorInfo?.workSchedule || []
        }
      }
    });
  } catch (error) {
    console.error('Error updating doctor info:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update doctor information',
      error: (error as Error).message
    });
  }
};

export const updateDoctorSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Doctor ID
    const { workSchedule } = req.body;
    
    // Validate input
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
      return;
    }
    
    if (!workSchedule || !Array.isArray(workSchedule)) {
      res.status(400).json({
        success: false,
        message: 'Valid work schedule array is required'
      });
      return;
    }
    
    // Find the doctor user
    const doctorUser = await User.findById(id);
    
    if (!doctorUser) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    if (doctorUser.userType !== 'Doctor') {
      res.status(400).json({
        success: false,
        message: 'User is not a doctor'
      });
      return;
    }
    
    // Validate each schedule item
    for (const schedule of workSchedule) {
      if (!schedule.day || typeof schedule.isWorking !== 'boolean' || 
          !schedule.startTime || !schedule.endTime || !schedule.slotDuration) {
        res.status(400).json({
          success: false,
          message: 'Each schedule must have day, isWorking, startTime, endTime, and slotDuration'
        });
        return;
      }
    }
    
    // Update doctor's schedule using mongoose update
    const updatedDoctor = await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          'doctorInfo.workSchedule': workSchedule 
        } 
      },
      { new: true }
    );
    
    if (!updatedDoctor) {
      res.status(404).json({
        success: false,
        message: 'Failed to update doctor schedule'
      });
      return;
    }
    
    // Return the updated doctor info
    res.status(200).json({
      success: true,
      message: 'Doctor schedule updated successfully',
      data: {
        doctorInfo: {
          _id: updatedDoctor._id,
          name: `${updatedDoctor.firstName} ${updatedDoctor.lastName}`,
          firstName: updatedDoctor.firstName,
          lastName: updatedDoctor.lastName,
          specialization: updatedDoctor.doctorInfo?.specialization,
          department: updatedDoctor.doctorInfo?.department,
          workSchedule: updatedDoctor.doctorInfo?.workSchedule || []
        }
      }
    });
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update doctor schedule',
      error: (error as Error).message
    });
  }
};

export const getDoctorReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Doctor User ID
    
    // Find the doctor
    const doctorUser = await User.findById(id);
    
    if (!doctorUser || doctorUser.userType !== 'Doctor') {
      res.status(404).json({
        success: false,
        message: 'Doctor information not found'
      });
      return;
    }
    
    // Use ratings instead of reviews as per your User model
    res.status(200).json({
      success: true,
      data: {
        reviews: doctorUser.doctorInfo?.ratings || [],
        averageRating: doctorUser.doctorInfo?.averageRating || 0,
        totalReviews: doctorUser.doctorInfo?.ratings?.length || 0
      }
    });
  } catch (error) {
    console.error('Error getting doctor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Could not get doctor reviews',
      error: (error as Error).message
    });
  }
};