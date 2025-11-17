import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["query","info","warn","error"] });
(async () => {
  console.log("[prisma-check] start");
  const users = await prisma.user.findMany();
  console.log("[prisma-check] users:", users);
  await prisma.$disconnect();
  console.log("[prisma-check] done");
})();