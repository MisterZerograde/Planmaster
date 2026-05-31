const PRIORITY_COLORS = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
}

const CATEGORY_ICONS = {
  Work: '💼',
  Personal: '🙋',
  Health: '💪',
  Other: '📌',
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.dueDate && task.dueDate < today && !task.completed

  return (
    <div className={`flex items-start gap-3 p-4 bg-white rounded-xl border shadow-sm transition-opacity ${
      task.completed ? 'opacity-60 border-gray-100' : isOverdue ? 'border-red-200' : 'border-gray-100'
    }`}>
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {task.completed && <span className="text-white text-xs leading-none">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm">{CATEGORY_ICONS[task.category] || '📌'} {task.category}</span>
          {task.priority && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {isOverdue ? '⚠️ ' : '📅 '}
              {new Date(task.dueDate + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(task)} className="text-gray-300 hover:text-gray-500 p-1 rounded text-sm">✏️</button>
        <button onClick={() => onDelete(task.id)} className="text-gray-300 hover:text-red-400 p-1 rounded text-sm">🗑️</button>
      </div>
    </div>
  )
}
