import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/authContext';
import {
  getSavedItems,
  toggleSaveItem,
  isSaved as checkIsSaved,
} from '@/services/savedItemsService';

export function useSavedItems() {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<string[]>([]);

  const refreshSaved = useCallback(async () => {
    if (!user?.uid) {
      setSavedItems([]);
      return;
    }
    const items = await getSavedItems(user.uid);
    setSavedItems(items.map((i) => i.itemId));
  }, [user?.uid]);

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const toggleSave = async (id: string, itemType: 'job' | 'mentorship' = 'job') => {
    if (!user?.uid) return;
    await toggleSaveItem(user.uid, id, itemType);
    await refreshSaved();
  };

  const isSaved = (id: string) => savedItems.includes(id);

  return { savedItems, toggleSave, isSaved };
}
