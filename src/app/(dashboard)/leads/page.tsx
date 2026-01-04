'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Lead {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  status: string
  source: string | null
  estimatedValue: number | null
  createdAt: string
  owner: {
    name: string
  }
}

const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
const sourceOptions = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Trade Show', 'Other']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    bio: '',
    status: 'new',
    source: '',
    estimatedValue: ''
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateLead(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      })

      if (res.ok) {
        setShowNewModal(false)
        setNewLead({
          name: '',
          company: '',
          email: '',
          phone: '',
          bio: '',
          status: 'new',
          source: '',
          estimatedValue: ''
        })
        fetchLeads()
      }
    } catch (error) {
      console.error('Error creating lead:', error)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Leads</h1>
          <p className="text-[var(--text-secondary)]">Manage your sales pipeline</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Lead
        </button>
      </div>

      <div className="card mb-6">
        <div className="p-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]" />
            <input
              type="text"
              placeholder="Search leads..."
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
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
                <th>Est. Value</th>
                <th>Source</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <Link href={`/leads/${lead.id}`} className="font-medium text-[var(--primary)] hover:underline">
                      {lead.name}
                    </Link>
                  </td>
                  <td className="text-[var(--text-secondary)]">{lead.company || '-'}</td>
                  <td className="text-[var(--text-secondary)]">{lead.email || '-'}</td>
                  <td>
                    <span className={`badge badge-${lead.status}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="text-[var(--text-secondary)]">
                    {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '-'}
                  </td>
                  <td className="text-[var(--text-secondary)]">{lead.source || '-'}</td>
                  <td className="text-[var(--text-secondary)]">
                    {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <button className="p-2 hover:bg-[var(--surface-hover)] rounded">
                      <MoreVertical className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="p-8 text-center text-[var(--text-secondary)]">
            No leads found
          </div>
        )}
      </div>

      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">New Lead</h2>
              <button onClick={() => setShowNewModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateLead}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Name *</label>
                    <input
                      type="text"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Company</label>
                    <input
                      type="text"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Email</label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone</label>
                    <input
                      type="tel"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Bio / Notes</label>
                  <textarea
                    value={newLead.bio}
                    onChange={(e) => setNewLead({ ...newLead, bio: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">Status</label>
                    <select
                      value={newLead.status}
                      onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                      className="input"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Source</label>
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                      className="input"
                    >
                      <option value="">Select source</option>
                      {sourceOptions.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Est. Value ($)</label>
                    <input
                      type="number"
                      value={newLead.estimatedValue}
                      onChange={(e) => setNewLead({ ...newLead, estimatedValue: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
