import { useEffect, useState } from "react";
import hero1 from "@/assets/hero-wd-black.jpg.asset.json";
import hero2 from "@/assets/hero-wd-white.jpg.asset.json";
import hero3 from "@/assets/hero-mg.jpg.asset.json";

const slides = [
  { src: hero1.url, alt: "TWOFOURSEVEN — WE DIFFERENT campaign portrait" },
  { src: hero2.url, alt: "TWOFOURSEVEN — WE DIFFERENT lifestyle" },
  { src: hero3.url, alt: "TWOFOURSEVEN — MONEY GANG editorial" },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-label="Featured collection"
      className="hero-section relative w-full overflow-hidden bg-secondary"
    >
      <div className="relative h-[78vh] min-h-[480px] w-full sm:h-[88vh]">
        <div
          className="flex h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="relative h-full w-full flex-shrink-0">
              <img
                src={s.src}
                alt={s.alt}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center gap-2 sm:bottom-8">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`pointer-events-auto h-px w-8 transition-all duration-500 ${
                i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
