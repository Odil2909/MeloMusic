"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "./Icon";

interface CoverImageProps {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fallbackLabel?: string;
}

export function CoverImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  fallbackLabel,
}: CoverImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (shouldShowImageFallback(src, failedSrc)) {
    return (
      <span
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        className={`cover-fallback ${className}`}
        role={alt ? "img" : undefined}
      >
        {fallbackLabel ? (
          <span aria-hidden="true" className="cover-fallback-initials">
            {fallbackLabel}
          </span>
        ) : (
          <Icon className="cover-fallback-icon" name="music" size={34} />
        )}
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
      src={src!}
    />
  );
}

export function shouldShowImageFallback(src: string | null, failedSrc: string | null): boolean {
  return !src || failedSrc === src;
}
