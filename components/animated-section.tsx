"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: "slide-up" | "scale-in" | "fade-in" | "fade-blur"
}

export function AnimatedSection({ 
  children, 
  className, 
  delay = 0,
  animation = "slide-up" 
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  const animationClass = {
    "slide-up": "animate-slide-up",
    "scale-in": "animate-scale-in",
    "fade-in": "animate-in fade-in duration-700",
    "fade-blur": "animate-fade-blur"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "opacity-0",
        isVisible && animationClass[animation],
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards"
      }}
    >
      {children}
    </div>
  )
}
