ALTER TABLE "Request"
  ADD COLUMN "addressReference" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "acceptedPriceOption" TEXT,
  ADD COLUMN "agreedTime" TEXT,
  ADD COLUMN "workConditions" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "statusHistory" TEXT NOT NULL DEFAULT '[]',
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3);

ALTER TABLE "Quote"
  ADD COLUMN "acceptedOption" TEXT;
