import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/seo/site";

const QUICK_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/studio", label: "Design Your Own" },
  { href: "/shop?customizable=true", label: "Customized Gifts" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-conditions", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
  { href: "/shipping-policy", label: "Shipping Policy" },
];

// ─── Social profiles (from SOCIAL_PROFILE_URLS) ──────────────────────────

type IconProps = { className?: string };
const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FacebookIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.1v3h2.5V21h2.9Z" />
  </svg>
);
const YoutubeIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </svg>
);
const PinterestIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.4 1.9.8 2.5.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.4-.6-2.2-2.6-2.2-4.2 0-3.4 2.5-6.6 7.2-6.6 3.8 0 6.7 2.7 6.7 6.3 0 3.7-2.4 6.8-5.6 6.8-1.1 0-2.2-.6-2.5-1.3l-.7 2.6c-.2 1-.9 2.2-1.4 2.9A10 10 0 1 0 12 2Z" />
  </svg>
);

function socialFor(url: string) {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (host.includes("instagram")) return { label: "Instagram", Icon: InstagramIcon };
  if (host.includes("facebook") || host === "fb.com") return { label: "Facebook", Icon: FacebookIcon };
  if (host.includes("youtube") || host === "youtu.be") return { label: "YouTube", Icon: YoutubeIcon };
  if (host.includes("pinterest") || host === "pin.it") return { label: "Pinterest", Icon: PinterestIcon };
  return { label: host, Icon: Globe };
}

const WhatsAppIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39c1.44.79 3.06 1.2 4.71 1.2h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0012.04 2zm5.78 14.02c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.3-.29.47-.14.16-.3.36-.43.48-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.83.92-1.12.19-.29.38-.24.64-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36z" />
  </svg>
);

export function Footer() {
  const socials = SITE.sameAs.flatMap((url) => {
    const info = socialFor(url);
    return info ? [{ url, info }] : [];
  });

  return (
    <footer className="mt-auto border-t border-border bg-cream-dark">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 sm:py-14 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brand/logo-mark.png"
              alt="Petal & Papers"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-display text-xl text-navy">Petal &amp; Papers</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted">
            Handcrafted gifts, made from the heart. Scrapbooks, explosion boxes,
            bouquets and keepsakes — personalized just for the people you love.
          </p>
          {socials.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2.5">
              {socials.map(({ url, info }) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Petal & Papers on ${info.label}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-paper text-navy transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold-dark active:scale-95"
                >
                  <info.Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="font-display text-base text-navy">Quick Links</h3>
          <ul className="mt-4 space-y-2.5">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-gold-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base text-navy">Get in Touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-gold-dark"
              >
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
                <span>WhatsApp us — we reply fast</span>
              </a>
            </li>
            <li>
              <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className="flex items-start gap-2 hover:text-gold-dark">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                <span>{SITE.phone}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-start gap-2 break-all hover:text-gold-dark">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
                <span>{SITE.email}</span>
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
              <span>Handmade in India · shipped across India</span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Petal &amp; Papers. All rights reserved.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {POLICY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-gold-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </footer>
  );
}
