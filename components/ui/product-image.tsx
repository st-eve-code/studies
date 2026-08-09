import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Renders a product/vehicle image. When no src is available, shows a neutral
 * muted placeholder instead of a remote test image.
 */
export function ProductImage({
  src,
  alt,
  fill,
  sizes,
  width,
  height,
  priority,
  className,
}: ProductImageProps) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <ImageIcon className="size-8 opacity-40" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      className={className}
    />
  );
}
