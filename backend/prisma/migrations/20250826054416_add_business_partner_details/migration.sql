-- CreateTable
CREATE TABLE "public"."business_partner_details" (
    "id" BIGSERIAL NOT NULL,
    "businessPartnerId" BIGINT NOT NULL,
    "companyNameKana" VARCHAR(255),
    "industry" VARCHAR(100),
    "employeeSize" VARCHAR(50),
    "businessDescription" TEXT,
    "contractTypes" JSONB,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "preferredSkills" JSONB,
    "preferredIndustries" JSONB,
    "requirements" TEXT,
    "currentEngineers" INTEGER NOT NULL DEFAULT 0,
    "monthlyRevenue" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" INTEGER NOT NULL DEFAULT 0,
    "totalProposals" INTEGER NOT NULL DEFAULT 0,
    "acceptedProposals" INTEGER NOT NULL DEFAULT 0,
    "lastContactDate" TIMESTAMP(3),
    "rating" REAL,
    "tags" JSONB,
    "paymentTerms" TEXT,
    "autoEmailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "followUpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_partner_details_businessPartnerId_key" ON "public"."business_partner_details"("businessPartnerId");

-- CreateIndex
CREATE INDEX "business_partner_details_businessPartnerId_idx" ON "public"."business_partner_details"("businessPartnerId");

-- CreateIndex
CREATE INDEX "business_partner_details_industry_idx" ON "public"."business_partner_details"("industry");

-- CreateIndex
CREATE INDEX "business_partner_details_rating_idx" ON "public"."business_partner_details"("rating");

-- AddForeignKey
ALTER TABLE "public"."business_partner_details" ADD CONSTRAINT "business_partner_details_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."business_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
