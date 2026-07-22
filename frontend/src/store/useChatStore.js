import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore.js';

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    searchQuery: "",
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isTyping: false,
    unreadCounts: {},
    isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

    setSearchQuery: (query) => set({ searchQuery: query }),

    clearUnread: (userId) => set((state) => ({
        unreadCounts: { ...state.unreadCounts, [userId]: 0 }
    })),

    toggleSound: () => {
        const next = !get().isSoundEnabled;
        localStorage.setItem("isSoundEnabled", next);
        set({ isSoundEnabled: next });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    setSelectedUser: (selectedUser) => {
        if (selectedUser) {
            set((state) => ({
                selectedUser,
                unreadCounts: { ...state.unreadCounts, [selectedUser._id]: 0 }
            }));
        } else {
            set({ selectedUser: null });
        }
    },

    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response?.data?.msg || "Something went wrong");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMyChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response?.data?.msg || "Something went wrong");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessagesByUserId: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
            await axiosInstance.put(`/messages/read/${userId}`);
        } catch (error) {
            toast.error(error.response?.data?.msg || "Something went wrong");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser } = get();
        const { authUser } = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
        };

        set({ messages: [...get().messages, optimisticMessage] });

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: get().messages.filter(m => m._id !== tempId).concat(res.data) });
        } catch (error) {
            set({ messages: get().messages.filter(m => m._id !== tempId) });
            toast.error(error.response?.data?.msg || "Something went wrong");
        }
    },

    deleteMessage: async (messageId) => {
        try {
            await axiosInstance.delete(`/messages/${messageId}`);
            set({ messages: get().messages.filter(m => m._id !== messageId) });
        } catch (error) {
            toast.error(error.response?.data?.msg || "Something went wrong");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            const isFromSelectedUser = newMessage.senderId === get().selectedUser?._id;

            if (isFromSelectedUser) {
                set({ messages: [...get().messages, newMessage] });
            } else {
                set((state) => ({
                    unreadCounts: {
                        ...state.unreadCounts,
                        [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1
                    }
                }));
            }

            if (get().isSoundEnabled) {
                const sound = new Audio("/sounds/notification.mp3");
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        });

        socket.on("userTyping", (senderId) => {
            if (senderId === get().selectedUser?._id) {
                set({ isTyping: true });
            }
        });

        socket.on("userStopTyping", (senderId) => {
            if (senderId === get().selectedUser?._id) {
                set({ isTyping: false });
            }
        });

        socket.on("messagesRead", ({ by }) => {
            if (by === get().selectedUser?._id) {
                set({
                    messages: get().messages.map(msg =>
                        msg.senderId !== get().selectedUser?._id ? { ...msg, read: true } : msg
                    )
                });
            }
        });
        socket.on("messageDeleted", (messageId) => {
            set({ messages: get().messages.filter(m => m._id !== messageId) });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("userTyping");
        socket?.off("userStopTyping");
        socket?.off("messagesRead");
        socket?.off("messageDeleted");
    },
}));
