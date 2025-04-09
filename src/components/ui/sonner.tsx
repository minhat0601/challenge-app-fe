"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "hsl(var(--success))",
          "--success-text": "hsl(var(--success-foreground))",
          "--success-border": "hsl(var(--success))",
          "--error-bg": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
          "--error-border": "hsl(var(--destructive))",
          "--loading-bg": "hsl(var(--muted))",
          "--loading-text": "hsl(var(--muted-foreground))",
          "--font-sans": "var(--font-sans)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
