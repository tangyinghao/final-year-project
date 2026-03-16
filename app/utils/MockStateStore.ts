type Listener = () => void;

class MockStateStore {
  private savedItems = new Set<string>();
  private listeners = new Set<Listener>();

  getSavedItems() {
    return Array.from(this.savedItems);
  }

  isSaved(id: string) {
    return this.savedItems.has(id);
  }

  toggleSave(id: string) {
    if (this.savedItems.has(id)) {
      this.savedItems.delete(id);
    } else {
      this.savedItems.add(id);
    }
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }
}

export const mockStateStore = new MockStateStore();
