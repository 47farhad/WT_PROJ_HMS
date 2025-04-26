import { useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore";

import toast from "react-hot-toast";

function MessageInput() {

    const [text, setText] = useState("");
    const [imagePre, setImagePre] = useState(null);
    const [disableSend, setDisableSend] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePre(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePre(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        console.log("mm")
        if (!text.trim() && !imagePre) return;

        try {
            setDisableSend(true);
            await sendMessage({
                text: text.trim(),
                image: imagePre,
            });

            // Clear form
            setText("");
            setImagePre(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setDisableSend(false);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="w-[95%] mb-5 py-1 bg-white rounded-3xl flex justify-center items-center relative">
            {imagePre && (
                <div className="absolute -top-32 left-2 mb-3 flex items-center gap-2 z-10">
                    <div className="relative">
                        <img
                            src={imagePre}
                            alt="Preview"
                            className="size-30 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            className="absolute top-1 right-0 w-5 h-5 rounded-full bg-[#243956] flex items-center justify-center text-white"
                            type="button"
                        >
                            x
                        </button>
                    </div>
                </div>
            )}

            <form className="w-full mx-2 flex items-center p-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 h-10 px-3 py-2 border-0 focus:outline-none focus:ring-0 text-lg"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </label>

                <button
                    type="submit"
                    disabled={!text.trim() && !imagePre || disableSend}
                    className={`p-2 ml-2 rounded-full ${((text.trim() || imagePre) && !disableSend) ? 'bg-[#243956] text-white' : 'bg-gray-200 text-gray-400'} hover:cursor-pointer`}
                    onClick={handleSendMessage}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
        </div>
    )
}

export default MessageInput