-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VERIFIER',
    "emailVerified" DATETIME,
    "image" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,
    "paymentTxnId" TEXT,
    "paymentStatus" TEXT DEFAULT 'unpaid',
    "subscriptionStatus" TEXT,
    "trialEndDate" DATETIME,
    "renewalDate" DATETIME,
    "verificationCount" INTEGER NOT NULL DEFAULT 0,
    "verificationFeesDue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "isVerified", "name", "password", "paymentMethod", "paymentStatus", "paymentTxnId", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "isVerified", "name", "password", "paymentMethod", "paymentStatus", "paymentTxnId", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
