import searchIcon from "/svgs/search-icon.svg"
import ChatCard from "../components/ChatCard"
import { useChatStore } from "../store/useChatStore"
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function Messages() {

    const { getUsers, isUsersLoading, selectedUser, setSelectedUser, users, getMessages, messages } = useChatStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        getUsers();
        getMessages(authUser._id);
    }, [getUsers, getMessages]);

    return (
        <div className="flex flex-row items-center w-full h-full mb-5">

                <div className="border-2 rounded-2xl border-[#f0f0f0] h-full w-150 m-4 flex flex-col items-center p-3">
                    <div className="w-full h-14 bg-[#f0f0f0] rounded-xl m-5 flex flex-row items-center">
                        <img src={searchIcon} className="w-8 h-8 m-2" />
                        <input
                            type="text"
                            className="flex-1 bg-transparent outline-none border-none h-full mr-5"
                            placeholder="Search..."
                        />
                    </div>

                    {
                        users.map((user) => (
                            <ChatCard key={user._id}
                                username={user.firstName + ' ' + user.lastName}
                                time="09:30 AM"
                                chat={messages.at(-1)}
                                notif={3}
                                profilePicture={user.profilePic} />
                        ))
                    }
                </div>

            <div className="flex flex-col h-full w-full mr-5 rounded-2xl bg-[#f0f0f0]">
                <div>

                </div>

                <div>

                </div>

                <div>

                </div>
            </div>
        </div>
    )
}

export default Messages