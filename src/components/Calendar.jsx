import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import TaskForm from './TaskForm'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const PRIORITY_DOT = { High: 'bg-red-400', Medium: 'bg-yellow-400', Low: 'bg-green-400' }

export default function Calendar({ user }) {
  const { tasks, addTask, updateTask, toggleTask, deleteTask } = useTasks(user.uid)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const today = now.toISOString().split('T')[0]
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const toDateStr = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const tasksForDay = (day) => tasks.filter(t => t.dueDate === toDateStr(day))

  const prev = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)
  const next = () => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1)

  const selectedDateStr = selectedDay ? toDateStr(selectedDay) : null
  const selectedTasks = selectedDay ? tasksForDay(selectedDay) : []

  const handleSave = async (form) => {
    if (editTask) {
      await updateTask(editTask.id, form)
    } else {
      await addTask(form)
    }
    setEditTask(null)
  }

  const handleEdit = (task) => { setEditTask(task); setShowForm(true) }
  const handleClose = () => { setShowForm(false); setEditTask(null) }

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={prev} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg text-gray-600 text-xl">‹</button>
          <h2 className="font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
          <button onClick={next} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg text-gray-600 text-xl">›</button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="h-16 border-b border-r border-gray-50" />
            const dateStr = toDateStr(day)
            const dayTasks = tasksForDay(day)
            const isToday = dateStr === today
            const isSelected = day === selectedDay

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`h-16 border-b border-r border-gray-50 p-1.5 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}
              >
                <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                }`}>{day}</span>
                <div className="flex gap-0.5 mt-1 flex-wrap">
                  {dayTasks.slice(0, 4).map(t => (
                    <div
                      key={t.id}
                      className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[t.priority] || 'bg-indigo-400'} ${t.completed ? 'opacity-30' : ''}`}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {new Date(selectedDateStr + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {' '}· {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              + Add
            </button>
          </div>

          {selectedTasks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6 bg-white rounded-xl border border-gray-100">
              No tasks on this day — click "+ Add" to create one!
            </p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(t => (
                <div key={t.id} className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm ${t.completed ? 'opacity-60' : ''}`}>
                  <button
                    onClick={() => toggleTask(t.id, t.completed)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      t.completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {t.completed && <span className="text-white text-xs leading-none">✓</span>}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${t.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                    <p className="text-xs text-gray-400">{t.category} · {t.priority}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(t)} className="text-gray-300 hover:text-gray-500 text-sm">✏️</button>
                    <button onClick={() => deleteTask(t.id)} className="text-gray-300 hover:text-red-400 text-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(showForm || editTask) && (
        <TaskForm
          task={editTask}
          defaultDate={selectedDateStr}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
