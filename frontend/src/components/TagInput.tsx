import { useState } from "react";

function TagInput ({ tags, setTags, placeholder }) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (['Enter', 'Tab', ','].includes(e.key)) {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setInputValue('');
            }
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            {
            (tags.length !== 0) &&    
            (<div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>)}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full outline-none flex items-center"
            />
        </div>
    );
};

export default TagInput;