import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash("Admin123",10);
    await prisma.user.upsert({
        where: { email: "sid4nnn@gmail.com"} ,
        update: {},
        create: {
            email: "sid4nnn@gmail.com",
            passwordHash,
            displayName: "Admin",
            role: "admin",
            Wallet: { create: {} },
        },
    });

    console.log("Seeded Sid4nnn@gmail.com / Admin123");
}

main().finally(() => prisma.$disconnect());