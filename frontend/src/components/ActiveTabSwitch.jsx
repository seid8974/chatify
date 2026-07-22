import React from 'react'
import { useChatStore } from '../store/useChatStore'

const ActiveTabSwitch = () => {
  const { activeTab, setActiveTab, setSearchQuery } = useChatStore();


  return (
    <div className='tabs tabs-boxed bg-transparent p-2 m-2'>
      <button onClick={() => { setActiveTab("chats"); setSearchQuery(""); }} className={`tab ${activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}>Chats</button>
      <button onClick={() => { setActiveTab("contacts"); setSearchQuery(""); }} className={`tab ${activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}>Contacts</button>
    </div>
  )
}

export default ActiveTabSwitch