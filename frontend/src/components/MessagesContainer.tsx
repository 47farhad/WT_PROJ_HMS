import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function MessagesContainer() {
    const { messages, getMessages, isMessagesLoading, selectedUser } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        getMessages(selectedUser._id);
    }, [getMessages, selectedUser._id]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessagesLoading) {
        return (
            <div className="flex items-center justify-center h-full my-1 overflow-y-auto">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#243956]"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full my-1 px-4 py-2 overflow-y-auto">
            {messages.length === 0 && !isMessagesLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messages.messages.map((message) => (
                    <div
                        key={message._id}
                        className={`flex mb-4 mx-[2.5%] ${message.senderId === authUser._id ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.senderId === authUser._id
                                ? "bg-[#DFF9FA] text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none"}`}
                        >
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Message content"
                                    className="rounded-lg mb-2 max-h-60 object-contain"
                                />
                            )}
                            <p className="break-words text-[#363638]">{message.text}</p>
                            <p className={`text-xs mt-1 text-[#363638]`}>
                                {formatMessageTime(message.createdAt)}
                            </p>
                        </div>
                    </div>
                ))
            )}
            <div ref={messageEndRef} />
        </div>
    );
}

export default MessagesContainer;