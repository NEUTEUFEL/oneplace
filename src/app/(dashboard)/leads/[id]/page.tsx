'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Trophy,
  User
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  isPrimary: boolean
}

interface Conversation {
  id: string
  subject: string
  summary: string | null
  date: string
  type: string
}

interface Lead {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  bio: string | null
  status: string
  source: string | null
  estimatedValue: number | null
  notes: string | null
  createdAt: string
  owner: { id: string; name: string; email: string }
  contacts: Contact[]
  conversations: Conversation[]
  project: { id: string } | null
}

const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Lead>>({})
  const [showContactModal, setShowContactModal] = useState(false)
  const [showConversationModal, setShowConversationModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', role: '', isPrimary: false })
  const [newConversation, setNewConversation] = useState({ subject: '', summary: '', date: '', type: 'email' })
  const [convertData, setConvertData] = useState({ name: '', description: '', contractValue: '', paymentType: 'milestone', startDate: '' })

  useEffect(() => {
    fetchLead()
  }, [id])

  async function fetchLead() {
    try {
      const res = await fetch(`/api/leads/${id}`)
      const data = await res.json()
      setLead(data)
      setEditData(data)
      setConvertData({
        name: data.name,
        description: '',
        contractValue: data.estimatedValue?.toString() || '',
        paymentType: 'milestone',
        startDate: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })
      if (res.ok) {
        setEditing(false)
        fetchLead()
      }
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch(`/api/leads/${id}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      })
      if (res.ok) {
        setShowContactModal(false)
        setNewContact({ name: '', email: '', phone: '', role: '', isPrimary: false })
        fetchLead()
      }
    } catch (error) {
      console.error('Error adding contact:', error)
    }
  }

  async function handleAddConversation(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch(`/api/leads/${id}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConversation)
      })
      if (res.ok) {
        setShowConversationModal(false)
        setNewConversation({ subject: '', summary: '', date: '', type: 'email' })
        fetchLead()
      }
    } catch (error) {
      console.error('Error adding conversation:', error)
    }
  }

  async function handleConvertToProject(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch(`/api/leads/${id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertData)
      })
      if (res.ok) {
        const project = await res.json()
        router.push(`/projects/${project.id}`)
      }
    } catch (error) {
      console.error('Error converting lead:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!lead) {
    return <div>Lead not found</div>
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/leads" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{lead.name}</h1>
              <span className={`badge badge-${lead.status}`}>{lead.status}</span>
            </div>
            {lead.company && (
              <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                <Building2 className="w-4 h-4" />
                {lead.company}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {lead.status !== 'won' && lead.status !== 'lost' && (
              <button
                onClick={() => setShowConvertModal(true)}
                className="btn btn-success"
              >
                <Trophy className="w-4 h-4" />
                Mark as Won
              </button>
            )}
            {lead.project && (
              <Link href={`/projects/${lead.project.id}`} className="btn btn-primary">
                View Project
              </Link>
            )}
            <button onClick={() => setEditing(!editing)} className="btn btn-secondary">
              <Edit className="w-4 h-4" />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--text-primary)]">Lead Information</h2>
            </div>
            <div className="p-4">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Name</label>
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="input-label">Company</label>
                      <input
                        type="text"
                        value={editData.company || ''}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Email</label>
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="input-label">Phone</label>
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Bio</label>
                    <textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="input"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Status</label>
                      <select
                        value={editData.status || ''}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
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
                      <label className="input-label">Estimated Value ($)</label>
                      <input
                        type="number"
                        value={editData.estimatedValue || ''}
                        onChange={(e) => setEditData({ ...editData, estimatedValue: parseFloat(e.target.value) })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleUpdate} className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-[var(--primary)] hover:underline">
                        <Mail className="w-4 h-4" />
                        {lead.email}
                      </a>
                    )}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-[var(--primary)] hover:underline">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </a>
                    )}
                  </div>
                  {lead.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Bio</h3>
                      <p className="text-[var(--text-primary)] whitespace-pre-wrap">{lead.bio}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Estimated Value</p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Source</p>
                      <p className="font-semibold text-[var(--text-primary)]">{lead.source || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Created</p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text-primary)]">Conversations</h2>
              <button onClick={() => setShowConversationModal(true)} className="btn btn-secondary text-sm">
                <Plus className="w-4 h-4" />
                Add Conversation
              </button>
            </div>
            <div className="p-4">
              {lead.conversations.length > 0 ? (
                <div className="space-y-3">
                  {lead.conversations.map((conv) => (
                    <div key={conv.id} className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)]">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[var(--primary)]" />
                          <span className="font-medium text-[var(--text-primary)]">{conv.subject}</span>
                          <span className="badge badge-pending">{conv.type}</span>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {format(new Date(conv.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {conv.summary && (
                        <p className="text-sm text-[var(--text-secondary)] mt-2 ml-6">{conv.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--text-secondary)] py-4">No conversations yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text-primary)]">Contacts</h2>
              <button onClick={() => setShowContactModal(true)} className="btn btn-secondary text-sm">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="p-4">
              {lead.contacts.length > 0 ? (
                <div className="space-y-3">
                  {lead.contacts.map((contact) => (
                    <div key={contact.id} className="p-3 rounded-lg border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="font-medium text-[var(--text-primary)]">{contact.name}</span>
                        {contact.isPrimary && <span className="badge badge-active">Primary</span>}
                      </div>
                      {contact.role && (
                        <p className="text-sm text-[var(--text-secondary)] ml-6">{contact.role}</p>
                      )}
                      <div className="ml-6 mt-2 space-y-1">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="text-sm text-[var(--primary)] hover:underline block">
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="text-sm text-[var(--primary)] hover:underline block">
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--text-secondary)] py-4">No contacts yet</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--text-primary)]">Owner</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-medium">
                  {lead.owner.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{lead.owner.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{lead.owner.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">Add Contact</h2>
              <button onClick={() => setShowContactModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="input-label">Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Role</label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    className="input"
                    placeholder="e.g., Decision Maker, Technical Lead"
                  />
                </div>
                <div>
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newContact.isPrimary}
                    onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                  />
                  <span className="text-sm">Primary contact</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowContactModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConversationModal && (
        <div className="modal-overlay" onClick={() => setShowConversationModal(false)}>
          <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">Add Conversation</h2>
              <button onClick={() => setShowConversationModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddConversation}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="input-label">Subject *</label>
                  <input
                    type="text"
                    value={newConversation.subject}
                    onChange={(e) => setNewConversation({ ...newConversation, subject: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Type</label>
                    <select
                      value={newConversation.type}
                      onChange={(e) => setNewConversation({ ...newConversation, type: e.target.value })}
                      className="input"
                    >
                      <option value="email">Email</option>
                      <option value="call">Call</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Date *</label>
                    <input
                      type="date"
                      value={newConversation.date}
                      onChange={(e) => setNewConversation({ ...newConversation, date: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Summary</label>
                  <textarea
                    value={newConversation.summary}
                    onChange={(e) => setNewConversation({ ...newConversation, summary: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowConversationModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Conversation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConvertModal && (
        <div className="modal-overlay" onClick={() => setShowConvertModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-lg font-semibold">Convert to Project</h2>
              <button onClick={() => setShowConvertModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleConvertToProject}>
              <div className="modal-body space-y-4">
                <p className="text-[var(--text-secondary)]">This will mark the lead as won and create a new project.</p>
                <div>
                  <label className="input-label">Project Name *</label>
                  <input
                    type="text"
                    value={convertData.name}
                    onChange={(e) => setConvertData({ ...convertData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Description</label>
                  <textarea
                    value={convertData.description}
                    onChange={(e) => setConvertData({ ...convertData, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Contract Value ($) *</label>
                    <input
                      type="number"
                      value={convertData.contractValue}
                      onChange={(e) => setConvertData({ ...convertData, contractValue: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Payment Type</label>
                    <select
                      value={convertData.paymentType}
                      onChange={(e) => setConvertData({ ...convertData, paymentType: e.target.value })}
                      className="input"
                    >
                      <option value="milestone">Milestone Based</option>
                      <option value="percent">Percent Complete</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Start Date</label>
                  <input
                    type="date"
                    value={convertData.startDate}
                    onChange={(e) => setConvertData({ ...convertData, startDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowConvertModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Convert to Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
