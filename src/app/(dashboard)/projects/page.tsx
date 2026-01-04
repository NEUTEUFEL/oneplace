'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, MoreVertical, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

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
  createdAt: string
  lead: { name: string; company: string | null } | null
  manager: { name: string }
  _count: { tasks: number; payments: number; expenses: number }
  tasks: Array<{ status: string }>
  payments: Array<{ amount: number; status: string }>
  expenses: Array<{ amount: number }>
}

const statusOptions = ['active', 'on-hold', 'completed', 'cancelled']

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    contractValue: '',
    paymentType: 'milestone',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })

      if (res.ok) {
        setShowNewModal(false)
        setNewProject({
          name: '',
          description: '',
          contractValue: '',
          paymentType: 'milestone',
          startDate: '',
          endDate: ''
        })
        fetchProjects()
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.lead?.company?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  function getProjectStats(project: Project) {
    const completedTasks = project.tasks.filter(t => t.status === 'completed').length
    const totalTasks = project.tasks.length
    const paidAmount = project.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    const totalExpenses = project.expenses.reduce((sum, e) => sum + e.amount, 0)

    return { completedTasks, totalTasks, paidAmount, totalExpenses }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
          <p className="text-[var(--text-secondary)]">Manage your active consulting projects</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const stats = getProjectStats(project)
          return (
            <Link key={project.id} href={`/projects/${project.id}`} className="card hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{project.name}</h3>
                    {project.lead?.company && (
                      <p className="text-sm text-[var(--text-secondary)]">{project.lead.company}</p>
                    )}
                  </div>
                  <span className={`badge badge-${project.status.replace('-', '')}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">Progress</span>
                    <span className="font-medium">{project.percentComplete}%</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all"
                      style={{ width: `${project.percentComplete}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--text-secondary)]">Contract Value</p>
                    <p className="font-semibold text-[var(--text-primary)]">${project.contractValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)]">Collected</p>
                    <p className="font-semibold text-[var(--success)]">${stats.paidAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <CheckCircle className="w-4 h-4" />
                      {stats.completedTasks}/{stats.totalTasks} tasks
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {project.paymentType} billing
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="card p-8 text-center text-[var(--text-secondary)]">
          No projects found
        </div>
      )}

      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">New Project</h2>
              <button onClick={() => setShowNewModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="input-label">Project Name *</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Contract Value ($) *</label>
                    <input
                      type="number"
                      value={newProject.contractValue}
                      onChange={(e) => setNewProject({ ...newProject, contractValue: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Payment Type</label>
                    <select
                      value={newProject.paymentType}
                      onChange={(e) => setNewProject({ ...newProject, paymentType: e.target.value })}
                      className="input"
                    >
                      <option value="milestone">Milestone Based</option>
                      <option value="percent">Percent Complete</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Start Date</label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">End Date</label>
                    <input
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
