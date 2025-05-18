import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarEvent } from "../../store/useAdminScheduleStore";

interface AppointmentDetailsModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: (appointmentId: string, updates: any) => void;
}

function AppointmentDetailsModal({ 
  event, 
  onClose, 
  onUpdate 
}: AppointmentDetailsModalProps) {
  const [status, setStatus] = useState(event.status || "pending");
  const [description, setDescription] = useState(event.title || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.resource.appointmentId) return;
    
    onUpdate(event.resource.appointmentId, {
      status,
      description
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#243954] text-white py-3 px-6 rounded-t-lg">
          <h3 className="text-xl font-bold">Appointment Details</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Patient</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {event.patientName || "Not specified"}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Doctor</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {event.resource.doctorName || "Not specified"}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {format(event.start, "PPPP")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {format(event.start, "h:mm a")}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {format(event.end, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentDetailsModal;