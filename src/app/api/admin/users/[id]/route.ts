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
    const { isActive, balance } = body

    const updateData: Record<string, unknown> = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (balance !== undefined) updateData.balance = balance

    const user = await db.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        balance: user.balance,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}
