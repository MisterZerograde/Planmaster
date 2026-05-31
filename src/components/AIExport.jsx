import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'

const PROMPT_TEMPLATE = `Help me plan and create tasks. Output tasks in this EXACT format, one per line:

[TASK] Task title | Priority | Category | Due date | Short description

Rules:
- Priority must be exactly: High, Medium, or Low
- Category must be exactly: Work, Personal, Health, or Other
- Due date format: YYYY-MM-DD (leave blank if no specific date)
- Output ONLY [TASK] lines — no extra text, headers, or explanations

Example output:
[TASK] Prepare Q2 report | High | Work | 2026-06-05 | Cover revenue and roadmap
[TASK] Morning run 30 min | Medium | Health | | Before 8am daily
[TASK] Buy groceries | Low | Personal | 2026-06-03 | Milk, eggs, bread

My goals / what I need help planning:
[DESCRIBE YOUR GOALS OR SITUATION HERE — then send this to AI]`

const EXPORT_MODES = [
  { id: 'plan', label: '📋 Daily Plan', desc: 'Tasks grouped by due date' },
  { id: 'priority', label: '🎯 By Priority', desc: 'Tasks grouped High → Low' },
  { id: 'review', label: '📊 Weekly Review', desc: 'Ask AI to review & prioritize' },
]

const parseAIResponse = (text) => {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.toUpperCase().startsWith('[TASK]'))
    .map(line => {
      const parts = line.slice(6).trim().split('|').map(p => p.trim())
      const [title, priority, category, dueDate, description] = parts
      if (!title) return null
      return {
        title,
        priority: ['High', 'Medium', 'Low'].includes(priority) ? priority : 'Medium',
        category: ['Work', 'Personal', 'Health', 'Other'].includes(category) ? category : 'Other',
        dueDate: /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : '',
        description: description || '',
      }
    })
    .filter(Boolean)
}

export default function AIExport({ user }) {
  const { tasks, addTask } = useTasks(user.uid)
  const [tab, setTab] = useState('import') // 'import' | 'export'
  const [exportMode, setExportMode] = useState('plan')
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedExport, setCopiedExport] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [preview, setPreview] = useState([])
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(0)

  const today = new Date().toISOString().split('T')[0]
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  // ── Export helpers ──────────────────────────────────────────────
  const fmt = (t) => {
    const check = t.completed ? '[x]' : '[ ]'
    const due = t.dueDate ? ` (due: ${t.dueDate})` : ''
    const pri = t.priority ? ` [${t.priority}]` : ''
    const desc = t.description ? `\n      → ${t.description}` : ''
    return `${check} ${t.title}${pri}${due}${desc}`
  }

  const generateExport = () => {
    const active = tasks.filter(t => !t.completed)
    const done = tasks.filter(t => t.completed)
    const overdue = active.filter(t => t.dueDate && t.dueDate < today)
    const dueToday = active.filter(t => t.dueDate === today)
    const upcoming = active.filter(t => t.dueDate && t.dueDate > today)
    const noDue = active.filter(t => !t.dueDate)
    const bar = '='.repeat(50)

    if (exportMode === 'plan') return `📋 MY PLAN — ${todayStr}
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

    if (exportMode === 'priority') {
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

  const copyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATE)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const copyExport = () => {
    navigator.clipboard.writeText(generateExport())
    setCopiedExport(true)
    setTimeout(() => setCopiedExport(false), 2000)
  }

  // ── Import helpers ──────────────────────────────────────────────
  const handleParse = () => {
    const parsed = parseAIResponse(pasteText)
    setPreview(parsed)
    setImportDone(0)
  }

  const handleImport = async () => {
    setImporting(true)
    for (const task of preview) {
      await addTask(task)
    }
    setImportDone(preview.length)
    setPreview([])
    setPasteText('')
    setImporting(false)
  }

  const PRIORITY_COLORS = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Low: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Export</h1>
        <p className="text-sm text-gray-500 mt-1">Let AI help you plan — then import tasks directly into PlanMaster</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          onClick={() => setTab('import')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'import' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🤖 Get AI to Create Tasks
        </button>
        <button
          onClick={() => setTab('export')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'export' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Export My Plan
        </button>
      </div>

      {/* ── IMPORT TAB ── */}
      {tab === 'import' && (
        <div className="space-y-5">

          {/* Step 1 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="font-semibold text-gray-900">Copy this prompt → paste into Claude or ChatGPT</h2>
            </div>
            <p className="text-xs text-gray-500">Edit the last line to describe your goals, then send to AI.</p>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-auto">
                {PROMPT_TEMPLATE}
              </pre>
              <button
                onClick={copyPrompt}
                className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  copiedPrompt ? 'bg-green-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                {copiedPrompt ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={copyPrompt}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm"
            >
              {copiedPrompt ? '✓ Copied to clipboard!' : '📋 Copy Prompt'}
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="font-semibold text-gray-900">Paste AI's response here</h2>
            </div>
            <p className="text-xs text-gray-500">Copy the AI's full reply and paste it below — the site will find and parse all [TASK] lines.</p>
            <textarea
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setPreview([]); setImportDone(0) }}
              placeholder="Paste AI response here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
            />
            <button
              onClick={handleParse}
              disabled={!pasteText.trim()}
              className="w-full py-2.5 border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🔍 Parse Tasks from Response
            </button>
          </div>

          {/* Step 3 — Preview */}
          {preview.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full text-xs font-bold flex items-center justify-center">3</span>
                <h2 className="font-semibold text-gray-900">Preview — {preview.length} task{preview.length !== 1 ? 's' : ''} found</h2>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {preview.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                      {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-500">{t.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[t.priority]}`}>
                          {t.priority}
                        </span>
                        {t.dueDate && <span className="text-xs text-gray-400">📅 {t.dueDate}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => setPreview(p => p.filter((_, j) => j !== i))}
                      className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {importing
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Importing...</>
                  : `✅ Add ${preview.length} Task${preview.length !== 1 ? 's' : ''} to PlanMaster`
                }
              </button>
            </div>
          )}

          {importDone > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-semibold">✅ {importDone} task{importDone !== 1 ? 's' : ''} added successfully!</p>
              <p className="text-green-600 text-sm mt-1">Check your Today or Tasks view.</p>
            </div>
          )}
        </div>
      )}

      {/* ── EXPORT TAB ── */}
      {tab === 'export' && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {EXPORT_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setExportMode(m.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border text-left transition-colors ${
                  exportMode === m.id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {m.label}
                <span className={`block text-xs mt-0.5 ${exportMode === m.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {m.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-700 mb-2">💡 After pasting, ask AI:</p>
            <ul className="space-y-1 text-xs text-indigo-600">
              <li>• "Help me prioritize these tasks for today"</li>
              <li>• "Create a realistic schedule for my week"</li>
              <li>• "What should I focus on first and why?"</li>
            </ul>
          </div>

          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-72 font-mono whitespace-pre-wrap leading-relaxed">
              {generateExport()}
            </pre>
            <button
              onClick={copyExport}
              className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copiedExport ? 'bg-green-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              {copiedExport ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={copyExport}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
          >
            {copiedExport ? '✓ Copied to clipboard!' : '📋 Copy to Clipboard'}
          </button>
        </div>
      )}
    </div>
  )
}
