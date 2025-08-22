-- CreateEnum
CREATE TYPE "public"."company_type" AS ENUM ('SES', 'CLIENT');

-- CreateEnum
CREATE TYPE "public"."gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."engineer_type" AS ENUM ('EMPLOYEE', 'FREELANCE');

-- CreateEnum
CREATE TYPE "public"."engineer_status" AS ENUM ('WORKING', 'WAITING', 'WAITING_SOON');

-- CreateEnum
CREATE TYPE "public"."project_scale" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "public"."work_style" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."contract_type" AS ENUM ('CONTRACT', 'DISPATCH');

-- CreateEnum
CREATE TYPE "public"."approach_type" AS ENUM ('MANUAL', 'PERIODIC', 'ASSIGN_REQUEST');

-- CreateEnum
CREATE TYPE "public"."approach_status" AS ENUM ('SENT', 'OPENED', 'REPLIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."exclusion_type" AS ENUM ('NG_ENGINEER', 'PERIODIC_EXCLUSION', 'MANUAL_EXCLUSION');

-- CreateEnum
CREATE TYPE "public"."template_type" AS ENUM ('APPROACH', 'PERIODIC', 'FREELANCE_APPROACH');

-- CreateEnum
CREATE TYPE "public"."email_status" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "public"."contract_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'TERMINATED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."billing_cycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."invoice_status" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."payment_method" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."lock_type" AS ENUM ('USER_LOCK', 'COMPANY_LOCK', 'SECURITY_LOCK');

-- CreateEnum
CREATE TYPE "public"."lock_reason" AS ENUM ('PAYMENT_OVERDUE', 'CONTRACT_VIOLATION', 'SECURITY_INCIDENT', 'MANUAL_LOCK');

-- CreateEnum
CREATE TYPE "public"."lock_status" AS ENUM ('ACTIVE', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."action_type" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOCK', 'UNLOCK');

-- CreateEnum
CREATE TYPE "public"."log_severity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."maintenance_type" AS ENUM ('REGULAR', 'EMERGENCY', 'FEATURE_UPDATE', 'SECURITY_PATCH');

-- CreateEnum
CREATE TYPE "public"."maintenance_status" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."announcement_type" AS ENUM ('INFO', 'WARNING', 'MAINTENANCE', 'FEATURE', 'IMPORTANT');

-- CreateEnum
CREATE TYPE "public"."target_audience" AS ENUM ('ALL', 'SPECIFIC_COMPANIES', 'ADMIN_ONLY');

-- CreateEnum
CREATE TYPE "public"."priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."announcement_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."offer_status" AS ENUM ('SENT', 'OPENED', 'PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."offer_engineer_status" AS ENUM ('SENT', 'OPENED', 'PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "public"."client_permission_type" AS ENUM ('FULL_ACCESS', 'SELECTED_ONLY', 'WAITING_ONLY');

-- CreateTable
CREATE TABLE "public"."companies" (
    "id" BIGSERIAL NOT NULL,
    "companyType" "public"."company_type" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "emailDomain" VARCHAR(255),
    "address" TEXT,
    "phone" VARCHAR(20),
    "websiteUrl" VARCHAR(500),
    "contactEmail" VARCHAR(255),
    "maxEngineers" INTEGER NOT NULL DEFAULT 6000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" BIGSERIAL NOT NULL,
    "companyId" BIGINT,
    "email" VARCHAR(255) NOT NULL,
    "personalEmail" VARCHAR(255),
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "accountLockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "roleId" BIGINT NOT NULL,
    "grantedBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "id" BIGSERIAL NOT NULL,
    "roleId" BIGINT NOT NULL,
    "permissionId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."engineers" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT,
    "companyId" BIGINT,
    "employeeNumber" VARCHAR(50),
    "name" VARCHAR(100) NOT NULL,
    "nameKana" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "birthDate" DATE,
    "gender" "public"."gender",
    "nearestStation" VARCHAR(100),
    "githubUrl" VARCHAR(500),
    "engineerType" "public"."engineer_type" NOT NULL,
    "currentStatus" "public"."engineer_status" NOT NULL DEFAULT 'WORKING',
    "availableDate" DATE,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastName" VARCHAR(50),
    "firstName" VARCHAR(50),
    "lastNameKana" VARCHAR(50),
    "firstNameKana" VARCHAR(50),
    "availability" VARCHAR(50),
    "currentProject" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "engineers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."engineer_skills" (
    "id" BIGSERIAL NOT NULL,
    "engineerId" BIGINT NOT NULL,
    "skillId" BIGINT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "years" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engineer_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skills" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skill_sheets" (
    "id" BIGSERIAL NOT NULL,
    "engineerId" BIGINT NOT NULL,
    "summary" TEXT,
    "totalExperienceYears" INTEGER,
    "programmingLanguages" JSONB,
    "frameworks" JSONB,
    "databases" JSONB,
    "cloudServices" JSONB,
    "tools" JSONB,
    "certifications" JSONB,
    "possibleRoles" JSONB,
    "possiblePhases" JSONB,
    "educationBackground" JSONB,
    "careerSummary" TEXT,
    "specialSkills" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdatedBy" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "clientCompany" VARCHAR(255),
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "plannedEndDate" DATE,
    "projectScale" "public"."project_scale",
    "industry" VARCHAR(100),
    "businessType" VARCHAR(100),
    "developmentMethodology" VARCHAR(100),
    "teamSize" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."engineer_projects" (
    "id" BIGSERIAL NOT NULL,
    "engineerId" BIGINT NOT NULL,
    "projectId" BIGINT NOT NULL,
    "role" VARCHAR(100),
    "responsibilities" TEXT,
    "phases" JSONB,
    "technologies" JSONB,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "achievements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engineer_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."freelancers" (
    "id" BIGSERIAL NOT NULL,
    "engineerId" BIGINT NOT NULL,
    "businessName" VARCHAR(255),
    "taxNumber" VARCHAR(50),
    "hourlyRateMin" INTEGER,
    "hourlyRateMax" INTEGER,
    "monthlyRateMin" INTEGER,
    "monthlyRateMax" INTEGER,
    "workStyle" "public"."work_style" NOT NULL DEFAULT 'HYBRID',
    "contractType" "public"."contract_type" NOT NULL DEFAULT 'CONTRACT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "freelancers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_partners" (
    "id" BIGSERIAL NOT NULL,
    "sesCompanyId" BIGINT NOT NULL,
    "clientCompanyId" BIGINT NOT NULL,
    "accessUrl" VARCHAR(500) NOT NULL,
    "urlToken" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "business_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_users" (
    "id" BIGSERIAL NOT NULL,
    "businessPartnerId" BIGINT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "department" VARCHAR(100),
    "position" VARCHAR(100),
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "accountLockedUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_user_roles" (
    "id" BIGSERIAL NOT NULL,
    "clientUserId" BIGINT NOT NULL,
    "roleId" BIGINT NOT NULL,
    "grantedBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_access_permissions" (
    "id" BIGSERIAL NOT NULL,
    "businessPartnerId" BIGINT NOT NULL,
    "engineerId" BIGINT,
    "permissionType" "public"."client_permission_type" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_access_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."engineer_permissions" (
    "id" BIGSERIAL NOT NULL,
    "businessPartnerId" BIGINT NOT NULL,
    "engineerId" BIGINT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engineer_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."engineer_ng_lists" (
    "id" BIGSERIAL NOT NULL,
    "businessPartnerId" BIGINT NOT NULL,
    "engineerId" BIGINT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engineer_ng_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."business_partner_settings" (
    "id" BIGSERIAL NOT NULL,
    "businessPartnerId" BIGINT NOT NULL,
    "viewType" TEXT NOT NULL DEFAULT 'waiting',
    "showWaitingOnly" BOOLEAN NOT NULL DEFAULT true,
    "autoApprove" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_view_logs" (
    "id" BIGSERIAL NOT NULL,
    "clientUserId" BIGINT NOT NULL,
    "engineerId" BIGINT,
    "action" VARCHAR(50) NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_view_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."approaches" (
    "id" BIGSERIAL NOT NULL,
    "fromCompanyId" BIGINT NOT NULL,
    "toCompanyId" BIGINT,
    "toFreelancerId" BIGINT,
    "approachType" "public"."approach_type" NOT NULL,
    "contactMethods" JSONB,
    "targetEngineers" JSONB,
    "projectDetails" TEXT,
    "messageContent" TEXT,
    "emailTemplateId" BIGINT,
    "status" "public"."approach_status" NOT NULL DEFAULT 'SENT',
    "sentBy" BIGINT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exclusions" (
    "id" BIGSERIAL NOT NULL,
    "companyId" BIGINT NOT NULL,
    "targetCompanyId" BIGINT,
    "targetEngineerId" BIGINT,
    "exclusionType" "public"."exclusion_type" NOT NULL,
    "reason" TEXT,
    "excludedBy" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" BIGSERIAL NOT NULL,
    "companyId" BIGINT NOT NULL,
    "templateType" "public"."template_type" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "senderName" VARCHAR(100),
    "senderEmail" VARCHAR(255),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_logs" (
    "id" BIGSERIAL NOT NULL,
    "approachId" BIGINT,
    "templateId" BIGINT,
    "fromEmail" VARCHAR(255) NOT NULL,
    "toEmail" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "public"."email_status" NOT NULL DEFAULT 'QUEUED',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" BIGSERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100),
    "phone" VARCHAR(20),
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "accountLockedUntil" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_roles" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_user_roles" (
    "id" BIGSERIAL NOT NULL,
    "adminUserId" BIGINT NOT NULL,
    "adminRoleId" BIGINT NOT NULL,
    "grantedBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contracts" (
    "id" BIGSERIAL NOT NULL,
    "companyId" BIGINT NOT NULL,
    "contractPlanId" BIGINT NOT NULL,
    "contractNumber" VARCHAR(100) NOT NULL,
    "contractStatus" "public"."contract_status" NOT NULL DEFAULT 'PENDING',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "billingCycle" "public"."billing_cycle" NOT NULL DEFAULT 'MONTHLY',
    "billingAmount" INTEGER NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxEngineers" INTEGER NOT NULL,
    "contractOptions" JSONB,
    "salesRepresentative" VARCHAR(100),
    "contractNotes" TEXT,
    "createdBy" BIGINT NOT NULL,
    "updatedBy" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contract_plans" (
    "id" BIGSERIAL NOT NULL,
    "planName" VARCHAR(100) NOT NULL,
    "planCode" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "basePrice" INTEGER NOT NULL,
    "pricePerUser" INTEGER NOT NULL DEFAULT 0,
    "pricePerEngineer" INTEGER NOT NULL DEFAULT 0,
    "maxUsers" INTEGER,
    "maxEngineers" INTEGER,
    "features" JSONB NOT NULL,
    "billingCycles" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" BIGSERIAL NOT NULL,
    "contractId" BIGINT NOT NULL,
    "invoiceNumber" VARCHAR(100) NOT NULL,
    "billingPeriodStart" DATE NOT NULL,
    "billingPeriodEnd" DATE NOT NULL,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "invoiceStatus" "public"."invoice_status" NOT NULL DEFAULT 'DRAFT',
    "usageDetails" JSONB,
    "notes" TEXT,
    "createdBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" BIGSERIAL NOT NULL,
    "invoiceId" BIGINT NOT NULL,
    "paymentDate" DATE NOT NULL,
    "paymentAmount" INTEGER NOT NULL,
    "paymentMethod" "public"."payment_method" NOT NULL,
    "paymentReference" VARCHAR(255),
    "bankName" VARCHAR(100),
    "notes" TEXT,
    "createdBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usage_logs" (
    "id" BIGSERIAL NOT NULL,
    "companyId" BIGINT NOT NULL,
    "contractId" BIGINT NOT NULL,
    "date" DATE NOT NULL,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "totalEngineers" INTEGER NOT NULL DEFAULT 0,
    "activeEngineers" INTEGER NOT NULL DEFAULT 0,
    "approachCount" INTEGER NOT NULL DEFAULT 0,
    "emailSentCount" INTEGER NOT NULL DEFAULT 0,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "storageUsageMb" INTEGER NOT NULL DEFAULT 0,
    "apiCallCount" INTEGER NOT NULL DEFAULT 0,
    "featureUsage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account_locks" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT,
    "companyId" BIGINT,
    "lockType" "public"."lock_type" NOT NULL,
    "lockReason" "public"."lock_reason" NOT NULL,
    "lockStatus" "public"."lock_status" NOT NULL DEFAULT 'ACTIVE',
    "lockedAt" TIMESTAMP(3) NOT NULL,
    "unlockScheduledAt" TIMESTAMP(3),
    "unlockedAt" TIMESTAMP(3),
    "lockDetails" TEXT,
    "lockedBy" BIGINT NOT NULL,
    "unlockedBy" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_logs" (
    "id" BIGSERIAL NOT NULL,
    "adminUserId" BIGINT NOT NULL,
    "targetCompanyId" BIGINT,
    "targetUserId" BIGINT,
    "actionType" "public"."action_type" NOT NULL,
    "resourceType" VARCHAR(100) NOT NULL,
    "resourceId" BIGINT,
    "actionDescription" TEXT NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "severity" "public"."log_severity" NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."maintenance_schedules" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "maintenanceType" "public"."maintenance_type" NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "status" "public"."maintenance_status" NOT NULL DEFAULT 'SCHEDULED',
    "affectedServices" JSONB,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcements" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "announcementType" "public"."announcement_type" NOT NULL DEFAULT 'INFO',
    "targetAudience" "public"."target_audience" NOT NULL DEFAULT 'ALL',
    "targetCompanies" JSONB,
    "priority" "public"."priority" NOT NULL DEFAULT 'NORMAL',
    "publishStart" TIMESTAMP(3) NOT NULL,
    "publishEnd" TIMESTAMP(3),
    "isPopup" BOOLEAN NOT NULL DEFAULT false,
    "isEmail" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."announcement_status" NOT NULL DEFAULT 'DRAFT',
    "createdBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."offers" (
    "id" BIGSERIAL NOT NULL,
    "offerNumber" VARCHAR(100) NOT NULL,
    "clientCompanyId" BIGINT NOT NULL,
    "status" "public"."offer_status" NOT NULL DEFAULT 'SENT',
    "projectName" VARCHAR(255) NOT NULL,
    "projectPeriodStart" DATE NOT NULL,
    "projectPeriodEnd" DATE NOT NULL,
    "requiredSkills" JSONB,
    "projectDescription" TEXT NOT NULL,
    "location" VARCHAR(255),
    "rateMin" INTEGER,
    "rateMax" INTEGER,
    "remarks" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" BIGINT,
    "clientUserId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."offer_engineers" (
    "id" BIGSERIAL NOT NULL,
    "offerId" BIGINT NOT NULL,
    "engineerId" BIGINT NOT NULL,
    "individualStatus" "public"."offer_engineer_status" NOT NULL DEFAULT 'SENT',
    "respondedAt" TIMESTAMP(3),
    "responseNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_engineers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "public"."users"("companyId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "public"."user_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "public"."role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "engineers_userId_key" ON "public"."engineers"("userId");

-- CreateIndex
CREATE INDEX "engineers_companyId_idx" ON "public"."engineers"("companyId");

-- CreateIndex
CREATE INDEX "engineers_currentStatus_idx" ON "public"."engineers"("currentStatus");

-- CreateIndex
CREATE INDEX "engineers_engineerType_idx" ON "public"."engineers"("engineerType");

-- CreateIndex
CREATE INDEX "engineers_isPublic_idx" ON "public"."engineers"("isPublic");

-- CreateIndex
CREATE INDEX "engineers_availableDate_idx" ON "public"."engineers"("availableDate");

-- CreateIndex
CREATE INDEX "engineer_skills_engineerId_idx" ON "public"."engineer_skills"("engineerId");

-- CreateIndex
CREATE INDEX "engineer_skills_skillId_idx" ON "public"."engineer_skills"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "engineer_skills_engineerId_skillId_key" ON "public"."engineer_skills"("engineerId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "public"."skills"("name");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "public"."skills"("category");

-- CreateIndex
CREATE UNIQUE INDEX "skill_sheets_engineerId_key" ON "public"."skill_sheets"("engineerId");

-- CreateIndex
CREATE INDEX "projects_startDate_endDate_idx" ON "public"."projects"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "projects_plannedEndDate_idx" ON "public"."projects"("plannedEndDate");

-- CreateIndex
CREATE INDEX "engineer_projects_engineerId_idx" ON "public"."engineer_projects"("engineerId");

-- CreateIndex
CREATE INDEX "engineer_projects_isCurrent_idx" ON "public"."engineer_projects"("isCurrent");

-- CreateIndex
CREATE INDEX "engineer_projects_startDate_endDate_idx" ON "public"."engineer_projects"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "freelancers_engineerId_key" ON "public"."freelancers"("engineerId");

-- CreateIndex
CREATE UNIQUE INDEX "business_partners_accessUrl_key" ON "public"."business_partners"("accessUrl");

-- CreateIndex
CREATE UNIQUE INDEX "business_partners_urlToken_key" ON "public"."business_partners"("urlToken");

-- CreateIndex
CREATE UNIQUE INDEX "client_users_email_key" ON "public"."client_users"("email");

-- CreateIndex
CREATE INDEX "client_users_businessPartnerId_idx" ON "public"."client_users"("businessPartnerId");

-- CreateIndex
CREATE INDEX "client_users_isActive_idx" ON "public"."client_users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "client_user_roles_clientUserId_roleId_key" ON "public"."client_user_roles"("clientUserId", "roleId");

-- CreateIndex
CREATE INDEX "client_access_permissions_businessPartnerId_idx" ON "public"."client_access_permissions"("businessPartnerId");

-- CreateIndex
CREATE INDEX "client_access_permissions_engineerId_idx" ON "public"."client_access_permissions"("engineerId");

-- CreateIndex
CREATE INDEX "engineer_permissions_businessPartnerId_idx" ON "public"."engineer_permissions"("businessPartnerId");

-- CreateIndex
CREATE INDEX "engineer_permissions_engineerId_idx" ON "public"."engineer_permissions"("engineerId");

-- CreateIndex
CREATE UNIQUE INDEX "engineer_permissions_businessPartnerId_engineerId_key" ON "public"."engineer_permissions"("businessPartnerId", "engineerId");

-- CreateIndex
CREATE INDEX "engineer_ng_lists_businessPartnerId_idx" ON "public"."engineer_ng_lists"("businessPartnerId");

-- CreateIndex
CREATE INDEX "engineer_ng_lists_engineerId_idx" ON "public"."engineer_ng_lists"("engineerId");

-- CreateIndex
CREATE UNIQUE INDEX "engineer_ng_lists_businessPartnerId_engineerId_key" ON "public"."engineer_ng_lists"("businessPartnerId", "engineerId");

-- CreateIndex
CREATE UNIQUE INDEX "business_partner_settings_businessPartnerId_key" ON "public"."business_partner_settings"("businessPartnerId");

-- CreateIndex
CREATE INDEX "client_view_logs_clientUserId_idx" ON "public"."client_view_logs"("clientUserId");

-- CreateIndex
CREATE INDEX "client_view_logs_engineerId_idx" ON "public"."client_view_logs"("engineerId");

-- CreateIndex
CREATE INDEX "client_view_logs_createdAt_idx" ON "public"."client_view_logs"("createdAt");

-- CreateIndex
CREATE INDEX "approaches_fromCompanyId_idx" ON "public"."approaches"("fromCompanyId");

-- CreateIndex
CREATE INDEX "approaches_toCompanyId_idx" ON "public"."approaches"("toCompanyId");

-- CreateIndex
CREATE INDEX "approaches_toFreelancerId_idx" ON "public"."approaches"("toFreelancerId");

-- CreateIndex
CREATE INDEX "approaches_sentAt_idx" ON "public"."approaches"("sentAt");

-- CreateIndex
CREATE INDEX "approaches_approachType_idx" ON "public"."approaches"("approachType");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "public"."admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");

-- CreateIndex
CREATE INDEX "admin_users_isActive_idx" ON "public"."admin_users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_name_key" ON "public"."admin_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_roles_adminUserId_adminRoleId_key" ON "public"."admin_user_roles"("adminUserId", "adminRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_contractNumber_key" ON "public"."contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "contracts_companyId_idx" ON "public"."contracts"("companyId");

-- CreateIndex
CREATE INDEX "contracts_contractPlanId_idx" ON "public"."contracts"("contractPlanId");

-- CreateIndex
CREATE INDEX "contracts_contractStatus_idx" ON "public"."contracts"("contractStatus");

-- CreateIndex
CREATE INDEX "contracts_startDate_endDate_idx" ON "public"."contracts"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "contract_plans_planCode_key" ON "public"."contract_plans"("planCode");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "public"."invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoices_contractId_idx" ON "public"."invoices"("contractId");

-- CreateIndex
CREATE INDEX "invoices_invoiceStatus_idx" ON "public"."invoices"("invoiceStatus");

-- CreateIndex
CREATE INDEX "invoices_issueDate_dueDate_idx" ON "public"."invoices"("issueDate", "dueDate");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "public"."payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "public"."payments"("paymentDate");

-- CreateIndex
CREATE INDEX "payments_paymentMethod_idx" ON "public"."payments"("paymentMethod");

-- CreateIndex
CREATE INDEX "usage_logs_companyId_date_idx" ON "public"."usage_logs"("companyId", "date");

-- CreateIndex
CREATE INDEX "usage_logs_contractId_idx" ON "public"."usage_logs"("contractId");

-- CreateIndex
CREATE INDEX "account_locks_userId_idx" ON "public"."account_locks"("userId");

-- CreateIndex
CREATE INDEX "account_locks_companyId_idx" ON "public"."account_locks"("companyId");

-- CreateIndex
CREATE INDEX "account_locks_lockStatus_idx" ON "public"."account_locks"("lockStatus");

-- CreateIndex
CREATE INDEX "account_locks_lockType_idx" ON "public"."account_locks"("lockType");

-- CreateIndex
CREATE INDEX "admin_logs_adminUserId_idx" ON "public"."admin_logs"("adminUserId");

-- CreateIndex
CREATE INDEX "admin_logs_targetCompanyId_idx" ON "public"."admin_logs"("targetCompanyId");

-- CreateIndex
CREATE INDEX "admin_logs_resourceType_resourceId_idx" ON "public"."admin_logs"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "admin_logs_createdAt_idx" ON "public"."admin_logs"("createdAt");

-- CreateIndex
CREATE INDEX "maintenance_schedules_scheduledStart_scheduledEnd_idx" ON "public"."maintenance_schedules"("scheduledStart", "scheduledEnd");

-- CreateIndex
CREATE INDEX "maintenance_schedules_status_idx" ON "public"."maintenance_schedules"("status");

-- CreateIndex
CREATE INDEX "announcements_publishStart_publishEnd_idx" ON "public"."announcements"("publishStart", "publishEnd");

-- CreateIndex
CREATE INDEX "announcements_status_idx" ON "public"."announcements"("status");

-- CreateIndex
CREATE INDEX "announcements_announcementType_idx" ON "public"."announcements"("announcementType");

-- CreateIndex
CREATE UNIQUE INDEX "offers_offerNumber_key" ON "public"."offers"("offerNumber");

-- CreateIndex
CREATE INDEX "offers_clientCompanyId_idx" ON "public"."offers"("clientCompanyId");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "public"."offers"("status");

-- CreateIndex
CREATE INDEX "offers_sentAt_idx" ON "public"."offers"("sentAt");

-- CreateIndex
CREATE INDEX "offer_engineers_offerId_idx" ON "public"."offer_engineers"("offerId");

-- CreateIndex
CREATE INDEX "offer_engineers_engineerId_idx" ON "public"."offer_engineers"("engineerId");

-- CreateIndex
CREATE INDEX "offer_engineers_individualStatus_idx" ON "public"."offer_engineers"("individualStatus");

-- CreateIndex
CREATE UNIQUE INDEX "offer_engineers_offerId_engineerId_key" ON "public"."offer_engineers"("offerId", "engineerId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineers" ADD CONSTRAINT "engineers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineers" ADD CONSTRAINT "engineers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_skills" ADD CONSTRAINT "engineer_skills_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_skills" ADD CONSTRAINT "engineer_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_sheets" ADD CONSTRAINT "skill_sheets_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_projects" ADD CONSTRAINT "engineer_projects_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_projects" ADD CONSTRAINT "engineer_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."freelancers" ADD CONSTRAINT "freelancers_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_partners" ADD CONSTRAINT "business_partners_sesCompanyId_fkey" FOREIGN KEY ("sesCompanyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_partners" ADD CONSTRAINT "business_partners_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_users" ADD CONSTRAINT "client_users_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."business_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_user_roles" ADD CONSTRAINT "client_user_roles_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "public"."client_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_user_roles" ADD CONSTRAINT "client_user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_access_permissions" ADD CONSTRAINT "client_access_permissions_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."business_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_access_permissions" ADD CONSTRAINT "client_access_permissions_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_permissions" ADD CONSTRAINT "engineer_permissions_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."business_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_permissions" ADD CONSTRAINT "engineer_permissions_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_ng_lists" ADD CONSTRAINT "engineer_ng_lists_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."business_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."engineer_ng_lists" ADD CONSTRAINT "engineer_ng_lists_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."business_partner_settings" ADD CONSTRAINT "business_partner_settings_businessPartnerId_fkey" FOREIGN KEY ("businessPartnerId") REFERENCES "public"."business_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_view_logs" ADD CONSTRAINT "client_view_logs_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "public"."client_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_view_logs" ADD CONSTRAINT "client_view_logs_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approaches" ADD CONSTRAINT "approaches_fromCompanyId_fkey" FOREIGN KEY ("fromCompanyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approaches" ADD CONSTRAINT "approaches_toCompanyId_fkey" FOREIGN KEY ("toCompanyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approaches" ADD CONSTRAINT "approaches_toFreelancerId_fkey" FOREIGN KEY ("toFreelancerId") REFERENCES "public"."freelancers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approaches" ADD CONSTRAINT "approaches_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "public"."email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approaches" ADD CONSTRAINT "approaches_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exclusions" ADD CONSTRAINT "exclusions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exclusions" ADD CONSTRAINT "exclusions_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exclusions" ADD CONSTRAINT "exclusions_targetEngineerId_fkey" FOREIGN KEY ("targetEngineerId") REFERENCES "public"."engineers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exclusions" ADD CONSTRAINT "exclusions_excludedBy_fkey" FOREIGN KEY ("excludedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_templates" ADD CONSTRAINT "email_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_approachId_fkey" FOREIGN KEY ("approachId") REFERENCES "public"."approaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."email_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_user_roles" ADD CONSTRAINT "admin_user_roles_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_user_roles" ADD CONSTRAINT "admin_user_roles_adminRoleId_fkey" FOREIGN KEY ("adminRoleId") REFERENCES "public"."admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_contractPlanId_fkey" FOREIGN KEY ("contractPlanId") REFERENCES "public"."contract_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contracts" ADD CONSTRAINT "contracts_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_logs" ADD CONSTRAINT "usage_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usage_logs" ADD CONSTRAINT "usage_logs_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "public"."contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_locks" ADD CONSTRAINT "account_locks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_locks" ADD CONSTRAINT "account_locks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_locks" ADD CONSTRAINT "account_locks_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account_locks" ADD CONSTRAINT "account_locks_unlockedBy_fkey" FOREIGN KEY ("unlockedBy") REFERENCES "public"."admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_logs" ADD CONSTRAINT "admin_logs_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_logs" ADD CONSTRAINT "admin_logs_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "public"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_logs" ADD CONSTRAINT "admin_logs_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offers" ADD CONSTRAINT "offers_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "public"."companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offers" ADD CONSTRAINT "offers_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offers" ADD CONSTRAINT "offers_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "public"."client_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offer_engineers" ADD CONSTRAINT "offer_engineers_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."offer_engineers" ADD CONSTRAINT "offer_engineers_engineerId_fkey" FOREIGN KEY ("engineerId") REFERENCES "public"."engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
