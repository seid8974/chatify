import { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import UsersLoadingSkeleten from './UsersLoadingSkeleten'
import { useAuthStore } from '../store/useAuthStore';


const ContactList = () => {
  const { getAllContacts, allContacts, isUsersLoading, setSelectedUser, searchQuery } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleten />;

  const filteredContacts = allContacts.filter(contact =>
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredContacts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        {searchQuery ? `No contacts found for "${searchQuery}"` : "No contacts yet"}
      </div>
    );
  }

  return (
    <>
      {
        filteredContacts.map((contact) => {
          return <div key={contact._id} className='bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors' onClick={() => setSelectedUser(contact)}>
            <div className='flex items-center gap-3'>
              <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                <div className='size-12 rounded-full'>
                  <img src={contact.profilePic || "/avatar.svg"} alt={contact.fullName} />
                </div>
              </div>
              <h4 className='text-slate-200 font-medium'>{contact.fullName}</h4>
            </div>
          </div>
        })
      }
    </>
  )
}

export default ContactList