"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, closeLightbox, nextLightbox, prevLightbox]);

  if (!images.length) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main image */}
      <div
        className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3] cursor-zoom-in group"
        onClick={() => openLightbox(activeIndex)}
        role="button"
        tabIndex={0}
        aria-label="Open image gallery"
        onKeyDown={(e) => e.key === "Enter" && openLightbox(activeIndex)}
      >
        <Image
          src={images[activeIndex]}
          alt={`${alt} — view ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {/* Expand hint */}
        <div className="absolute top-3 right-3 size-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Expand className="size-4 text-white" />
        </div>
        {/* Navigation arrows (if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i - 1 + images.length) % images.length); }}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5 text-white" />
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
              onClick={(e) => { e.stopPropagation(); setActiveIndex((i) => (i + 1) % images.length); }}
              aria-label="Next image"
            >
              <ChevronRight className="size-5 text-white" />
            </button>
            {/* Counter */}
            <span className="absolute bottom-3 right-3 text-xs text-white bg-black/50 px-2 py-0.5 rounded-full">
              {activeIndex + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                i === activeIndex ? "border-orange-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="size-5 text-white" />
            </button>

            {/* Counter */}
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
              {lightboxIndex + 1} / {images.length}
            </span>

            {/* Prev */}
            {images.length > 1 && (
              <button
                onClick={prevLightbox}
                className="absolute left-4 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-6 text-white" />
              </button>
            )}

            {/* Main image */}
            <div className="relative w-full max-w-5xl mx-16 aspect-video">
              <Image
                src={images[lightboxIndex]}
                alt={`${alt} — view ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
                priority
              />
            </div>

            {/* Next */}
            {images.length > 1 && (
              <button
                onClick={nextLightbox}
                className="absolute right-4 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="size-6 text-white" />
              </button>
            )}

            {/* Thumbnail strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={cn(
                    "relative w-14 h-10 rounded overflow-hidden transition-all",
                    i === lightboxIndex ? "ring-2 ring-orange-500" : "opacity-50 hover:opacity-80"
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}
