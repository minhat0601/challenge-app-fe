"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface MarqueeBannerProps {
  messages: string[];
  speed?: number;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'info';
  fixed?: boolean;
}

export function MarqueeBanner({
  messages = ["Thông báo quan trọng của hệ thống sẽ xuất hiện ở đây..."],
  speed = 40,
  className,
  variant = 'default',
  fixed = false,
}: MarqueeBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || !contentRef.current) return;

    const scrollContainer = scrollRef.current;
    const contentWidth = contentRef.current.scrollWidth;
    const viewportWidth = scrollContainer.clientWidth;

    // Only animate if content is wider than viewport
    if (contentWidth <= viewportWidth) return;

    let animationId: number;
    let position = 0;

    const animate = () => {
      position -= 1;

      // Reset position when content has scrolled completely out of view
      if (Math.abs(position) >= contentWidth) {
        position = viewportWidth;
      }

      if (contentRef.current) {
        contentRef.current.style.transform = `translateX(${position}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [speed]);

  // Define variant styles
  const variantStyles = {
    default: "bg-muted/60 dark:bg-muted/40 border-border",
    primary: "bg-primary/10 dark:bg-primary/15 border-primary/20 dark:border-primary/30",
    secondary: "bg-secondary/10 dark:bg-secondary/15 border-secondary/20 dark:border-secondary/30",
    warning: "bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/20 dark:border-orange-500/30",
    info: "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20 dark:border-blue-500/30",
  };

  return (
    <div
      className={cn(
        "overflow-hidden whitespace-nowrap py-1 px-4 border-b text-xs",
        "backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-opacity-80",
        fixed && "fixed top-0 left-0 right-0 z-[100] shadow-md",
        variantStyles[variant],
        className
      )}
      ref={scrollRef}
    >
      <div
        ref={contentRef}
        className="inline-flex items-center gap-3 py-0.5"
      >
        {messages.map((message, index) => (
          <div key={index} className="inline-flex items-center gap-1.5">
            <Bell className="h-3 w-3 text-primary dark:text-primary" />
            <span className="text-muted-foreground dark:text-muted-foreground font-medium">{message}</span>
            <span className="mx-3 text-muted-foreground/50 dark:text-muted-foreground/50">•</span>
          </div>
        ))}
        {/* Duplicate messages to create seamless loop */}
        {messages.map((message, index) => (
          <div key={`dup-${index}`} className="inline-flex items-center gap-1.5">
            <Bell className="h-3 w-3 text-primary dark:text-primary" />
            <span className="text-muted-foreground dark:text-muted-foreground font-medium">{message}</span>
            <span className="mx-3 text-muted-foreground/50 dark:text-muted-foreground/50">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
