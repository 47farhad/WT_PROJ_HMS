interface Props {
    username: string,
    time: string,
    chat: string,
    notif: number,
    profilePicture: string
}

function ChatCard(p: Props) {
    return (
        <div className="w-full p-2 pr-4 h-18 flex flex-row items-center hover:bg-[#eeeeee] rounded-2xl">
            <img src={p.profilePicture} className="w-14 h-14 mr-3 rounded-full" />
            <div className='flex flex-col w-full h-full'>
                <div className='w-full h-[50%] flex justify-between items-center'>
                    <span className='text-xl font-medium'>
                        {p.username}
                    </span>
                    <span className='text-[#ff9d9e]'>
                        {p.time}
                    </span>
                </div>
                <div className='w-full h-[50%] flex justify-between items-center'>
                    <span className='text-[#8f8f8f] truncate max-w-[172px]'>
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