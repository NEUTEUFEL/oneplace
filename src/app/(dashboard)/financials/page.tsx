'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'

interface FinancialData {
  period: string
  summary: {
    totalRevenue: number
    expectedRevenue: number
    totalExpenses: number
    netProfit: number
    projectCount: number
    activeProjects: number
  }
  projectSummaries: Array<{
    id: string
    name: string
    company: string
    contractValue: number
    totalPaid: number
    totalExpenses: number
    netProfit: number
    percentComplete: number
    status: string
  }>
  upcomingPayments: Array<{
    id: string
    amount: number
    dueDate: string
    project: { name: string }
    status: string
  }>
  overduePayments: Array<{
    id: string
    amount: number
    dueDate: string
    project: { name: string }
  }>
  monthlyData: Array<{
    month: string
    revenue: number
    expenses: number
  }>
}

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')

  useEffect(() => {
    fetchFinancials()
  }, [period])

  async function fetchFinancials() {
    setLoading(true)
    try {
      const res = await fetch(`/api/financials?period=${period}`)
      const financials = await res.json()
      setData(financials)
    } catch (error) {
      console.error('Error fetching financials:', error)
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
    return <div>Error loading financial data</div>
  }

  const maxChartValue = Math.max(
    ...data.monthlyData.map(d => Math.max(d.revenue, d.expenses))
  ) || 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Financial Overview</h1>
          <p className="text-[var(--text-secondary)]">Monitor revenue, expenses, and profitability</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-40"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Revenue ({period})</p>
              <p className="text-2xl font-bold text-[var(--success)]">
                ${data.summary.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Expected</p>
              <p className="text-2xl font-bold text-[var(--primary)]">
                ${data.summary.expectedRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Expenses</p>
              <p className="text-2xl font-bold text-[var(--danger)]">
                ${data.summary.totalExpenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${data.summary.netProfit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Net Profit</p>
              <p className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                ${data.summary.netProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Revenue vs Expenses (Last 6 Months)</h2>
          </div>
          <div className="p-4">
            <div className="h-64 flex items-end gap-4">
              {data.monthlyData.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 h-48 items-end justify-center">
                    <div
                      className="w-5 bg-[var(--success)] rounded-t transition-all"
                      style={{ height: `${(month.revenue / maxChartValue) * 100}%` }}
                      title={`Revenue: $${month.revenue.toLocaleString()}`}
                    />
                    <div
                      className="w-5 bg-[var(--danger)] rounded-t transition-all"
                      style={{ height: `${(month.expenses / maxChartValue) * 100}%` }}
                      title={`Expenses: $${month.expenses.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--success)] rounded" />
                <span className="text-sm text-[var(--text-secondary)]">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--danger)] rounded" />
                <span className="text-sm text-[var(--text-secondary)]">Expenses</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Overdue Payments</h2>
            </div>
          </div>
          <div className="p-4">
            {data.overduePayments.length > 0 ? (
              <div className="space-y-3">
                {data.overduePayments.map((payment) => (
                  <div key={payment.id} className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[var(--text-primary)]">{payment.project.name}</p>
                      <p className="font-semibold text-[var(--danger)]">
                        ${payment.amount.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Due {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--text-secondary)] py-4">No overdue payments</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Upcoming Payments</h2>
            </div>
          </div>
          <div className="p-4">
            {data.upcomingPayments.length > 0 ? (
              <div className="space-y-2">
                {data.upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-hover)]">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{payment.project.name}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Due {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--success)]">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <span className={`badge badge-${payment.status}`}>{payment.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--text-secondary)] py-4">No upcoming payments</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">Project Profitability</h2>
          </div>
          <div className="p-4">
            {data.projectSummaries.length > 0 ? (
              <div className="table-container">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Revenue</th>
                      <th>Expenses</th>
                      <th>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projectSummaries.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{project.company}</p>
                        </td>
                        <td className="text-[var(--success)]">${project.totalPaid.toLocaleString()}</td>
                        <td className="text-[var(--danger)]">${project.totalExpenses.toLocaleString()}</td>
                        <td className={project.netProfit >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}>
                          ${project.netProfit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-[var(--text-secondary)] py-4">No projects yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
