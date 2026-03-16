import { useState, useEffect } from 'react';
import { mockStateStore } from './MockStateStore';

export function useSavedItems() {
  const [savedItems, setSavedItems] = useState<string[]>(mockStateStore.getSavedItems());

  useEffect(() => {
    const handleUpdate = () => {
      setSavedItems(mockStateStore.getSavedItems());
    };
    
    const unsubscribe = mockStateStore.subscribe(handleUpdate);
    return () => {
      unsubscribe();
    };
  }, []);

  const toggleSave = (id: string) => {
    mockStateStore.toggleSave(id);
  };

  const isSaved = (id: string) => mockStateStore.isSaved(id);

  return { savedItems, toggleSave, isSaved };
}
