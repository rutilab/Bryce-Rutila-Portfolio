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
        <span className="text-sm text-white/50">{caption}</span>
        <div className="px-3 py-1 rounded-full bg-white/10">
          <span className="text-[10px] font-mono text-white/80 uppercase">
            {pillText}
          </span>
        </div>
      </div>
    </div>
  );
}
