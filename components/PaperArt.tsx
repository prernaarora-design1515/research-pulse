// Deliberately not a screenshot of the paper itself -- a card should read as
// an edited, designed object, not a photocopy. Pulls a free, open-licensed
// photo from Lorem Picsum (picsum.photos), keyed to a stable seed so the same
// paper always gets the same image, and lets the gradient/typography layered
// on top by each caller do the actual information design.
export default function PaperArt({
  seed,
  alt,
  className = "",
}: {
  seed: string | number;
  alt: string;
  className?: string;
}) {
  const src = `https://picsum.photos/seed/rp-${encodeURIComponent(String(seed))}/640/800`;

  return (
    <div className={`relative overflow-hidden bg-slate-800 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover grayscale-[35%] contrast-[1.1] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-accent mix-blend-color opacity-30" />
    </div>
  );
}
