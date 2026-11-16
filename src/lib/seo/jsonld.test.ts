import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  faqJsonLd,
  organizationJsonLd,
  productJsonLd,
  websiteJsonLd,
  type ProductLike,
} from "@/lib/seo/jsonld";

const product: ProductLike = {
  id: "3f2b8c1e-9a4d-4e6f-8b1a-2c3d4e5f6a7b",
  name: "Personalized Scrapbook",
  sku: "SCRAP-001",
  description: "A handmade scrapbook.",
  finalPrice: 899,
  price: 999,
  discountPercent: 10,
  deliveryTime: "5-7 business days",
  isCustomizable: true,
  inStock: true,
  categoryName: "Scrapbooks",
  images: ["https://res.cloudinary.com/demo/a.jpg"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = Record<string, any>;

describe("productJsonLd", () => {
  it("emits a valid Offer in INR with absolute URLs", () => {
    const ld = productJsonLd(product) as Obj;
    expect(ld["@type"]).toBe("Product");
    expect(ld.offers.priceCurrency).toBe("INR");
    expect(ld.offers.price).toBe("899.00");
    expect(ld.offers.availability).toBe("https://schema.org/InStock");
    expect(ld.url).toMatch(/^https:\/\/www\.petalandpapers\.test\/product\/personalized-scrapbook-/);
  });

  it("marks out-of-stock products OutOfStock", () => {
    const ld = productJsonLd({ ...product, inStock: false }) as Obj;
    expect(ld.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("charges shipping below the free-delivery threshold and none above it", () => {
    const cheap = productJsonLd({ ...product, finalPrice: 500 }) as Obj;
    const dear = productJsonLd({ ...product, finalPrice: 1500 }) as Obj;
    expect(cheap.offers.shippingDetails.shippingRate.value).toBe(99);
    expect(dear.offers.shippingDetails.shippingRate.value).toBe(0);
  });

  it("never invents ratings: no aggregateRating without reviews", () => {
    expect(productJsonLd(product)).not.toHaveProperty("aggregateRating");
    expect(
      productJsonLd(product, { count: 0, average: 0, reviews: [] }),
    ).not.toHaveProperty("aggregateRating");
  });

  it("includes aggregateRating and reviews when real reviews exist", () => {
    const ld = productJsonLd(product, {
      count: 2,
      average: 4.5,
      reviews: [
        { author: "Asha", rating: 5, title: "Lovely", body: "Perfect gift", createdAt: new Date("2026-08-01") },
        { author: "Ravi", rating: 4, title: null, body: "Nice", createdAt: new Date("2026-08-02") },
      ],
    }) as Obj;
    expect(ld.aggregateRating).toMatchObject({ ratingValue: 4.5, reviewCount: 2 });
    expect(ld.review).toHaveLength(2);
    expect(ld.review[0].datePublished).toBe("2026-08-01");
    expect(ld.review[1]).not.toHaveProperty("name");
  });

  it("flags customizable products", () => {
    expect((productJsonLd(product) as Obj).additionalProperty.name).toBe("Customizable");
    expect(productJsonLd({ ...product, isCustomizable: false })).not.toHaveProperty("additionalProperty");
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers items from 1 with absolute URLs", () => {
    const ld = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
    ]) as Obj;
    expect(ld.itemListElement.map((i: Obj) => i.position)).toEqual([1, 2]);
    expect(ld.itemListElement[1].item).toBe("https://www.petalandpapers.test/shop");
  });
});

describe("collectionJsonLd", () => {
  it("lists products as an ItemList with canonical product URLs", () => {
    const ld = collectionJsonLd({
      name: "Handmade Scrapbooks",
      description: "d",
      path: "/category/scrapbooks",
      products: [{ id: product.id, name: product.name, image: "https://x/y.jpg" }],
    }) as Obj;
    expect(ld.mainEntity.numberOfItems).toBe(1);
    expect(ld.mainEntity.itemListElement[0].url).toContain("/product/personalized-scrapbook-");
  });
});

describe("faqJsonLd", () => {
  it("maps Q&A pairs to schema.org Questions", () => {
    const ld = faqJsonLd([{ question: "Q?", answer: "A." }]) as Obj;
    expect(ld.mainEntity[0]).toMatchObject({ "@type": "Question", name: "Q?" });
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("A.");
  });
});

describe("organization & website", () => {
  it("links the website to the organization and exposes a search action", () => {
    const org = organizationJsonLd() as Obj;
    const site = websiteJsonLd() as Obj;
    expect(site.publisher["@id"]).toBe(org["@id"]);
    expect(site.potentialAction.target.urlTemplate).toContain("/shop?q={search_term_string}");
    expect(org.email).toBe("owner@petalandpapers.test");
  });
});
