"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FloatingOrbs } from "@/components/floating-orbs"
import { ScoreRing } from "@/components/score-ring"
import { AnimatedSection } from "@/components/animated-section"
import { ArrowRight, Play, FileText, Linkedin, Github, Sparkles, CheckCircle2 } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <FloatingOrbs />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Career Analysis
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-6">
                <span className="text-balance block">Analyze Your</span>
                <span className="text-balance block">Career Profile</span>
                <span className="gradient-text text-balance block">in Seconds</span>
              </h1>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed text-pretty">
                Get instant AI analysis of your Resume, LinkedIn, and GitHub profiles. 
                Receive scores, personalized suggestions, and job matching to accelerate your career.
              </p>
            </AnimatedSection>
            
            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto glow-primary group text-base px-8 h-12 magnetic-hover">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto group text-base px-8 h-12 border-2">
                  <Play className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-125" />
                  Watch Demo
                </Button>
              </div>
            </AnimatedSection>
            
            <AnimatedSection delay={400}>
              <div className="mt-12 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                {["Free to use", "No credit card", "Instant results"].map((text, i) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground" style={{ animationDelay: `${400 + i * 100}ms` }}>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {text}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
          
          {/* Right Content - Score Preview */}
          <AnimatedSection delay={200} animation="scale-in">
            <div className="relative perspective-card">
              {/* Main card */}
              <div className="relative glass rounded-3xl p-8 glow-primary">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                
                <div className="relative">
                  <div className="mb-6 text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-1">Your Career Score</h3>
                    <p className="text-sm text-muted-foreground">Powered by AI analysis</p>
                  </div>
                  
                  <div className="flex justify-center mb-8">
                    <ScoreRing score={87} size={180} strokeWidth={12} />
                  </div>
                  
                  {/* Score breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: FileText, label: "Resume", score: 92, color: "text-primary", bg: "bg-primary/10" },
                      { icon: Linkedin, label: "LinkedIn", score: 85, color: "text-accent", bg: "bg-accent/10" },
                      { icon: Github, label: "GitHub", score: 84, color: "text-chart-3", bg: "bg-chart-3/10" }
                    ].map((item, i) => (
                      <div 
                        key={item.label}
                        className="flex flex-col items-center p-4 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ animationDelay: `${600 + i * 100}ms` }}
                      >
                        <div className={`p-2 rounded-xl ${item.bg} mb-2`}>
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <span className="text-2xl font-bold text-foreground">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 glass rounded-2xl p-4 animate-float shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">+</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Job Matches</p>
                    <p className="text-lg font-bold text-foreground">12 Found</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 animate-float shadow-xl" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/30 to-chart-3/30 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">AI Suggestions</p>
                    <p className="text-lg font-bold text-foreground">5 Tips</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-pulse">
        <span className="text-xs text-muted-foreground">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
