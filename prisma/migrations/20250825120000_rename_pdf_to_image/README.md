This migration documents a semantic rename:

- Model PdfExercise -> ImageExercise (mapped to table `PdfExercise` via @@map).
- Field pdfPath -> imagePath (mapped via @map("pdfPath")).
- Submission relation field pdfExerciseId -> imageExerciseId (mapped via @map("pdfExerciseId")).

No physical schema change is performed for SQLite. Data is preserved.
