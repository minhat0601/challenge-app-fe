'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isPlaying: boolean;
  className?: string;
  barCount?: number;
  color?: string;
  variant?: 'bars' | 'wave' | 'circle';
}

export function AudioVisualizer({
  isPlaying,
  className,
  barCount = 32,
  color = 'currentColor',
  variant = 'bars'
}: AudioVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);

  // Tạo mảng các thanh
  const bars = Array.from({ length: barCount }, (_, i) => i);

  // Thiết lập animation
  useEffect(() => {
    if (!containerRef.current) return;

    // Hàm tạo giá trị ngẫu nhiên cho các thanh
    const animateBars = () => {
      barsRef.current.forEach((bar) => {
        if (!bar) return;
        
        if (isPlaying) {
          // Tạo giá trị ngẫu nhiên khi đang phát
          const height = Math.random() * 100;
          bar.style.height = `${height}%`;
          
          // Thêm transition để tạo hiệu ứng mượt mà
          bar.style.transition = 'height 0.2s ease';
        } else {
          // Khi không phát, các thanh ở mức thấp
          bar.style.height = '10%';
        }
      });

      // Tiếp tục animation
      animationRef.current = requestAnimationFrame(animateBars);
    };

    // Bắt đầu animation
    animationRef.current = requestAnimationFrame(animateBars);

    // Dọn dẹp khi unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Render dựa trên variant
  if (variant === 'wave') {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "relative h-16 w-full flex items-center justify-center",
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            <path 
              d={`M 0,50 ${bars.map((_, i) => {
                const x = (i / (barCount - 1)) * 100;
                const y = isPlaying ? 50 + Math.sin(i * 0.5) * (Math.random() * 20 + 10) : 50;
                return `L ${x},${y}`;
              }).join(' ')} L 100,50`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              className="transition-all duration-300"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "relative h-40 w-40 flex items-center justify-center",
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full">
            {bars.map((_, i) => {
              const angle = (i / barCount) * 360;
              return (
                <div
                  key={i}
                  ref={(el) => el && (barsRef.current[i] = el)}
                  className="absolute top-1/2 left-1/2 w-1 origin-bottom transform -translate-x-1/2 -translate-y-full transition-all"
                  style={{
                    height: '40%',
                    backgroundColor: color,
                    transform: `rotate(${angle}deg) translateY(-50%)`,
                    opacity: isPlaying ? 0.7 : 0.3,
                  }}
                />
              );
            })}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3/4 w-3/4 rounded-full border-2" style={{ borderColor: color }} />
          </div>
        </div>
      </div>
    );
  }

  // Default: bars
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative h-16 w-full flex items-end justify-center gap-0.5",
        className
      )}
    >
      {bars.map((_, i) => (
        <div
          key={i}
          ref={(el) => el && (barsRef.current[i] = el)}
          className="w-1 h-1/2 rounded-t-sm transition-all"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
