"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  iconColor?: string
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  className,
  iconColor = "text-primary"
}: FeatureCardProps) {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-card hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 perspective-card",
        className
      )}
    >
      {/* Animated gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shimmer" />
      
      <div className="relative">
        <div className={cn(
          "mb-6 inline-flex rounded-2xl p-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
          iconColor === "text-primary" && "bg-primary/10",
          iconColor === "text-accent" && "bg-accent/10",
          iconColor === "text-chart-3" && "bg-chart-3/10"
        )}>
          <Icon className={cn("h-8 w-8 transition-transform duration-300", iconColor)} />
        </div>
        
        <h3 className="mb-3 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
