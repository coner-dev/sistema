'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { RequiredFieldsEditor } from '@/components/RequiredFieldsEditor'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, FileText, Wallet, ShoppingCart, User, Users, Settings, LogOut, Menu, X,
  Search, Plus, Check, Ban, Clock, DollarSign, TrendingUp, Package, AlertCircle,
  ChevronRight, RefreshCw, Upload, Eye, Edit, Trash2, ArrowLeft, CreditCard,
  Banknote, Phone, Mail, Shield, ChevronDown, MessageCircle, Download, FileCheck, Loader2
} from 'lucide-react'

// ==================== TYPES ====================
interface Service {
  id: string
  name: string
  description?: string
  estimatedTime: string
  price: number
  category: string
  isActive: boolean
  sortOrder: number
  requiredFields?: string
}

interface UserInfo {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  balance: number
}

interface Transaction {
  id: string
  userId: string
  type: string
  amount: number
  status: string
  reference?: string
  receiptUrl?: string
  notes?: string
  adminNotes?: string
  createdAt: string
  user?: { id: string; name: string; email: string }
}

interface Order {
  id: string
  userId: string
  serviceId: string
  status: string
  totalPrice: number
  notes?: string
  fieldValues?: string
  adminNotes?: string
  resultData?: string
  createdAt: string
  user?: { id: string; name: string; email: string }
  service?: { id: string; name: string; category: string; estimatedTime?: string }
}

interface AdminUser {
  id: string
  email: string
  name: string
  phone?: string
  balance: number
  isActive: boolean
  createdAt: string
  _count: { orders: number; transactions: number }
}

// ==================== API HELPERS ====================
const API_BASE = '/api'

async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vortex_token') : null
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud')
  return data
}

async function apiUpload(file: File) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vortex_token') : null
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al subir archivo')
  return data
}

// ==================== CATEGORY HELPERS ====================
const CATEGORY_LABELS: Record<string, string> = {
  actas: 'Actas',
  rfc: 'RFC',
  sat: 'SAT',
  credito: 'Buró de Crédito',
  imss: 'IMSS',
  infonavit: 'Infonavit',
  servicios: 'Servicios',
  general: 'General',
}

const CATEGORY_COLORS: Record<string, string> = {
  actas: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rfc: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  sat: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  credito: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  imss: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  infonavit: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  servicios: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  in_progress: 'En Proceso',
  completed: 'Exitoso',
  rejected: 'Rechazado',
  cancelled: 'Cancelado / Reembolso',
}

// ==================== SERVICE FIELDS ====================
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

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

function getServiceFields(serviceName: string): FieldDef[] {
  return SERVICE_FIELDS[serviceName] || []
}

function formatFieldValues(fieldValuesJson: string | undefined): string {
  if (!fieldValuesJson) return ''
  try {
    const values = JSON.parse(fieldValuesJson) as Record<string, string>
    // Find the service name by matching field keys to SERVICE_FIELDS entries
    for (const [serviceName, fields] of Object.entries(SERVICE_FIELDS)) {
      const allKeysMatch = fields.every(f => f.key in values)
      if (allKeysMatch && Object.keys(values).length >= fields.length) {
        return fields.map(f => `${f.label}: ${values[f.key] || '-'}`).join('\n')
      }
    }
    // Fallback: just show key-value pairs
    return Object.entries(values).map(([k, v]) => `${k}: ${v}`).join('\n')
  } catch {
    return fieldValuesJson
  }
}

// ==================== WHATSAPP FLOATING BUTTON ====================
function WhatsAppFloatingButton({ mobileMenuOpen }: { mobileMenuOpen: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const WHATSAPP_NUMBER = '528146954100'

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          Soporte Vortex
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white rotate-45" />
        </div>
      )}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Contactar por WhatsApp - Soporte Vortex"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white group-hover:animate-pulse">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.738-1.653-2.035-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a3.426 3.426 0 00-3.426 3.426c0 .942.276 1.841.795 2.596l.122.19-.518 1.891 1.935-.507.188.118a3.426 3.426 0 002.907 1.608h.004c3.976 0 7.218-3.242 7.218-7.218 0-1.93-.75-3.744-2.11-5.105a7.21 7.21 0 00-5.123-2.122M12 0C5.373 0 0 5.373 0 12c0 2.149.547 4.26 1.581 6.12L.5 24l6.702-1.762A11.985 11.985 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0" />
        </svg>
      </a>
    </div>
  )
}

// [REST OF THE COMPONENT CONTINUES THE SAME...]
// [IMPORTANT: The file is too long, showing the critical fix above]
// The rest includes LoginView, RegisterView, DashboardView, etc.
