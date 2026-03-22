"use client"

import { AnimatedSection } from "@/components/animated-section"
import { FeatureCard } from "@/components/feature-card"
import { 
  FileText, 
  Linkedin, 
  Github, 
  Sparkles, 
  Target, 
  TrendingUp,
  FileCheck,
  Brain,
  Zap
} from "lucide-react"

const additionalFeatures = [
  { icon: Target, title: "Job Match Percentage", description: "See how well your profile matches specific job roles.", color: "text-primary", bg: "bg-primary/10" },
  { icon: Brain, title: "AI Explanations", description: "Understand exactly why your score is what it is.", color: "text-accent", bg: "bg-accent/10" },
  { icon: TrendingUp, title: "Personalized Tips", description: "Get tailored suggestions to improve your profile.", color: "text-chart-3", bg: "bg-chart-3/10" },
  { icon: FileCheck, title: "PDF Report Download", description: "Download detailed analysis reports in PDF format.", color: "text-chart-4", bg: "bg-chart-4/10" },
  { icon: Zap, title: "Instant Analysis", description: "Get results in seconds with our fast AI processing.", color: "text-chart-5", bg: "bg-chart-5/10" },
  { icon: Sparkles, title: "Score Visualization", description: "Beautiful visual breakdowns of your scores and progress.", color: "text-primary", bg: "bg-primary/10" },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 text-balance">
            Everything You Need to{" "}
            <span className="gradient-text">Level Up</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our AI-powered platform analyzes every aspect of your professional profile 
            to give you actionable insights and recommendations.
          </p>
        </AnimatedSection>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <AnimatedSection delay={100}>
            <FeatureCard
              icon={FileText}
              title="Resume Analyzer"
              description="Get your ATS score, identify missing keywords, fix formatting issues, and discover best-fit job roles with match percentages."
              iconColor="text-primary"
            />
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <FeatureCard
              icon={Linkedin}
              title="LinkedIn Analyzer"
              description="Evaluate your profile completeness, headline strength, and experience clarity. Get suggestions to boost your professional presence."
              iconColor="text-accent"
            />
          </AnimatedSection>
          
          <AnimatedSection delay={300}>
            <FeatureCard
              icon={Github}
              title="GitHub Analyzer"
              description="Analyze your repository quality, README presence, and bio. Showcase your coding skills with a detailed developer score."
              iconColor="text-chart-3"
            />
          </AnimatedSection>
        </div>

        {/* Additional Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <AnimatedSection key={feature.title} delay={400 + index * 100}>
              <div className="group flex items-start gap-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:bg-card hover:border-border hover:shadow-xl hover:-translate-y-1">
                <div className={`flex-shrink-0 h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
