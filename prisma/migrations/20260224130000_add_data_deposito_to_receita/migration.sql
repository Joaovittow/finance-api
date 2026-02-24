-- AlterTable
ALTER TABLE "receitas" ADD COLUMN "dataDeposito" TEXT;

-- AlterTable
ALTER TABLE "receitas" ALTER COLUMN "tipo" SET DEFAULT 'fixa';

