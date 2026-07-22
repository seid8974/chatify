import { useState } from 'react'
import { useChatStore } from '../store/useChatStore.js'
import BorderAnimatedContainer from '../components/BorderAnimatedContainer.jsx'
import ProfileHeader from '../components/ProfileHeader.jsx'
import ActiveTabSwitch from '../components/ActiveTabSwitch.jsx'
import ChatsList from '../components/ChatsList.jsx'
import ContactList from '../components/ContactList.jsx'
import ChatContainer from '../components/ChatContainer.jsx'
import NoConversationPlaceholder from '../components/NoConversationPlaceholder.jsx'
import { Search, ArrowLeft } from 'lucide-react'

const ChatPage = () => {
  const { activeTab, selectedUser, searchQuery, setSearchQuery, setSelectedUser } = useChatStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  // on mobile, when a user is selected hide the sidebar
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMobileSidebarOpen(false);
  };

  return (
    <div className='relative w-full max-w-6xl h-[800px] md:h-[800px] h-screen'>
      {/* background blobs */}
      <div className='absolute top-0 -left-4 size-96 bg-pink-500 opacity-10 blur-[100px] pointer-events-none' />
      <div className='absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-10 blur-[100px] pointer-events-none' />

      <BorderAnimatedContainer>
        {/* LEFT SIDE — sidebar */}
        <div className={`
          ${mobileSidebarOpen ? 'flex' : 'hidden'}
          md:flex
          w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col shrink-0
        `}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className='px-4 pb-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className='w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 pl-9 pr-4 text-slate-200 placeholder:text-slate-500 text-sm outline-none focus:border-cyan-500/50'
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* wrap setSelectedUser to handle mobile sidebar */}
            <div onClick={(e) => {
              const chatItem = e.target.closest('[data-chat-item]');
              if (chatItem) setMobileSidebarOpen(false);
            }}>
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — chat area */}
        <div className={`
          ${!mobileSidebarOpen || selectedUser ? 'flex' : 'hidden'}
          md:flex
          flex-1 flex-col bg-slate-900/50 backdrop-blur-sm overflow-hidden
        `}>
          {/* mobile back button */}
          {selectedUser && (
            <button
              onClick={() => { setSelectedUser(null); setMobileSidebarOpen(true); }}
              className='md:hidden flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200 border-b border-slate-700/50'
            >
              <ArrowLeft className='w-4 h-4' />
              <span className='text-sm'>Back</span>
            </button>
          )}
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  )
}

export default ChatPage
