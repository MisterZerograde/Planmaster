const TABS = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'export', label: 'AI Export', icon: '🤖' },
]

export default function Navbar({ user, view, setView, onSignOut }) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">📋</div>
            <span className="font-bold text-gray-900 hidden sm:block">PlanMaster</span>
          </div>

          <div className="flex items-center gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  view === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
            <button onClick={onSignOut} className="text-xs text-gray-500 hover:text-gray-700 hidden sm:block">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
