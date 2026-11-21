/**
 * Seeds the Design Studio with starter categories, templates (several designs
 * × sizes, placeholder prices) and a sticker library.
 *
 *   npm run db:seed:studio
 *
 * Idempotent and non-destructive: existing categories keep their linked
 * product and settings (only the 3D product shape is filled in), and
 * templates/stickers that already exist are skipped — so it never touches
 * anything the admin created or edited.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { SIZE_PRESETS, parseDesignDoc } from "../src/lib/studio/doc";
import { buildStarter } from "../src/lib/studio/starters";
import { STICKERS, STUDIO_SEED } from "./studio-stickers";
import { BOUQUET_CANVAS, BOUQUET_CATEGORY_SLUG, BOUQUET_SIZES, DEFAULT_RECIPE, buildBouquetDoc } from "../src/lib/studio/bouquet";

/** The Bouquet Builder's carrier category + template (the price comes from each recipe). */
async function seedBouquetBuilder() {
  let category = await prisma.designCategory.findUnique({ where: { slug: BOUQUET_CATEGORY_SLUG } });
  if (!category) {
    const product = await prisma.product.findUnique({ where: { sku: "PIPE-001" } });
    if (!product) return console.warn("! Bouquet Builder: product PIPE-001 not found — skipped");
    category = await prisma.designCategory.create({
      data: {
        name: "Build a Bouquet",
        slug: BOUQUET_CATEGORY_SLUG,
        description: "Pick every pipe-cleaner flower, the wrapping paper, ribbon and gift tag — and watch your bouquet come together.",
        kind: "STANDARD",
        productId: product.id,
        sortOrder: 0,
        isActive: true,
      },
    });
    console.log("+ Build a Bouquet: created");
  }
  const exists = await prisma.designTemplate.findFirst({ where: { categoryId: category.id } });
  if (exists) return;
  const parsed = parseDesignDoc(buildBouquetDoc(DEFAULT_RECIPE));
  if ("error" in parsed) throw new Error(parsed.error);
  await prisma.designTemplate.create({
    data: {
      categoryId: category.id,
      name: "Pipe Cleaner Bouquet",
      sizeLabel: "Handmade to order",
      width: BOUQUET_CANVAS.width,
      height: BOUQUET_CANVAS.height,
      price: BOUQUET_SIZES[0].base,
      canvas: parsed.doc as unknown as Prisma.InputJsonValue,
      isActive: true,
      sortOrder: 0,
    },
  });
  console.log("  + template Pipe Cleaner Bouquet");
}

const STICKER_DIR = path.join(process.cwd(), "public", "studio", "stickers");

async function main() {
  // 1. Sticker files (shipped with the site under /studio/stickers).
  fs.mkdirSync(STICKER_DIR, { recursive: true });
  for (const s of STICKERS) fs.writeFileSync(path.join(STICKER_DIR, s.file), s.svg + "\n");
  console.log(`✓ ${STICKERS.length} sticker files in public/studio/stickers`);

  for (const seed of STUDIO_SEED) {
    // 2. Category (create, or just fill in the 3D shape on an existing one).
    let category = await prisma.designCategory.findUnique({ where: { slug: seed.slug } });
    if (category) {
      category = await prisma.designCategory.update({
        where: { id: category.id },
        data: {
          kind: seed.kind,
          ...(category.description ? {} : { description: seed.description }),
        },
      });
      console.log(`• ${seed.name}: exists — kept settings, shape set to ${seed.kind}`);
    } else {
      const product = await prisma.product.findUnique({ where: { sku: seed.productSku } });
      if (!product) {
        console.warn(`! ${seed.name}: product ${seed.productSku} not found — skipped`);
        continue;
      }
      category = await prisma.designCategory.create({
        data: {
          name: seed.name,
          slug: seed.slug,
          description: seed.description,
          kind: seed.kind,
          productId: product.id,
          sortOrder: seed.sortOrder,
          isActive: true,
        },
      });
      console.log(`+ ${seed.name}: created (ordered as ${product.name})`);
    }

    // 3. Templates: every design in every listed size.
    let order = await prisma.designTemplate.count({ where: { categoryId: category.id } });
    for (const design of seed.designs) {
      for (const [presetKey, price] of design.sizes) {
        const preset = SIZE_PRESETS.find((p) => p.key === presetKey);
        if (!preset) throw new Error(`Unknown size preset ${presetKey}`);
        const sizeLabel = preset.label.split(" · ").pop() ?? preset.label;

        const exists = await prisma.designTemplate.findFirst({
          where: { categoryId: category.id, name: design.name, sizeLabel },
        });
        if (exists) continue;

        const doc = buildStarter(design.starter, preset.width, preset.height);
        const parsed = parseDesignDoc(doc);
        if ("error" in parsed) throw new Error(`${design.name} ${sizeLabel}: ${parsed.error}`);

        await prisma.designTemplate.create({
          data: {
            categoryId: category.id,
            name: design.name,
            sizeLabel,
            width: preset.width,
            height: preset.height,
            price,
            canvas: parsed.doc as unknown as Prisma.InputJsonValue,
            isActive: true,
            sortOrder: order++,
          },
        });
        console.log(`  + template ${design.name} · ${sizeLabel} · ₹${price}`);
      }
    }
  }

  await seedBouquetBuilder();

  // 4. Sticker library rows, per category.
  const categories = await prisma.designCategory.findMany({ select: { id: true, slug: true, name: true } });
  for (const category of categories) {
    let order = await prisma.designElement.count({ where: { categoryId: category.id } });
    let added = 0;
    for (const s of STICKERS) {
      if (!s.for.includes("*") && !s.for.includes(category.slug)) continue;
      const imageUrl = `/studio/stickers/${s.file}`;
      const exists = await prisma.designElement.findFirst({ where: { categoryId: category.id, imageUrl } });
      if (exists) continue;
      await prisma.designElement.create({
        data: {
          categoryId: category.id,
          name: s.name,
          group: s.group,
          imageUrl,
          cloudinaryId: `local:${s.file}`,
          sortOrder: order++,
        },
      });
      added++;
    }
    console.log(`✓ ${category.name}: ${added} stickers added`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
