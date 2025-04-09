"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface MarqueeBannerProps {
  messages: string[];
  speed?: number;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'warning' | 'info';
}

export function MarqueeBanner({
  messages = ["Thông báo quan trọng của hệ thống sẽ xuất hiện ở đây..."],
  speed = 40,
  className,
  variant = 'default',
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
    default: "bg-muted/50 dark:bg-muted/30 border-border",
    primary: "bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20",
    secondary: "bg-secondary/5 dark:bg-secondary/10 border-secondary/10 dark:border-secondary/20",
    warning: "bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/10 dark:border-orange-500/20",
    info: "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10 dark:border-blue-500/20",
  };

  return (
    <div
      className={cn(
        "overflow-hidden whitespace-nowrap py-0.5 px-4 border-b text-xs",
        variantStyles[variant],
        className
      )}
      ref={scrollRef}
    >
      <div
        ref={contentRef}
        className="inline-flex items-center gap-3"
      >
        {messages.map((message, index) => (
          <div key={index} className="inline-flex items-center gap-1.5">
            <Bell className="h-3 w-3 text-primary dark:text-primary" />
            <span className="text-muted-foreground dark:text-muted-foreground">{message}</span>
            <span className="mx-3 text-muted-foreground/50 dark:text-muted-foreground/50">•</span>
          </div>
        ))}
        {/* Duplicate messages to create seamless loop */}
        {messages.map((message, index) => (
          <div key={`dup-${index}`} className="inline-flex items-center gap-1.5">
            <Bell className="h-3 w-3 text-primary dark:text-primary" />
            <span className="text-muted-foreground dark:text-muted-foreground">{message}</span>
            <span className="mx-3 text-muted-foreground/50 dark:text-muted-foreground/50">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
