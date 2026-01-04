'use client'

import { useEffect, useState } from 'react'
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

interface ReportData {
  leadsByStatus: Record<string, number>
  leadsBySource: Record<string, number>
  projectsByStatus: Record<string, number>
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topProjects: Array<{ name: string; revenue: number; profit: number }>
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    try {
      const [leadsRes, projectsRes, financialsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/projects'),
        fetch('/api/financials?period=annually')
      ])

      const leads = await leadsRes.json()
      const projects = await projectsRes.json()
      const financials = await financialsRes.json()

      const leadsByStatus: Record<string, number> = {}
      const leadsBySource: Record<string, number> = {}

      leads.forEach((lead: { status: string; source: string }) => {
        leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1
        if (lead.source) {
          leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1
        }
      })

      const projectsByStatus: Record<string, number> = {}
      projects.forEach((project: { status: string }) => {
        projectsByStatus[project.status] = (projectsByStatus[project.status] || 0) + 1
      })

      const topProjects = projects
        .map((p: { name: string; payments: Array<{ status: string; amount: number }>; expenses: Array<{ amount: number }> }) => {
          const revenue = p.payments.filter((pay: { status: string }) => pay.status === 'paid').reduce((sum: number, pay: { amount: number }) => sum + pay.amount, 0)
          const expenses = p.expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
          return { name: p.name, revenue, profit: revenue - expenses }
        })
        .sort((a: { revenue: number }, b: { revenue: number }) => b.revenue - a.revenue)
        .slice(0, 5)

      setData({
        leadsByStatus,
        leadsBySource,
        projectsByStatus,
        monthlyRevenue: financials.monthlyData || [],
        topProjects
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!data) {
    return <div>Error loading report data</div>
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-purple-500',
    qualified: 'bg-indigo-500',
    proposal: 'bg-yellow-500',
    negotiation: 'bg-orange-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
    active: 'bg-green-500',
    'on-hold': 'bg-yellow-500',
    completed: 'bg-gray-500',
    cancelled: 'bg-red-500'
  }

  const totalLeads = Object.values(data.leadsByStatus).reduce((a, b) => a + b, 0)
  const totalProjects = Object.values(data.projectsByStatus).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
          <p className="text-[var(--text-secondary)]">Analytics and insights</p>
        </div>
        <button className="btn btn-secondary">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Leads by Status</h2>
            <p className="text-sm text-[var(--text-secondary)]">{totalLeads} total leads</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(data.leadsByStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize text-[var(--text-primary)]">{status}</span>
                    <span className="text-sm font-medium">{count} ({Math.round((count / totalLeads) * 100)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status] || 'bg-gray-500'} rounded-full`}
                      style={{ width: `${(count / totalLeads) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Projects by Status</h2>
            <p className="text-sm text-[var(--text-secondary)]">{totalProjects} total projects</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(data.projectsByStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize text-[var(--text-primary)]">{status.replace('-', ' ')}</span>
                    <span className="text-sm font-medium">{count} ({totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColors[status] || 'bg-gray-500'} rounded-full`}
                      style={{ width: `${totalProjects > 0 ? (count / totalProjects) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Lead Sources</h2>
          </div>
          <div className="p-4">
            {Object.keys(data.leadsBySource).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.leadsBySource)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)]">
                      <span className="font-medium text-[var(--text-primary)]">{source}</span>
                      <span className="text-[var(--text-secondary)]">{count} leads</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-[var(--text-secondary)] py-4">No source data</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Top Projects by Revenue</h2>
          </div>
          <div className="p-4">
            {data.topProjects.length > 0 ? (
              <div className="space-y-3">
                {data.topProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{project.name}</p>
                      <p className={`text-sm ${project.profit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                        Net: ${project.profit.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-semibold text-[var(--success)]">
                      ${project.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--text-secondary)] py-4">No project data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
