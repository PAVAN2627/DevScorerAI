"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { createClient } from "@/lib/supabase/client"
import {
  History,
  FileText,
  Linkedin,
  Github,
  ArrowRight,
  Calendar,
  Eye,
  Loader2,
  Upload
} from "lucide-react"

interface Analysis {
  id: string
  analysis_type: string
  score: number
  created_at: string
  results: Record<string, unknown>
}

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unknown error"
  }

  const maybeError = error as { message?: string; code?: string; details?: string }
  return maybeError.message || maybeError.details || maybeError.code || "Unknown error"
}

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
      return { text: "text-primary", bg: "bg-primary/10" }
    case "linkedin":
      return { text: "text-accent", bg: "bg-accent/10" }
    case "github":
      return { text: "text-chart-3", bg: "bg-chart-3/10" }
    default:
      return { text: "text-primary", bg: "bg-primary/10" }
  }
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

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
          .select("id, analysis_type, score, created_at, results")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.warn("Unable to fetch analyses:", getErrorMessage(error))
          setAnalyses([])
          setLoading(false)
          return
        }

        setAnalyses(data || [])
      } catch (error) {
        console.warn("History fetch failed:", getErrorMessage(error))
        setAnalyses([])
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [])

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedSection>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              Analysis History
            </h1>
            <p className="text-muted-foreground mt-1">
              View all your past analyses and track your progress.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* History Table/Cards */}
      <AnimatedSection delay={100}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              All Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No analyses yet. Start by analyzing your profile.</p>
                <Link href="/dashboard/resume">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Start Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Score</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.map((analysis) => {
                        const Icon = getIconByType(analysis.analysis_type)
                        const colors = getColorByType(analysis.analysis_type)
                        return (
                          <tr 
                            key={analysis.id} 
                            className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${colors.bg}`}>
                                  <Icon className={`h-5 w-5 ${colors.text}`} />
                                </div>
                                <span className="font-medium text-foreground capitalize">
                                  {analysis.analysis_type} Analysis
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-2xl font-bold ${
                                analysis.score >= 80 ? "text-chart-3" :
                                analysis.score >= 60 ? "text-chart-4" :
                                "text-destructive"
                              }`}>
                                {analysis.score}
                              </span>
                              <span className="text-muted-foreground">/100</span>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {formatDate(analysis.created_at)}
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">
                              {formatTimeAgo(analysis.created_at)}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Link href={`/dashboard/history/${analysis.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {analyses.map((analysis) => {
                    const Icon = getIconByType(analysis.analysis_type)
                    const colors = getColorByType(analysis.analysis_type)
                    return (
                      <Link
                        key={analysis.id}
                        href={`/dashboard/history/${analysis.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${colors.bg}`}>
                              <Icon className={`h-5 w-5 ${colors.text}`} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground capitalize">{analysis.analysis_type}</p>
                              <p className="text-xs text-muted-foreground">{formatTimeAgo(analysis.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`text-xl font-bold ${
                                analysis.score >= 80 ? "text-chart-3" :
                                analysis.score >= 60 ? "text-chart-4" :
                                "text-destructive"
                              }`}>
                                {analysis.score}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
