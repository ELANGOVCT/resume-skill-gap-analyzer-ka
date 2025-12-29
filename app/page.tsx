"use client"

import { useState, useTransition } from "react"
import { analyzeSkillGap } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Logo } from "@/components/logo"
import { Chatbot } from "@/components/chatbot"
import { LearningPlanModal } from "@/components/learning-plan-modal"
import {
  FileText,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Download,
  Sparkles,
  Target,
  BookOpen,
  Lightbulb,
  Award,
  Clock,
  ArrowRight,
  Calendar,
} from "lucide-react"

interface AnalysisResult {
  matchedSkills: Array<{
    skill: string
    proficiency: "basic" | "intermediate" | "advanced"
    years?: number
    isHighDemand: boolean
  }>
  missingSkills: Array<{
    skill: string
    resource: string
    priority: "high" | "medium" | "low"
    isHighDemand: boolean
    alternatives: string[]
  }>
  extraSkills: Array<{
    skill: string
    isHighDemand: boolean
  }>
  matchScore: number
  suggestions: string[]
}

export default function Home() {
  const [resume, setResume] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  const [showLearningPlan, setShowLearningPlan] = useState(false)

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      alert("Please enter both resume and job description")
      return
    }

    startTransition(() => {
      setLoading(true)
      analyzeSkillGap(resume, jobDescription)
        .then((analysis) => setResult(analysis))
        .catch((error) => {
          console.error("Analysis failed:", error)
          alert("Analysis failed. Please try again.")
        })
        .finally(() => setLoading(false))
    })
  }

  const handleDownloadReport = () => {
    if (!result) return

    const report = `RESUME SKILL GAP ANALYSIS REPORT
=================================
Generated: ${new Date().toLocaleString()}

ATS MATCH SCORE: ${result.matchScore.toFixed(1)}%

MATCHED SKILLS (${result.matchedSkills.length}):
${result.matchedSkills
  .map(
    (item) =>
      `✓ ${item.skill.toUpperCase()} [${item.proficiency}]${item.years ? ` - ${item.years} years` : ""}${item.isHighDemand ? " ⭐ HIGH DEMAND" : ""}`,
  )
  .join("\n")}

MISSING SKILLS (${result.missingSkills.length}):
${result.missingSkills
  .map(
    (item) =>
      `✗ ${item.skill.toUpperCase()} [Priority: ${item.priority}]${item.isHighDemand ? " ⭐ HIGH DEMAND" : ""}
  Learn at: ${item.resource}${item.alternatives.length > 0 ? `\n  You have: ${item.alternatives.join(", ")}` : ""}`,
  )
  .join("\n\n")}

ADDITIONAL SKILLS FROM YOUR RESUME (${result.extraSkills.length}):
${result.extraSkills.map((item) => `• ${item.skill}${item.isHighDemand ? " ⭐ HIGH DEMAND" : ""}`).join("\n")}

RESUME IMPROVEMENT SUGGESTIONS:
${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

RECOMMENDATIONS:
${
  result.matchScore >= 75
    ? "Excellent match! You have most of the required skills. Focus on the high-priority missing skills to become a perfect candidate."
    : result.matchScore >= 50
      ? "Good foundation! You have several key skills. Prioritize learning the high-demand missing skills to improve your candidacy."
      : "Focus on skill development. Consider gaining experience in the high-priority and high-demand missing skills before applying."
}
`

    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `skill_gap_report_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <LearningPlanModal
        open={showLearningPlan}
        onOpenChange={setShowLearningPlan}
        missingSkills={result?.missingSkills || []}
        matchedSkills={result?.matchedSkills || []}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-sm font-semibold text-transparent">
              AI-Powered Career Development Tool
            </span>
          </div>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Resume Skill Gap
            </span>{" "}
            <span className="text-foreground">Analyzer</span>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Advanced <span className="font-semibold text-blue-600">ATS-style analysis</span> with{" "}
            <span className="font-semibold text-purple-600">proficiency detection</span>,{" "}
            <span className="font-semibold text-pink-600">semantic skill matching</span>, and personalized learning
            recommendations to advance your career.
          </p>
        </div>

        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Your Resume</CardTitle>
              </div>
              <CardDescription>Paste the content of your resume below</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your resume text here..."
                className="min-h-[300px] resize-none font-mono text-sm"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle>Job Description</CardTitle>
              </div>
              <CardDescription>Paste the job description you're targeting</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter job description here..."
                className="min-h-[300px] resize-none font-mono text-sm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mb-12 flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isPending || !resume.trim() || !jobDescription.trim()}
            className="gap-2 px-8"
          >
            {isPending ? "Analyzing..." : "Analyze Skill Gap"}
          </Button>
        </div>

        {result && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,400px]">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>ATS Match Score</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleDownloadReport} className="gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Match Percentage</span>
                      <span className="text-2xl font-bold">{result.matchScore.toFixed(1)}%</span>
                    </div>
                    <Progress value={result.matchScore} className="h-3" />
                    <p className="text-sm text-muted-foreground">
                      {result.matchScore >= 75
                        ? "Excellent match! You're well-qualified for this position."
                        : result.matchScore >= 50
                          ? "Good foundation. Focus on acquiring the missing skills."
                          : "Consider developing more skills before applying."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {result.suggestions && result.suggestions.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Resume Improvement Suggestions
                    </CardTitle>
                    <CardDescription>Actionable tips to optimize your resume for ATS and recruiters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex gap-3 text-sm">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {index + 1}
                          </span>
                          <span className="leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-600">
                      ✓
                    </span>
                    Matched Skills ({result.matchedSkills.length})
                  </CardTitle>
                  <CardDescription>
                    Skills you have that match the job requirements with proficiency levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                          {item.skill}
                          <span className="ml-1.5 text-xs opacity-75">
                            [{item.proficiency}
                            {item.years ? `, ${item.years}y` : ""}]
                          </span>
                        </Badge>
                        {item.isHighDemand && (
                          <TrendingUp className="h-3 w-3 text-green-600" title="High demand skill" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {result.missingSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Missing Skills ({result.missingSkills.length})
                    </CardTitle>
                    <CardDescription>
                      Skills from the job description that you should develop (sorted by priority)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.missingSkills.map((item, index) => (
                        <div key={index} className="flex flex-col gap-2 rounded-lg border p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`border-orange-500/50 text-orange-700 ${
                                  item.priority === "high" ? "bg-orange-500/10" : ""
                                }`}
                              >
                                {item.skill}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  item.priority === "high"
                                    ? "bg-red-500/10 text-red-700"
                                    : item.priority === "medium"
                                      ? "bg-yellow-500/10 text-yellow-700"
                                      : "bg-gray-500/10 text-gray-700"
                                }`}
                              >
                                {item.priority} priority
                              </Badge>
                              {item.isHighDemand && (
                                <Badge variant="secondary" className="gap-1 bg-purple-500/10 text-xs text-purple-700">
                                  <TrendingUp className="h-3 w-3" />
                                  High Demand
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Learn at:{" "}
                            <a
                              href={item.resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {item.resource}
                            </a>
                          </p>
                          {item.alternatives.length > 0 && (
                            <p className="text-sm text-green-700">
                              You have similar skills: <strong>{item.alternatives.join(", ")}</strong>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.extraSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-600">
                        +
                      </span>
                      Additional Skills ({result.extraSkills.length})
                    </CardTitle>
                    <CardDescription>Valuable skills from your resume that add to your profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.extraSkills.map((item, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <Badge variant="outline" className="border-blue-500/50 text-blue-700">
                            {item.skill}
                          </Badge>
                          {item.isHighDemand && (
                            <TrendingUp className="h-3 w-3 text-blue-600" title="High demand skill" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="sticky top-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Skill Improvement Guide
                  </CardTitle>
                  <CardDescription>Personalized learning roadmap based on your analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Target className="h-4 w-4 text-red-600" />
                      Priority Skills (Learn First)
                    </h3>
                    <div className="space-y-2">
                      {result.missingSkills
                        .filter((s: any) => s.priority === "high")
                        .slice(0, 3)
                        .map((skill: any, index: number) => (
                          <div key={index} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-medium text-red-700">{skill.skill}</span>
                              {skill.isHighDemand && <TrendingUp className="h-3 w-3 text-red-600" />}
                            </div>
                            <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>4 weeks • Critical for role</span>
                            </div>
                            {skill.alternatives.length > 0 && (
                              <div className="mb-2 text-xs text-green-700">
                                ✓ You know: {skill.alternatives.slice(0, 2).join(", ")}
                              </div>
                            )}
                            <Button size="sm" variant="outline" className="h-7 w-full text-xs bg-transparent" asChild>
                              <a href={skill.resource} target="_blank" rel="noopener noreferrer">
                                Start Learning →
                              </a>
                            </Button>
                          </div>
                        ))}
                      {result.missingSkills.filter((s: any) => s.priority === "high").length === 0 && (
                        <div className="flex items-center gap-2 rounded-lg bg-green-500/5 p-3 text-sm text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          No critical gaps found!
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Recommended Next Steps
                    </h3>
                    <div className="space-y-2">
                      {result.missingSkills
                        .filter((s: any) => s.priority === "medium")
                        .slice(0, 3)
                        .map((skill: any, index: number) => (
                          <div key={index} className="rounded-lg border p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{skill.skill}</span>
                              {skill.isHighDemand && <TrendingUp className="h-3 w-3 text-purple-600" />}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />2 weeks
                            </div>
                          </div>
                        ))}
                      {result.missingSkills.filter((s: any) => s.priority === "medium").length === 0 && (
                        <p className="text-sm text-muted-foreground">No medium priority skills to learn</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Your Strengths
                    </h3>
                    <div className="space-y-2">
                      {result.matchedSkills
                        .filter((s: any) => s.proficiency === "advanced" || s.isHighDemand)
                        .slice(0, 4)
                        .map((skill: any, index: number) => (
                          <div key={index} className="flex items-center justify-between rounded-lg bg-blue-500/5 p-2">
                            <span className="text-sm font-medium text-blue-700">{skill.skill}</span>
                            <Badge variant="secondary" className="bg-blue-500/10 text-xs text-blue-700">
                              {skill.proficiency}
                            </Badge>
                          </div>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Highlight these skills prominently in your resume and cover letter.
                    </p>
                  </div>

                  <div className="rounded-lg border-2 border-dashed border-purple-500/30 bg-purple-500/5 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-purple-700">Estimated Learning Time</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {result.missingSkills.filter((s: any) => s.priority === "high").length * 4 +
                        result.missingSkills.filter((s: any) => s.priority === "medium").length * 2 +
                        result.missingSkills.filter((s: any) => s.priority === "low").length * 1}{" "}
                      weeks
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      With dedicated learning (10-15 hrs/week) to acquire all missing skills
                    </p>
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">High Priority:</span>
                        <span className="font-medium">
                          {result.missingSkills.filter((s: any) => s.priority === "high").length * 4} weeks
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Medium Priority:</span>
                        <span className="font-medium">
                          {result.missingSkills.filter((s: any) => s.priority === "medium").length * 2} weeks
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low Priority:</span>
                        <span className="font-medium">
                          {result.missingSkills.filter((s: any) => s.priority === "low").length * 1} week
                          {result.missingSkills.filter((s: any) => s.priority === "low").length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    onClick={() => setShowLearningPlan(true)}
                  >
                    <BookOpen className="h-4 w-4" />
                    View Full Learning Plan
                  </Button>

                  <div className="rounded-lg border bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-3">
                    <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold">
                      <Award className="h-3 w-3 text-blue-600" />
                      Quick Tips
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-start gap-1">
                        <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        <span>Start with one high-priority skill</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        <span>Build projects while learning</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0" />
                        <span>Update resume as you progress</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Chatbot />
    </div>
  )
}
