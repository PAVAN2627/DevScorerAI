"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { AnimatedSection } from "@/components/animated-section"
import { ScoreRing } from "@/components/score-ring"
import { createClient } from "@/lib/supabase/client"
import { downloadReportPdf } from "@/lib/report/download-pdf"
import {
  Github,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  GitBranch,
  Star,
  FileCode,
  Download,
  Search,
  ExternalLink,
  BookOpen,
  Loader2
} from "lucide-react"

interface RepoInfo {
  name: string
  stars: number
  language: string
  hasReadme: boolean
}

interface AnalysisResults {
  overallScore: number
  vibeFeedback: string
  stats: {
    totalRepos: number
    publicRepos: number
    stars: number
    forks: number
    followers: number
    following: number
  }
  repoAnalysis: {
    withReadme: number
    withoutReadme: number
    averageStars: number
    topLanguages: string[]
  }
  strengths: string[]
  improvements: string[]
  topRepos: RepoInfo[]
}

export default function GitHubAnalyzerPage() {
  const [username, setUsername] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveWarning, setSaveWarning] = useState<string | null>(null)
  const [analyzedUsername, setAnalyzedUsername] = useState("")

  const handleAnalyze = async () => {
    if (!username.trim()) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'github', 
          username: username.trim()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Analysis failed')
      }

      const data = await response.json()
      setResults(data)
      setAnalyzedUsername(username.trim())
      setSaveWarning(null)

      const supabase = createClient()
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error: insertError } = await supabase.from("analysis_results").insert({
            user_id: user.id,
            analysis_type: "github",
            score: data.overallScore,
            input_data: username.trim(),
            results: data,
          })

          if (insertError) {
            setSaveWarning("Analysis is ready, but history could not be saved. Please run database setup SQL.")
          }
        } else {
          setSaveWarning("Analysis is ready, but history is saved only after login.")
        }
      } else {
        setSaveWarning("Analysis is ready, but Supabase is not configured for history saving.")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze GitHub profile. Please try again.'
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setUsername("")
    setResults(null)
    setError(null)
    setSaveWarning(null)
    setAnalyzedUsername("")
  }

  const handleDownloadReport = () => {
    if (!results) return

    downloadReportPdf({
      fileName: `github-analysis-${analyzedUsername || "profile"}-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: "GitHub Analysis Report",
      meta: {
        "GitHub Username": analyzedUsername || "N/A",
        "Overall Score": `${results.overallScore}/100`,
        "Total Repos": results.stats.totalRepos,
        "Total Stars": results.stats.stars,
      },
      sections: [
        { heading: "Vibe Feedback", lines: [results.vibeFeedback] },
        {
          heading: "Repository Analysis",
          lines: [
            `With README: ${results.repoAnalysis.withReadme}`,
            `Without README: ${results.repoAnalysis.withoutReadme}`,
            `Average Stars: ${results.repoAnalysis.averageStars}`,
            `Top Languages: ${results.repoAnalysis.topLanguages.join(", ")}`,
          ],
        },
        {
          heading: "Top Repositories",
          lines: results.topRepos.map(
            (repo) => `${repo.name} - ${repo.language} - ${repo.stars} stars - README: ${repo.hasReadme ? "Yes" : "No"}`
          ),
        },
        { heading: "Strengths", lines: results.strengths },
        { heading: "Suggestions", lines: results.improvements },
      ],
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedSection>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Github className="h-8 w-8 text-chart-3" />
            GitHub Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Enter your GitHub username to get AI-powered profile and repository analysis.
          </p>
        </div>
      </AnimatedSection>

      {/* Input Section */}
      <AnimatedSection delay={100}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-chart-3" />
              Enter GitHub Username
            </CardTitle>
            <CardDescription>
              We will analyze your public profile and repositories using AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  disabled={isAnalyzing}
                />
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={!username.trim() || isAnalyzing}
                className="bg-chart-3 hover:bg-chart-3/90 text-background"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Profile
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {saveWarning && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {saveWarning}
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Results Section */}
      {results && (
        <>
          {/* Score Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <AnimatedSection delay={200}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 flex flex-col items-center">
                  <ScoreRing score={results.overallScore} size={120} strokeWidth={8} />
                  <p className="text-sm font-medium text-foreground mt-3">Overall Score</p>
                  <p className="text-xs text-center mt-2 text-chart-3/90 font-medium">
                    {results.vibeFeedback}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={250}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                  <GitBranch className="h-8 w-8 text-chart-3 mb-2" />
                  <p className="text-3xl font-bold text-foreground">{results.stats.totalRepos}</p>
                  <p className="text-sm text-muted-foreground">Total Repos</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                  <Star className="h-8 w-8 text-chart-4 mb-2" />
                  <p className="text-3xl font-bold text-foreground">{results.stats.stars}</p>
                  <p className="text-sm text-muted-foreground">Total Stars</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={350}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
                  <BookOpen className="h-8 w-8 text-accent mb-2" />
                  <p className="text-3xl font-bold text-foreground">{results.repoAnalysis.withReadme}</p>
                  <p className="text-sm text-muted-foreground">With README</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Top Repositories & Languages */}
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedSection delay={400}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-chart-4" />
                    Top Repositories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.topRepos.map((repo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <FileCode className="h-5 w-5 text-chart-3" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{repo.name}</p>
                          <p className="text-xs text-muted-foreground">{repo.language}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-chart-4" />
                          <span className="text-foreground">{repo.stars}</span>
                        </div>
                        {repo.hasReadme ? (
                          <CheckCircle2 className="h-4 w-4 text-chart-3" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={450}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-primary" />
                    Top Languages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.repoAnalysis.topLanguages.map((lang, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">{lang}</span>
                        <span className="text-chart-3 font-bold">{Math.max(100 - index * 18, 25)}%</span>
                      </div>
                      <Progress value={Math.max(100 - index * 18, 25)} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedSection delay={500}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-chart-3">
                    <CheckCircle2 className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={550}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-chart-4">
                    <Lightbulb className="h-5 w-5" />
                    Suggestions
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-chart-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Profile Link & Actions */}
          <AnimatedSection delay={600}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-chart-3/10">
                    <Github className="h-8 w-8 text-chart-3" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">View Full Profile</p>
                    <p className="text-sm text-muted-foreground">github.com/{analyzedUsername}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset}>
                    Analyze Another
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`https://github.com/${analyzedUsername}`} target="_blank" rel="noopener noreferrer">
                      Open GitHub
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </>
      )}
    </div>
  )
}
