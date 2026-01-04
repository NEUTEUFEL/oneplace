import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'

    let startDate: Date
    let endDate: Date
    const now = new Date()

    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        break
      case 'monthly':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'annually':
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const projects = await prisma.project.findMany({
      include: {
        payments: true,
        expenses: true,
        lead: {
          select: { name: true, company: true }
        }
      }
    })

    const paymentsInPeriod = await prisma.payment.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        project: {
          select: { name: true }
        }
      }
    })

    const expensesInPeriod = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        project: {
          select: { name: true }
        }
      }
    })

    const totalRevenue = paymentsInPeriod
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)

    const expectedRevenue = paymentsInPeriod
      .filter(p => p.status === 'pending' || p.status === 'invoiced')
      .reduce((sum, p) => sum + p.amount, 0)

    const totalExpenses = expensesInPeriod.reduce((sum, e) => sum + e.amount, 0)

    const projectSummaries = projects.map(project => {
      const projectPayments = project.payments
      const projectExpenses = project.expenses
      const totalPaid = projectPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
      const totalExpensesForProject = projectExpenses.reduce((sum, e) => sum + e.amount, 0)

      return {
        id: project.id,
        name: project.name,
        company: project.lead?.company || 'Direct Project',
        contractValue: project.contractValue,
        totalPaid,
        totalExpenses: totalExpensesForProject,
        netProfit: totalPaid - totalExpensesForProject,
        percentComplete: project.percentComplete,
        status: project.status
      }
    })

    const upcomingPayments = await prisma.payment.findMany({
      where: {
        status: { in: ['pending', 'invoiced'] },
        dueDate: { gte: now }
      },
      include: {
        project: {
          select: { name: true }
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    })

    const overduePayments = await prisma.payment.findMany({
      where: {
        status: { in: ['pending', 'invoiced'] },
        dueDate: { lt: now }
      },
      include: {
        project: {
          select: { name: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))

      const monthPayments = await prisma.payment.findMany({
        where: {
          paidDate: {
            gte: monthStart,
            lte: monthEnd
          },
          status: 'paid'
        }
      })

      const monthExpenses = await prisma.expense.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      })
    }

    return NextResponse.json({
      period,
      startDate,
      endDate,
      summary: {
        totalRevenue,
        expectedRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        projectCount: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length
      },
      projectSummaries,
      upcomingPayments,
      overduePayments,
      monthlyData
    })
  } catch (error) {
    console.error('Error fetching financials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
