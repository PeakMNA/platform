/*
  Warnings:

  - A unique constraint covering the columns `[name,categoryId]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Template_name_categoryId_key" ON "Template"("name", "categoryId");
