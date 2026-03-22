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

export function Review() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContentType | ''>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      // Remove from list after action
      setItems(prev => prev.filter(i => i.id !== item.id));
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

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
        <div>
          <h2 className="text-[#333333] font-bold text-xl mb-1">Content Management</h2>
          <p className="text-sm text-[#8e8e93]">Review and manage all user-submitted content.</p>
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
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
                    {item.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={actionLoading === item.id}
                          onClick={() => handleAction(item, 'reject')}
                          className="text-[#d71440] bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          disabled={actionLoading === item.id}
                          onClick={() => handleAction(item, 'approve')}
                          className="text-white bg-[#1b1c62] hover:bg-opacity-90 px-3 py-1 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                        >
                          Approve
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#8e8e93]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
