import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'

export default function Today({ user }) {
  const { tasks, loading, addTask, updateTask, toggleTask, deleteTask } = useTasks(user.uid)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const todayTasks = tasks.filter(t => t.dueDate === today)
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today && !t.completed)
  const noDueTasks = tasks.filter(t => !t.dueDate && !t.completed)

  const handleSave = async (form) => {
    if (editTask) {
      await updateTask(editTask.id, form)
    } else {
      await addTask({ ...form, dueDate: today })
    }
    setEditTask(null)
  }

  const handleEdit = (task) => { setEditTask(task); setShowForm(true) }
  const handleClose = () => { setShowForm(false); setEditTask(null) }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-sm text-gray-500">{todayLabel}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm"
        >
          + Add Task
        </button>
      </div>

      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-500 mb-3">⚠️ Overdue ({overdueTasks.length})</h2>
          <div className="space-y-2">
            {overdueTasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={toggleTask} onEdit={handleEdit} onDelete={deleteTask} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Due Today ({todayTasks.length})</h2>
        {todayTasks.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100 text-gray-400">
            <p className="text-3xl mb-2">✨</p>
            <p className="text-sm">Nothing due today — click "Add Task" to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={toggleTask} onEdit={handleEdit} onDelete={deleteTask} />
            ))}
          </div>
        )}
      </section>

      {noDueTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">No Due Date ({noDueTasks.length})</h2>
          <div className="space-y-2">
            {noDueTasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={toggleTask} onEdit={handleEdit} onDelete={deleteTask} />
            ))}
          </div>
        </section>
      )}

      {(showForm || editTask) && (
        <TaskForm
          task={editTask}
          defaultDate={today}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
