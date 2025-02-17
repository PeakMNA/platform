/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,name]` on the table `TemplateCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TemplateCategory_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCategory_tenantId_name_key" ON "TemplateCategory"("tenantId", "name");
