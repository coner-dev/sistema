import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── ADMIN USER ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await db.user.upsert({
    where: { email: 'admin@coner.mx' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@coner.mx',
      password: hashedPassword,
      role: 'admin',
      balance: 9999,
      isActive: true,
    },
  });
  console.log('✅ Admin creado:', admin.email);

  // ─── SERVICES ────────────────────────────────────────────────────────────────
  // category = slug de categoría  |  requiredFields = JSON string de campos
  // estimatedTime = tiempo de entrega  |  sortOrder = orden en UI

  const services: {
    name: string;
    description?: string;
    price: number;
    estimatedTime: string;
    category: string;
    requiredFields: string;
    sortOrder: number;
  }[] = [

    // ── ACTAS Y CERTIFICADOS ─────────────────────────────────────────────────
    { name: 'Certificado De No Deudor Alimentario',      price: 80,  estimatedTime: '10-45 MIN',  category: 'actas', requiredFields: '["nombre_completo","curp"]',                    sortOrder: 101 },
    { name: 'Acta de Defunción con Nº Cadena',           price: 25,  estimatedTime: '10-45 MIN',  category: 'actas', requiredFields: '["folio_cadena"]',                              sortOrder: 102 },
    { name: 'Acta de Defunción Folio',                   price: 30,  estimatedTime: '10-15 MIN',  category: 'actas', requiredFields: '["nombre_completo","fecha_defuncion"]',         sortOrder: 103 },
    { name: 'Acta de Defunción México (Lento)',          price: 12,  estimatedTime: '15-30 MIN',  category: 'actas', requiredFields: '["nombre_completo","fecha_defuncion"]',         sortOrder: 104 },
    { name: 'Acta de Defunción México Solo (L-D)',       price: 25,  estimatedTime: '10-20 MIN',  category: 'actas', requiredFields: '["nombre_completo"]',                          sortOrder: 105 },
    { name: 'Acta de Divorcio con Nº Cadena',            price: 25,  estimatedTime: '10-45 MIN',  category: 'actas', requiredFields: '["folio_cadena"]',                              sortOrder: 106 },
    { name: 'Acta de Divorcio Folio',                    price: 30,  estimatedTime: '10-15 MIN',  category: 'actas', requiredFields: '["nombre_completo","fecha"]',                  sortOrder: 107 },
    { name: 'Acta de Divorcio México (Lento)',           price: 12,  estimatedTime: '15-30 MIN',  category: 'actas', requiredFields: '["nombre_completo"]',                          sortOrder: 108 },
    { name: 'Acta de Divorcio México Solo (L-D)',        price: 25,  estimatedTime: '10-20 MIN',  category: 'actas', requiredFields: '["nombre_completo"]',                          sortOrder: 109 },
    { name: 'Acta de Matrimonio con Nº Cadena',          price: 25,  estimatedTime: '10-45 MIN',  category: 'actas', requiredFields: '["folio_cadena"]',                              sortOrder: 110 },
    { name: 'Acta de Matrimonio Folio',                  price: 40,  estimatedTime: '10-15 MIN',  category: 'actas', requiredFields: '["nombre_completo","fecha"]',                  sortOrder: 111 },
    { name: 'Acta de Matrimonio México (Lento)',         price: 12,  estimatedTime: '15-30 MIN',  category: 'actas', requiredFields: '["nombre_completo"]',                          sortOrder: 112 },
    { name: 'Acta de Matrimonio México Solo (L-D)',      price: 25,  estimatedTime: '10-20 MIN',  category: 'actas', requiredFields: '["nombre_completo"]',                          sortOrder: 113 },
    { name: 'Acta de Nacimiento con Nº Cadena',          price: 25,  estimatedTime: '10-45 MIN',  category: 'actas', requiredFields: '["folio_cadena"]',                              sortOrder: 114 },
    { name: 'Acta de Nacimiento Folio',                  price: 30,  estimatedTime: '10-15 MIN',  category: 'actas', requiredFields: '["nombre_completo","fecha_nacimiento"]',       sortOrder: 115 },
    { name: 'Acta de Nacimiento México (Lento)',         price: 12,  estimatedTime: '15-30 MIN',  category: 'actas', requiredFields: '["nombre_completo"]',                          sortOrder: 116 },
    { name: 'Acta de Nacimiento México Solo (L-D)',      price: 25,  estimatedTime: '10-20 MIN',  category: 'actas', requiredFields: '["nombre_completo"]',                          sortOrder: 117 },

    // ── ACTAS POR CURP (RENAPO) ──────────────────────────────────────────────
    // Consulta directa vía CURP — integración RENAPO / CURP API
    { name: 'Acta de Nacimiento por CURP (Express)',     price: 35,  estimatedTime: '5-10 MIN',   category: 'actas-curp', requiredFields: '["curp"]',                               sortOrder: 201, description: 'Obtención de acta de nacimiento usando solo la CURP. Consulta directa a RENAPO. Entrega en PDF verificable.' },
    { name: 'Acta de Nacimiento por CURP (Estándar)',    price: 20,  estimatedTime: '10-30 MIN',  category: 'actas-curp', requiredFields: '["curp"]',                               sortOrder: 202, description: 'Acta de nacimiento por CURP en modalidad estándar. Mismo resultado, tiempo de proceso un poco mayor.' },
    { name: 'Acta de Matrimonio por CURP',               price: 45,  estimatedTime: '10-30 MIN',  category: 'actas-curp', requiredFields: '["curp"]',                               sortOrder: 203, description: 'Localización y entrega de acta de matrimonio a partir de la CURP del titular.' },
    { name: 'Acta de Defunción por CURP',                price: 35,  estimatedTime: '10-30 MIN',  category: 'actas-curp', requiredFields: '["curp"]',                               sortOrder: 204, description: 'Acta de defunción obtenida mediante consulta directa con la CURP del fallecido.' },
    { name: 'Acta de Divorcio por CURP',                 price: 45,  estimatedTime: '10-30 MIN',  category: 'actas-curp', requiredFields: '["curp"]',                               sortOrder: 205, description: 'Acta de divorcio localizada vía CURP. Aplica cuando el registro civil tiene folio vinculado a la CURP.' },
    { name: 'Paquete CURP + Acta de Nacimiento',         price: 45,  estimatedTime: '10-20 MIN',  category: 'actas-curp', requiredFields: '["nombre_completo","fecha_nacimiento","entidad"]', sortOrder: 206, description: 'Generación de CURP y obtención simultánea del acta de nacimiento asociada. Ideal para trámites que requieren ambos documentos.' },
    { name: 'Validación y Corrección de CURP',           price: 30,  estimatedTime: '10-20 MIN',  category: 'actas-curp', requiredFields: '["curp","nombre_completo"]',              sortOrder: 207, description: 'Verificación de CURP contra RENAPO y corrección de datos si hay discrepancia con el acta.' },

    // ── TRÁMITES FISCALES ────────────────────────────────────────────────────
    { name: 'Alta Contribuyente sin Acudir',             price: 700, estimatedTime: '15-25 Días', category: 'fiscales', requiredFields: '["nombre","curp","rfc"]',                   sortOrder: 301 },
    { name: 'Antecedentes No Penales Estatal (Reseteo)', price: 110, estimatedTime: '24-72 Hrs',  category: 'fiscales', requiredFields: '["nombre_completo","curp"]',               sortOrder: 302 },
    { name: 'Antecedentes No Penales Estatal (Primera Vez)', price: 100, estimatedTime: '1-24 Hrs', category: 'fiscales', requiredFields: '["nombre_completo","curp"]',             sortOrder: 303 },
    { name: 'Antecedentes No Penales Federal Original',  price: 280, estimatedTime: '2-3 Hrs',    category: 'fiscales', requiredFields: '["nombre_completo","curp"]',               sortOrder: 304 },
    { name: 'Cédula de Datos Fiscales',                  price: 40,  estimatedTime: '10-45 MIN',  category: 'fiscales', requiredFields: '["rfc","curp"]',                           sortOrder: 305 },
    { name: 'Constancia de No Afiliación al ISSTE',      price: 15,  estimatedTime: '10-15 MIN',  category: 'fiscales', requiredFields: '["nombre","curp"]',                        sortOrder: 306 },
    { name: 'Opinión Cumplimiento Obligaciones Fiscales 32-D', price: 20, estimatedTime: '10-15 MIN', category: 'fiscales', requiredFields: '["rfc"]',                              sortOrder: 307 },
    { name: 'Generar CURP a RFC',                        price: 6,   estimatedTime: '10-15 MIN',  category: 'fiscales', requiredFields: '["curp"]',                                 sortOrder: 308 },
    { name: 'Refacturación Registrada SAT',              price: 90,  estimatedTime: '10-15 MIN',  category: 'fiscales', requiredFields: '["rfc","uuid"]',                           sortOrder: 309 },

    // ── IMSS E INFONAVIT ─────────────────────────────────────────────────────
    { name: 'Asignación NSS IMSS',                       price: 20,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nombre_completo","curp"]',                   sortOrder: 401 },
    { name: 'Aviso Retención Infonavit',                 price: 200, estimatedTime: '10-45 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 402 },
    { name: 'Captura Promedio de Salario',               price: 140, estimatedTime: '10-45 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 403 },
    { name: 'Desbloqueo + Cambio Contraseña Infonavit',  price: 100, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 404 },
    { name: 'Desbloqueo Buró Infonavit (OCI)',           price: 10,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 405 },
    { name: 'Desvinculación Dispositivo Infonavit',      price: 200, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 406 },
    { name: 'Estado Cuenta Histórico Infonavit',         price: 120, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 407 },
    { name: 'Localizar Afore',                           price: 90,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nombre_completo","curp"]',                   sortOrder: 408 },
    { name: 'Número Seguro Social IMSS',                 price: 100, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nombre_completo","curp"]',                   sortOrder: 409 },
    { name: 'Precalificación Infonavit Bansefi',         price: 16,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 410 },
    { name: 'Precalificación Infonavit + Desbloqueo',    price: 50,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 411 },
    { name: 'Precalificación Infonavit Sistema (OCI)',   price: 400, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 412 },
    { name: 'Precalificación Mejoravit',                 price: 100, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 413 },
    { name: 'Recibo CFE Solo Número Servicio',           price: 190, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["numero_servicio"]',                          sortOrder: 414 },
    { name: 'Registro Nuevo Infonavit',                  price: 120, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nombre_completo","curp","nss"]',             sortOrder: 415 },
    { name: 'Reporte Personalizado IMSS (RPCI)',         price: 40,  estimatedTime: '10-45 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 416 },
    { name: 'Reseteo Infonavit',                         price: 40,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 417 },
    { name: 'Resumen Movimientos Infonavit',             price: 60,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 418 },
    { name: 'Semanas Cotizadas Detalladas (Premium)',    price: 110, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 419 },
    { name: 'Semanas Cotizadas Sencilla (Premium)',      price: 140, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 420 },
    { name: 'SINDO de Pensión (Nómina)',                 price: 40,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 421 },
    { name: 'SINDO de Pensión (Status)',                 price: 60,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 422 },
    { name: 'SINDO de Pensión (Viudas)',                 price: 60,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 423 },
    { name: 'SINDO Fechas Último Retiro',                price: 150, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 424 },
    { name: 'SINDO Promedio',                            price: 20,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 425 },
    { name: 'SINDOS Completos',                          price: 340, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 426 },
    { name: 'Vigencia (Premium)',                        price: 70,  estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss"]',                                      sortOrder: 427 },
    { name: 'Cambio Contraseña Mejoravit',               price: 120, estimatedTime: '10-15 MIN',  category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 428 },
    { name: 'Eliminación Cuenta Mejoravit',              price: 60,  estimatedTime: 'Lun-Vie',    category: 'imss', requiredFields: '["nss","nombre"]',                             sortOrder: 429 },

    // ── BURÓ Y CRÉDITO ───────────────────────────────────────────────────────
    { name: 'Buró de Crédito sin Datos Original',        price: 160, estimatedTime: '2-24 Hrs',   category: 'creditos', requiredFields: '["nombre_completo","curp"]',               sortOrder: 501 },
    { name: 'CSF con CURP Persona Física Original',      price: 140, estimatedTime: '10-15 MIN',  category: 'creditos', requiredFields: '["curp"]',                                 sortOrder: 502 },
    { name: 'CSF con CURP Verificable Express',          price: 70,  estimatedTime: '10-15 MIN',  category: 'creditos', requiredFields: '["curp"]',                                 sortOrder: 503 },
    { name: 'CSF con CURP Verificable Lento',            price: 65,  estimatedTime: '10-45 MIN',  category: 'creditos', requiredFields: '["curp"]',                                 sortOrder: 504 },
    { name: 'CSF con RFC e IDCIF',                       price: 20,  estimatedTime: '10-15 MIN',  category: 'creditos', requiredFields: '["rfc"]',                                  sortOrder: 505 },
    { name: 'CSF Solo con CURP Clon',                    price: 30,  estimatedTime: '10-15 MIN',  category: 'creditos', requiredFields: '["curp"]',                                 sortOrder: 506 },
    { name: 'CSF Persona Moral Original',                price: 180, estimatedTime: '10-45 MIN',  category: 'creditos', requiredFields: '["rfc","idcif"]',                          sortOrder: 507 },
    { name: 'Localizar IDCIF Express',                   price: 60,  estimatedTime: '10-15 MIN',  category: 'creditos', requiredFields: '["nombre_completo"]',                      sortOrder: 508 },
    { name: 'Localizar IDCIF Lento',                     price: 500, estimatedTime: '3 Hrs',      category: 'creditos', requiredFields: '["nombre_completo"]',                      sortOrder: 509 },

    // ── PERMISOS DE CONDUCIR ─────────────────────────────────────────────────
    { name: 'Permiso Conducir sin Placa CDMX',           price: 25,  estimatedTime: '10-45 MIN',  category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]',   sortOrder: 601 },
    { name: 'Permiso Conducir sin Placa Edo. México',    price: 25,  estimatedTime: '10-45 MIN',  category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]',   sortOrder: 602 },
    { name: 'Permiso Conducir sin Placa Jalisco',        price: 25,  estimatedTime: '10-45 MIN',  category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]',   sortOrder: 603 },
    { name: 'Permiso Conducir sin Placa Oaxaca',         price: 90,  estimatedTime: '10-45 MIN',  category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]',   sortOrder: 604 },
    { name: 'Permiso Conducir sin Placa Aguascalientes', price: 80,  estimatedTime: '10-45 MIN',  category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]',   sortOrder: 605 },
    { name: 'Permiso Conducir sin Placa San Luis Potosí', price: 80, estimatedTime: '10-45 MIN',  category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]',   sortOrder: 606 },
    { name: 'Permiso Conducir sin Placa Copalillo Guerrero', price: 60, estimatedTime: '10-45 MIN', category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]', sortOrder: 607 },
    { name: 'Permiso Conducir sin Placa Tlapa Guerrero', price: 80,  estimatedTime: '10-45 MIN',  category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]',   sortOrder: 608 },
    { name: 'Permiso Conducir sin Placa Huitzuco Guerrero', price: 180, estimatedTime: '10-45 MIN', category: 'conducir', requiredFields: '["nombre_completo","fecha_nacimiento"]', sortOrder: 609 },

    // ── LICENCIAS Y SOFTWARE ─────────────────────────────────────────────────
    { name: 'Licencia IBO Player Pro 1 Año',             price: 30,  estimatedTime: 'Instant',    category: 'licencias', requiredFields: '["email","mac_dispositivo"]',              sortOrder: 701 },
    { name: 'Licencia Smart Player 1 Año',               price: 8,   estimatedTime: 'Instant',    category: 'licencias', requiredFields: '["email","mac_dispositivo"]',              sortOrder: 702 },
    { name: 'Licencia Vivo Player 1 Año',                price: 25,  estimatedTime: 'Instant',    category: 'licencias', requiredFields: '["email","mac_dispositivo"]',              sortOrder: 703 },
    { name: 'Eleventa Multicaja 5.20 Permanente',        price: 160, estimatedTime: '10-15 MIN',  category: 'licencias', requiredFields: '["nombre","email","serie_equipo"]',        sortOrder: 704 },
    { name: 'Código Japishow Descargas Premium',         price: 100, estimatedTime: '10-15 MIN',  category: 'licencias', requiredFields: '["email"]',                               sortOrder: 705 },
    { name: 'Ibo Multi Player',                          price: 100, estimatedTime: '10-15 MIN',  category: 'licencias', requiredFields: '["email","mac_dispositivo"]',              sortOrder: 706 },
    { name: 'Multi Player',                              price: 5,   estimatedTime: '10-15 MIN',  category: 'licencias', requiredFields: '["email","mac_dispositivo"]',              sortOrder: 707 },

    // ── STREAMING E IPTV ─────────────────────────────────────────────────────
    { name: 'Cuenta FlujoTV 1 Mes',                      price: 60,  estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 801 },
    { name: 'Cuenta FlujoTV 3 Meses',                    price: 140, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 802 },
    { name: 'Cuenta FlujoTV 6 Meses',                    price: 260, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 803 },
    { name: 'Cuenta FlujoTV 12 Meses',                   price: 500, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 804 },
    { name: 'Cuenta StellaTV 1 Mes',                     price: 60,  estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 805 },
    { name: 'Cuenta StellaTV 3 Meses',                   price: 140, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 806 },
    { name: 'Cuenta StellaTV 6 Meses',                   price: 260, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 807 },
    { name: 'Cuenta StellaTV 12 Meses',                  price: 500, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 808 },
    { name: 'Cuenta TeleLatino 1 Mes',                   price: 60,  estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 809 },
    { name: 'Cuenta TeleLatino 3 Meses',                 price: 140, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 810 },
    { name: 'Cuenta TeleLatino 6 Meses',                 price: 260, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 811 },
    { name: 'Cuenta TeleLatino 12 Meses',                price: 500, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 812 },
    { name: 'Cuenta Oleada TV 1 Mes',                    price: 60,  estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 813 },
    { name: 'Cuenta Oleada TV 3 Meses',                  price: 140, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 814 },
    { name: 'Cuenta Oleada TV 6 Meses',                  price: 260, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 815 },
    { name: 'Cuenta Oleada TV 12 Meses',                 price: 500, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 816 },
    { name: 'IPTV M327 Cuenta Nueva',                    price: 110, estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 817 },
    { name: 'IPTV M327 Renovación',                      price: 55,  estimatedTime: 'Instant',    category: 'streaming', requiredFields: '["email"]',                               sortOrder: 818 },

    // ── IDENTIDAD Y CURP ─────────────────────────────────────────────────────
    { name: 'Documento CURP Estado Emergencia',          price: 10,  estimatedTime: '10-15 MIN',  category: 'identidad', requiredFields: '["nombre_completo","fecha_nacimiento","entidad"]', sortOrder: 901 },

    // ── PLATAFORMAS DE STREAMING ─────────────────────────────────────────────
    { name: 'Netflix Cuenta Individual',                 price: 185, estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1001 },
    { name: 'Netflix Perfil Adicional',                  price: 55,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1002 },
    { name: 'Disney+ Cuenta Individual',                 price: 110, estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1003 },
    { name: 'Disney+ Perfil Adicional',                  price: 50,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1004 },
    { name: 'Spotify Cuenta Individual',                 price: 40,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1005 },
    { name: 'Spotify Cuenta Premium',                    price: 110, estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1006 },
    { name: 'Prime Video Cuenta Individual',             price: 75,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1007 },
    { name: 'Prime Video Perfil Adicional',              price: 20,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1008 },
    { name: 'ClaroVideo + Fox Premium',                  price: 60,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1009 },
    { name: 'ClaroVideo + Fox Renovación',               price: 35,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1010 },
    { name: 'ClaroVideo + Crunchyroll Premium',          price: 60,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1011 },
    { name: 'ClaroVideo + Crunchyroll Renovación',       price: 35,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1012 },
    { name: 'HBO Max Cuenta Individual',                 price: 80,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1013 },
    { name: 'HBO Max Perfil Adicional',                  price: 30,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1014 },
    { name: 'Amazon Music Individual',                   price: 35,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1015 },
    { name: 'Amazon Music Anual',                        price: 85,  estimatedTime: 'Instant',    category: 'plataformas', requiredFields: '["email"]',                             sortOrder: 1016 },

    // ── SOFTWARE Y HERRAMIENTAS ──────────────────────────────────────────────
    { name: 'Canva Pro Mensual',                         price: 45,  estimatedTime: 'Instant',    category: 'software', requiredFields: '["email"]',                               sortOrder: 1101 },
    { name: 'Canva Pro Anual',                           price: 120, estimatedTime: 'Instant',    category: 'software', requiredFields: '["email"]',                               sortOrder: 1102 },
    { name: 'Punto de Venta Mensual',                    price: 160, estimatedTime: 'Instant',    category: 'software', requiredFields: '["email","nombre"]',                      sortOrder: 1103 },
    { name: 'Punto de Venta Permanente',                 price: 200, estimatedTime: 'Instant',    category: 'software', requiredFields: '["email","nombre"]',                      sortOrder: 1104 },
    { name: 'Sistema de Facturación Mensual',            price: 140, estimatedTime: 'Instant',    category: 'software', requiredFields: '["email","nombre","rfc"]',                sortOrder: 1105 },
    { name: 'Sistema de Facturación Renovación',         price: 70,  estimatedTime: 'Instant',    category: 'software', requiredFields: '["email","rfc"]',                         sortOrder: 1106 },

    // ── OSINT E INTELIGENCIA ─────────────────────────────────────────────────
    { name: 'Perfilamiento por Nombre Completo',         price: 150, estimatedTime: '15-30 MIN',  category: 'osint', requiredFields: '["nombre_completo"]',                         sortOrder: 1201 },
    { name: 'Perfilamiento por Número de Teléfono',      price: 120, estimatedTime: '15-30 MIN',  category: 'osint', requiredFields: '["telefono"]',                                sortOrder: 1202 },
    { name: 'Perfilamiento por Correo Electrónico',      price: 100, estimatedTime: '15-30 MIN',  category: 'osint', requiredFields: '["email"]',                                   sortOrder: 1203 },
    { name: 'Enriquecimiento y Búsqueda de Redes Sociales', price: 80, estimatedTime: '10-20 MIN', category: 'osint', requiredFields: '["nombre_completo","telefono"]',             sortOrder: 1204 },
    { name: 'Análisis de Riesgo y Búsqueda en Listas Negras', price: 200, estimatedTime: '20-45 MIN', category: 'osint', requiredFields: '["nombre_completo","curp"]',             sortOrder: 1205 },
    { name: 'Antecedentes Penales Estatales en Tiempo Real', price: 250, estimatedTime: '30-60 MIN', category: 'osint', requiredFields: '["nombre_completo","curp","entidad"]',    sortOrder: 1206 },
  ];

  let created = 0;
  for (const svc of services) {
    await db.service.upsert({
      where: {
        // name es unique por convención — si tu schema no tiene @unique en name,
        // cambia esto por un campo que sí lo sea o usa create directamente.
        name: svc.name,
      },
      update: {
        price: svc.price,
        estimatedTime: svc.estimatedTime,
        category: svc.category,
        requiredFields: svc.requiredFields,
        sortOrder: svc.sortOrder,
        description: svc.description ?? null,
        isActive: true,
      },
      create: {
        name: svc.name,
        description: svc.description ?? null,
        price: svc.price,
        estimatedTime: svc.estimatedTime,
        category: svc.category,
        requiredFields: svc.requiredFields,
        sortOrder: svc.sortOrder,
        isActive: true,
      },
    });
    created++;
  }
  console.log(`✅ Servicios creados/actualizados: ${created}`);
  console.log(`   → actas:        ${services.filter(s => s.category === 'actas').length}`);
  console.log(`   → actas-curp:   ${services.filter(s => s.category === 'actas-curp').length}`);
  console.log(`   → fiscales:     ${services.filter(s => s.category === 'fiscales').length}`);
  console.log(`   → imss:         ${services.filter(s => s.category === 'imss').length}`);
  console.log(`   → creditos:     ${services.filter(s => s.category === 'creditos').length}`);
  console.log(`   → conducir:     ${services.filter(s => s.category === 'conducir').length}`);
  console.log(`   → licencias:    ${services.filter(s => s.category === 'licencias').length}`);
  console.log(`   → streaming:    ${services.filter(s => s.category === 'streaming').length}`);
  console.log(`   → identidad:    ${services.filter(s => s.category === 'identidad').length}`);
  console.log(`   → plataformas:  ${services.filter(s => s.category === 'plataformas').length}`);
  console.log(`   → software:     ${services.filter(s => s.category === 'software').length}`);
  console.log(`   → osint:        ${services.filter(s => s.category === 'osint').length}`);

  // ─── SETTINGS ────────────────────────────────────────────────────────────────
  const settings = [
    // Datos bancarios
    { key: 'bank_name',        value: 'SANTANDER' },
    { key: 'bank_clabe',       value: '0000 0000 0000 0000 00' },
    { key: 'bank_reference',   value: 'CONER' },
    { key: 'bank_account',     value: 'NOMBRE TITULAR' },
    { key: 'min_payment',      value: '100' },
    { key: 'max_payment',      value: '50000' },
    // Plataforma
    { key: 'site_name',        value: 'CONER' },
    { key: 'site_description', value: 'Plataforma de Servicios Digitales' },
    { key: 'whatsapp',         value: '521XXXXXXXXXX' },
    { key: 'support_email',    value: 'soporte@coner.mx' },
  ];

  for (const setting of settings) {
    await db.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ Settings creados');

  console.log('\n🎉 Seed completado!');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
