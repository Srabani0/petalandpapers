import { SITE } from "@/lib/seo/site";
import {
  DELIVERY_CHARGE,
  FREE_DELIVERY_THRESHOLD,
  RUSH_ORDER_FEE,
  GIFT_WRAP_FEE,
} from "@/lib/cart-constants";

const { minDays, maxDays } = SITE.shipping;
const deliveryCharge = DELIVERY_CHARGE;
const freeAbove = FREE_DELIVERY_THRESHOLD;

/**
 * Real answers to the questions people (and AI assistants) ask before buying
 * handmade gifts. Every claim here mirrors /shipping-policy and /refund-policy.
 * Rendered visibly on the homepage and mirrored into FAQPage JSON-LD + llms.txt.
 */
export const HOME_FAQS = [
  {
    question: "What is Petal & Papers?",
    answer:
      "Petal & Papers is an Indian online store for handmade and personalized gifts — custom scrapbooks, explosion boxes, crochet bouquets, keychains, photo frames and gift hampers. Every piece is crafted by hand and made to order.",
  },
  {
    question: "Can I customize a gift with my own photos and message?",
    answer:
      "Yes. Customizable products have a personalization form where you add your names, message, colours and photos. For many products we then share a design preview for your approval before we start making it.",
  },
  {
    question: "Do you deliver across India?",
    answer: `Yes, we ship across India. Delivery is ₹${deliveryCharge} per order and free on orders above ₹${freeAbove}. Delivery typically takes ${minDays}–${maxDays} business days depending on the product, and the estimate is shown on every product page.`,
  },
  {
    question: "Can I order a gift in a hurry?",
    answer: `Yes. You can add rush processing at checkout (+₹${RUSH_ORDER_FEE}) to have your order prioritized. Because everything is handmade, we recommend ordering personalized gifts a few days ahead of the occasion.`,
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "You can pay online by UPI, credit/debit card, net banking or wallet through Razorpay, or choose Cash on Delivery at checkout.",
  },
  {
    question: "Can I add a gift message or gift wrap?",
    answer: `Yes. At checkout you can add a personal gift message, choose a scheduled delivery date, and add gift wrap (+₹${GIFT_WRAP_FEE}).`,
  },
  {
    question: "What if my order arrives damaged?",
    answer: `Contact us within ${SITE.returns.damagedClaimHours} hours of delivery with a photo of the item and its packaging, and we'll arrange a replacement or a refund. Because personalized items are made specifically for you, we can't accept change-of-mind returns once production has begun — see our Refund & Cancellation Policy for details.`,
  },
  {
    question: "What are good handmade gift ideas for birthdays and anniversaries?",
    answer:
      "Popular choices are a personalized scrapbook filled with your photos and memories, an explosion box that unfolds with messages and pictures, a crochet bouquet that never wilts, a custom photo frame, or a curated gift hamper. All can be personalized for the person you're gifting.",
  },
] as const;
