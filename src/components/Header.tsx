import { Menu, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="grid h-14 grid-cols-3 items-center px-5 sm:h-16 sm:px-8">
        <div className="justify-self-start">
          <button
            aria-label="Open menu"
            className="-ml-2 p-2 text-foreground transition-opacity hover:opacity-60"
          >
            <Menu strokeWidth={1.25} className="h-5 w-5" />
          </button>
        </div>

        <Link
          to="/"
          aria-label="TWOFOURSEVEN — Home"
          className="wordmark justify-self-center text-[0.95rem] sm:text-[1.1rem] text-foreground"
        >
          TWOFOURSEVEN
        </Link>

        <div className="justify-self-end">
          <button
            aria-label="Open cart"
            className="-mr-2 p-2 text-foreground transition-opacity hover:opacity-60"
          >
            <ShoppingBag strokeWidth={1.25} className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
