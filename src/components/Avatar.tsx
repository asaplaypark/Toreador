type Size = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<Size, { wrap: string; text: string }> = {
  sm:  { wrap: "size-8",  text: "text-xs" },
  md:  { wrap: "size-12", text: "text-base" },
  lg:  { wrap: "size-16", text: "text-2xl" },
  xl:  { wrap: "size-24", text: "text-3xl" },
};

type Props = {
  url?: string | null;
  initials: string;
  size?: Size;
  alt?: string;
};

export default function Avatar({ url, initials, size = "md", alt = "" }: Props) {
  const { wrap, text } = sizeClasses[size];

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt || initials}
        className={`${wrap} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${wrap} shrink-0 select-none rounded-full bg-sepia-mid flex items-center justify-center`}
    >
      <span className={`${text} font-semibold text-sepia-cream`}>
        {initials.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
