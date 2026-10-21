"use client";

import Image from "next/image";
import { useState } from "react";

interface CoverImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

export function CoverImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: CoverImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        className={`cover-fallback ${className}`}
        role={alt ? "img" : undefined}
      >
        <span aria-hidden="true">m</span>
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={`cover-image ${className}`}
      fill
      onError={() => setFailedSrc(src)}
      priority={priority}
      sizes={sizes}
      src={src}
    />
  );
}
