"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { ScoreRing } from "@/components/score-ring"
import { createClient } from "@/lib/supabase/client"
import { downloadReportPdf } from "@/lib/report/download-pdf"
import {
  ArrowLeft,
  FileText,
  Linkedin,
  Github,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Share2,
  RefreshCcw,
  Loader2
} from "lucide-react"

interface AnalysisResult {
  overallScore?: number
  strengths?: string[]
  improvements?: string[]
  suggestions?: string[]
  jobMatches?: { title?: string; role?: string; match: number }[]
  missingKeywords?: string[]
  sections?:
    | { name: string; score: number; feedback: string }[]
    | Record<string, { score: number; feedback: string }>
  stats?: {
    repos?: number
    stars?: number
    followers?: number
    contributions?: number
    totalRepos?: number
    publicRepos?: number
    following?: number
    forks?: number
  }
  topRepos?: { name: string; stars: number; language: string; hasReadme?: boolean }[]
  languages?: { name: string; percentage: number }[]
}

interface Analysis {
  id: string
  analysis_type: string
  score: number
  created_at: string
  results: AnalysisResult
  input_data?: string
}

const typeConfig: Record<string, {
  icon: typeof FileText
  color: string
  bgColor: string
  borderColor: string
}> = {
  resume: {
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30"
  },
  github: {
    icon: Github,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/30"
  },
  linkedin: {
    icon: Linkedin,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30"
  }
}

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const supabase = createClient()
        if (!supabase) {
          setError("Service unavailable")
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError("Please sign in to view this analysis")
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from("analysis_results")
          .select("id, analysis_type, score, created_at, results, input_data")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()

        if (fetchError || !data) {
          setError("Analysis not found")
          setLoading(false)
          return
        }

        setAnalysis(data)
      } catch (err) {
        console.error("Error fetching analysis:", err)
        setError("Failed to load analysis")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(dateString)
  }

  const handleExport = () => {
    if (!analysis) return

    const resultLines: string[] = []
    if (analysis.results.strengths?.length) {
      resultLines.push(`Strengths: ${analysis.results.strengths.length}`)
    }
    if (analysis.results.improvements?.length) {
      resultLines.push(`Suggestions: ${analysis.results.improvements.length}`)
    }
    if (analysis.results.jobMatches?.length) {
      resultLines.push(`Job Matches: ${analysis.results.jobMatches.length}`)
    }
    if (analysis.results.topRepos?.length) {
      resultLines.push(`Top Repositories: ${analysis.results.topRepos.length}`)
    }

    downloadReportPdf({
      fileName: `${analysis.analysis_type}-report-${analysis.id.slice(0, 8)}.pdf`,
      title: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis Report`,
      meta: {
        "Analysis ID": analysis.id,
        "Score": `${analysis.score}/100`,
        "Created": formatDate(analysis.created_at),
      },
      sections: [
        {
          heading: "Summary",
          lines: [analysis.input_data || `${analysisType} analysis report`, ...resultLines],
        },
        {
          heading: "Strengths",
          lines: analysis.results.strengths || [],
        },
        {
          heading: "Suggestions",
          lines: analysis.results.improvements || analysis.results.suggestions || [],
        },
      ],
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading analysis...</p>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Analysis Not Found</h1>
        <p className="text-muted-foreground mb-6">{error || "The analysis you're looking for doesn't exist."}</p>
        <Link href="/dashboard/history">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>
    )
  }

  const analysisType = analysis.analysis_type?.toLowerCase() || "resume"
  const config = typeConfig[analysisType] || typeConfig.resume
  const Icon = config.icon
  const result = analysis.results || {}
  const sectionEntries = Array.isArray(result.sections)
    ? result.sections.map((section) => ({
        name: section.name,
        score: section.score,
        feedback: section.feedback,
      }))
    : Object.entries(result.sections || {}).map(([name, section]) => ({
        name,
        score: section.score,
        feedback: section.feedback,
      }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/history">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${config.bgColor}`}>
                <Icon className={`h-6 w-6 ${config.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Analysis
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(analysis.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTimeAgo(analysis.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Link href={`/dashboard/${analysisType}`}>
              <Button size="sm">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Re-analyze
              </Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Score Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <AnimatedSection delay={100}>
          <Card className={`border-2 ${config.borderColor} bg-card/50 backdrop-blur-sm`}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <ScoreRing score={analysis.score} size={140} strokeWidth={10} />
                <p className="text-lg font-semibold text-foreground mt-4">Overall Score</p>
                <p className="text-sm text-muted-foreground">
                  {analysis.score >= 80 ? "Excellent" : analysis.score >= 60 ? "Good" : "Needs Work"}
                </p>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={150} className="md:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Analysis Details</CardTitle>
              <CardDescription>
                {analysis.input_data || `${analysisType} profile analysis`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sectionEntries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {sectionEntries.slice(0, 3).map((section, index) => (
                    <div key={index} className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="text-2xl font-bold text-foreground">{section.score}</div>
                      <div className="text-xs text-muted-foreground">{section.name}</div>
                    </div>
                  ))}
                </div>
              ) : result.stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-foreground">{result.stats.repos ?? result.stats.totalRepos ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Repos</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-foreground">{result.stats.stars ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Stars</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-foreground">{result.stats.followers ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-foreground">{result.stats.following ?? result.stats.contributions ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No detailed stats available</p>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Score Breakdown */}
      {sectionEntries.length > 0 && (
        <AnimatedSection delay={200}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectionEntries.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{section.name}</span>
                      <span className="text-sm font-bold text-foreground">
                        {section.score}/100
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                          section.score >= 80 ? "bg-chart-3" : section.score >= 60 ? "bg-chart-4" : "bg-destructive"
                        }`}
                        style={{ width: `${section.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{section.feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        {result.strengths && result.strengths.length > 0 && (
          <AnimatedSection delay={250}>
            <Card className="border-chart-3/30 bg-card/50 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-chart-3">
                  <CheckCircle2 className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-chart-3 flex-shrink-0" />
                      <span className="text-sm text-foreground">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {result.improvements && result.improvements.length > 0 && (
          <AnimatedSection delay={300}>
            <Card className="border-chart-4/30 bg-card/50 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-chart-4">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-chart-4 flex-shrink-0" />
                      <span className="text-sm text-foreground">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}
      </div>

      {/* Suggestions/Recommendations */}
      {result.suggestions && result.suggestions.length > 0 && (
        <AnimatedSection delay={350}>
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Actionable steps to improve your {analysisType} score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm text-foreground">{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}

      {/* Job Matches (for Resume) */}
      {result.jobMatches && result.jobMatches.length > 0 && (
        <AnimatedSection delay={400}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Job Match Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.jobMatches.map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="font-medium text-foreground">{job.title || job.role}</span>
                    <span className={`font-bold ${
                      job.match >= 80 ? "text-chart-3" : job.match >= 60 ? "text-chart-4" : "text-destructive"
                    }`}>
                      {job.match}% match
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}

      {/* Top Repos (for GitHub) */}
      {result.topRepos && result.topRepos.length > 0 && (
        <AnimatedSection delay={400}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Top Repositories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.topRepos.map((repo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <span className="font-medium text-foreground">{repo.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{repo.language}</span>
                    </div>
                    <span className="text-chart-4">★ {repo.stars}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      )}
    </div>
  )
}
