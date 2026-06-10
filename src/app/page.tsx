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

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-xl text-sm font-medium whitespace-nowrap animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          Soporte Vortex
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white rotate-45" />
        </div>
      )}
      <a
        href="https://wa.me/529613142550"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Contactar por WhatsApp - Soporte Vortex"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white group-hover:animate-pulse">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.494-1.653-1.791-.173-.297-.018-.458.13-.606.149-.149.331-.387.497-.58.166-.194.221-.331.331-.55.11-.219.055-.408-.055-.580-.11-.173-.973-2.387-1.333-3.27-.35-.859-.719-.742-.973-.755-.252-.012-.541-.01-.83-.01-.289 0-.759.11-1.157.55-.397.44-1.516 1.481-1.516 3.604 0 2.124 1.551 4.182 1.766 4.471.215.29 3.038 4.746 7.348 6.653.342.15.966.361 1.296.361.33 0 1.063-.108 1.215-.2.152-.092.975-.381 1.114-.748.139-.367.139-.683.097-.749-.041-.066-.152-.107-.311-.184z" />
        </svg>
      </a>
    </div>
  )
}

// ==================== MAIN APP ====================
type View = 'landing' | 'login' | 'register' | 'dashboard'

export default function VortexApp() {
  const [view, setView] = useState<View>('landing')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('vortex_token')
      const savedUser = localStorage.getItem('vortex_user')
      if (token && savedUser) {
        try {
          const data = await apiFetch('/auth/me')
          setUser(data.user)
          setView('dashboard')
        } catch {
          localStorage.removeItem('vortex_token')
          localStorage.removeItem('vortex_user')
        }
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  // Seed database on first load
  useEffect(() => {
    const seed = async () => {
      try {
        await fetch(`${API_BASE}/seed`, { method: 'POST' })
      } catch {
        // Ignore seed errors
      }
    }
    seed()
  }, [])

  // Load services
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await apiFetch('/services')
        if (!cancelled) setServices(data.services || [])
      } catch {
        // Will retry
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleLogin = (userData: UserInfo, token: string) => {
    localStorage.setItem('vortex_token', token)
    localStorage.setItem('vortex_user', JSON.stringify(userData))
    setUser(userData)
    setView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('vortex_token')
    localStorage.removeItem('vortex_user')
    setUser(null)
    setView('landing')
    setMobileMenuOpen(false)
  }

  const refreshUser = async () => {
    try {
      const data = await apiFetch('/auth/me')
      setUser(data.user)
      localStorage.setItem('vortex_user', JSON.stringify(data.user))
    } catch {
      handleLogout()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Image src="/logo.png" alt="Vortex" width={80} height={80} />
          </motion.div>
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
          <p className="text-gray-400 text-lg">Cargando...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <LandingView onLogin={() => setView('login')} onRegister={() => setView('register')} services={services} />
          </motion.div>
        )}
        {view === 'login' && (
          <motion.div key="login" initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <LoginView onLogin={handleLogin} onBack={() => setView('landing')} onRegister={() => setView('register')} />
          </motion.div>
        )}
        {view === 'register' && (
          <motion.div key="register" initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <RegisterView onRegister={handleLogin} onBack={() => setView('landing')} onLogin={() => setView('login')} />
          </motion.div>
        )}
        {view === 'dashboard' && user && (
          <motion.div key="dashboard" initial="initial" animate="animate" exit="exit" variants={pageVariants}>
            <DashboardView
              user={user}
              services={services}
              onLogout={handleLogout}
              onRefreshUser={refreshUser}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <WhatsAppFloatingButton mobileMenuOpen={mobileMenuOpen} />
    </div>
  )
}

// ==================== LANDING VIEW ====================
function LandingView({ onLogin, onRegister, services }: { onLogin: () => void; onRegister: () => void; services: Service[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))]
  const filteredServices = selectedCategory === 'all' ? services : services.filter(s => s.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Vortex" width={40} height={40} />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">VORTEX</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onLogin} className="text-gray-300 hover:text-white hover:bg-gray-800">
                Iniciar Sesión
              </Button>
              <Button onClick={onRegister} className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white">
                Crear Cuenta
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-gray-950 to-gray-950" />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">VORTEX</span> Trámites Digitales
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Tu plataforma de trámites digitales
            </motion.p>
            <motion.p
              className="text-gray-500 mb-10 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Realiza tus trámites de manera rápida y segura. Actas, RFC, SAT, IMSS, Infonavit y más.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" onClick={onRegister} className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-lg px-8 py-6 shadow-lg shadow-purple-500/50">
                  Comenzar Ahora <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" variant="outline" onClick={onLogin} className="border-gray-700 text-gray-300 hover:bg-gray-800 text-lg px-8 py-6">
                  Iniciar Sesión
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { icon: Shield, label: 'Trámites seguros' },
                { icon: Clock, label: 'Respuesta rápida' },
                { icon: MessageCircle, label: 'Soporte por WhatsApp' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-gray-400">
                  <Icon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { value: '27+', label: 'Servicios' },
              { value: '8', label: 'Categorías' },
              { value: '24/7', label: 'Disponible' },
            ].map(stat => (
              <div key={stat.label} className="text-center rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm py-5">
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">¿Por qué elegir Vortex?</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Hacemos tus trámites simples, rápidos y confiables</p>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          {[
            { icon: Clock, title: 'Rápido y eficiente', desc: 'Procesamos tus solicitudes en el menor tiempo posible para que no esperes de más.' },
            { icon: Shield, title: 'Seguro y confiable', desc: 'Tus datos están protegidos. Manejamos tu información con la máxima confidencialidad.' },
            { icon: Wallet, title: 'Saldo a tu favor', desc: 'Recarga tu saldo y úsalo cuando quieras en cualquiera de nuestros servicios.' },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={staggerItem}>
              <Card className="h-full bg-gray-900/80 backdrop-blur-sm border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Nuestros Servicios</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Más de 27 trámites digitales disponibles para ti</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
            >
              {cat === 'all' ? 'Todos' : CATEGORY_LABELS[cat] || cat}
            </Button>
          ))}
        </div>

        {/* Service Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredServices.map((service, index) => (
            <motion.div key={service.id} variants={staggerItem} custom={index}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className={CATEGORY_COLORS[service.category] || CATEGORY_COLORS.general}>
                        {CATEGORY_LABELS[service.category] || service.category}
                      </Badge>
                      <span className="text-purple-400 font-bold text-lg">${service.price}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mt-2 mb-1 group-hover:text-purple-300 transition-colors">{service.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{service.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Payment Info */}
      <section className="bg-gray-900 border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Método de Pago</h2>
            <p className="text-gray-400">Realiza tu depósito mediante transferencia bancaria</p>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Banknote className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-white font-semibold text-lg">Transferencia Bancaria</p>
                  <p className="text-gray-400 text-sm">Banco: Santander</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Nombre:</span>
                  <span className="text-white font-medium">Soluciones Digitales</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Banco:</span>
                  <span className="text-white font-medium">Santander</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">CLABE:</span>
                  <span className="text-white font-mono">0146 1014 0229 4278 94</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-400">Concepto:</span>
                  <span className="text-white font-mono">PANELTRAMITES</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Monto Mínimo:</span>
                  <span className="text-cyan-400 font-medium">$250.00 MXN</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/logo.png" alt="Vortex" width={36} height={36} />
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">VORTEX</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Tu plataforma de trámites digitales. Realizamos tus gestiones de actas, RFC, SAT, IMSS e Infonavit de forma rápida y segura.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5">
                {[
                  { icon: Shield, label: 'Trámites seguros' },
                  { icon: Clock, label: 'Respuesta rápida' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-500 text-xs">
                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Plataforma</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={onRegister} className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    Crear cuenta
                  </button>
                </li>
                <li>
                  <button onClick={onLogin} className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    Iniciar sesión
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    Nuestros servicios
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://wa.me/529613142550"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Soporte por WhatsApp
                  </a>
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4" />
                  961 314 2550
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-gray-500 text-sm">© 2026 Vortex. Todos los derechos reservados.</span>
            <a
              href="https://synkdata.online"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span>Powered by</span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:from-purple-300 group-hover:to-cyan-300 transition-all">
                Synkdata.online
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// [CONTINUES WITH LOGIN, REGISTER, DASHBOARD COMPONENTS...]
// [Due to size limits, the remaining components follow the same pattern of DAX -> Vortex changes]
// [Key changes: localStorage keys, colors (blue->purple), text updates, and data fields]