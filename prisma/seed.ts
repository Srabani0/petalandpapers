// Seeds (1) the single admin account from env vars — admin accounts are
// never created through public registration (FR-AUTH-06), this script is
// the only way one gets made — (2) a starter catalog of categories and
// products matching the blueprint's product list, so the storefront isn't
// empty on first run, and (3) a WELCOME10 test coupon for exercising the
// cart's coupon flow. All steps are idempotent (safe to re-run).
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedAdmin(prisma: PrismaClient) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", isVerified: true },
    create: { name, email, passwordHash, role: "ADMIN", isVerified: true },
  });

  console.log(`Admin ready: ${admin.email} (role: ${admin.role})`);
}

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  discountPercent?: number;
  stock: number;
  deliveryTime: string;
}

interface SeedCategory {
  name: string;
  skuPrefix: string;
  description: string;
  isCustomizable: boolean;
  products: SeedProduct[];
}

const CATALOG: SeedCategory[] = [
  {
    name: "Ready-made Keychains",
    skuPrefix: "KEYRM",
    description: "Charming keychains, ready to ship as-is.",
    isCustomizable: false,
    products: [
      { name: "Wooden Heart Keychain", description: "A hand-sanded wooden heart keychain, finished with natural oil.", price: 149, stock: 40, deliveryTime: "3-5 business days" },
      { name: "Resin Flower Keychain", description: "Real dried flowers set in clear resin, framed in a brass ring.", price: 199, stock: 30, deliveryTime: "3-5 business days" },
    ],
  },
  {
    name: "Pipe Cleaner Bouquets",
    skuPrefix: "PIPE",
    description: "Playful, colourful bouquets twisted by hand from pipe cleaners.",
    isCustomizable: false,
    products: [
      { name: "Rainbow Pipe Cleaner Bouquet", description: "A cheerful mixed-colour bouquet that never needs water.", price: 349, stock: 20, deliveryTime: "3-5 business days" },
      { name: "Pastel Pipe Cleaner Bunch", description: "Soft pastel tones, perfect for a gentle desk-side gift.", price: 399, stock: 18, deliveryTime: "3-5 business days" },
    ],
  },
  {
    name: "Artificial Flower Bouquets",
    skuPrefix: "AFLOWER",
    description: "Silk and foam flower bouquets that keep their bloom.",
    isCustomizable: false,
    products: [
      { name: "Everlasting Rose Bouquet", description: "A dozen silk roses arranged with eucalyptus-style greenery.", price: 599, stock: 15, deliveryTime: "5-7 business days" },
      { name: "Sunflower Silk Bouquet", description: "Bright silk sunflowers wrapped in kraft paper.", price: 549, stock: 15, deliveryTime: "5-7 business days" },
    ],
  },
  {
    name: "Greeting Cards",
    skuPrefix: "CARD",
    description: "Hand-finished cards for every occasion.",
    isCustomizable: false,
    products: [
      { name: "Handmade Quilling Card", description: "Intricate paper-quilled artwork on a folded card base.", price: 129, stock: 50, deliveryTime: "2-4 business days" },
      { name: "Watercolor Wish Card", description: "An original hand-painted watercolor greeting card.", price: 99, stock: 60, deliveryTime: "2-4 business days" },
    ],
  },
  {
    name: "Gift Hampers",
    skuPrefix: "HAMPER",
    description: "Curated ready-made hampers for effortless gifting.",
    isCustomizable: false,
    products: [
      { name: "Cozy Self-Care Hamper", description: "Candle, bath salts, and a handwritten note in a woven basket.", price: 1299, stock: 12, deliveryTime: "5-7 business days" },
      { name: "Chocolate & Candle Hamper", description: "Artisanal chocolate paired with a soy wax candle.", price: 999, stock: 12, deliveryTime: "5-7 business days" },
    ],
  },
  {
    name: "Decorative Items",
    skuPrefix: "DECOR",
    description: "Handcrafted pieces to bring warmth to any room.",
    isCustomizable: false,
    products: [
      { name: "Macrame Wall Hanging", description: "Hand-knotted cotton macrame on a driftwood rod.", price: 799, stock: 10, deliveryTime: "5-7 business days" },
      { name: "Hand-painted Terracotta Pot", description: "A small terracotta planter, hand-painted with botanical motifs.", price: 449, stock: 20, deliveryTime: "5-7 business days" },
    ],
  },
  {
    name: "Scrapbooks",
    skuPrefix: "SCRAP",
    description: "Personalized keepsake scrapbooks built around your photos and memories.",
    isCustomizable: true,
    products: [
      { name: "Memory Lane Scrapbook", description: "A 20-page scrapbook designed around your photos, notes, and theme.", price: 1499, stock: 8, deliveryTime: "7-10 business days" },
      { name: "Travel Diary Scrapbook", description: "A keepsake scrapbook for your travel photos and ticket stubs.", price: 1699, stock: 8, deliveryTime: "7-10 business days" },
    ],
  },
  {
    name: "Explosion Boxes",
    skuPrefix: "EXBOX",
    description: "Pop-open boxes layered with photos, notes, and surprises.",
    isCustomizable: true,
    products: [
      { name: "Birthday Explosion Box", description: "A pop-up box with layered photo tiers and a birthday message.", price: 1199, stock: 10, deliveryTime: "5-7 business days" },
      { name: "Anniversary Explosion Box", description: "A romantic explosion box built around your shared memories.", price: 1399, stock: 10, deliveryTime: "5-7 business days" },
    ],
  },
  {
    name: "Personalized Bouquets",
    skuPrefix: "BOUQ",
    description: "Bouquets personalized with names, colors, and a custom note.",
    isCustomizable: true,
    products: [
      { name: "Name-in-Bloom Bouquet", description: "A silk flower bouquet with a hand-lettered name tag.", price: 899, stock: 10, deliveryTime: "5-7 business days" },
      { name: "Photo Petal Bouquet", description: "A bouquet with mini photo charms tucked between the blooms.", price: 999, stock: 10, deliveryTime: "5-7 business days" },
    ],
  },
  {
    name: "Personalized Keychains",
    skuPrefix: "PKEY",
    description: "Keychains engraved or printed with your own photo or name.",
    isCustomizable: true,
    products: [
      { name: "Custom Photo Keychain", description: "Your photo printed on a durable acrylic keychain.", price: 249, stock: 25, deliveryTime: "3-5 business days" },
      { name: "Engraved Name Keychain", description: "A name or short message laser-engraved on wood.", price: 279, stock: 25, deliveryTime: "3-5 business days" },
    ],
  },
  {
    name: "Customized Frames",
    skuPrefix: "FRAME",
    description: "Photo frames arranged and captioned around your story.",
    isCustomizable: true,
    products: [
      { name: "Story Collage Frame", description: "Multiple photos collaged into a single frame with your caption.", price: 899, stock: 12, deliveryTime: "5-7 business days" },
      { name: "Milestone Photo Frame", description: "A frame designed around a graduation, birthday, or milestone date.", price: 799, stock: 12, deliveryTime: "5-7 business days" },
    ],
  },
  {
    name: "Memory Gifts",
    skuPrefix: "MEMORY",
    description: "Keepsakes built to hold a specific memory close.",
    isCustomizable: true,
    products: [
      { name: "Memory Jar", description: "A jar filled with hand-folded notes of your favourite memories.", price: 699, stock: 10, deliveryTime: "5-7 business days" },
      { name: "Voice Message Photo Frame", description: "A photo frame with an embedded playable voice message.", price: 1199, stock: 8, deliveryTime: "7-10 business days" },
    ],
  },
  {
    name: "Couple Gifts",
    skuPrefix: "COUPLE",
    description: "Matching and paired gifts made for two.",
    isCustomizable: true,
    products: [
      { name: "His & Her Mug Set", description: "A pair of mugs printed with your names and a shared date.", price: 699, stock: 15, deliveryTime: "5-7 business days" },
      { name: "Couple Scrapbook", description: "A shared scrapbook built around your relationship timeline.", price: 1599, stock: 8, deliveryTime: "7-10 business days" },
    ],
  },
  {
    name: "Personalized Hampers",
    skuPrefix: "PHAMPER",
    description: "Hampers curated and labeled around a specific person or occasion.",
    isCustomizable: true,
    products: [
      { name: "Just For You Hamper", description: "A hamper curated around the recipient's favourite things.", price: 1799, stock: 8, deliveryTime: "7-10 business days" },
      { name: "Anniversary Surprise Hamper", description: "A hamper themed around your anniversary story.", price: 1999, stock: 8, deliveryTime: "7-10 business days" },
    ],
  },
];

async function seedCatalog(prisma: PrismaClient) {
  for (const [index, categoryData] of CATALOG.entries()) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: {
        name: categoryData.name,
        slug: slugify(categoryData.name),
        skuPrefix: categoryData.skuPrefix,
        description: categoryData.description,
        sortOrder: index,
      },
    });

    for (const productData of categoryData.products) {
      const exists = await prisma.product.findFirst({
        where: { name: productData.name, categoryId: category.id },
      });
      if (exists) continue;

      const count = await prisma.product.count({ where: { categoryId: category.id } });
      const sku = `${category.skuPrefix}-${(count + 1).toString().padStart(3, "0")}`;
      const discountPercent = productData.discountPercent ?? 0;
      const finalPrice =
        Math.round(productData.price * (1 - discountPercent / 100) * 100) / 100;

      await prisma.product.create({
        data: {
          name: productData.name,
          sku,
          description: productData.description,
          categoryId: category.id,
          price: productData.price,
          discountPercent,
          finalPrice,
          stock: productData.stock,
          deliveryTime: productData.deliveryTime,
          isCustomizable: categoryData.isCustomizable,
          requiresApproval: categoryData.isCustomizable,
          minPhotos: categoryData.isCustomizable ? 1 : null,
          maxPhotos: categoryData.isCustomizable ? 5 : null,
        },
      });
    }
  }

  const [categoryCount, productCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);
  console.log(`Catalog ready: ${categoryCount} categories, ${productCount} products.`);
}

async function seedCoupons(prisma: PrismaClient) {
  const coupon = await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderValue: 500,
      maxDiscountAmount: 300,
      perUserLimit: 1,
      isActive: true,
    },
  });
  console.log(`Coupon ready: ${coupon.code}`);
}

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  await seedAdmin(prisma);
  await seedCatalog(prisma);
  await seedCoupons(prisma);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
