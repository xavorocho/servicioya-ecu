import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.timeProposal.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.providerDocument.deleteMany();
  await prisma.request.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  console.log("Creando categorías...");
  const categories = await Promise.all([
    prisma.category.create({ data: { slug: "plomeria", name: "Plomería", description: "Fugas, tuberías, grifería y mantenimiento.", icon: "wrench", color: "from-blue-500 to-cyan-500" } }),
    prisma.category.create({ data: { slug: "electricidad", name: "Electricidad", description: "Instalaciones, tomacorrientes y fallas eléctricas.", icon: "bolt", color: "from-amber-500 to-yellow-500" } }),
    prisma.category.create({ data: { slug: "limpieza", name: "Limpieza", description: "Limpieza general, profunda y por horas.", icon: "broom", color: "from-emerald-500 to-teal-500" } }),
    prisma.category.create({ data: { slug: "pintura", name: "Pintura", description: "Pintura interior, exterior y retoques.", icon: "paint-roller", color: "from-purple-500 to-pink-500" } }),
    prisma.category.create({ data: { slug: "carpinteria", name: "Carpintería", description: "Muebles, puertas, repisas y reparaciones.", icon: "hammer", color: "from-orange-500 to-red-500" } }),
    prisma.category.create({ data: { slug: "jardineria", name: "Jardinería", description: "Poda, césped y mantenimiento de jardines.", icon: "seedling", color: "from-green-500 to-emerald-500" } }),
    prisma.category.create({ data: { slug: "electrodomesticos", name: "Electrodomésticos", description: "Diagnóstico y reparación de equipos.", icon: "plug", color: "from-slate-500 to-gray-500" } }),
    prisma.category.create({ data: { slug: "mudanzas", name: "Mudanzas", description: "Carga, traslado y descarga de muebles.", icon: "truck", color: "from-indigo-500 to-blue-500" } }),
    prisma.category.create({ data: { slug: "cerrajeria", name: "Cerrajería", description: "Chapas, llaves y apertura de puertas.", icon: "key", color: "from-rose-500 to-pink-500" } }),
    prisma.category.create({ data: { slug: "cuidado", name: "Cuidado del hogar", description: "Asistencia y apoyo en tareas del hogar.", icon: "house-user", color: "from-violet-500 to-purple-500" } }),
  ]);

  console.log("Creando usuarios demo...");
  const password = await bcrypt.hash("123456", 10);

  const cliente = await prisma.user.create({
    data: { name: "Justin Medina", email: "cliente@demo.com", password, role: "cliente", phone: "0990001112", city: "Latacunga", status: "Activo" },
  });
  const admin = await prisma.user.create({
    data: { name: "Xavier Yugcha", email: "admin@demo.com", password, role: "admin", phone: "0988887777", city: "Latacunga", status: "Activo" },
  });

  console.log("Creando proveedores demo...");
  const proveedorUser = await prisma.user.create({
    data: { name: "Juan Pérez", email: "proveedor@demo.com", password, role: "proveedor", phone: "0991112223", city: "Latacunga", status: "Aprobado" },
  });
  const pendienteUser = await prisma.user.create({
    data: { name: "Pedro Loján", email: "pendiente@demo.com", password, role: "proveedor", phone: "0946667778", city: "Riobamba", status: "Pendiente" },
  });

  const catPlomeria = categories.find((c) => c.slug === "plomeria");
  const catLimpieza = categories.find((c) => c.slug === "limpieza");
  const catElectricidad = categories.find((c) => c.slug === "electricidad");
  const catPintura = categories.find((c) => c.slug === "pintura");
  const catCuidado = categories.find((c) => c.slug === "cuidado");
  const catElectro = categories.find((c) => c.slug === "electrodomesticos");

  const juanPerez = await prisma.provider.create({
    data: {
      userEmail: "proveedor@demo.com", name: "Juan Pérez", category: "plomeria", categoryName: "Plomería",
      city: "Latacunga", sector: "La Matriz", rating: 4.8, reviews: 48, price: 25, available: true, verified: true,
      status: "Aprobado", color: "avatar-green", experience: "6 años de experiencia", phone: "0991112223",
      description: "Especialista en fugas de agua, cambios de llaves, mantenimiento de tuberías y reparaciones urgentes.",
      services: JSON.stringify(["Reparación de fugas", "Cambio de grifería", "Mantenimiento de tuberías", "Instalación de lavamanos"]),
      documents: JSON.stringify({ cedula: "cedula_juan_perez.pdf", antecedentes: "certificado_antecedentes_juan.pdf", oficio: "certificado_experiencia_plomeria.pdf", ruc: "ruc_juan_perez.pdf" }),
      comments: JSON.stringify([{ user: "Mónica A.", rating: 5, text: "Llegó puntual y solucionó la fuga rápidamente." }, { user: "Diego R.", rating: 4, text: "Buen trabajo, explicó claramente el problema." }]),
      categoryId: catPlomeria.id, experienceYears: 6, baseReferencePrice: 25,
    },
  });

  await prisma.provider.create({
    data: {
      userEmail: "ana@servicioya.ec", name: "Ana Romero", category: "limpieza", categoryName: "Limpieza",
      city: "Quito", sector: "Quitumbe", rating: 4.9, reviews: 82, price: 18, available: true, verified: true,
      status: "Aprobado", color: "avatar-green", experience: "4 años de experiencia", phone: "0982223334",
      description: "Servicio de limpieza para casas, departamentos, oficinas pequeñas y limpieza profunda por horas.",
      services: JSON.stringify(["Limpieza general", "Limpieza profunda", "Desinfección básica", "Organización de espacios"]),
      documents: JSON.stringify({ cedula: "cedula_ana_romero.pdf", antecedentes: "certificado_antecedentes_ana.pdf", oficio: "referencias_limpieza.pdf", ruc: "rimpe_ana_romero.pdf" }),
      comments: JSON.stringify([{ user: "Paola V.", rating: 5, text: "Excelente servicio y muy cuidadosa." }, { user: "Kevin L.", rating: 5, text: "Dejó el departamento impecable." }]),
      categoryId: catLimpieza.id, experienceYears: 4, baseReferencePrice: 18,
    },
  });

  await prisma.provider.create({
    data: {
      userEmail: "carlos@servicioya.ec", name: "Carlos Mena", category: "electricidad", categoryName: "Electricidad",
      city: "Ambato", sector: "Ficoa", rating: 4.7, reviews: 39, price: 30, available: true, verified: true,
      status: "Aprobado", color: "avatar-orange", experience: "8 años de experiencia", phone: "0973334445",
      description: "Técnico eléctrico para revisión de instalaciones, cambios de tomacorrientes, breakers y luminarias.",
      services: JSON.stringify(["Revisión eléctrica", "Instalación de luminarias", "Cambio de tomacorrientes", "Tableros eléctricos"]),
      documents: JSON.stringify({ cedula: "cedula_carlos_mena.pdf", antecedentes: "certificado_antecedentes_carlos.pdf", oficio: "certificado_electricidad.pdf", ruc: "ruc_carlos_mena.pdf" }),
      comments: JSON.stringify([{ user: "Fernanda T.", rating: 5, text: "Muy profesional y ordenado." }, { user: "Andrés P.", rating: 4, text: "Resolvió el problema el mismo día." }]),
      categoryId: catElectricidad.id, experienceYears: 8, baseReferencePrice: 30,
    },
  });

  await prisma.provider.create({
    data: {
      userEmail: "sofia@servicioya.ec", name: "Sofía Vega", category: "pintura", categoryName: "Pintura",
      city: "Pelileo", sector: "Centro", rating: 4.6, reviews: 27, price: 35, available: false, verified: true,
      status: "Aprobado", color: "avatar-red", experience: "5 años de experiencia", phone: "0964445556",
      description: "Pintura de interiores y exteriores, retoques de paredes, preparación de superficie y acabados.",
      services: JSON.stringify(["Pintura interior", "Pintura exterior", "Retoques", "Preparación de paredes"]),
      documents: JSON.stringify({ cedula: "cedula_sofia_vega.pdf", antecedentes: "certificado_antecedentes_sofia.pdf", oficio: "portafolio_pintura.pdf", ruc: "rimpe_sofia_vega.pdf" }),
      comments: JSON.stringify([{ user: "Josselyn G.", rating: 5, text: "El acabado quedó muy limpio." }, { user: "Mario S.", rating: 4, text: "Buen precio y buen trato." }]),
      categoryId: catPintura.id, experienceYears: 5, baseReferencePrice: 35,
    },
  });

  await prisma.provider.create({
    data: {
      userEmail: "martha@servicioya.ec", name: "Martha Quispe", category: "cuidado", categoryName: "Cuidado del hogar",
      city: "Latacunga", sector: "San Felipe", rating: 4.9, reviews: 56, price: 22, available: true, verified: true,
      status: "Aprobado", color: "avatar-purple", experience: "9 años de experiencia", phone: "0928889990",
      description: "Asistencia para cuidado del hogar, apoyo a adultos mayores y acompañamiento básico.",
      services: JSON.stringify(["Asistencia del hogar", "Acompañamiento", "Organización", "Apoyo por horas"]),
      documents: JSON.stringify({ cedula: "cedula_martha_quispe.pdf", antecedentes: "certificado_antecedentes_martha.pdf", oficio: "referencias_cuidado_hogar.pdf", ruc: "rimpe_martha.pdf" }),
      comments: JSON.stringify([{ user: "Lucía P.", rating: 5, text: "Muy amable y confiable." }, { user: "Gabriel T.", rating: 5, text: "Excelente atención." }]),
      categoryId: catCuidado.id, experienceYears: 9, baseReferencePrice: 22,
    },
  });

  const pedroLojan = await prisma.provider.create({
    data: {
      userEmail: "pendiente@demo.com", name: "Pedro Loján", category: "electrodomesticos", categoryName: "Electrodomésticos",
      city: "Riobamba", sector: "Lizarzaburu", rating: 0, reviews: 0, price: 28, available: false, verified: false,
      status: "Pendiente", color: "avatar-cyan", experience: "2 años de experiencia", phone: "0946667778",
      description: "Revisión básica de lavadoras, cocinas, refrigeradoras y pequeños electrodomésticos.",
      services: JSON.stringify(["Diagnóstico", "Mantenimiento preventivo", "Revisión de lavadoras", "Revisión de cocinas"]),
      documents: JSON.stringify({ cedula: "cedula_pedro_lojan.pdf", antecedentes: "certificado_antecedentes_pedro.pdf", oficio: "referencias_electrodomesticos.pdf", ruc: "No adjuntado" }),
      comments: JSON.stringify([]),
      categoryId: catElectro.id, experienceYears: 2, baseReferencePrice: 28,
    },
  });

  await prisma.user.update({ where: { id: proveedorUser.id }, data: { providerId: juanPerez.id } });
  await prisma.user.update({ where: { id: pendienteUser.id }, data: { providerId: pedroLojan.id } });

  console.log("Creando documentos demo...");
  await prisma.providerDocument.create({ data: { providerId: juanPerez.id, documentType: "cedula", filePath: "/uploads/cedula_juan.pdf", originalName: "cedula_juan.pdf", reviewStatus: "Aprobado", reviewedBy: "admin@demo.com" } });
  await prisma.providerDocument.create({ data: { providerId: juanPerez.id, documentType: "antecedentes", filePath: "/uploads/antecedentes_juan.pdf", originalName: "antecedentes_juan.pdf", reviewStatus: "Aprobado", reviewedBy: "admin@demo.com" } });
  await prisma.providerDocument.create({ data: { providerId: juanPerez.id, documentType: "experiencia", filePath: "/uploads/experiencia_juan.pdf", originalName: "experiencia_juan.pdf", reviewStatus: "Aprobado", reviewedBy: "admin@demo.com" } });

  await prisma.providerDocument.create({ data: { providerId: pedroLojan.id, documentType: "cedula", filePath: "/uploads/cedula_pedro.pdf", originalName: "cedula_pedro.pdf", reviewStatus: "Pendiente" } });
  await prisma.providerDocument.create({ data: { providerId: pedroLojan.id, documentType: "antecedentes", filePath: "/uploads/antecedentes_pedro.pdf", originalName: "antecedentes_pedro.pdf", reviewStatus: "Pendiente" } });

  console.log("Creando solicitudes demo...");
  const req1 = await prisma.request.create({
    data: {
      displayId: "SY-1001", clientEmail: "cliente@demo.com", client: "Justin Medina", providerId: juanPerez.id,
      providerName: "Juan Pérez", service: "Plomería", city: "Latacunga", address: "La Matriz",
      description: "Reparación de fuga en lavamanos del baño principal. El agua gotea constantemente.",
      phone: "0990001112", preferredDate: "2026-07-15", preferredTimeRange: "Tarde", status: "pendiente_cotizacion",
    },
  });

  const req2 = await prisma.request.create({
    data: {
      displayId: "SY-1002", clientEmail: "cliente@demo.com", client: "Justin Medina", providerId: juanPerez.id,
      providerName: "Juan Pérez", service: "Plomería", city: "Latacunga", address: "San Felipe",
      description: "Cambio de tubería en cocina que está obstruida. Necesito que revisen y reemplacen la sección dañada.",
      phone: "0990001112", preferredDate: "2026-07-18", preferredTimeRange: "Mañana", status: "pendiente_cotizacion",
    },
  });

  console.log("Creando cotización demo...");
  const quote1 = await prisma.quote.create({
    data: {
      requestId: req1.id, providerId: juanPerez.id, laborPrice: 20, materialsPrice: 15,
      totalWithMaterials: 35, totalWithoutMaterials: 20,
      materialsDetail: "Silicona sanitaria ($5), Junta tórica ($3), Cinta teflón ($2), Lavamanos básico ($5)",
      providerNote: "La fuga parece ser por la junta del lavamanos. Puedo reemplazarla completo si desea.",
      providerExactTime: "15:30", status: "enviada",
    },
  });

  await prisma.request.update({ where: { id: req1.id }, data: { status: "cotizacion_enviada" } });

  console.log("Seed completado exitosamente.");
  console.log("Cuentas demo disponibles:");
  console.log("  Cliente:   cliente@demo.com / 123456");
  console.log("  Proveedor: proveedor@demo.com / 123456");
  console.log("  Admin:     admin@demo.com / 123456");
  console.log("  Pendiente: pendiente@demo.com / 123456");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
