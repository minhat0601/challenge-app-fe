'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarFrameProps {
  src?: string;
  fallback: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  frame?: 'none' | 'rank1' | 'rank2' | 'rank3';
}

export function AvatarFrame({
  src,
  fallback,
  alt,
  className,
  size = 'md',
  frame = 'none'
}: AvatarFrameProps) {
  // Kích thước avatar dựa trên prop size
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  // Lớp CSS cho frame
  const frameClasses = {
    none: '',
    rank1: 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background',
    rank2: 'ring-2 ring-gray-400 ring-offset-2 ring-offset-background',
    rank3: 'ring-2 ring-amber-700 ring-offset-2 ring-offset-background'
  };

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], frameClasses[frame], className)}>
        {src && <AvatarImage src={src} alt={alt || fallback} />}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
    </div>
  );
}
