import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskForm from './TaskForm'
import TaskNode from './TaskNode'

const FILTERS = ['Active', 'All', 'Completed']
const CATEGORIES = ['All', 'Work', 'Personal', 'Health', 'Other']
const PRIORITIES = ['All', 'High', 'Medium', 'Low']

export default function TaskList({ user }) {
  const { tasks, loading, addTask, updateTask, toggleTask, deleteTask } = useTasks(user.uid)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [addingSubtaskTo, setAddingSubtaskTo] = useState(null)
  const [filter, setFilter] = useState('Active')
  const [category, setCategory] = useState('All')
  const [priority, setPriority] = useState('All')

  const handleSave = async (form) => {
    if (editTask) {
      await updateTask(editTask.id, form)
    } else {
      await addTask({ ...form, parentId: addingSubtaskTo || null })
    }
    setEditTask(null)
    setAddingSubtaskTo(null)
  }

  const handleEdit = (task) => { setEditTask(task); setShowForm(true) }
  const handleClose = () => { setShowForm(false); setEditTask(null); setAddingSubtaskTo(null) }
  const handleAddSubtask = (parentId) => { setAddingSubtaskTo(parentId); setShowForm(true) }

  const parentTask = addingSubtaskTo ? tasks.find(t => t.id === addingSubtaskTo) : null

  // Filter applies only to root tasks; their children always render with them
  const rootTasks = tasks.filter(t => !t.parentId)
  const filtered = rootTasks.filter(t => {
    if (filter === 'Active' && t.completed) return false
    if (filter === 'Completed' && !t.completed) return false
    if (category !== 'All' && t.category !== category) return false
    if (priority !== 'All' && t.priority !== priority) return false
    return true
  })

  const doneCount = tasks.filter(t => t.completed).length

  const nodeProps = {
    allTasks: tasks,
    onToggle: toggleTask,
    onEdit: handleEdit,
    onDelete: deleteTask,
    onAddSubtask: handleAddSubtask,
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-sm text-gray-500">{doneCount} of {tasks.length} completed</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm"
        >
          + Add Task
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 text-gray-400">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm">No tasks found. Try a different filter or add one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => <TaskNode key={t.id} task={t} {...nodeProps} />)}
        </div>
      )}

      {(showForm || editTask) && (
        <TaskForm
          task={editTask}
          parentTaskTitle={parentTask?.title}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
