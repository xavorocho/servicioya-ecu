-- Seguridad de cuentas, consentimiento y recuperación de contraseña.
ALTER TABLE "User"
  ADD COLUMN "verificationExpiresAt" TIMESTAMP(3),
  ADD COLUMN "passwordResetToken" TEXT,
  ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3),
  ADD COLUMN "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "termsAcceptedAt" TIMESTAMP(3),
  ADD COLUMN "termsVersion" TEXT;

-- Fotografías públicas y privadas para la validación de proveedores.
ALTER TABLE "Provider"
  ADD COLUMN "profileImage" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "verificationFrontImage" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "verificationSideImage" TEXT NOT NULL DEFAULT '';
