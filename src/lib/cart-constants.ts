// Plain checkout-fee constants, deliberately dependency-free (no Prisma
// import) so client components can read them without pulling the Prisma
// client — which is server/Node-only — into the browser bundle.
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_CHARGE = 99;
export const RUSH_ORDER_FEE = 149;
export const GIFT_WRAP_FEE = 49;
