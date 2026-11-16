"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Input";
import { CONTACT_TOPICS } from "@/lib/validations/contact";

const selectClasses =
  "w-full rounded-md border border-border bg-paper px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<string>(CONTACT_TOPICS[0]);
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, topic, orderNumber, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 rounded-xl border border-border bg-paper p-10 text-center"
      >
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="font-display text-xl text-navy">Thank you, {name.split(" ")[0]}!</p>
        <p className="max-w-sm text-sm text-muted">
          Your message is on its way to us. We usually reply within 24 hours at{" "}
          <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-paper p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Your Name</Label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            autoComplete="tel"
          />
        </div>
        <div>
          <Label htmlFor="contact-topic">What&apos;s this about?</Label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={selectClasses}
          >
            {CONTACT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {topic === "Order help" ? (
        <div>
          <Label htmlFor="contact-order">Order number (optional)</Label>
          <Input
            id="contact-order"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="PP-2026-00001"
            maxLength={30}
          />
        </div>
      ) : null}

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          placeholder="Tell us about the gift you have in mind, the occasion, and any deadline…"
        />
      </div>

      {/* Honeypot — hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto sm:self-start">
        {loading ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
