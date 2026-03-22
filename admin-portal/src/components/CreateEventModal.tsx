import { useState } from 'react';
import { callCreateOfficialEvent } from '../lib/firebase';

interface CreateEventModalProps {
  onClose: () => void;
}

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await callCreateOfficialEvent({
        title,
        description,
        date: new Date(date).getTime(),
        location,
        maxCapacity: maxCapacity ? parseInt(maxCapacity, 10) : null,
        coverImage: coverImage || null,
      });
      onClose();
    } catch (err) {
      console.error('Create event error:', err);
      setError('Failed to create event. Please check your inputs.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#333333]">Create Official Event</h2>
          <button onClick={onClose} className="text-[#8e8e93] hover:text-[#333333]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#333333] mb-1">Title *</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors text-sm"
              placeholder="e.g. EEE Industry Night 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333333] mb-1">Description *</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors text-sm resize-none"
              placeholder="Describe the event..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">Date & Time *</label>
              <input
                required
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-1">Max Capacity</label>
              <input
                type="number"
                min="1"
                value={maxCapacity}
                onChange={e => setMaxCapacity(e.target.value)}
                className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors text-sm"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333333] mb-1">Location *</label>
            <input
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors text-sm"
              placeholder="e.g. LT1, NTU North Spine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#333333] mb-1">Cover Image URL</label>
            <input
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              className="w-full bg-[#f6f6f6] border border-transparent focus:border-[#1b1c62] focus:bg-white rounded-xl px-4 py-3 outline-none transition-colors text-sm"
              placeholder="https://... (optional)"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-[#e5e5ea] text-[#333333] font-medium text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-full bg-[#1b1c62] text-white font-medium text-sm shadow-sm hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
