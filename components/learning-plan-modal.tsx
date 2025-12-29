"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  Calendar,
  Award,
  ExternalLink,
  ArrowRight,
} from "lucide-react"

interface MissingSkill {
  skill: string
  resource: string
  priority: "high" | "medium" | "low"
  isHighDemand: boolean
  alternatives: string[]
}

interface MatchedSkill {
  skill: string
  proficiency: string
  years?: number
  isHighDemand: boolean
}

interface LearningPlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  missingSkills: MissingSkill[]
  matchedSkills: MatchedSkill[]
}

export function LearningPlanModal({ open, onOpenChange, missingSkills, matchedSkills }: LearningPlanModalProps) {
  const highPriority = missingSkills.filter((s) => s.priority === "high")
  const mediumPriority = missingSkills.filter((s) => s.priority === "medium")
  const lowPriority = missingSkills.filter((s) => s.priority === "low")

  const totalWeeks = highPriority.length * 4 + mediumPriority.length * 2 + lowPriority.length * 1

  const phases = [
    {
      title: "Phase 1: Critical Skills (Weeks 1-" + highPriority.length * 4 + ")",
      description: "Focus on high-priority skills essential for the role",
      skills: highPriority,
      weeks: highPriority.length * 4,
      color: "red",
    },
    {
      title:
        "Phase 2: Core Skills (Weeks " +
        (highPriority.length * 4 + 1) +
        "-" +
        (highPriority.length * 4 + mediumPriority.length * 2) +
        ")",
      description: "Build foundational knowledge in medium-priority areas",
      skills: mediumPriority,
      weeks: mediumPriority.length * 2,
      color: "orange",
    },
    {
      title: "Phase 3: Nice-to-Have Skills",
      description: "Optional skills that can give you an edge",
      skills: lowPriority,
      weeks: lowPriority.length * 1,
      color: "blue",
    },
  ]

  const handleStartLearning = () => {
    if (highPriority.length > 0) {
      window.open(highPriority[0].resource, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-purple-600" />
            Complete Learning Plan
          </DialogTitle>
          <DialogDescription>A structured roadmap to acquire all the skills needed for this position</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Total Skills
              </div>
              <div className="mt-1 text-2xl font-bold">{missingSkills.length}</div>
            </div>
            <div className="rounded-lg border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Estimated Time
              </div>
              <div className="mt-1 text-2xl font-bold">{totalWeeks} weeks</div>
            </div>
            <div className="rounded-lg border bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                High Demand
              </div>
              <div className="mt-1 text-2xl font-bold">{missingSkills.filter((s) => s.isHighDemand).length}</div>
            </div>
          </div>

          {/* Learning Phases */}
          {phases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{phase.title}</h3>
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {phase.weeks} weeks
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{phase.description}</p>

              <div className="space-y-3">
                {phase.skills.map((skill, skillIndex) => (
                  <div
                    key={skillIndex}
                    className={`rounded-lg border ${
                      phase.color === "red"
                        ? "border-red-500/20 bg-red-500/5"
                        : phase.color === "orange"
                          ? "border-orange-500/20 bg-orange-500/5"
                          : "border-blue-500/20 bg-blue-500/5"
                    } p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-semibold">{skill.skill}</span>
                          {skill.isHighDemand && (
                            <Badge variant="secondary" className="gap-1 bg-green-500/10 text-xs text-green-700">
                              <TrendingUp className="h-3 w-3" />
                              High Demand
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              phase.color === "red"
                                ? "border-red-500/50 text-red-700"
                                : phase.color === "orange"
                                  ? "border-orange-500/50 text-orange-700"
                                  : "border-blue-500/50 text-blue-700"
                            }`}
                          >
                            {skill.priority} priority
                          </Badge>
                        </div>

                        {skill.alternatives.length > 0 && (
                          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            You already know: {skill.alternatives.join(", ")}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-1 bg-transparent" asChild>
                            <a href={skill.resource} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                              Start Learning
                            </a>
                          </Button>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {skill.priority === "high" ? "4 weeks" : skill.priority === "medium" ? "2 weeks" : "1 week"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Learning Tips */}
          <div className="rounded-lg border-2 border-dashed border-purple-500/30 bg-purple-500/5 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
              <Award className="h-5 w-5" />
              Pro Learning Tips
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                <span>Dedicate 10-15 hours per week for consistent progress</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                <span>Build projects to apply what you learn - practical experience matters most</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                <span>Focus on one skill at a time rather than learning everything simultaneously</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                <span>Join communities and find mentors to accelerate your learning journey</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="rounded-lg border bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4">
            <h3 className="mb-2 font-semibold">Ready to Start?</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Begin with the first high-priority skill and work through the phases systematically. Track your progress
              and update your resume as you gain new skills.
            </p>
            <Button className="w-full gap-2" onClick={handleStartLearning} disabled={highPriority.length === 0}>
              <Target className="h-4 w-4" />
              Start with {highPriority[0]?.skill || "First Skill"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
