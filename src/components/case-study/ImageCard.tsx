'use client';

import Image from 'next/image';

interface ImageCardProps {
  src: string;
  alt: string;
  caption: string;
  pillText?: string;
  isGif?: boolean;
  aspectRatio?: string;
  backgroundColor?: string;
}

export function ImageCard({
  src,
  alt,
  caption,
  pillText = 'Image',
  isGif = false,
  aspectRatio = '16/9',
  backgroundColor = 'rgb(48, 48, 48)',
}: ImageCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{ backgroundColor, aspectRatio }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain p-8"
          unoptimized={isGif}
        />
      </div>
      <div className="flex items-center justify-end gap-2.5">
        <span className="cs-caption">{caption}</span>
        <span className="cs-pill">
          <span className="cs-pill-text">{pillText}</span>
        </span>
      </div>
    </div>
  );
}
