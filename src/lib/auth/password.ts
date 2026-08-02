import bcrypt from "bcryptjs";

const BCRYPT_COST = 12; // NFR-SEC-02

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
