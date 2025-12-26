/*
  Warnings:

  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "approved" BOOLEAN NOT NULL DEFAULT true,
    "idVerificationPhoto" TEXT,
    "idVerificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("approved", "createdAt", "email", "id", "idVerificationPhoto", "idVerificationStatus", "name", "password", "phoneNumber", "role", "updatedAt") SELECT "approved", "createdAt", "email", "id", "idVerificationPhoto", "idVerificationStatus", "name", "password", COALESCE("phoneNumber", '+994500000000'), "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_approved_idx" ON "User"("role", "approved");
CREATE INDEX "User_role_idVerificationStatus_idx" ON "User"("role", "idVerificationStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
