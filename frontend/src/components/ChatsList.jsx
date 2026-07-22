import { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import UsersLoadingSkeleten from './UsersLoadingSkeleten'
import NoChatsFound from './NoChatsFound'
import { useAuthStore } from '../store/useAuthStore'
import { ImageIcon } from 'lucide-react'

const ChatsList = () => {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, searchQuery, unreadCounts } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleten />;
  if (chats.length === 0) return <NoChatsFound />;

  const filteredChats = chats.filter(chat =>
    chat.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {filteredChats.map((chat) => (
        <div
          key={chat._id}
          data-chat-item="true"
          className='bg-cyan-500/10 p-3 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors'
          onClick={() => setSelectedUser(chat)}
        >
          <div className='flex items-center gap-3'>
            <div className='relative shrink-0'>
              <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className='size-12 rounded-full'>
                  <img src={chat.profilePic || "/avatar.svg"} alt={chat.fullName} />
                </div>
              </div>
              {unreadCounts[chat._id] > 0 && (
                <span className='absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                  {unreadCounts[chat._id] > 9 ? "9+" : unreadCounts[chat._id]}
                </span>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between gap-1'>
                <h4 className='text-slate-200 font-medium truncate text-sm'>{chat.fullName}</h4>
                {chat.lastMessage && (
                  <span className='text-slate-500 text-xs shrink-0'>
                    {formatTime(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className='text-slate-400 text-xs truncate mt-0.5 flex items-center gap-1'>
                  {chat.lastMessage.senderId === authUser._id && <span className='text-slate-500'>You: </span>}
                  {chat.lastMessage.image && !chat.lastMessage.text && (
                    <span className='flex items-center gap-1'><ImageIcon className='w-3 h-3' /> Photo</span>
                  )}
                  {chat.lastMessage.text && <span className='truncate'>{chat.lastMessage.text}</span>}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default ChatsList
