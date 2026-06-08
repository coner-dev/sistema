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

    const user = await db.user.findFirst({ where: { sessionToken: token } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const service = await db.service.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json({ error: 'Error al actualizar servicio' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findFirst({ where: { sessionToken: token } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    await db.service.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Servicio eliminado' })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json({ error: 'Error al eliminar servicio' }, { status: 500 })
  }
}
