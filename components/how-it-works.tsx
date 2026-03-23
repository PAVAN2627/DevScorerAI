"use client"

import { AnimatedSection } from "@/components/animated-section"
import { Upload, Brain, BarChart3, Rocket, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Your Profile",
    description: "Upload your resume PDF, LinkedIn PDF, or enter your GitHub URL to get started.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
    glowColor: "group-hover:shadow-primary/20"
  },
  {
    icon: Brain,
    title: "AI Analyzes",
    description: "Our advanced AI powered by Grok analyzes every aspect of your professional profile.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/40",
    glowColor: "group-hover:shadow-accent/20"
  },
  {
    icon: BarChart3,
    title: "Get Your Score",
    description: "Receive detailed scores with visual breakdowns for skills, experience, and projects.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/40",
    glowColor: "group-hover:shadow-chart-3/20"
  },
  {
    icon: Rocket,
    title: "Level Up",
    description: "Follow personalized suggestions and job matches to accelerate your career growth.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/40",
    glowColor: "group-hover:shadow-chart-4/20"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-20 bg-muted/30">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] bg-[size:40px_40px] opacity-30" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6 backdrop-blur-sm">
            <BarChart3 className="h-4 w-4" />
            Simple Process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 text-balance">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get your career score in just a few simple steps. 
            No complicated setup required.
          </p>
        </AnimatedSection>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-1 bg-gradient-to-r from-primary/50 via-accent/50 via-chart-3/50 to-chart-4/50 rounded-full" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={index * 150}>
                <div className={`group relative flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2`}>
                  {/* Arrow connector for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-24 -right-3 z-10 h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                  
                  {/* Step icon */}
                  <div className={`relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border-2 ${step.borderColor} ${step.bgColor} backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl ${step.glowColor}`}>
                    <step.icon className={`h-10 w-10 ${step.color} transition-transform duration-300 group-hover:scale-110`} />
                    <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border text-sm font-bold text-foreground shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3 transition-colors duration-300 group-hover:text-primary">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed max-w-[250px]">
                    {step.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
