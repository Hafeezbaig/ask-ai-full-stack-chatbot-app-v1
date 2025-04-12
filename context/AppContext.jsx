'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import axios from 'axios';
import { createContext, useEffect, useState, useMemo } from 'react';
import { useContext } from 'react';
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // ✅ Setup guest chat
  const setupGuestChat = () => {
    const guestChat = {
      _id: 'guest-chat',
      name: 'Guest Chat',
      messages: [],
    };
    setChats([guestChat]);
    setSelectedChat(guestChat);
  };

  const createNewChat = async () => {
    try {
      if (!user) return setupGuestChat(); // ✅ Allow guest to create a basic chat
      const token = await getToken();
      await axios.post('/api/chat/create', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsersChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUsersChats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/chat/get', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const validChats = data.data.filter(chat => chat && chat._id);
        validChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        setChats(validChats);
        if (validChats.length > 0) {
          setSelectedChat(validChats[0]);
        } else {
          await createNewChat();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch chats');
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setupGuestChat(); // ✅ Set up guest chat on mount if not logged in
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  }), [user, chats, selectedChat]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
