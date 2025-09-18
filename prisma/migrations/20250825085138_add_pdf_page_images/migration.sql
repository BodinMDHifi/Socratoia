/*
  Warnings:

  - You are about to drop the `PdfPage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PdfPage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PdfPageImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pdfExerciseId" INTEGER NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PdfPageImage_pdfExerciseId_fkey" FOREIGN KEY ("pdfExerciseId") REFERENCES "PdfExercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PdfPageImage_pdfExerciseId_pageNumber_key" ON "PdfPageImage"("pdfExerciseId", "pageNumber");
