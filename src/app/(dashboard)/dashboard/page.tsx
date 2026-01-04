'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  FolderKanban,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface DashboardData {
  leadCount: number
  projectCount: number
  activeProjects: number
  recentLeads: Array<{
    id: string
    name: string
    company: string | null
    status: string
    createdAt: string
  }>
  upcomingPayments: Array<{
    id: string
    amount: number
    dueDate: string
    project: { name: string }
  }>
  overduePayments: Array<{
    id: string
    amount: number
    dueDate: string
    project: { name: string }
  }>
  totalRevenue: number
  pendingTasks: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [leadsRes, projectsRes, financialsRes] = await Promise.all([
          fetch('/api/leads'),
          fetch('/api/projects'),
          fetch('/api/financials?period=monthly')
        ])

        const leads = await leadsRes.json()
        const projects = await projectsRes.json()
        const financials = await financialsRes.json()

        const pendingTasks = projects.reduce((count: number, p: { tasks: Array<{ status: string }> }) =>
          count + p.tasks.filter((t: { status: string }) => t.status !== 'completed').length, 0)

        setData({
          leadCount: leads.length,
          projectCount: projects.length,
          activeProjects: projects.filter((p: { status: string }) => p.status === 'active').length,
          recentLeads: leads.slice(0, 5),
          upcomingPayments: financials.upcomingPayments || [],
          overduePayments: financials.overduePayments || [],
          totalRevenue: financials.summary?.totalRevenue || 0,
          pendingTasks
        })
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  const stats = [
    { name: 'Total Leads', value: data?.leadCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Projects', value: data?.activeProjects || 0, icon: FolderKanban, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Revenue (This Month)', value: `$${(data?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Pending Tasks', value: data?.pendingTasks || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Welcome back! Here&apos;s your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{stat.name}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text-primary)]">Recent Leads</h2>
              <Link href="/leads" className="text-sm text-[var(--primary)] hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="p-4">
            {data?.recentLeads && data.recentLeads.length > 0 ? (
              <div className="space-y-3">
                {data.recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{lead.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{lead.company || 'No company'}</p>
                    </div>
                    <span className={`badge badge-${lead.status}`}>{lead.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)] text-center py-8">No leads yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text-primary)]">Upcoming Payments</h2>
              <Link href="/financials" className="text-sm text-[var(--primary)] hover:underline">
                View all
              </Link>
            </div>
          </div>
          <div className="p-4">
            {data?.overduePayments && data.overduePayments.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Overdue Payments</span>
                </div>
                {data.overduePayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-sm py-1">
                    <span>{payment.project.name}</span>
                    <span className="font-medium">${payment.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            {data?.upcomingPayments && data.upcomingPayments.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingPayments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-hover)]"
                  >
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{payment.project.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Due {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="font-semibold text-[var(--success)]">
                      ${payment.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)] text-center py-8">No upcoming payments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
