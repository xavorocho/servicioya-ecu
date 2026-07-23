ALTER TABLE "Provider" ADD COLUMN "documentReviews" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "SupportMessage" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'media';

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "link" TEXT NOT NULL DEFAULT '',
  "read" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userEmail_read_idx" ON "Notification"("userEmail", "read");
