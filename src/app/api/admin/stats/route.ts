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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const totalUsers = await db.user.count({ where: { role: 'user' } })
    const activeUsers = await db.user.count({ where: { role: 'user', isActive: true } })
    const pendingDeposits = await db.transaction.count({ where: { type: 'deposit', status: 'pending' } })
    const pendingOrders = await db.order.count({ where: { status: 'pending' } })
    const completedOrders = await db.order.count({ where: { status: 'completed' } })
    const totalOrders = await db.order.count()

    const totalRevenueResult = await db.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ['pending', 'in_progress', 'completed'] } },
    })

    const totalBalanceResult = await db.user.aggregate({
      _sum: { balance: true },
      where: { role: 'user', isActive: true },
    })

    return NextResponse.json({
      totalUsers,
      activeUsers,
      pendingDeposits,
      pendingOrders,
      completedOrders,
      totalOrders,
      totalRevenue: totalRevenueResult._sum.totalPrice || 0,
      totalBalance: totalBalanceResult._sum.balance || 0,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
