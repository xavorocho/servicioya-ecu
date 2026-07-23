import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "plomeria", name: "Plomería", description: "Fugas, tuberías, grifería y mantenimiento.", icon: "wrench", color: "from-blue-500 to-cyan-500" },
  { slug: "electricidad", name: "Electricidad", description: "Instalaciones, tomacorrientes y fallas eléctricas.", icon: "bolt", color: "from-amber-500 to-yellow-500" },
  { slug: "limpieza", name: "Limpieza", description: "Limpieza general, profunda y por horas.", icon: "broom", color: "from-emerald-500 to-teal-500" },
  { slug: "pintura", name: "Pintura", description: "Pintura interior, exterior y retoques.", icon: "paint-roller", color: "from-purple-500 to-pink-500" },
  { slug: "carpinteria", name: "Carpintería", description: "Muebles, puertas, repisas y reparaciones.", icon: "hammer", color: "from-orange-500 to-red-500" },
  { slug: "jardineria", name: "Jardinería", description: "Poda, césped y mantenimiento de jardines.", icon: "seedling", color: "from-green-500 to-emerald-500" },
  { slug: "electrodomesticos", name: "Electrodomésticos", description: "Diagnóstico y reparación de equipos.", icon: "plug", color: "from-slate-500 to-gray-500" },
  { slug: "mudanzas", name: "Mudanzas", description: "Carga, traslado y descarga de muebles.", icon: "truck", color: "from-indigo-500 to-blue-500" },
  { slug: "cerrajeria", name: "Cerrajería", description: "Chapas, llaves y apertura de puertas.", icon: "key", color: "from-rose-500 to-pink-500" },
  { slug: "cuidado", name: "Cuidado del hogar", description: "Asistencia y apoyo en tareas del hogar.", icon: "house-user", color: "from-violet-500 to-purple-500" },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log("Categorías base sincronizadas sin borrar usuarios ni solicitudes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
