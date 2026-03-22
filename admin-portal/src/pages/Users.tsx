import { useState, useEffect, useCallback } from 'react';
import { callGetUsers, callSuspendUser } from '../lib/firebase';

type RoleFilter = 'student' | 'alumni' | 'admin' | '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDate(ts: any): string {
  if (!ts) return '';
  const millis = ts._seconds ? ts._seconds * 1000 : ts.seconds ? ts.seconds * 1000 : 0;
  if (!millis) return '';
  return new Date(millis).toLocaleDateString();
}

export function Users() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('');
  const [cursor, setCursor] = useState<{ id: string; createdAt?: number; email?: string } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (append = false) => {
    if (!append) setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = { limit: 20 };
      if (search) params.searchByEmailPrefix = search;
      else if (roleFilter) params.roleFilter = roleFilter;
      if (append && cursor) params.lastCursor = cursor;

      const res = await callGetUsers(params);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res.data as any;
      const newUsers = data.users || [];

      if (append) {
        setUsers(prev => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }
      setCursor(data.nextCursor || null);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error('Load users error:', err);
    }
    setLoading(false);
  }, [search, roleFilter, cursor]);

  // Reset on filter change
  useEffect(() => {
    setCursor(null);
    setHasMore(false);
  }, [search, roleFilter]);

  useEffect(() => {
    if (cursor === null) {
      load(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const handleSuspend = async (uid: string, suspend: boolean) => {
    if (!confirm(`Are you sure you want to ${suspend ? 'suspend' : 'unsuspend'} this user?`)) return;
    setActionLoading(uid);
    try {
      await callSuspendUser({ targetUid: uid, suspend });
      setUsers(prev =>
        prev.map(u => (u.uid || u.id) === uid ? { ...u, status: suspend ? 'suspended' : 'active' } : u)
      );
    } catch (err) {
      console.error('Suspend error:', err);
      alert('Action failed. Please try again.');
    }
    setActionLoading(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleFilter('');
    setSearch(searchInput);
  };

  const handleRoleChange = (role: RoleFilter) => {
    setSearch('');
    setSearchInput('');
    setRoleFilter(role);
  };

  const roleStyle = (role: string) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800';
    if (role === 'alumni') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 bg-white rounded-2xl border border-[#e5e5ea] shadow-sm flex flex-col">
        <div className="p-6 border-b border-[#e5e5ea] flex justify-between items-center">
          <div>
            <h2 className="text-[#333333] font-bold text-xl mb-1">Users Library</h2>
            <p className="text-sm text-[#8e8e93]">
              {loading ? 'Loading...' : `${users.length}${hasMore ? '+' : ''} users shown`}
            </p>
          </div>
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search by email..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="bg-[#f6f6f6] rounded-xl pl-10 pr-4 py-2 text-sm outline-none w-64 focus:bg-white focus:border-[#1b1c62] border border-transparent transition-colors"
              />
              <svg className="w-5 h-5 absolute left-3 top-2 text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            <select
              value={roleFilter}
              onChange={e => handleRoleChange(e.target.value as RoleFilter)}
              className="bg-[#f6f6f6] text-[#333333] px-4 py-2 rounded-xl text-sm font-medium border border-[#e5e5ea] outline-none"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admin</option>
            </select>
            {search && (
              <button
                onClick={() => { setSearch(''); setSearchInput(''); }}
                className="text-sm text-[#d71440] font-medium hover:underline px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-12 text-center text-[#8e8e93]">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-[#8e8e93]">No users found.</div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f6f6f6] border-b border-[#e5e5ea] sticky top-0 z-10">
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[#8e8e93] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5ea]">
                  {users.map(u => {
                    const uid = u.uid || u.id;
                    return (
                      <tr key={uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.profilePhoto ? (
                              <img src={u.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-[#333333]">{u.displayName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#666666] text-sm">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleStyle(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#8e8e93] text-sm">{formatDate(u.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${u.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.role !== 'admin' && (
                            u.status === 'active' ? (
                              <button
                                disabled={actionLoading === uid}
                                onClick={() => handleSuspend(uid, true)}
                                className="text-[#d71440] font-medium hover:bg-red-50 px-3 py-1 rounded-lg text-sm transition disabled:opacity-50"
                              >
                                {actionLoading === uid ? '...' : 'Suspend'}
                              </button>
                            ) : (
                              <button
                                disabled={actionLoading === uid}
                                onClick={() => handleSuspend(uid, false)}
                                className="text-[#1b1c62] font-medium hover:bg-gray-100 px-3 py-1 border border-[#e5e5ea] rounded-lg text-sm transition disabled:opacity-50"
                              >
                                {actionLoading === uid ? '...' : 'Unsuspend'}
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
    </div>
  );
}
