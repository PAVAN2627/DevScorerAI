"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AnimatedSection } from "@/components/animated-section"
import { ScoreRing } from "@/components/score-ring"
import { createClient } from "@/lib/supabase/client"
import { extractPdfText, getExtractionQuality } from "@/lib/pdf/extract-text"
import { downloadReportPdf } from "@/lib/report/download-pdf"
import {
  Linkedin,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  User,
  Briefcase,
  GraduationCap,
  Download,
  X,
  Loader2
} from "lucide-react"

interface SectionAnalysis {
  score: number
  feedback: string
}

interface AnalysisResults {
  profileScore: number
  vibeFeedback: string
  sections: {
    headline: SectionAnalysis
    summary: SectionAnalysis
    experience: SectionAnalysis
    skills: SectionAnalysis
    education: SectionAnalysis
    recommendations: SectionAnalysis
  }
  strengths: string[]
  improvements: string[]
}

export default function LinkedInAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveWarning, setSaveWarning] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile)
      setResults(null)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const content = await extractPdfText(file)
      const quality = getExtractionQuality(content)
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'linkedin', 
          content: quality.isHighConfidence
            ? content
            : `LinkedIn profile from ${file.name}. Low-confidence PDF extraction. Upload a text-based export for best results.`
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Analysis failed')
      }

      const data = await response.json()
      setResults(data)
      setSaveWarning(null)

      const supabase = createClient()
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error: insertError } = await supabase.from("analysis_results").insert({
            user_id: user.id,
            analysis_type: "linkedin",
            score: data.profileScore,
            file_name: file.name,
            input_data: content.slice(0, 3000),
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze LinkedIn profile. Please try again.'
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setResults(null)
    setError(null)
    setSaveWarning(null)
  }

  const handleDownloadReport = () => {
    if (!results) return

    const sectionLines = Object.entries(results.sections).map(
      ([name, section]) => `${name}: ${section.score}% - ${section.feedback}`
    )

    downloadReportPdf({
      fileName: `linkedin-analysis-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: "LinkedIn Analysis Report",
      meta: {
        "Profile Score": `${results.profileScore}/100`,
        "LinkedIn PDF": file?.name ?? "N/A",
      },
      sections: [
        { heading: "Vibe Feedback", lines: [results.vibeFeedback] },
        { heading: "Section Breakdown", lines: sectionLines },
        { heading: "Strengths", lines: results.strengths },
        { heading: "Suggestions", lines: results.improvements },
      ],
    })
  }

  const sectionIcons: Record<string, typeof User> = {
    headline: User,
    summary: Lightbulb,
    experience: Briefcase,
    skills: Sparkles,
    education: GraduationCap,
    recommendations: CheckCircle2
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedSection>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Linkedin className="h-8 w-8 text-accent" />
            LinkedIn Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your LinkedIn PDF to get AI-powered profile analysis and improvement tips.
          </p>
        </div>
      </AnimatedSection>

      {/* Upload Section */}
      <AnimatedSection delay={100}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-accent" />
              Upload LinkedIn PDF
            </CardTitle>
            <CardDescription>
              Export your LinkedIn profile as PDF and upload for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 rounded-full bg-accent/10 mb-4">
                    <Linkedin className="h-8 w-8 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Click to upload</span> your LinkedIn PDF
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF files only (max 10MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Linkedin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

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
            
            {file && !results && (
              <Button
                className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze LinkedIn
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Results Section */}
      {results && (
        <>
          {/* Score Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <AnimatedSection delay={200}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Strength</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ScoreRing score={results.profileScore} size={140} strokeWidth={10} />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {results.profileScore >= 85 ? "All-Star Profile" : 
                     results.profileScore >= 70 ? "Expert Level" : 
                     results.profileScore >= 50 ? "Intermediate" : "Beginner"}
                  </p>
                  <p className="text-sm mt-2 text-center font-medium text-accent/90">
                    {results.vibeFeedback}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={300} className="md:col-span-2">
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Section Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.entries(results.sections) as [string, SectionAnalysis][]).map(([key, section]) => {
                    const Icon = sectionIcons[key] || User
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground font-medium flex items-center gap-2 capitalize">
                            <Icon className="h-4 w-4 text-accent" />
                            {key}
                          </span>
                          <span className="text-accent font-bold">{section.score}%</span>
                        </div>
                        <Progress value={section.score} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{section.feedback}</p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Detailed Analysis */}
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedSection delay={400}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-chart-3">
                    <CheckCircle2 className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={500}>
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
                    {results.improvements.map((improvement: string, index: number) => (
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

          {/* Analyze Another */}
          <AnimatedSection delay={600}>
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleRemoveFile}>
                Analyze Another Profile
              </Button>
            </div>
          </AnimatedSection>
        </>
      )}
    </div>
  )
}
