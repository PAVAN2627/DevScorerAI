"use client"

import { cn } from "@/lib/utils"

interface FloatingOrbsProps {
  className?: string
}

export function FloatingOrbs({ className }: FloatingOrbsProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Primary orb - morphing */}
      <div 
        className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/25 dark:bg-primary/15 blur-[120px] animate-morph animate-pulse-glow"
        style={{ animationDelay: "0s" }}
      />
      
      {/* Accent orb - morphing */}
      <div 
        className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent/20 dark:bg-accent/12 blur-[100px] animate-morph animate-pulse-glow"
        style={{ animationDelay: "2s", animationDuration: "10s" }}
      />
      
      {/* Center orb */}
      <div 
        className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-3/15 dark:bg-chart-3/10 blur-[80px] animate-pulse-glow"
        style={{ animationDelay: "4s" }}
      />
      
      {/* Small floating particles */}
      <div className="absolute top-1/4 right-1/4 h-2 w-2 rounded-full bg-primary/50 dark:bg-primary/40 animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-3/4 left-1/4 h-3 w-3 rounded-full bg-accent/50 dark:bg-accent/40 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/3 h-2 w-2 rounded-full bg-chart-3/50 dark:bg-chart-3/40 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 right-1/2 h-1.5 w-1.5 rounded-full bg-primary/50 dark:bg-primary/40 animate-float" style={{ animationDelay: "3s" }} />
    </div>
  )
}
