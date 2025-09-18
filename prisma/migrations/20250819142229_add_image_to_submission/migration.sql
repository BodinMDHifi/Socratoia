/*
  Warnings:

  - You are about to drop the column `checkMode` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `kind` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `targetSmiles` on the `Exercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Submission" ADD COLUMN "imagePath" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "expected" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Exercise" ("createdAt", "description", "expected", "id", "level", "title", "topic") SELECT "createdAt", "description", "expected", "id", "level", "title", "topic" FROM "Exercise";
DROP TABLE "Exercise";
ALTER TABLE "new_Exercise" RENAME TO "Exercise";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
