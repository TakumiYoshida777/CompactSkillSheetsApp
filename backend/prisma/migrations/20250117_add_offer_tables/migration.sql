-- CreateEnum
CREATE TYPE "offer_status" AS ENUM ('SENT', 'OPENED', 'PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "offer_engineer_status" AS ENUM ('SENT', 'OPENED', 'PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "offers" (
    "id" BIGSERIAL NOT NULL,
    "offer_number" VARCHAR(100) NOT NULL,
    "client_company_id" BIGINT NOT NULL,
    "status" "offer_status" NOT NULL DEFAULT 'SENT',
    "project_name" VARCHAR(255) NOT NULL,
    "project_period_start" DATE NOT NULL,
    "project_period_end" DATE NOT NULL,
    "required_skills" JSONB,
    "project_description" TEXT NOT NULL,
    "location" VARCHAR(255),
    "rate_min" INTEGER,
    "rate_max" INTEGER,
    "remarks" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "reminder_sent_at" TIMESTAMP(3),
    "reminder_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_engineers" (
    "id" BIGSERIAL NOT NULL,
    "offer_id" BIGINT NOT NULL,
    "engineer_id" BIGINT NOT NULL,
    "individual_status" "offer_engineer_status" NOT NULL DEFAULT 'SENT',
    "responded_at" TIMESTAMP(3),
    "response_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_engineers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_offer_number_key" ON "offers"("offer_number");

-- CreateIndex
CREATE INDEX "offers_client_company_id_idx" ON "offers"("client_company_id");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- CreateIndex
CREATE INDEX "offers_sent_at_idx" ON "offers"("sent_at");

-- CreateIndex
CREATE INDEX "offer_engineers_offer_id_idx" ON "offer_engineers"("offer_id");

-- CreateIndex
CREATE INDEX "offer_engineers_engineer_id_idx" ON "offer_engineers"("engineer_id");

-- CreateIndex
CREATE INDEX "offer_engineers_individual_status_idx" ON "offer_engineers"("individual_status");

-- CreateIndex
CREATE UNIQUE INDEX "offer_engineers_offer_id_engineer_id_key" ON "offer_engineers"("offer_id", "engineer_id");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_client_company_id_fkey" FOREIGN KEY ("client_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_engineers" ADD CONSTRAINT "offer_engineers_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_engineers" ADD CONSTRAINT "offer_engineers_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;