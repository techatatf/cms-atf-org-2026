import { ImageOff } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { NewsArticleHeroImage } from "@/services/news";

type NewsArticleImageProps = {
  frameClassName?: string;
  image: NewsArticleHeroImage;
  imageClassName?: string;
  onFailure?: () => void;
};

function UnavailableImage({
  ariaLabel,
  frameClassName,
}: {
  ariaLabel: string;
  frameClassName?: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col items-center justify-center gap-3 bg-atf-gray-100 text-atf-gray-500",
        frameClassName,
      )}
      role="img"
    >
      <ImageOff className="size-8" aria-hidden="true" />
      <span className="font-display text-sm font-bold uppercase">
        Image unavailable
      </span>
    </div>
  );
}

export function NewsArticleImage({
  frameClassName,
  image,
  imageClassName,
  onFailure,
}: NewsArticleImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <UnavailableImage
        ariaLabel={`${image.alt}. Image unavailable.`}
        frameClassName={frameClassName}
      />
    );
  }

  return (
    <div className={cn("overflow-hidden bg-atf-gray-100", frameClassName)}>
      <img
        alt={image.alt}
        className={cn("block size-full object-cover", imageClassName)}
        decoding="async"
        onError={() => {
          setFailed(true);
          onFailure?.();
        }}
        src={image.url}
      />
    </div>
  );
}
