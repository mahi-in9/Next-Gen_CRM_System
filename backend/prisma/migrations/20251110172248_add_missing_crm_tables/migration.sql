/*
  Safe migration for upgrading Lead-based schema to full CRM schema.
  Preserves data in `activities` while introducing Contacts, Deals, Tasks, etc.
*/

/* ===============================
   ENUM CREATION
=============================== */
CREATE TYPE "DealStage" AS ENUM ('Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed_Won', 'Closed_Lost');
CREATE TYPE "TaskPriority" AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE "TaskStatus" AS ENUM ('To_Do', 'In_Progress', 'Completed');
CREATE TYPE "ActivityType" AS ENUM ('Note', 'Email', 'Call', 'Meeting');

/* ===============================
   CLEANUP OLD LEAD TABLES (SAFE)
=============================== */
-- Drop lead-based relations if they exist
DO $$ BEGIN
  ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "activities_leadId_fkey";
  ALTER TABLE "lead_histories" DROP CONSTRAINT IF EXISTS "lead_histories_changedBy_fkey";
  ALTER TABLE "lead_histories" DROP CONSTRAINT IF EXISTS "lead_histories_leadId_fkey";
  ALTER TABLE "leads" DROP CONSTRAINT IF EXISTS "leads_ownerId_fkey";
EXCEPTION WHEN others THEN NULL;
END $$;

-- Drop obsolete lead tables safely
DROP TABLE IF EXISTS "lead_histories" CASCADE;
DROP TABLE IF EXISTS "leads" CASCADE;

/* ===============================
   SAFE PATCH FOR EXISTING ACTIVITIES
=============================== */
-- 1. Add "content" column with default for existing rows
ALTER TABLE "activities"
  ADD COLUMN IF NOT EXISTS "content" TEXT DEFAULT 'Imported from previous version';

-- 2. Add temporary column for old "type" values
ALTER TABLE "activities"
  ADD COLUMN IF NOT EXISTS "type_tmp" TEXT;

-- 3. Copy old data
UPDATE "activities" SET "type_tmp" = "type" WHERE "type_tmp" IS NULL;

-- 4. Drop old "type" column (string-based)
ALTER TABLE "activities" DROP COLUMN IF EXISTS "type";

-- 5. Add new enum-based "type" column
ALTER TABLE "activities" ADD COLUMN "type" "ActivityType" DEFAULT 'Note';

-- 6. Convert legacy data safely
UPDATE "activities"
SET "type" = CASE
  WHEN "type_tmp" ILIKE 'note' THEN 'Note'
  WHEN "type_tmp" ILIKE 'email' THEN 'Email'
  WHEN "type_tmp" ILIKE 'call' THEN 'Call'
  WHEN "type_tmp" ILIKE 'meeting' THEN 'Meeting'
  ELSE 'Note'
END;

-- 7. Drop the temporary column
ALTER TABLE "activities" DROP COLUMN IF EXISTS "type_tmp";

-- 8. Ensure content is NOT NULL
ALTER TABLE "activities" ALTER COLUMN "content" SET NOT NULL;

/* ===============================
   CREATE NEW CRM TABLES
=============================== */
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "position" TEXT,
    "notes" TEXT,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "deals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "stage" "DealStage" NOT NULL,
    "contactId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER,
    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "contactId" TEXT,
    "dealId" TEXT,
    "ownerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "contact_histories" (
    "id" SERIAL NOT NULL,
    "contactId" TEXT NOT NULL,
    "changedBy" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_histories_pkey" PRIMARY KEY ("id")
);

/* ===============================
   INDEXES
=============================== */
CREATE INDEX IF NOT EXISTS "contacts_ownerId_idx" ON "contacts"("ownerId");
CREATE INDEX IF NOT EXISTS "deals_contactId_idx" ON "deals"("contactId");
CREATE INDEX IF NOT EXISTS "deals_ownerId_idx" ON "deals"("ownerId");
CREATE INDEX IF NOT EXISTS "tasks_contactId_idx" ON "tasks"("contactId");
CREATE INDEX IF NOT EXISTS "tasks_dealId_idx" ON "tasks"("dealId");
CREATE INDEX IF NOT EXISTS "tasks_ownerId_idx" ON "tasks"("ownerId");
CREATE INDEX IF NOT EXISTS "contact_histories_contactId_idx" ON "contact_histories"("contactId");
CREATE INDEX IF NOT EXISTS "contact_histories_changedBy_idx" ON "contact_histories"("changedBy");
CREATE INDEX IF NOT EXISTS "activities_contactId_idx" ON "activities"("contactId");
CREATE INDEX IF NOT EXISTS "activities_dealId_idx" ON "activities"("dealId");
CREATE INDEX IF NOT EXISTS "activities_userId_idx" ON "activities"("userId");
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

/* ===============================
   FOREIGN KEYS
=============================== */
ALTER TABLE "contacts"
  ADD CONSTRAINT "contacts_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "deals"
  ADD CONSTRAINT "deals_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "contacts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "deals"
  ADD CONSTRAINT "deals_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "contacts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_dealId_fkey"
  FOREIGN KEY ("dealId") REFERENCES "deals"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
