import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  // Reset to first slide when image set changes (e.g. color swap)
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });
    setIndex(0);
  }, [images]);

  const goTo = (i: number) => {
    const el = railRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = railRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <div className="relative">
      <div
        ref={railRef}
        onScroll={onScroll}
        className="flex aspect-[3/4] w-full snap-x snap-mandatory overflow-x-auto bg-secondary [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div key={i} className="relative h-full w-full shrink-0 snap-center">
            <img
              src={src}
              alt={`${alt} — view ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-background/85 text-foreground backdrop-blur transition-opacity hover:bg-background disabled:opacity-30"
          >
            <ChevronLeft strokeWidth={1.25} className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => goTo(index + 1)}
            disabled={index === count - 1}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center bg-background/85 text-foreground backdrop-blur transition-opacity hover:bg-background disabled:opacity-30"
          >
            <ChevronRight strokeWidth={1.25} className="h-4 w-4" />
          </button>

          <div className="eyebrow absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/85 px-3 py-1 text-[0.65rem] text-foreground backdrop-blur">
            {index + 1} / {count}
          </div>
        </>
      )}
    </div>
  );
}
