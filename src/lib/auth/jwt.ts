import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set — see .env.example`);
  }
  return new TextEncoder().encode(value);
}

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
}

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getSecret("JWT_ACCESS_SECRET"));
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret("JWT_ACCESS_SECRET"));
  return payload as AccessTokenPayload;
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  jti: string; // unique id, matched against the RefreshToken row's tokenHash
}

export async function signRefreshToken(payload: RefreshTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_SECONDS}s`)
    .sign(getSecret("JWT_REFRESH_SECRET"));
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret("JWT_REFRESH_SECRET"));
  return payload as RefreshTokenPayload;
}

export const REFRESH_TOKEN_TTL_MS = REFRESH_TOKEN_TTL_SECONDS * 1000;
