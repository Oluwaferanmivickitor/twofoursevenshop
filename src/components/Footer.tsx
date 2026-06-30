import { useState } from "react";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "@tanstack/react-router";

const quickLinks = [
  { label: "Shipping Policy", to: "/shipping" as const },
  { label: "Returns & Refunds", to: "/returns" as const },
  { label: "Contact Us", to: "/contact" as const },
  { label: "Size Guide", to: "/size-guide" as const },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "X (Twitter)", href: "https://x.com", Icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
];

const contact = [
  { label: "Location", value: "Lagos, Nigeria" },
  { label: "Email", value: "247.freeworld@gmail.com", href: "mailto:247.freeworld@gmail.com" },
  { label: "Phone", value: "0806 006 3068", href: "tel:+2348060063068" },
  { label: "WhatsApp", value: "0704 690 0261", href: "https://wa.me/2347046900261" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-10">
          {/* Newsletter */}
          <div>
            <p className="eyebrow text-muted-foreground">Newsletter</p>
            <h3 className="mt-3 font-serif text-2xl font-light text-foreground sm:text-3xl">
              Private dispatches.
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSubmitted(true);
              }}
              className="mt-6"
            >
              {submitted ? (
                <p className="text-sm text-muted-foreground">
                  Thank you — you are on the list.
                </p>
              ) : (
                <div className="flex items-center border-b border-foreground/40 focus-within:border-foreground">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    aria-label="Email address"
                    className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="eyebrow shrink-0 pl-3 text-foreground transition-opacity hover:opacity-60"
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Quick links */}
          <div>
            <p className="eyebrow text-muted-foreground">Assistance</p>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-foreground transition-opacity hover:opacity-60"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="eyebrow text-muted-foreground">Contact</p>
            <ul className="mt-5 space-y-3">
              {contact.map((c) => (
                <li key={c.label} className="text-sm text-foreground/80">
                  <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {c.label}
                  </span>
                  {c.href ? (
                    <a href={c.href} className="transition-opacity hover:opacity-60">
                      {c.value}
                    </a>
                  ) : (
                    <span>{c.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <p className="eyebrow text-muted-foreground">Follow</p>
            <ul className="mt-5 flex items-center gap-5">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="block text-foreground transition-opacity hover:opacity-60"
                  >
                    <Icon strokeWidth={1.25} className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="wordmark text-[0.7rem] text-foreground">TWOFOURSEVEN</p>
          <p className="text-[0.7rem] text-muted-foreground">
            © {new Date().getFullYear()} TWOFOURSEVEN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
