import { useEffect, useRef, useState } from "react";
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
    const {
        messages: { data: messages, pagination },
        getMessages,
        isChatLoading,
        selectedUser
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const messageStartRef = useRef(null);

    const [isAtTop, setIsAtTop] = useState(false);

    useEffect(() => {
        getMessages(selectedUser._id);
    }, [getMessages, selectedUser._id]);

    useEffect(() => {
        if (pagination.currentPage == 1) messageEndRef.current?.scrollIntoView();
    }, [messages]);

    useEffect(() => {
        if (isAtTop && !isChatLoading && pagination.hasMore) {
            getMessages(selectedUser._id, pagination.currentPage + 1);
        }
    }, [isAtTop, selectedUser._id, pagination.currentPage, getMessages, isChatLoading, pagination.hasMore]);

    const detectScrollTop = () => {
        if (messageStartRef.current && pagination.hasMore) {
            const { scrollTop } = messageStartRef.current;
            setIsAtTop(scrollTop <= 5);
        }
    };

    if (isChatLoading) {
        return (
            <div className="flex items-center justify-center h-full my-1 overflow-y-auto">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#243956]"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full my-1 px-4 py-2 overflow-y-auto"
            ref={messageStartRef}
            onScroll={detectScrollTop}>
            {messages.length === 0 && !isChatLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messages.map((message) => (
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