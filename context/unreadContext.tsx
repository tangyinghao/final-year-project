import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { subscribeToChats } from '@/services/chatService';

interface UnreadContextType {
  totalUnread: number;
}

const UnreadContext = createContext<UnreadContextType>({ totalUnread: 0 });

export const UnreadProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setTotalUnread(0);
      return;
    }
    const unsub = subscribeToChats(user.uid, (chatList) => {
      let total = 0;
      chatList.forEach((chat) => {
        const count = (chat as any).unreadCount?.[user.uid] || 0;
        total += count;
      });
      setTotalUnread(total);
    });
    return unsub;
  }, [user?.uid]);

  return (
    <UnreadContext.Provider value={{ totalUnread }}>
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => useContext(UnreadContext);
