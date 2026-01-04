import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const lead = await prisma.lead.findUnique({
      where: { id }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (lead.status !== 'won') {
      await prisma.lead.update({
        where: { id },
        data: { status: 'won', wonAt: new Date() }
      })
    }

    const project = await prisma.project.create({
      data: {
        name: data.name || lead.name,
        description: data.description,
        contractValue: data.contractValue ? parseFloat(data.contractValue) : lead.estimatedValue || 0,
        paymentType: data.paymentType || 'milestone',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        leadId: id,
        managerId: session.user.id
      },
      include: {
        lead: true,
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error converting lead to project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
