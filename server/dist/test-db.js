import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
(async () => {
    try {
        console.log("[test-db] starting…");
        // Quick ping: list tables by querying Users
        const users = await prisma.user.findMany();
        console.log("[test-db] users:", users);
    }
    catch (err) {
        console.error("[test-db] ERROR:", err);
        process.exitCode = 1;
    }
    finally {
        await prisma.$disconnect();
        console.log("[test-db] finished.");
    }
})();
//# sourceMappingURL=test-db.js.map