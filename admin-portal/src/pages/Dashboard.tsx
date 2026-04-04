import { useState, useEffect } from 'react';
import { callGetDashboardStats, callGetPendingContent, callGetReports } from '../lib/firebase';

type Tab = 'Dashboard' | 'Review' | 'Reports' | 'Users';

interface DashboardProps {
  onNavigate: (tab: Tab, selectedId?: string) => void;
}

interface Stats {
  pendingContent: number;
  unresolvedReports: number;
  activeUsers: number;
  totalEvents: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTimestamp(ts: any): string {
  if (!ts) return '';
  const millis = ts._seconds ? ts._seconds * 1000 : ts.seconds ? ts.seconds * 1000 : 0;
  if (!millis) return '';
  const diff = Date.now() - millis;
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(millis).toLocaleDateString();
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, contentRes, reportsRes] = await Promise.all([
          callGetDashboardStats({}),
          callGetPendingContent({ limit: 3 }),
          callGetReports({ limit: 3 }),
        ]);
        setStats(statsRes.data as Stats);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPendingItems((contentRes.data as any).items || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRecentReports((reportsRes.data as any).reports || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const statCards: { label: string; value: number; isAlert: boolean; navigateTo?: Tab }[] = [
    { label: 'Pending Content', value: stats?.pendingContent ?? 0, isAlert: true, navigateTo: 'Review' },
    { label: 'Unresolved Reports', value: stats?.unresolvedReports ?? 0, isAlert: true, navigateTo: 'Reports' },
    { label: 'Active Users', value: stats?.activeUsers ?? 0, isAlert: false, navigateTo: 'Users' },
    { label: 'Total Events', value: stats?.totalEvents ?? 0, isAlert: false },
  ];

  const collectionLabel = (coll: string) => {
    if (coll === 'events') return 'Event';
    if (coll === 'jobs') return 'Job';
    if (coll === 'mentorships') return 'Mentorship';
    return coll;
  };

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(stat => (
          <div
            key={stat.label}
            onClick={() => stat.navigateTo && onNavigate(stat.navigateTo)}
            className={`bg-white p-6 rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col ${stat.navigateTo ? 'cursor-pointer hover:border-[#1b1c62] transition-colors' : ''}`}
          >
            <h3 className="text-sm font-medium text-[#8e8e93] mb-2">{stat.label}</h3>
            <span className={`text-4xl font-bold ${stat.isAlert && stat.value > 0 ? 'text-[#d71440]' : 'text-[#333333]'}`}>
              {loading ? '...' : stat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Needs Review */}
        <div className="bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col">
          <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
            <h2 className="text-[#333333] font-bold text-lg">Needs Review</h2>
            <button onClick={() => onNavigate('Review')} className="text-sm text-[#1b1c62] font-medium hover:underline">View All</button>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-6 text-center text-[#8e8e93]">Loading...</div>
            ) : pendingItems.length === 0 ? (
              <div className="p-6 text-center text-[#8e8e93]">No pending content</div>
            ) : (
              pendingItems.map((item, i) => (
                <div key={item.id} onClick={() => onNavigate('Review', item.id)} className={`p-4 px-6 flex justify-between items-center ${i !== pendingItems.length - 1 ? 'border-b border-[#e5e5ea]' : ''} hover:bg-[#f6f6f6] transition-colors cursor-pointer`}>
                  <div>
                    <h4 className="font-semibold text-[#333333]">{item.title}</h4>
                    <p className="text-sm text-[#8e8e93]">
                      {collectionLabel(item._collection)} &bull; {item.creatorName || item.posterName || item.mentorName || 'Unknown'}
                    </p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col">
          <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
            <h2 className="text-[#333333] font-bold text-lg">Recent Reports</h2>
            <button onClick={() => onNavigate('Reports')} className="text-sm text-[#1b1c62] font-medium hover:underline">View All</button>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-6 text-center text-[#8e8e93]">Loading...</div>
            ) : recentReports.length === 0 ? (
              <div className="p-6 text-center text-[#8e8e93]">No reports</div>
            ) : (
              recentReports.map((r, i) => (
                <div key={r.id} onClick={() => onNavigate('Reports', r.id)} className={`p-4 px-6 flex justify-between items-center ${i !== recentReports.length - 1 ? 'border-b border-[#e5e5ea]' : ''} hover:bg-red-50 transition-colors cursor-pointer`}>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#d71440]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#333333]">{r.reportedUserName || 'Unknown User'}</h4>
                      <p className="text-sm text-[#8e8e93]">{r.reason}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#8e8e93]">{formatTimestamp(r.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
