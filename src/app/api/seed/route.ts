import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

interface FieldDef {
  key: string
  label: string
  type: 'text' | 'date' | 'email' | 'tel'
  required: boolean
  placeholder: string
}

const SERVICE_FIELDS: Record<string, FieldDef[]> = {
  'Acta de Nacimiento': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Acta de Matrimonio': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Acta de Divorcio': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Acta de Defunción': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'RFC con IdCIF': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
  ],
  'RFC con CURP': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Localización de IdCIF CURP': [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
    { key: 'entidadFederativa', label: 'Entidad federativa de nacimiento', type: 'text', required: true, placeholder: 'Ej: Chiapas' },
  ],
  'Cita al SAT Primera Vez': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Ej: correo@ejemplo.com' },
    { key: 'telefono', label: 'Teléfono', type: 'tel', required: true, placeholder: 'Ej: 5512345678' },
  ],
  'Cita al SAT Primera Vez Express': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Ej: correo@ejemplo.com' },
    { key: 'telefono', label: 'Teléfono', type: 'tel', required: true, placeholder: 'Ej: 5512345678' },
  ],
  'Cita para la e.firma': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Ej: correo@ejemplo.com' },
  ],
  'Cambio de Lugar y Fecha de Emisión': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Cita para Cambio de Domicilio': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Corrección de Datos': [
    { key: 'rfc', label: 'RFC', type: 'text', required: true, placeholder: 'Ej: ABCD123456' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Buró de Crédito': [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
    { key: 'rfcOCurp', label: 'RFC o CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456 o ABCD123456HDFRFA09' },
  ],
  'Buró de Crédito con Score': [
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true, placeholder: '' },
    { key: 'rfcOCurp', label: 'RFC o CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456 o ABCD123456HDFRFA09' },
  ],
  'Semanas Cotizadas': [
    { key: 'nssOCurp', label: 'NSS o CURP', type: 'text', required: true, placeholder: 'Ej: 12345678901 o ABCD123456HDFRFA09' },
  ],
  'Semanas Cotizadas Detalladas': [
    { key: 'nssOCurp', label: 'NSS o CURP', type: 'text', required: true, placeholder: 'Ej: 12345678901 o ABCD123456HDFRFA09' },
  ],
  'NSS': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nombreCompleto', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
  ],
  'CFE': [
    { key: 'numeroServicio', label: 'Número de servicio', type: 'text', required: true, placeholder: 'Ej: 123456789' },
    { key: 'nombrePersona', label: 'Nombre de la persona', type: 'text', required: true, placeholder: 'Ej: Juan Pérez García' },
    { key: 'numeroMedidor', label: 'Número de medidor', type: 'text', required: true, placeholder: 'Ej: 12345678' },
  ],
  'Talón de Pago IMSS Activo y Jubilados': [
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
  ],
  'Talón de Pago Pensión ISSSTE': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'numeroPensionado', label: 'Número de pensionado', type: 'text', required: true, placeholder: 'Ej: 123456789' },
  ],
  'Desbloqueo de Cuenta Infonavit': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Pre-calificación Crédito Infonavit': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Recuperación de Clave Cuenta Infonavit': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Registro de Cuenta Infonavit': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Reporte Histórico Infonavit': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
  'Resumen de Movimientos Infonavit': [
    { key: 'curp', label: 'CURP', type: 'text', required: true, placeholder: 'Ej: ABCD123456HDFRFA09' },
    { key: 'nss', label: 'NSS', type: 'text', required: true, placeholder: 'Ej: 12345678901' },
  ],
}

const services = [
  { name: 'Acta de Nacimiento', estimatedTime: '10-20 min', price: 65, category: 'actas', sortOrder: 1 },
  { name: 'Acta de Matrimonio', estimatedTime: '10-20 min', price: 65, category: 'actas', sortOrder: 2 },
  { name: 'Acta de Divorcio', estimatedTime: '10-20 min', price: 65, category: 'actas', sortOrder: 3 },
  { name: 'Acta de Defunción', estimatedTime: '10-20 min', price: 65, category: 'actas', sortOrder: 4 },
  { name: 'RFC con IdCIF', estimatedTime: '15-30 min', price: 65, category: 'rfc', sortOrder: 5 },
  { name: 'RFC con CURP', estimatedTime: '30-60 min', price: 120, category: 'rfc', sortOrder: 6 },
  { name: 'Localización de IdCIF CURP', estimatedTime: '60 min', price: 90, category: 'rfc', sortOrder: 7 },
  { name: 'Cita al SAT Primera Vez', estimatedTime: '1 Día-4 Meses', price: 80, category: 'sat', sortOrder: 8 },
  { name: 'Cita al SAT Primera Vez Express', estimatedTime: '1 Día-10 Días', price: 500, category: 'sat', sortOrder: 9 },
  { name: 'Cita para la e.firma', estimatedTime: '1 Día-10 Días', price: 400, category: 'sat', sortOrder: 10 },
  { name: 'Cambio de Lugar y Fecha de Emisión', estimatedTime: '20-30 min', price: 100, category: 'sat', sortOrder: 11 },
  { name: 'Cita para Cambio de Domicilio', estimatedTime: '1 Día-10 Días', price: 400, category: 'sat', sortOrder: 12 },
  { name: 'Corrección de Datos', estimatedTime: '1 Día-10 Días', price: 400, category: 'sat', sortOrder: 13 },
  { name: 'Buró de Crédito', estimatedTime: '30 min', price: 60, category: 'credito', sortOrder: 14 },
  { name: 'Buró de Crédito con Score', estimatedTime: '30 min', price: 90, category: 'credito', sortOrder: 15 },
  { name: 'Semanas Cotizadas', estimatedTime: '30 min', price: 30, category: 'imss', sortOrder: 16 },
  { name: 'Semanas Cotizadas Detalladas', estimatedTime: '30-60 min', price: 60, category: 'imss', sortOrder: 17 },
  { name: 'NSS', estimatedTime: '20 min', price: 30, category: 'imss', sortOrder: 18 },
  { name: 'CFE', estimatedTime: '10-20 min', price: 15, category: 'servicios', sortOrder: 19 },
  { name: 'Talón de Pago IMSS Activo y Jubilados', estimatedTime: '30-60 min', price: 25, category: 'imss', sortOrder: 20 },
  { name: 'Talón de Pago Pensión ISSSTE', estimatedTime: '15-30 min', price: 10, category: 'imss', sortOrder: 21 },
  { name: 'Desbloqueo de Cuenta Infonavit', estimatedTime: '1-2 Horas', price: 100, category: 'infonavit', sortOrder: 22 },
  { name: 'Pre-calificación Crédito Infonavit', estimatedTime: '15-30 min', price: 80, category: 'infonavit', sortOrder: 23 },
  { name: 'Recuperación de Clave Cuenta Infonavit', estimatedTime: '1-2 Horas', price: 100, category: 'infonavit', sortOrder: 24 },
  { name: 'Registro de Cuenta Infonavit', estimatedTime: '1-2 Horas', price: 90, category: 'infonavit', sortOrder: 25 },
  { name: 'Reporte Histórico Infonavit', estimatedTime: '1-2 Horas', price: 70, category: 'infonavit', sortOrder: 26 },
  { name: 'Resumen de Movimientos Infonavit', estimatedTime: '1-2 Horas', price: 70, category: 'infonavit', sortOrder: 27 },
]

export async function POST() {
  try {
    // Create admin user if not exists
    const existingAdmin = await db.user.findUnique({ where: { email: 'admin@dax.com' } })
    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: 'admin@dax.com',
          password: 'admin123',
          name: 'Administrador DAX',
          phone: '0000000000',
          role: 'admin',
          sessionToken: randomUUID(),
        },
      })
    }

    // Check if already seeded
    const existingServices = await db.service.count()
    if (existingServices === 0) {
      // Create services with requiredFields
      for (const service of services) {
        const fields = SERVICE_FIELDS[service.name]
        await db.service.create({
          data: {
            name: service.name,
            estimatedTime: service.estimatedTime,
            price: service.price,
            category: service.category,
            sortOrder: service.sortOrder,
            description: `Trámite de ${service.name}`,
            requiredFields: fields ? JSON.stringify(fields) : null,
          },
        })
      }
      return NextResponse.json({ message: 'Base de datos inicializada correctamente', services: services.length })
    } else {
      // Update existing services with requiredFields (always update to keep in sync)
      let updated = 0
      const allServices = await db.service.findMany()
      for (const svc of allServices) {
        const fields = SERVICE_FIELDS[svc.name]
        if (fields) {
          const newFields = JSON.stringify(fields)
          if (svc.requiredFields !== newFields) {
            await db.service.update({
              where: { id: svc.id },
              data: { requiredFields: newFields },
            })
            updated++
          }
        } else if (!svc.requiredFields) {
          // No fields defined for this service name, skip
        }
      }
      return NextResponse.json({ message: 'Base de datos ya inicializada', updatedFields: updated })
    }
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Error al inicializar la base de datos' }, { status: 500 })
  }
}
