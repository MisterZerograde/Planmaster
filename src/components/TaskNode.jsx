import { useState } from 'react'
import TaskItem from './TaskItem'

export default function TaskNode({ task, allTasks, onToggle, onEdit, onDelete, onAddSubtask }) {
  const [expanded, setExpanded] = useState(true)
  const children = allTasks.filter(t => t.parentId === task.id)

  return (
    <div>
      <TaskItem
        task={task}
        hasChildren={children.length > 0}
        expanded={expanded}
        onExpandToggle={() => setExpanded(e => !e)}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddSubtask={() => onAddSubtask(task.id)}
      />
      {expanded && children.length > 0 && (
        <div className="ml-5 mt-1.5 pl-3 border-l-2 border-indigo-100 space-y-1.5">
          {children.map(child => (
            <TaskNode
              key={child.id}
              task={child}
              allTasks={allTasks}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}
    </div>
  )
}
