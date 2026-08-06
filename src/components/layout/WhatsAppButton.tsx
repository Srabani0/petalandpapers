"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

const WHATSAPP_NUMBER = "918488082783";
const DEFAULT_MESSAGE = "Hi Petal & Papers! I'd love to know more about your handmade gifts.";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const chatUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-72 overflow-hidden rounded-2xl border border-border bg-paper shadow-2xl">
          <div className="flex items-center justify-between gap-2 bg-[#25D366] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <WhatsAppIcon className="h-5 w-5" />
              <span className="font-display text-sm">Chat with us</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat popup"
              className="opacity-80 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-ink">
              Hi there! Got a question about a custom order or an existing one? Message us on
              WhatsApp — we usually reply fast.
            </p>
            <a
              href={chatUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" />
              Start Chat
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close WhatsApp chat" : "Chat on WhatsApp"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <WhatsAppIcon className="h-7 w-7" />}
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39c1.44.79 3.06 1.2 4.71 1.2h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0012.04 2zm5.78 14.02c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.3-.29.47-.14.16-.3.36-.43.48-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.14.46.12.63-.07.17-.19.72-.83.92-1.12.19-.29.38-.24.64-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}
