import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = await db.user.findFirst({ where: { sessionToken: token } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { status, adminNotes } = body

    const transaction = await db.transaction.findUnique({ where: { id } })
    if (!transaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Esta transacción ya ha sido procesada' }, { status: 400 })
    }

    const updated = await db.transaction.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
    })

    // If approved, add balance to user
    if (status === 'approved') {
      await db.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      })
    }

    return NextResponse.json({ transaction: updated })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json({ error: 'Error al actualizar transacción' }, { status: 500 })
  }
}
