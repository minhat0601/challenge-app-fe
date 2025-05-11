'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  exactMatch?: boolean;
}

export function NavLink({ href, icon: Icon, label, exactMatch = false }: NavLinkProps) {
  const pathname = usePathname();

  // Kiểm tra xem link có đang active không
  const isActive = exactMatch
    ? pathname === href
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
        "hover:bg-primary/15 hover:text-primary hover:translate-x-1",
        isActive
          ? "bg-primary/15 text-primary font-medium border-l-2 border-primary pl-[10px] shadow-sm"
          : "text-muted-foreground"
      )}
    >
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-all",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
      )}>
        <Icon className={cn(
          "h-4 w-4 transition-all",
          "group-hover:scale-110"
        )} />
      </div>
      <span className="font-medium">{label}</span>
      {isActive && (
        <span className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse"></span>
      )}
    </Link>
  );
}
