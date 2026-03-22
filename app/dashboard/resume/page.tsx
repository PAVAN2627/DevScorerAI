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
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Download,
  X,
  Loader2
} from "lucide-react"

interface AnalysisResults {
  atsScore: number
  vibeFeedback: string
  jobMatches: { role: string; match: number }[]
  strengths: string[]
  improvements: string[]
  missingKeywords: string[]
}

export default function ResumeAnalyzerPage() {
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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const text = await extractPdfText(file)
      const quality = getExtractionQuality(text)

      if (quality.isHighConfidence) {
        return text
      }

      return `Resume: ${file.name}\n\nLow-confidence PDF text extraction. Ask user to upload a text-based PDF export for best analysis quality.`
    } catch (error) {
      console.error("PDF extraction error:", error)
      return `Resume file: ${file.name}\nContent: File uploaded for analysis.`
    }
  }

  const handleAnalyze = async () => {
    if (!file) return
    
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const content = await extractTextFromPDF(file)
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'resume', 
          content: content
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
            analysis_type: "resume",
            score: data.atsScore,
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze resume. Please try again.'
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

    downloadReportPdf({
      fileName: `resume-analysis-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: "Resume Analysis Report",
      meta: {
        "ATS Score": `${results.atsScore}/100`,
        "Resume File": file?.name ?? "N/A",
      },
      sections: [
        { heading: "Vibe Feedback", lines: [results.vibeFeedback] },
        { heading: "Job Match Analysis", lines: results.jobMatches.map((job) => `${job.role}: ${job.match}%`) },
        { heading: "Strengths", lines: results.strengths },
        { heading: "Suggestions", lines: results.improvements },
        { heading: "Missing Keywords", lines: results.missingKeywords },
      ],
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedSection>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Resume Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume PDF to get AI-powered ATS score, job matches, and improvement suggestions.
          </p>
        </div>
      </AnimatedSection>

      {/* Upload Section */}
      <AnimatedSection delay={100}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Upload your resume in PDF format for AI analysis powered by Grok
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
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
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
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
                className="w-full mt-4 glow-primary"
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
                    Analyze Resume
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
                  <CardTitle className="text-lg">ATS Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ScoreRing score={results.atsScore} size={140} strokeWidth={10} />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {results.atsScore >= 80 ? "Excellent ATS compatibility" : 
                     results.atsScore >= 60 ? "Good with room for improvement" : 
                     "Needs optimization for ATS"}
                  </p>
                  <p className="text-sm mt-2 text-center font-medium text-primary/90">
                    {results.vibeFeedback}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={300} className="md:col-span-2">
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Job Match Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.jobMatches.map((job, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground font-medium">{job.role}</span>
                        <span className="text-primary font-bold">{job.match}%</span>
                      </div>
                      <Progress value={job.match} className="h-2" />
                    </div>
                  ))}
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

            <AnimatedSection delay={500}>
              <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-chart-4">
                    <Lightbulb className="h-5 w-5" />
                    Suggestions
                  </CardTitle>
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

          {/* Missing Keywords */}
          <AnimatedSection delay={600}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Missing Keywords
                  </CardTitle>
                  <CardDescription>
                    Add these keywords to improve your ATS score
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.missingKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Analyze Another */}
          <AnimatedSection delay={700}>
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleRemoveFile}>
                Analyze Another Resume
              </Button>
            </div>
          </AnimatedSection>
        </>
      )}
    </div>
  )
}
