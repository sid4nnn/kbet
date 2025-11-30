import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
    const passwordHash = await bcrypt.hash("Admin123", 10);
    await prisma.user.upsert({
        where: { email: "admin@admin.com" },
        update: {},
        create: {
            email: "admin@admin.com",
            passwordHash,
            displayName: "Admin",
            role: "admin",
            Wallet: { create: {} },
        },
    });

    console.log("Seeded admin@admin.com / Admin123");
}

main().finally(() => prisma.$disconnect());