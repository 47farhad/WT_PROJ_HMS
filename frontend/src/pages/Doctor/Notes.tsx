import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({
        title: '',
        description: ''
    });
     const navigate = useNavigate();
    const [submissionMessage, setSubmissionMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNote(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newNote.title || !newNote.description) return;

        setSubmissionMessage('Note created successfully!');
        setTimeout(() => setSubmissionMessage(''), 3000);
        setNewNote({ title: '', description: '' });
    };


    return (
        <div className="h-full w-full flex items-center justify-center overflow-y-auto" style={{zoom:"133%"}}>
            <div className="w-full max-w-2xl">
                <div className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-300">
                    <h2 className="text-2xl font-semibold text-[#243954] mb-6 text-center">
                        NOTE
                    </h2>
                    {submissionMessage && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
                            {submissionMessage}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700">
                                Condition/Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newNote.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Asthma, Hypertension"
                                className="p-3 border border-gray-300 bg-white rounded-md outline-gray-500"
                                required
                            />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={newNote.description}
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
                                className="px-6 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1a2d42] transition-colors"
                            >
                                Submit
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