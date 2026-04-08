-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."ToolStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ToolReviewStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "public"."ToolIndexingStatus" AS ENUM ('NOINDEX', 'INDEX');

-- CreateEnum
CREATE TYPE "public"."ToolEvidenceStatus" AS ENUM ('MISSING', 'PARTIAL', 'COMPLETE');

-- CreateEnum
CREATE TYPE "public"."LinkKind" AS ENUM ('AFFILIATE', 'SPONSORED', 'DIRECT');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('AFFILIATE_CLICK', 'OUTBOUND_CLICK');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."WorkflowLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tool" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ToolStatus" NOT NULL DEFAULT 'ACTIVE',
    "reviewStatus" "public"."ToolReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "indexingStatus" "public"."ToolIndexingStatus" NOT NULL DEFAULT 'NOINDEX',
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "evidenceStatus" "public"."ToolEvidenceStatus" NOT NULL DEFAULT 'MISSING',
    "authorId" TEXT,
    "reviewedById" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "changeSummary" TEXT,
    "setupMinutes" INTEGER,
    "pricingFrom" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ToolCategory" (
    "toolId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolCategory_pkey" PRIMARY KEY ("toolId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."AffiliateProgram" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "network" TEXT,
    "programName" TEXT NOT NULL,
    "commissionModel" TEXT,
    "cookieDays" INTEGER,
    "payoutNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AffiliateLink" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "programId" TEXT,
    "linkKind" "public"."LinkKind" NOT NULL DEFAULT 'AFFILIATE',
    "region" TEXT NOT NULL DEFAULT 'global',
    "destinationUrl" TEXT NOT NULL,
    "trackingUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ToolPrice" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comparison" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ComparisonItem" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComparisonItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "difficulty" "public"."WorkflowLevel" NOT NULL DEFAULT 'BEGINNER',
    "estimatedMinutes" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "steps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClickEvent" (
    "id" TEXT NOT NULL,
    "eventType" "public"."EventType" NOT NULL,
    "pagePath" TEXT NOT NULL,
    "toolId" TEXT,
    "affiliateLinkId" TEXT,
    "sessionId" TEXT,
    "visitorHash" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "countryCode" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Submission" (
    "id" TEXT NOT NULL,
    "companyName" TEXT,
    "contactEmail" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "message" TEXT,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_slug_key" ON "public"."Tool"("slug");

-- CreateIndex
CREATE INDEX "Tool_status_indexingStatus_idx" ON "public"."Tool"("status", "indexingStatus");

-- CreateIndex
CREATE INDEX "Tool_reviewStatus_qualityScore_idx" ON "public"."Tool"("reviewStatus", "qualityScore");

-- CreateIndex
CREATE INDEX "ToolCategory_categoryId_idx" ON "public"."ToolCategory"("categoryId");

-- CreateIndex
CREATE INDEX "AffiliateProgram_toolId_idx" ON "public"."AffiliateProgram"("toolId");

-- CreateIndex
CREATE INDEX "AffiliateLink_toolId_idx" ON "public"."AffiliateLink"("toolId");

-- CreateIndex
CREATE INDEX "AffiliateLink_programId_idx" ON "public"."AffiliateLink"("programId");

-- CreateIndex
CREATE INDEX "ToolPrice_toolId_capturedAt_idx" ON "public"."ToolPrice"("toolId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Comparison_slug_key" ON "public"."Comparison"("slug");

-- CreateIndex
CREATE INDEX "ComparisonItem_toolId_idx" ON "public"."ComparisonItem"("toolId");

-- CreateIndex
CREATE UNIQUE INDEX "ComparisonItem_comparisonId_toolId_key" ON "public"."ComparisonItem"("comparisonId", "toolId");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_slug_key" ON "public"."Workflow"("slug");

-- CreateIndex
CREATE INDEX "ClickEvent_createdAt_idx" ON "public"."ClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_toolId_createdAt_idx" ON "public"."ClickEvent"("toolId", "createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_affiliateLinkId_createdAt_idx" ON "public"."ClickEvent"("affiliateLinkId", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_status_createdAt_idx" ON "public"."Submission"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Tool" ADD CONSTRAINT "Tool_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tool" ADD CONSTRAINT "Tool_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolCategory" ADD CONSTRAINT "ToolCategory_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolCategory" ADD CONSTRAINT "ToolCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateProgram" ADD CONSTRAINT "AffiliateProgram_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateLink" ADD CONSTRAINT "AffiliateLink_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateLink" ADD CONSTRAINT "AffiliateLink_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."AffiliateProgram"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolPrice" ADD CONSTRAINT "ToolPrice_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComparisonItem" ADD CONSTRAINT "ComparisonItem_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "public"."Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ComparisonItem" ADD CONSTRAINT "ComparisonItem_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClickEvent" ADD CONSTRAINT "ClickEvent_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClickEvent" ADD CONSTRAINT "ClickEvent_affiliateLinkId_fkey" FOREIGN KEY ("affiliateLinkId") REFERENCES "public"."AffiliateLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Submission" ADD CONSTRAINT "Submission_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

