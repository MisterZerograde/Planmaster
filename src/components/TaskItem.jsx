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

export default function TaskItem({
  task,
  hasChildren,
  expanded,
  onExpandToggle,
  onToggle,
  onEdit,
  onDelete,
  onAddSubtask,
}) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = task.dueDate && task.dueDate < today && !task.completed

  return (
    <div className={`flex items-start gap-2 p-3 bg-white rounded-xl border shadow-sm ${
      task.completed ? 'opacity-60 border-gray-100' : isOverdue ? 'border-red-200' : 'border-gray-100'
    }`}>

      {/* Expand / collapse chevron */}
      <button
        onClick={onExpandToggle}
        className={`mt-1 w-4 h-4 flex-shrink-0 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors ${!hasChildren ? 'invisible' : ''}`}
      >
        <span className="text-xs">{expanded ? '▾' : '▸'}</span>
      </button>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {task.completed && <span className="text-white text-xs leading-none">✓</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-gray-500">{CATEGORY_ICONS[task.category] || '📌'} {task.category}</span>
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

      {/* Actions */}
      <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
        <button
          onClick={onAddSubtask}
          title="Add subtask"
          className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors text-base font-light"
        >
          +
        </button>
        <button
          onClick={() => onEdit(task)}
          className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-50 transition-colors text-xs"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors text-xs"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
