"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/score-ring"
import { AnimatedSection } from "@/components/animated-section"
import { createClient } from "@/lib/supabase/client"
import {
  FileText,
  Linkedin,
  Github,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Upload,
  BarChart3,
  Lightbulb,
  Loader2
} from "lucide-react"

interface Analysis {
  id: string
  analysis_type: string
  score: number
  created_at: string
}

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unknown error"
  }

  const maybeError = error as { message?: string; code?: string; details?: string }
  return maybeError.message || maybeError.details || maybeError.code || "Unknown error"
}

const quickActions = [
  {
    title: "Analyze Resume",
    description: "Upload your resume PDF for ATS scoring",
    icon: FileText,
    href: "/dashboard/resume",
    color: "bg-primary/10 text-primary",
    hoverBorder: "hover:border-primary/50"
  },
  {
    title: "Analyze LinkedIn",
    description: "Check your LinkedIn profile strength",
    icon: Linkedin,
    href: "/dashboard/linkedin",
    color: "bg-accent/10 text-accent",
    hoverBorder: "hover:border-accent/50"
  },
  {
    title: "Analyze GitHub",
    description: "Evaluate your GitHub profile quality",
    icon: Github,
    href: "/dashboard/github",
    color: "bg-chart-3/10 text-chart-3",
    hoverBorder: "hover:border-chart-3/50"
  }
]

const getIconByType = (type: string) => {
  switch (type?.toLowerCase()) {
    case "resume":
      return FileText
    case "linkedin":
      return Linkedin
    case "github":
      return Github
    default:
      return FileText
  }
}

const getColorByType = (type: string) => {
  switch (type?.toLowerCase()) {
    case "resume":
      return "text-primary"
    case "linkedin":
      return "text-accent"
    case "github":
      return "text-chart-3"
    default:
      return "text-primary"
  }
}

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    latestScore: 0,
    bestScore: 0,
    latestType: ""
  })

  useEffect(() => {
    async function fetchAnalyses() {
      try {
        const supabase = createClient()
        if (!supabase) {
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("analysis_results")
          .select("id, analysis_type, score, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) {
          console.warn("Unable to fetch analyses:", getErrorMessage(error))
          setAnalyses([])
          setStats({ total: 0, latestScore: 0, bestScore: 0, latestType: "" })
          setLoading(false)
          return
        }

        setAnalyses(data || [])

        if (data && data.length > 0) {
          const scores = data.map((a: Analysis) => a.score)
          setStats({
            total: data.length,
            latestScore: data[0].score,
            bestScore: Math.max(...scores),
            latestType: data[0].analysis_type
          })
        }
      } catch (error) {
        console.warn("Dashboard fetch failed:", getErrorMessage(error))
        setAnalyses([])
        setStats({ total: 0, latestScore: 0, bestScore: 0, latestType: "" })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your career analysis.
            </p>
          </div>
          <Link href="/dashboard/resume">
            <Button className="glow-primary">
              <Upload className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>
      </AnimatedSection>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedSection delay={0}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Analyses
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">All time</p>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Latest Score
              </CardTitle>
              <Target className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">{stats.latestScore || "-"}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stats.latestType || "No analyses yet"}</p>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Score
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">{stats.bestScore || "-"}</div>
                  <p className="text-xs text-muted-foreground mt-1">Personal best</p>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Improvement Tips
              </CardTitle>
              <Lightbulb className="h-5 w-5 text-chart-4" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-foreground">{analyses.length > 0 ? analyses.length * 3 : 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pending review</p>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <AnimatedSection delay={200}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Actions
            </h2>
          </AnimatedSection>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action, index) => (
              <AnimatedSection key={action.title} delay={300 + index * 100}>
                <Link href={action.href}>
                  <Card className={`h-full border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer transition-all hover:bg-card/80 hover:shadow-lg ${action.hoverBorder}`}>
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`mb-4 rounded-xl p-4 ${action.color}`}>
                        <action.icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Overall Score */}
        <AnimatedSection delay={400}>
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loading ? (
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ScoreRing score={stats.bestScore || 0} size={140} strokeWidth={10} />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {analyses.length > 0 ? "Your best score across all analyses" : "Complete an analysis to see your score"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Recent Analyses */}
      <AnimatedSection delay={500}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Analyses
            </CardTitle>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No analyses yet. Start by analyzing your resume, LinkedIn, or GitHub profile.</p>
                <Link href="/dashboard/resume">
                  <Button className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Start Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => {
                  const Icon = getIconByType(analysis.analysis_type)
                  const color = getColorByType(analysis.analysis_type)
                  return (
                    <Link
                      key={analysis.id}
                      href={`/dashboard/history/${analysis.id}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg bg-muted/50 ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground capitalize">{analysis.analysis_type} Analysis</p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(analysis.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">{analysis.score}</p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
