import { useEffect, useRef, useState, useCallback } from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { axiosInstance } from '../lib/axios.js'
import MessagesLoadingSkeleton from '../components/MessagesLoadingSkeleton'
import NoChatHistoryPlaceholder from '../components/NoChatHistoryPlaceholder'
import MessageInput from '../components/MessageInput'
import ChatHeader from '../components/ChatHeader'
import ImageLightbox from './ImageLightbox'
import { Check, CheckCheck, Trash2, ChevronDown } from 'lucide-react'

const ChatContainer = () => {
  const {
    getMessagesByUserId, selectedUser, messages,
    isMessagesLoading, subscribeToMessages, unsubscribeFromMessages,
    isTyping, deleteMessage
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  // scroll to bottom on new messages only if already near bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // mark incoming messages as read in real time when chat is open
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.senderId === selectedUser._id && !lastMsg.read) {
      axiosInstance.put(`/messages/read/${selectedUser._id}`).catch(() => {});
    }
  }, [messages, selectedUser._id]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  }, []);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className='flex flex-col flex-1 overflow-hidden relative'>
      <ChatHeader />

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className='flex-1 px-6 overflow-y-auto py-8 relative'
      >
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length === 0 ? (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        ) : (
          <div className='max-w-3xl mx-auto space-y-6'>
            {messages.map(msg => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                onMouseEnter={() => setHoveredMsg(msg._id)}
                onMouseLeave={() => setHoveredMsg(null)}
              >
                <div className={`chat-bubble relative group ${msg.senderId === authUser._id
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-200"
                  }`}>
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className='rounded-lg h-48 object-cover cursor-zoom-in hover:opacity-90 transition-opacity'
                      onClick={() => setLightboxImage(msg.image)}
                    />
                  )}
                  {msg.text && <p className='mt-2'>{msg.text}</p>}
                  <p className='text-xs mt-1 opacity-75 flex items-center gap-1'>
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                    {msg.senderId === authUser._id && (
                      <span className='ml-1'>
                        {msg.read
                          ? <CheckCheck className='w-3 h-3 inline text-cyan-200' />
                          : <Check className='w-3 h-3 inline text-slate-300' />
                        }
                      </span>
                    )}
                  </p>

                  {/* delete button — only own messages, shown on hover */}
                  {msg.senderId === authUser._id && hoveredMsg === msg._id && !msg.isOptimistic && (
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className='absolute -top-3 -right-3 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-full p-1 transition-colors shadow-lg'
                      title="Delete message"
                    >
                      <Trash2 className='w-3 h-3' />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className='absolute bottom-24 right-8 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-2 shadow-lg transition-all z-10'
          title="Scroll to bottom"
        >
          <ChevronDown className='w-5 h-5' />
        </button>
      )}

      {isTyping && (
        <div className='px-6 pb-2'>
          <div className='max-w-3xl mx-auto'>
            <div className='chat chat-start'>
              <div className='chat-bubble bg-slate-800 text-slate-400 text-sm py-2 px-4'>
                <span className='flex gap-1 items-center'>
                  <span className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]' />
                  <span className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]' />
                  <span className='w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]' />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      <MessageInput />
    </div>
  )
}

export default ChatContainer
