'use client'

import { useEffect, useState, use } from 'react'
import {
  ArrowLeft,
  Plus,
  Edit,
  CheckCircle,
  Circle,
  Clock,
  DollarSign,
  Receipt,
  User,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  assignee: { id: string; name: string } | null
}

interface Payment {
  id: string
  amount: number
  dueDate: string
  paidDate: string | null
  status: string
  type: string
  description: string | null
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  vendor: string | null
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  contractValue: number
  percentComplete: number
  paymentType: string
  startDate: string | null
  endDate: string | null
  lead: { name: string; company: string | null } | null
  manager: { id: string; name: string }
  tasks: Task[]
  payments: Payment[]
  expenses: Expense[]
}

interface UserOption {
  id: string
  name: string
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tasks' | 'payments' | 'expenses'>('tasks')
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '' })
  const [newPayment, setNewPayment] = useState({ amount: '', dueDate: '', type: 'milestone', description: '' })
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'other', date: '', vendor: '' })

  useEffect(() => {
    fetchProject()
    fetchUsers()
  }, [id])

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${id}`)
      const data = await res.json()
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      })
      if (res.ok) {
        setShowTaskModal(false)
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch(`/api/projects/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayment)
      })
      if (res.ok) {
        setShowPaymentModal(false)
        setNewPayment({ amount: '', dueDate: '', type: 'milestone', description: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch(`/api/projects/${id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      })
      if (res.ok) {
        setShowExpenseModal(false)
        setNewExpense({ description: '', amount: '', category: 'other', date: '', vendor: '' })
        fetchProject()
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  async function toggleTaskStatus(task: Task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      fetchProject()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  async function markPaymentPaid(paymentId: string) {
    try {
      await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' })
      })
      fetchProject()
    } catch (error) {
      console.error('Error updating payment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!project) {
    return <div>Project not found</div>
  }

  const totalPaid = project.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalPaid - totalExpenses

  return (
    <div>
      <div className="mb-6">
        <Link href="/projects" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{project.name}</h1>
              <span className={`badge badge-${project.status.replace('-', '')}`}>{project.status}</span>
            </div>
            {project.lead?.company && (
              <p className="text-[var(--text-secondary)] mt-1">{project.lead.company}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="card p-4">
          <p className="text-sm text-[var(--text-secondary)]">Contract Value</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">${project.contractValue.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--text-secondary)]">Collected</p>
          <p className="text-2xl font-bold text-[var(--success)]">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--text-secondary)]">Expenses</p>
          <p className="text-2xl font-bold text-[var(--danger)]">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-[var(--text-secondary)]">Net Profit</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
            ${netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--text-secondary)]">Progress</span>
            <span className="font-medium">{project.percentComplete}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--background)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all"
              style={{ width: `${project.percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-[var(--border)]">
          <div className="flex">
            {(['tasks', 'payments', 'expenses'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--background)] text-xs">
                  {tab === 'tasks' ? project.tasks.length : tab === 'payments' ? project.payments.length : project.expenses.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
              {project.tasks.length > 0 ? (
                <div className="space-y-2">
                  {project.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)]">
                      <button onClick={() => toggleTaskStatus(task)}>
                        {task.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[var(--text-disabled)]" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-[var(--text-disabled)]' : 'text-[var(--text-primary)]'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-[var(--text-secondary)]">{task.description}</p>
                        )}
                      </div>
                      <span className={`badge badge-${task.priority === 'high' || task.priority === 'urgent' ? 'overdue' : 'pending'}`}>
                        {task.priority}
                      </span>
                      {task.assignee && (
                        <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                          <User className="w-4 h-4" />
                          {task.assignee.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--text-secondary)] py-8">No tasks yet</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Add Payment
                </button>
              </div>
              {project.payments.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.payments.map(payment => (
                        <tr key={payment.id}>
                          <td className="font-medium">{payment.description || 'Payment'}</td>
                          <td>${payment.amount.toLocaleString()}</td>
                          <td>{format(new Date(payment.dueDate), 'MMM d, yyyy')}</td>
                          <td><span className="badge badge-pending">{payment.type}</span></td>
                          <td><span className={`badge badge-${payment.status}`}>{payment.status}</span></td>
                          <td>
                            {payment.status !== 'paid' && (
                              <button
                                onClick={() => markPaymentPaid(payment.id)}
                                className="btn btn-success text-xs py-1 px-2"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-[var(--text-secondary)] py-8">No payments yet</p>
              )}
            </div>
          )}

          {activeTab === 'expenses' && (
            <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowExpenseModal(true)} className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
              </div>
              {project.expenses.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Vendor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.expenses.map(expense => (
                        <tr key={expense.id}>
                          <td className="font-medium">{expense.description}</td>
                          <td className="text-[var(--danger)]">-${expense.amount.toLocaleString()}</td>
                          <td><span className="badge badge-pending">{expense.category}</span></td>
                          <td>{format(new Date(expense.date), 'MMM d, yyyy')}</td>
                          <td>{expense.vendor || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-[var(--text-secondary)] py-8">No expenses yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">Add Task</h2>
              <button onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="input-label">Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Assign To</label>
                  <select
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                    className="input"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">Add Payment</h2>
              <button onClick={() => setShowPaymentModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddPayment}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="input-label">Description</label>
                  <input
                    type="text"
                    value={newPayment.description}
                    onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                    className="input"
                    placeholder="e.g., Milestone 1, Monthly payment"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Amount ($) *</label>
                    <input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Due Date *</label>
                    <input
                      type="date"
                      value={newPayment.dueDate}
                      onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Type</label>
                  <select
                    value={newPayment.type}
                    onChange={(e) => setNewPayment({ ...newPayment, type: e.target.value })}
                    className="input"
                  >
                    <option value="milestone">Milestone</option>
                    <option value="percent">Percent Complete</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">Add Expense</h2>
              <button onClick={() => setShowExpenseModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddExpense}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="input-label">Description *</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Amount ($) *</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Date *</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="input"
                    >
                      <option value="labor">Labor</option>
                      <option value="materials">Materials</option>
                      <option value="travel">Travel</option>
                      <option value="software">Software</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Vendor</label>
                    <input
                      type="text"
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
