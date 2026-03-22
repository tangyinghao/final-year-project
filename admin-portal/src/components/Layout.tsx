import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
  activeTab: 'Dashboard' | 'Review' | 'Reports' | 'Users';
  onNavigate: (tab: 'Dashboard' | 'Review' | 'Reports' | 'Users') => void;
  onLogout: () => void;
  onCreateEvent: () => void;
};

export function Layout({ children, activeTab, onNavigate, onLogout, onCreateEvent }: LayoutProps) {
  const tabs = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'Review', label: 'Review', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'Reports', label: 'Reports', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'Users', label: 'Users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
  ];

  return (
    <div className="flex h-screen w-full bg-[#f6f6f6] text-[#333333] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#e5e5ea] flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[#1b1c62]">MSCircle</h1>
            <p className="text-xs text-[#8e8e93]">Admin Portal</p>
          </div>
          <nav className="mt-4 px-4 space-y-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id as 'Dashboard' | 'Review' | 'Reports' | 'Users')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive ? 'bg-[#1b1c62] text-white' : 'text-[#8e8e93] hover:bg-[#f6f6f6] hover:text-[#1b1c62]'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          <button
            onClick={onLogout}
            className="flex items-center text-sm font-medium text-[#d71440] hover:bg-red-50 w-full px-4 py-3 border border-[#e5e5ea] rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e5e5ea] flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#333333]">{activeTab}</h2>
          <div className="flex items-center gap-4">
             {activeTab === 'Dashboard' && (
                <button
                  onClick={onCreateEvent}
                  className="bg-[#1b1c62] text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-opacity-90"
                >
                  + Create Official Event
                </button>
             )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
