import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  href?: string;
  priority?: boolean;
}

export function Logo({
  width = 140,
  height,
  className = "",
  href,
  priority = true,
}: LogoProps) {
  // Original aspect ratio: 956 / 264 ≈ 3.6212
  const computedHeight = height ?? Math.round(width / 3.6212);

  const imageElement = (
    <Image
      src="/anilink-logo.png"
      alt="AniLink"
      width={width}
      height={computedHeight}
      priority={priority}
      className={`h-auto object-contain ${className}`}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center transition-opacity hover:opacity-90">
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}
