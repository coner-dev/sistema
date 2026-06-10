const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Actualizando servicios con campos requeridos...");

  // Update each service individually
  await prisma.service.updateMany({
    where: { name: "Localización de IdCIF" },
    data: {
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" }
      ]),
    },
  });
  console.log(`✅ Actualizado: Localización de IdCIF`);

  await prisma.service.updateMany({
    where: { name: "Cambio de Lugar y Fecha de Emisión" },
    data: {
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "idcif", label: "IdCIF", required: true, type: "text" },
        { key: "lugarEmision", label: "Lugar de Emisión", required: true, type: "text" }
      ]),
    },
  });
  console.log(`✅ Actualizado: Cambio de Lugar y Fecha de Emisión`);

  await prisma.service.updateMany({
    where: { name: "Buro de Crédito Básico" },
    data: {
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "fotoINE", label: "Foto del INE", required: true, type: "file" },
        { key: "numeroTarjeta", label: "Número de Tarjeta de Crédito", required: true, type: "text" }
      ]),
    },
  });
  console.log(`✅ Actualizado: Buro de Crédito Básico`);

  await prisma.service.updateMany({
    where: { name: "Buro de Crédito con Score" },
    data: {
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "fotoINE", label: "Foto del INE", required: true, type: "file" },
        { key: "numeroTarjeta", label: "Número de Tarjeta de Crédito", required: true, type: "text" }
      ]),
    },
  });
  console.log(`✅ Actualizado: Buro de Crédito con Score`);

  await prisma.service.updateMany({
    where: { name: "Talón de pago ISSSTE" },
    data: {
      requiredFields: JSON.stringify([
        { key: "numeroPension", label: "Número de Pensión", required: true, type: "text" },
        { key: "codigoAdeudo", label: "Código de Adeudo", required: true, type: "text" }
      ]),
    },
  });
  console.log(`✅ Actualizado: Talón de pago ISSSTE`);

  await prisma.service.updateMany({
    where: { name: "Semanas Cotizadas Básica" },
    data: {
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "nss", label: "NSS", required: true, type: "text" }
      ]),
    },
  });
  console.log(`✅ Actualizado: Semanas Cotizadas Básica`);

  await prisma.service.updateMany({
    where: { name: "Semanas Cotizadas Detalladas" },
    data: {
      requiredFields: JSON.stringify([
        { key: "curp", label: "CURP", required: true, type: "text" },
        { key: "nss", label: "NSS", required: true, type: "text" }
      ]),
    },
  });
  console.log(`✅ Actualizado: Semanas Cotizadas Detalladas`);

  console.log("🎉 Actualización completada!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
