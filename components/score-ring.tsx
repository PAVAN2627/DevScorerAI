"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  animated?: boolean
}

export function ScoreRing({ 
  score, 
  size = 120, 
  strokeWidth = 8,
  className,
  label,
  animated = true
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (displayScore / 100) * circumference

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!animated || !isVisible) return
    
    const timer = setTimeout(() => {
      const duration = 1500
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutExpo = 1 - Math.pow(2, -10 * progress)
        const currentScore = Math.round(score * easeOutExpo)
        
        setDisplayScore(currentScore)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }, 200)
    
    return () => clearTimeout(timer)
  }, [score, animated, isVisible])

  const getColor = (score: number) => {
    if (score >= 80) return { stroke: "stroke-primary", glow: "var(--primary)" }
    if (score >= 60) return { stroke: "stroke-chart-4", glow: "var(--chart-4)" }
    if (score >= 40) return { stroke: "stroke-chart-5", glow: "var(--chart-5)" }
    return { stroke: "stroke-destructive", glow: "var(--destructive)" }
  }

  const colors = getColor(score)

  return (
    <div ref={ref} className={cn("relative flex flex-col items-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--chart-3)" />
          </linearGradient>
          <filter id={`glow-${score}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? offset : circumference}
          strokeLinecap="round"
          stroke={`url(#gradient-${score})`}
          filter={`url(#glow-${score})`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground tabular-nums">
          {Math.round(displayScore)}
        </span>
        <span className="text-sm text-muted-foreground font-medium">/100</span>
      </div>
      
      {label && (
        <span className="mt-3 text-sm font-semibold text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  )
}
