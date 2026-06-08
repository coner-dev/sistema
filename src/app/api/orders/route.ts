import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findFirst({ where: { sessionToken: token } })
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let orders
    if (user.role === 'admin') {
      orders = await db.order.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      orders = await db.order.findMany({
        where: { userId: user.id },
        include: { service: { select: { id: true, name: true, category: true, estimatedTime: true } } },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await db.user.findFirst({ where: { sessionToken: token } })
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, notes, fieldValues } = body

    if (!serviceId) {
      return NextResponse.json({ error: 'El servicio es obligatorio' }, { status: 400 })
    }

    const service = await db.service.findUnique({ where: { id: serviceId } })
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 400 })
    }

    // Validate required fields
    if (service.requiredFields) {
      try {
        const requiredFields = JSON.parse(service.requiredFields) as Array<{ key: string; label: string; required: boolean }>
        const parsedFieldValues: Record<string, string> = fieldValues ? JSON.parse(fieldValues) : {}
        for (const field of requiredFields) {
          if (field.required && !parsedFieldValues[field.key]?.trim()) {
            return NextResponse.json({ error: `El campo "${field.label}" es obligatorio` }, { status: 400 })
          }
        }
      } catch {
        // If fieldValues can't be parsed, continue without validation
      }
    }

    // Check balance
    const freshUser = await db.user.findUnique({ where: { id: user.id } })
    if (!freshUser || freshUser.balance < service.price) {
      return NextResponse.json({ error: 'Saldo insuficiente. Por favor recarga tu saldo.' }, { status: 400 })
    }

    // Deduct balance and create order
    await db.user.update({
      where: { id: user.id },
      data: { balance: { decrement: service.price } },
    })

    const order = await db.order.create({
      data: {
        userId: user.id,
        serviceId,
        totalPrice: service.price,
        notes: notes || null,
        fieldValues: fieldValues || null,
        status: 'pending',
      },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}
