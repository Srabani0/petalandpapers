import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";

const QUICK_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?customizable=true", label: "Customized Gifts" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-cream-dark">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
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
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
              <span>hello@petalandpapers.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />
              <span>Made &amp; shipped with care, India</span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Petal &amp; Papers. All rights reserved.</p>
          <p>Every piece made by hand, with love.</p>
        </Container>
      </div>
    </footer>
  );
}
