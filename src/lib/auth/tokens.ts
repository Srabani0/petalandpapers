import { randomBytes, randomInt, createHash } from "crypto";

/** Opaque token for email verification / password-reset links. */
export function generateVerificationToken() {
  return randomBytes(32).toString("hex");
}

/** 6-digit OTP for password reset (FR-AUTH-05, 10-minute expiry enforced by caller). */
export function generateOTP() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export const OTP_TTL_MS = 10 * 60 * 1000;
