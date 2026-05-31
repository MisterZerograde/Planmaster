import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'

const MODES = [
  { id: 'plan', label: '📋 Daily Plan', desc: 'All tasks grouped by due date' },
  { id: 'priority', label: '🎯 By Priority', desc: 'Tasks grouped High → Low' },
  { id: 'review', label: '📊 Weekly Review', desc: 'Ask AI to review & prioritize' },
]

const PROMPTS = [
  '"Help me prioritize these tasks for today"',
  '"Create a realistic schedule for my week"',
  '"What should I focus on first and why?"',
  '"Break down my high-priority tasks into steps"',
]

export default function AIExport({ user }) {
  const { tasks } = useTasks(user.uid)
  const [mode, setMode] = useState('plan')
  const [copied, setCopied] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const fmt = (t) => {
    const check = t.completed ? '[x]' : '[ ]'
    const due = t.dueDate ? ` (due: ${t.dueDate})` : ''
    const pri = t.priority ? ` [${t.priority}]` : ''
    const desc = t.description ? `\n      → ${t.description}` : ''
    return `${check} ${t.title}${pri}${due}${desc}`
  }

  const generateText = () => {
    const active = tasks.filter(t => !t.completed)
    const done = tasks.filter(t => t.completed)
    const overdue = active.filter(t => t.dueDate && t.dueDate < today)
    const dueToday = active.filter(t => t.dueDate === today)
    const upcoming = active.filter(t => t.dueDate && t.dueDate > today)
    const noDue = active.filter(t => !t.dueDate)
    const bar = '='.repeat(50)

    if (mode === 'plan') return `📋 MY PLAN — ${todayStr}
${bar}

📊 SUMMARY
• Total: ${tasks.length} tasks (${active.length} active, ${done.length} done)
• Overdue: ${overdue.length} | Due today: ${dueToday.length} | Upcoming: ${upcoming.length}

${overdue.length > 0 ? `⚠️ OVERDUE\n${overdue.map(fmt).join('\n')}\n\n` : ''}☀️ DUE TODAY
${dueToday.length > 0 ? dueToday.map(fmt).join('\n') : '(nothing due today)'}

📅 UPCOMING
${upcoming.length > 0 ? upcoming.map(fmt).join('\n') : '(none)'}

📌 NO DUE DATE
${noDue.length > 0 ? noDue.map(fmt).join('\n') : '(none)'}

✅ RECENTLY COMPLETED
${done.slice(0, 5).map(t => `[x] ${t.title}`).join('\n') || '(none yet)'}
${bar}`

    if (mode === 'priority') {
      const high = active.filter(t => t.priority === 'High')
      const med = active.filter(t => t.priority === 'Medium')
      const low = active.filter(t => t.priority === 'Low')
      return `🎯 PRIORITY VIEW — ${todayStr}
${bar}

🔴 HIGH (${high.length})
${high.length > 0 ? high.map(fmt).join('\n') : '(none)'}

🟡 MEDIUM (${med.length})
${med.length > 0 ? med.map(fmt).join('\n') : '(none)'}

🟢 LOW (${low.length})
${low.length > 0 ? low.map(fmt).join('\n') : '(none)'}
${bar}`
    }

    const cats = [...new Set(active.map(t => t.category))]
    return `📊 WEEKLY REVIEW — ${todayStr}
${bar}
Please help me:
1. Identify what I should focus on first
2. Spot tasks I might be procrastinating on
3. Suggest a realistic plan for this week

TASKS BY CATEGORY:
${cats.map(cat => {
  const catTasks = active.filter(t => t.category === cat)
  return `\n${cat.toUpperCase()} (${catTasks.length})\n${catTasks.map(fmt).join('\n')}`
}).join('\n')}

RECENTLY COMPLETED:
${done.slice(0, 10).map(t => `[x] ${t.title}`).join('\n') || '(none)'}
${bar}`
  }

  const text = generateText()

  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Export</h1>
        <p className="text-sm text-gray-500 mt-1">Copy your plan and paste it into Claude or ChatGPT</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border text-left transition-colors ${
              mode === m.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {m.label}
            <span className={`block text-xs mt-0.5 ${mode === m.id ? 'text-indigo-200' : 'text-gray-400'}`}>
              {m.desc}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-700 mb-2">💡 Paste the text below then ask:</p>
        <ul className="space-y-1">
          {PROMPTS.map(p => (
            <li key={p} className="text-xs text-indigo-600">{p}</li>
          ))}
        </ul>
      </div>

      <div className="relative">
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-72 font-mono whitespace-pre-wrap leading-relaxed">
          {text}
        </pre>
        <button
          onClick={copy}
          className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            copied ? 'bg-green-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      <button
        onClick={copy}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center justify-center gap-2"
      >
        {copied ? '✓ Copied to clipboard!' : '📋 Copy to Clipboard'}
      </button>
    </div>
  )
}
