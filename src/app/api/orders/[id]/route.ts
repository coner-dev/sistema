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
    const { status, adminNotes, resultData } = body

    const order = await db.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (resultData !== undefined) updateData.resultData = resultData

    // If order is cancelled, refund the balance
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await db.user.update({
        where: { id: order.userId },
        data: { balance: { increment: order.totalPrice } },
      })
    }

    const updated = await db.order.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 })
  }
}
