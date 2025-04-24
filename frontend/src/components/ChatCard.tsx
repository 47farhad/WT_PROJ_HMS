import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"

interface Props {
    username: string,
    userID: string,
    time: string,
    chat: string,
    notif: number,
    profilePicture: string,
    handleClick: () => void
}

function ChatCard(p: Props) {

    const { selectedUser } = useChatStore();
    const { onlineUsers } = useAuthStore();

    return (
        <div className={`w-full p-2 pr-4 mb-2 h-18 flex flex-row items-center ${selectedUser?._id == p.userID ? "bg-[#e7e7e7] hover:bg-[#e7e7e7]" : "hover:bg-[#eeeeee]"} rounded-2xl`}
            onClick={p.handleClick}>
            <img src={p.profilePicture} className="w-14 h-14 mr-3 rounded-full" />
            <div className='flex flex-col w-full h-full'>
                <div className='w-full h-[50%] flex justify-between items-center'>
                    <span className='text-xl font-medium flex flex-row items-center gap-2'>
                        {p.username}
                        {(onlineUsers.includes(p.userID)) && (<div className="w-4 h-4 rounded-full bg-[#66d973]"/>)}
                    </span>
                    <span className='text-[#ff9d9e]'>
                        {p.time}
                    </span>
                </div>
                <div className='w-full h-[50%] flex justify-between items-center'>
                    <span className='text-[#8f8f8f] truncate max-w-[280px]'>
                        {p.chat}
                    </span>
                    {(p.notif != 0) && (
                        <div className='w-6 h-6 rounded-full bg-[#FC4245] text-white flex items-center justify-center text-sm flex-shrink-0 ml-2'>
                            {p.notif}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChatCard