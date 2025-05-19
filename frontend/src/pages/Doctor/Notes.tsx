import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotesStore } from '../../store/useNotesStore'; 
import { toast } from 'react-hot-toast';

const Notes = () => {
    const [newNote, setNewNote] = useState({
        header: '', 
        text: ''    
    });
    const navigate = useNavigate();
    const { appointmentId } = useParams(); // Get appointmentId from URL
    const { createNotes, isCreatingNotes } = useNotesStore();
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNote(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!newNote.header || !newNote.text) {
            toast.error('Both header and text are required');
            return;
        }

        if (!appointmentId) {
            toast.error('No appointment specified');
            return;
        }

        try {
            await createNotes(appointmentId, {
                header: newNote.header,
                text: newNote.text
            });
            
            // Reset form after successful submission
            setNewNote({ header: '', text: '' });
            
            // Optionally navigate away or show success message
            toast.success('Note created successfully!');
            // navigate(-1); // Uncomment if you want to go back after creation
        } catch (error) {
            // Error handling is already done in the store
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center overflow-y-auto" style={{zoom:"133%"}}>
            <div className="w-full max-w-2xl">
                <div className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-300">
                    <h2 className="text-2xl font-semibold text-[#243954] mb-6 text-center">
                        NOTE
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="header" className="text-sm font-medium text-gray-700">
                                Condition/Title
                            </label>
                            <input
                                type="text"
                                id="header"
                                name="header"
                                value={newNote.header}
                                onChange={handleInputChange}
                                placeholder="e.g. Asthma, Hypertension"
                                className="p-3 border border-gray-300 bg-white rounded-md outline-gray-500"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label htmlFor="text" className="text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                id="text"
                                name="text"
                                value={newNote.text}
                                onChange={handleInputChange}
                                placeholder="Enter your notes here..."
                                rows="6"
                                className="p-3 border border-gray-300 bg-white rounded-md outline-gray-500"
                                required
                            />
                        </div>

                        <div className="flex space-x-4 justify-center">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1a2d42] transition-colors disabled:opacity-50"
                                disabled={isCreatingNotes}
                            >
                                {isCreatingNotes ? 'Creating...' : 'Submit'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 text-[#243954] bg-[#e0f2fe] rounded-md hover:bg-sky-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Notes;