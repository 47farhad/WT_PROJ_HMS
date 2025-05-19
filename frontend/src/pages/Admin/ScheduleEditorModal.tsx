import React, { useState, useEffect } from "react";
import { Doctor, WorkScheduleItem } from "../../store/useAdminScheduleStore";

interface ScheduleEditorModalProps {
  doctors: Doctor[];
  onClose: () => void;
  onUpdate: (doctorId: string, workSchedule: WorkScheduleItem[]) => void;
}

function ScheduleEditorModal({
  doctors,
  onClose,
  onUpdate
}: ScheduleEditorModalProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctors[0]?._id || "");
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleItem[]>([]);

  // Initialize workSchedule when doctor selection changes
  useEffect(() => {
    if (!selectedDoctor) return;
    
    const doctor = doctors.find(d => d._id === selectedDoctor);
    if (!doctor) return;

    // Initialize with provided work schedule or create default schedule
    const schedule = doctor.doctorInfo?.workSchedule || [];
    
    // Ensure all days of the week are included
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const newSchedule = daysOfWeek.map(day => {
      const existingDay = schedule.find(s => s.day === day);
      return existingDay || {
        day,
        isWorking: day !== "Saturday" && day !== "Sunday", // Default: weekdays are working days
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30
      };
    });
    
    setWorkSchedule(newSchedule);
  }, [selectedDoctor, doctors]);

  // Handle schedule changes
  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updatedSchedule = [...workSchedule];
    
    if (field === "isWorking") {
      updatedSchedule[index].isWorking = !updatedSchedule[index].isWorking;
    } else {
      (updatedSchedule[index] as any)[field] = value;
    }
    
    setWorkSchedule(updatedSchedule);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    onUpdate(selectedDoctor, workSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#243954] text-white py-3 px-6 rounded-t-lg">
          <h3 className="text-xl font-bold">Edit Doctor Schedule</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="doctor-select" className="block text-sm font-medium mb-2">
              Select Doctor
            </label>
            <select
              id="doctor-select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
            >
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Weekly Schedule</h4>
            
            <div className="space-y-4">
              {workSchedule.map((schedule, index) => (
                <div key={schedule.day} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`working-${schedule.day}`}
                        checked={schedule.isWorking}
                        onChange={() => handleScheduleChange(index, "isWorking", null)}
                        className="mr-2 h-4 w-4 text-[#243954] focus:ring-[#243954] border-gray-300 rounded"
                      />
                      <label htmlFor={`working-${schedule.day}`} className="font-medium">
                        {schedule.day}
                      </label>
                    </div>
                  </div>
                  
                  {schedule.isWorking && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`start-${schedule.day}`} className="block text-sm mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id={`start-${schedule.day}`}
                          value={schedule.startTime}
                          onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#243954]"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`end-${schedule.day}`} className="block text-sm mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          id={`end-${schedule.day}`}
                          value={schedule.endTime}
                          onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#243954]"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`slot-${schedule.day}`} className="block text-sm mb-1">
                          Slot Duration (mins)
                        </label>
                        <select
                          id={`slot-${schedule.day}`}
                          value={schedule.slotDuration}
                          onChange={(e) => handleScheduleChange(index, "slotDuration", parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#243954]"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>60 minutes</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 sticky bottom-0 pt-3 bg-white border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1A2A40] transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleEditorModal;