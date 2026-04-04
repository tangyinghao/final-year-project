import { useState, useEffect, useCallback } from 'react';
import { callGetPendingContent, callApproveContent } from '../lib/firebase';

type ContentType = 'events' | 'jobs' | 'mentorships';
type StatusFilter = 'pending' | 'approved' | 'rejected' | '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDate(ts: any): string {
  if (!ts) return '';
  const millis = ts._seconds ? ts._seconds * 1000 : ts.seconds ? ts.seconds * 1000 : 0;
  if (!millis) return '';
  return new Date(millis).toLocaleDateString();
}

function statusStyle(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function eventTypeStyle(type: string) {
  if (type === 'official') return 'bg-[#1b1c62] text-white';
  return 'bg-blue-100 text-blue-800';
}

interface ReviewProps {
  initialSelectedId?: string | null;
}

export function Review({ initialSelectedId }: ReviewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { limit: 50 };
      if (filter) params.contentType = filter;
      if (statusFilter) params.statusFilter = statusFilter;
      const res = await callGetPendingContent(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setItems((res.data as any).items || []);
    } catch (err) {
      console.error('Load content error:', err);
    }
    setLoading(false);
  }, [filter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (initialSelectedId && items.length > 0) {
      const match = items.find(i => i.id === initialSelectedId);
      if (match) setSelectedItem(match);
    }
  }, [initialSelectedId, items]);

  const handleAction = async (item: { id: string; _collection: string }, action: 'approve' | 'reject') => {
    setActionLoading(item.id);
    try {
      const contentTypeMap: Record<string, string> = {
        events: 'event',
        jobs: 'job',
        mentorships: 'mentorship',
      };
      await callApproveContent({
        contentType: contentTypeMap[item._collection],
        contentId: item.id,
        action,
      });
      // Update status in list instead of removing
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
      if (selectedItem?.id === item.id) {
        setSelectedItem((prev: typeof selectedItem) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Action error:', err);
      alert('Action failed. Please try again.');
    }
    setActionLoading(null);
  };

  const collectionLabel = (coll: string) => {
    if (coll === 'events') return 'Event';
    if (coll === 'jobs') return 'Job';
    if (coll === 'mentorships') return 'Mentorship';
    return coll;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderDetailFields = (item: any) => {
    const fields: { label: string; value: string | undefined | null }[] = [];

    // Common fields
    fields.push({ label: 'Description', value: item.description });

    if (item._collection === 'events') {
      fields.push({ label: 'Location', value: item.location });
      fields.push({ label: 'Event Date', value: formatDate(item.date) });
      if (item.maxCapacity) fields.push({ label: 'Max Capacity', value: String(item.maxCapacity) });
      if (item.attendeeCount != null) fields.push({ label: 'Attendees', value: String(item.attendeeCount) });
    }

    if (item._collection === 'jobs') {
      fields.push({ label: 'Company', value: item.company });
      fields.push({ label: 'Location', value: item.location });
      if (item.tags?.length) fields.push({ label: 'Tags', value: item.tags.join(', ') });
    }

    if (item._collection === 'mentorships') {
      fields.push({ label: 'Mentor', value: item.mentorName });
      if (item.expertise) fields.push({ label: 'Expertise', value: item.expertise });
      if (item.availability) fields.push({ label: 'Availability', value: item.availability });
    }

    return fields;
  };

  return (
    <div className="flex h-full gap-6">
      {/* Main Table */}
      <div className={`${selectedItem ? 'flex-1' : 'w-full'} bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col`}>
        <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
          <div>
            <h2 className="text-[#333333] font-bold text-xl mb-1">Content Management</h2>
            <p className="text-sm text-[#8e8e93]">Click an item to review its details before taking action.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-[#f6f6f6] text-[#333333] px-4 py-2 rounded-xl text-sm font-medium border border-[#e5e5ea] outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as ContentType | '')}
              className="bg-[#f6f6f6] text-[#333333] px-4 py-2 rounded-xl text-sm font-medium border border-[#e5e5ea] outline-none"
            >
              <option value="">All Types</option>
              <option value="events">Events</option>
              <option value="jobs">Jobs</option>
              <option value="mentorships">Mentorships</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-12 text-center text-[#8e8e93]">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-[#8e8e93]">No content found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f6f6f6] border-b border-[#e5e5ea] sticky top-0 z-10">
                  <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5ea]">
                {items.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-100/60' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium w-fit">
                          {collectionLabel(item._collection)}
                        </span>
                        {item._collection === 'events' && item.type && (
                          <span className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${eventTypeStyle(item.type)}`}>
                            {item.type === 'official' ? 'Official' : 'User-Created'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#333333]">{item.title}</td>
                    <td className="px-6 py-4 text-[#666666]">{item.creatorName || item.posterName || item.mentorName || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8e8e93] text-sm">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                        className="text-[#1b1c62] font-medium hover:underline text-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <div className="w-[420px] bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col">
          <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
            <div>
              <h3 className="font-bold text-[#333333]">Content Review</h3>
              <p className="text-xs text-[#8e8e93] mt-0.5">Review details before taking action</p>
            </div>
            <button onClick={() => setSelectedItem(null)} className="text-[#8e8e93] hover:text-[#333333]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-auto">
            {/* Title & Type */}
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Title</p>
              <p className="text-sm text-[#333333] font-semibold">{selectedItem.title}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium">
                {collectionLabel(selectedItem._collection)}
              </span>
              {selectedItem._collection === 'events' && selectedItem.type && (
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${eventTypeStyle(selectedItem.type)}`}>
                  {selectedItem.type === 'official' ? 'Official' : 'User-Created'}
                </span>
              )}
              <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyle(selectedItem.status)}`}>
                {selectedItem.status}
              </span>
            </div>

            {/* Submitted by */}
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Submitted By</p>
              <p className="text-sm text-[#333333]">{selectedItem.creatorName || selectedItem.posterName || selectedItem.mentorName || 'Unknown'}</p>
            </div>

            {/* Submitted date */}
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Submitted</p>
              <p className="text-sm text-[#333333]">{formatDate(selectedItem.createdAt)}</p>
            </div>

            {/* Dynamic content fields */}
            {renderDetailFields(selectedItem).map(({ label, value }) => value ? (
              <div key={label}>
                <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">{label}</p>
                <p className="text-sm text-[#333333] whitespace-pre-wrap">{value}</p>
              </div>
            ) : null)}

            {/* Cover image for events */}
            {selectedItem.coverImage && (
              <div>
                <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Cover Image</p>
                <img
                  src={selectedItem.coverImage}
                  alt="Cover"
                  className="w-full h-40 object-cover rounded-lg border border-[#e5e5ea]"
                />
              </div>
            )}
          </div>

          {/* Actions — only for pending content */}
          {selectedItem.status === 'pending' && (
            <div className="p-6 border-t border-[#e5e5ea] space-y-2">
              <div className="flex gap-2">
                <button
                  disabled={actionLoading === selectedItem.id}
                  onClick={() => handleAction(selectedItem, 'reject')}
                  className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-[#d71440] text-white hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {actionLoading === selectedItem.id ? 'Processing...' : 'Reject'}
                </button>
                <button
                  disabled={actionLoading === selectedItem.id}
                  onClick={() => handleAction(selectedItem, 'approve')}
                  className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-[#1b1c62] text-white hover:bg-opacity-90 transition disabled:opacity-50"
                >
                  {actionLoading === selectedItem.id ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
