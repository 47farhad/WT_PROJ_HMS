import searchIcon from "/svgs/search-icon.svg"
import menuIcon from "/svgs/menu-icon.svg"
import ChatCard from "../components/ChatCard"
import { useChatStore } from "../store/useChatStore"
import { useEffect, useRef, useState } from "react";
import MessagesContainer from "../components/MessagesContainer";
import MessageInput from "../components/MessageInput";

function Messages() {

    const {
        getUsers,
        isUsersLoading,
        selectedUser,
        setSelectedUser,
        users: {
            data: users,
            pagination
        }
    } = useChatStore();

    const userEndRef = useRef(null);
    const userContainerRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(false);

    useEffect(() => {
        getUsers();
    }, [getUsers]);

    useEffect(() => {
        if (isAtBottom && !pagination.isPageLoading && pagination.hasMore) {
            getUsers(pagination.currentPage + 1);
        }
    }, [isAtBottom, pagination.currentPage, getUsers, pagination.isPageLoading, pagination.hasMore]);

    useEffect(() => {
        const container = userContainerRef.current;

        const handleScroll = () => {
            if (!container || !userEndRef.current) return;

            // Get the position of the end ref relative to the container
            const endRefPosition = userEndRef.current.getBoundingClientRect().bottom;
            const containerPosition = container.getBoundingClientRect().bottom;

            // Add a small threshold (e.g., 5px) to account for rounding differences
            const threshold = 5;
            const reachedBottom = Math.abs(endRefPosition - containerPosition) <= threshold;

            setIsAtBottom(reachedBottom);
        };

        container.addEventListener('scroll', handleScroll);

        // Initial check
        handleScroll();

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="flex flex-row items-center w-full h-full mb-5 max-h-[calc(100vh-108px)]">

            <div className="border-2 rounded-2xl border-[#f0f0f0] h-full w-150 m-4 flex flex-col items-center p-3 overflow-y-auto overflow-x-hidden" ref={userContainerRef}>
                <div className="w-full h-14 bg-[#f0f0f0] rounded-xl m-5 flex flex-row items-center">
                    <img src={searchIcon} className="w-8 h-8 m-2" />
                    <input
                        type="text"
                        className="flex-1 bg-transparent outline-none border-none h-full mr-5"
                        placeholder="Search..."
                    />
                </div>

                {
                    !isUsersLoading ?
                        (users.map((user) => {
                            const formattedTime = user.lastMessage
                                ? new Date(user.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })
                                : "";

                            return (
                                <ChatCard
                                    key={user._id}
                                    username={`${user.firstName} ${user.lastName}`}
                                    time={formattedTime}
                                    chat={user.lastMessage?.text || (user.lastMessage?.image ? 'Image' : '')}
                                    notif={0}
                                    profilePicture={user.profilePic}
                                    handleClick={() => { setSelectedUser(user) }}
                                />
                            );
                        }))
                        :
                        <div> Loading </div>
                }
                <div ref={userEndRef} className="w-full" />
            </div>

            {selectedUser ?
                (<div className="flex flex-col h-full w-full mr-5 rounded-2xl bg-[#f0f0f0] items-center">
                    <div className="w-[95%] h-25 border-b-2 border-[#e6e6e6] flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={selectedUser?.profilePic} className="w-14 h-14 rounded-full" />
                            <div>
                                <span className="font-medium text-2xl">
                                    {selectedUser?.firstName + ' ' + selectedUser?.lastName}
                                </span> <br />
                                <span className="text-xs text-gray-500">Last online {'To be implemented'}</span>
                            </div>
                        </div>

                        <button className="h-12 w-12 bg-white hover:bg-[#fafafa] rounded-2xl transition-colors font-extrabold flex items-center justify-center">
                            <img src={menuIcon} className="h-[80%] w-[60%]" />
                        </button>
                    </div>

                    <MessagesContainer />
                    <MessageInput />
                </div>)
                :
                <div className="flex flex-col h-full w-full mr-5 rounded-2xl bg-[#f0f0f0] items-center justify-center"> Select a chat </div>}
        </div>
    )
}

export default Messages