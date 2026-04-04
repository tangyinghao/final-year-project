import { useState, useEffect, useCallback } from 'react';
import { callGetReports, callUpdateReportStatus } from '../lib/firebase';

type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

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
    case 'reviewed': return 'bg-blue-100 text-blue-800';
    case 'actioned': return 'bg-green-100 text-green-800';
    case 'dismissed': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-800';
  }
}

interface ReportsProps {
  initialSelectedId?: string | null;
}

export function Reports({ initialSelectedId }: ReportsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [cursor, setCursor] = useState<{ id: string; createdAt: number } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const load = useCallback(async (append = false) => {
    if (!append) setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { limit: 20 };
      if (statusFilter) params.statusFilter = statusFilter;
      if (append && cursor) params.lastCursor = cursor;

      const res = await callGetReports(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res.data as any;
      const newReports = data.reports || [];

      if (append) {
        setReports(prev => [...prev, ...newReports]);
      } else {
        setReports(newReports);
      }
      setCursor(data.nextCursor || null);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error('Load reports error:', err);
    }
    setLoading(false);
  }, [statusFilter, cursor]);

  // Reset and reload when filter changes
  useEffect(() => {
    setCursor(null);
    setHasMore(false);
  }, [statusFilter]);

  useEffect(() => {
    if (cursor === null) {
      load(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (initialSelectedId && reports.length > 0) {
      const match = reports.find(r => r.id === initialSelectedId);
      if (match) { setSelectedReport(match); setConfirmSuspend(false); }
    }
  }, [initialSelectedId, reports]);

  const handleSuspendUser = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await callUpdateReportStatus({ reportId, newStatus: 'actioned', suspendUser: true });
      setReports(prev =>
        prev.map(r => r.id === reportId ? { ...r, status: 'actioned' } : r)
      );
      if (selectedReport?.id === reportId) {
        setSelectedReport((prev: typeof selectedReport) => prev ? { ...prev, status: 'actioned' } : null);
      }
      setConfirmSuspend(false);
    } catch (err) {
      console.error('Suspend user error:', err);
      alert('Failed to suspend user.');
    }
    setActionLoading(null);
  };

  const handleDismiss = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await callUpdateReportStatus({ reportId, newStatus: 'dismissed' });
      setReports(prev =>
        prev.map(r => r.id === reportId ? { ...r, status: 'dismissed' } : r)
      );
      if (selectedReport?.id === reportId) {
        setSelectedReport((prev: typeof selectedReport) => prev ? { ...prev, status: 'dismissed' } : null);
      }
    } catch (err) {
      console.error('Dismiss report error:', err);
      alert('Failed to dismiss report.');
    }
    setActionLoading(null);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Main Table */}
      <div className={`${selectedReport ? 'flex-1' : 'w-full'} bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col`}>
        <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
          <div>
            <h2 className="text-[#333333] font-bold text-xl mb-1">User Reports</h2>
            <p className="text-sm text-[#8e8e93]">Manage complaints and rule violations.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ReportStatus | '')}
              className="bg-[#f6f6f6] text-[#333333] px-4 py-2 rounded-xl text-sm font-medium border border-[#e5e5ea] outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="actioned">Actioned</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-12 text-center text-[#8e8e93]">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-[#8e8e93]">No reports found.</div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f6f6f6] border-b border-[#e5e5ea] sticky top-0 z-10">
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Reported User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5ea]">
                  {reports.map(r => (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedReport?.id === r.id ? 'bg-blue-100/60' : ''}`}
                      onClick={() => { setSelectedReport(r); setConfirmSuspend(false); }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#333333] text-sm">{r.reportedUserName || 'Unknown User'}</div>
                        <div className="text-xs text-[#8e8e93] font-mono">{r.reportedUserId?.slice(0, 12)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#333333]">{r.reason}</div>
                        {r.additionalDetails && (
                          <div className="text-xs text-[#8e8e93] mt-1 truncate max-w-xs">{r.additionalDetails}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyle(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#8e8e93] text-sm">{formatDate(r.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(r); setConfirmSuspend(false); }}
                          className="text-[#1b1c62] font-medium hover:underline text-sm"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMore && (
                <div className="p-4 text-center border-t border-[#e5e5ea]">
                  <button
                    onClick={() => load(true)}
                    className="text-[#1b1c62] font-medium text-sm hover:underline"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedReport && (
        <div className="w-96 bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col">
          <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
            <h3 className="font-bold text-[#333333]">Report Details</h3>
            <button onClick={() => { setSelectedReport(null); setConfirmSuspend(false); }} className="text-[#8e8e93] hover:text-[#333333]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-auto">
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Reported User</p>
              <p className="text-sm text-[#333333] font-semibold">{selectedReport.reportedUserName || 'Unknown User'}</p>
              <p className="text-xs text-[#8e8e93] font-mono break-all mt-0.5">{selectedReport.reportedUserId}</p>
            </div>
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Reported By</p>
              <p className="text-sm text-[#333333] font-semibold">{selectedReport.reportedByName || 'Unknown User'}</p>
              <p className="text-xs text-[#8e8e93] font-mono break-all mt-0.5">{selectedReport.reportedBy}</p>
            </div>
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Reason</p>
              <p className="text-sm text-[#333333]">{selectedReport.reason}</p>
            </div>
            {selectedReport.additionalDetails && (
              <div>
                <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Additional Details</p>
                <p className="text-sm text-[#333333]">{selectedReport.additionalDetails}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Status</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyle(selectedReport.status)}`}>
                {selectedReport.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-[#8e8e93] uppercase font-semibold mb-1">Submitted</p>
              <p className="text-sm text-[#333333]">{formatDate(selectedReport.createdAt)}</p>
            </div>
          </div>
          {(selectedReport.status === 'pending' || selectedReport.status === 'reviewed') && (
            <div className="p-6 border-t border-[#e5e5ea] space-y-3">
              {confirmSuspend ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-[#333333] font-medium">
                    Suspend <span className="font-bold">{selectedReport.reportedUserName || 'this user'}</span>?
                  </p>
                  <p className="text-xs text-[#8e8e93]">This will prevent the user from accessing the platform.</p>
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading === selectedReport.id}
                      onClick={() => setConfirmSuspend(false)}
                      className="flex-1 text-sm font-medium py-2 rounded-lg border border-[#e5e5ea] text-[#333333] hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={actionLoading === selectedReport.id}
                      onClick={() => handleSuspendUser(selectedReport.id)}
                      className="flex-1 text-sm font-medium py-2 rounded-lg bg-[#d71440] text-white hover:bg-opacity-90 transition disabled:opacity-50"
                    >
                      {actionLoading === selectedReport.id ? 'Suspending...' : 'Confirm Suspend'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    disabled={actionLoading === selectedReport.id}
                    onClick={() => setConfirmSuspend(true)}
                    className="flex-1 text-sm font-medium py-2.5 rounded-lg bg-[#d71440] text-white hover:bg-opacity-90 transition disabled:opacity-50"
                  >
                    Suspend User
                  </button>
                  <button
                    disabled={actionLoading === selectedReport.id}
                    onClick={() => handleDismiss(selectedReport.id)}
                    className="flex-1 text-sm font-medium py-2.5 rounded-lg border border-[#e5e5ea] text-[#8e8e93] hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    {actionLoading === selectedReport.id ? 'Dismissing...' : 'Dismiss'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
