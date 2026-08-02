import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { signRefreshToken, REFRESH_TOKEN_TTL_MS } from "@/lib/auth/jwt";
import { hashToken } from "@/lib/auth/tokens";

/** Issues a new refresh token and persists its hash for rotation/reuse detection. */
export async function issueRefreshToken(userId: string) {
  const jti = randomUUID();
  const rawToken = await signRefreshToken({ sub: userId, jti });

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

/**
 * Validates a presented refresh token against its stored record and rotates
 * it. Returns null if the token is unknown, expired, or already revoked
 * (revoked-but-presented again means the token was stolen/reused — every
 * other active session for the user is revoked defensively).
 */
export async function rotateRefreshToken(userId: string, rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record || record.userId !== userId || record.expiresAt < new Date()) {
    return null;
  }

  if (record.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  const newRawToken = await issueRefreshToken(userId);
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date(), replacedByHash: hashToken(newRawToken) },
  });

  return newRawToken;
}

export async function revokeRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
