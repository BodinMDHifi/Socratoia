-- CreateTable
CREATE TABLE "PdfPage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pdfExerciseId" INTEGER NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PdfPage_pdfExerciseId_fkey" FOREIGN KEY ("pdfExerciseId") REFERENCES "PdfExercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PdfPage_pdfExerciseId_pageNumber_key" ON "PdfPage"("pdfExerciseId", "pageNumber");
