const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de servicios mexicanos...");

  const services = [
    {
      name: "Localización de IdCIF",
      description: "Obtén la localización del IdCIF de una persona",
      estimatedTime: "24 horas",
      price: 150.0,
      category: "identificacion",
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" }
      ]),
      sortOrder: 1,
    },
    {
      name: "Cambio de Lugar y Fecha de Emisión",
      description: "Modifica el lugar y fecha de emisión de un documento",
      estimatedTime: "48 horas",
      price: 200.0,
      category: "tramites",
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "idcif", label: "IdCIF", required: true, type: "text" },
        { key: "lugarEmision", label: "Lugar de Emisión", required: true, type: "text" }
      ]),
      sortOrder: 2,
    },
    {
      name: "Buro de Crédito Básico",
      description: "Consulta básica de historial crediticio",
      estimatedTime: "24 horas",
      price: 89.99,
      category: "credito",
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "fotoINE", label: "Foto del INE", required: true, type: "file" },
        { key: "numeroTarjeta", label: "Número de Tarjeta de Crédito", required: true, type: "text" }
      ]),
      sortOrder: 3,
    },
    {
      name: "Buro de Crédito con Score",
      description: "Consulta de historial crediticio con puntuación",
      estimatedTime: "24 horas",
      price: 129.99,
      category: "credito",
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "fotoINE", label: "Foto del INE", required: true, type: "file" },
        { key: "numeroTarjeta", label: "Número de Tarjeta de Crédito", required: true, type: "text" }
      ]),
      sortOrder: 4,
    },
    {
      name: "Talón de pago ISSSTE",
      description: "Obtén tu talón de pago del ISSSTE",
      estimatedTime: "12 horas",
      price: 50.0,
      category: "pensiones",
      requiredFields: JSON.stringify([
        { key: "numeroPension", label: "Número de Pensión", required: true, type: "text" },
        { key: "codigoAdeudo", label: "Código de Adeudo", required: true, type: "text" }
      ]),
      sortOrder: 5,
    },
    {
      name: "Semanas Cotizadas Básica",
      description: "Consulta básica de semanas cotizadas al IMSS",
      estimatedTime: "24 horas",
      price: 75.0,
      category: "pensiones",
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "nss", label: "NSS", required: true, type: "text" }
      ]),
      sortOrder: 6,
    },
    {
      name: "Semanas Cotizadas Detalladas",
      description:
        "Consulta detallada de semanas cotizadas al IMSS con desglose",
      estimatedTime: "48 horas",
      price: 125.0,
      category: "pensiones",
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "nss", label: "NSS", required: true, type: "text" }
      ]),
      sortOrder: 7,
    },
  ];

  for (const service of services) {
    const existingService = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existingService) {
      const created = await prisma.service.create({
        data: {
          ...service,
          isActive: true,
        },
      });
      console.log(`✅ Creado: ${created.name}`);
    } else {
      console.log(`⏭️  Ya existe: ${service.name}`);
    }
  }

  console.log("🎉 Seed completado!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error en seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
