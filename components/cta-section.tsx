"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background animate-gradient" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-primary/10 blur-2xl animate-float" />
      <div className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <div className="glass rounded-[2rem] p-8 md:p-16 glow-primary relative overflow-hidden">
            {/* Inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm text-primary mb-8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Start Your Journey Today
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 text-balance">
                Ready to <span className="gradient-text">Level Up</span> Your Career?
              </h2>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
                Join thousands of developers and professionals who have improved 
                their career profiles with DevScorer AI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto glow-primary group text-base px-8 h-14 magnetic-hover">
                    Start Free Analysis
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 h-14 border-2">
                    Sign In
                  </Button>
                </Link>
              </div>
              
              <p className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                No credit card required. Get started in seconds.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
