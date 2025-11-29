-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "game" TEXT NOT NULL DEFAULT 'Blackjack',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameTransaction" ("amountCents", "createdAt", "id", "type", "userId") SELECT "amountCents", "createdAt", "id", "type", "userId" FROM "GameTransaction";
DROP TABLE "GameTransaction";
ALTER TABLE "new_GameTransaction" RENAME TO "GameTransaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
