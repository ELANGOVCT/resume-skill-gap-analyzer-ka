"use server"

const SKILLS = [
  // Programming Languages
  "python",
  "javascript",
  "typescript",
  "java",
  "c++",
  "c#",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "php",
  "scala",
  "r",
  "matlab",
  "perl",
  "shell",
  "bash",

  // Web Technologies
  "html",
  "css",
  "react",
  "angular",
  "vue",
  "nextjs",
  "next.js",
  "nodejs",
  "node.js",
  "express",
  "django",
  "flask",
  "spring",
  "asp.net",
  "jquery",
  "bootstrap",
  "tailwind",
  "sass",
  "webpack",
  "vite",
  "graphql",
  "rest api",
  "api",

  // Databases
  "sql",
  "mysql",
  "postgresql",
  "postgres",
  "mongodb",
  "redis",
  "elasticsearch",
  "dynamodb",
  "oracle",
  "sqlite",
  "cassandra",
  "neo4j",
  "database",

  // Cloud & DevOps
  "aws",
  "azure",
  "gcp",
  "google cloud",
  "docker",
  "kubernetes",
  "k8s",
  "jenkins",
  "terraform",
  "ansible",
  "ci/cd",
  "devops",
  "git",
  "github",
  "gitlab",
  "bitbucket",
  "linux",
  "unix",

  // Data Science & ML
  "machine learning",
  "deep learning",
  "tensorflow",
  "pytorch",
  "scikit-learn",
  "sklearn",
  "pandas",
  "numpy",
  "data analysis",
  "data visualization",
  "statistics",
  "nlp",
  "computer vision",
  "ai",
  "artificial intelligence",
  "tableau",
  "power bi",
  "powerbi",
  "excel",

  // Soft Skills
  "communication",
  "leadership",
  "teamwork",
  "problem solving",
  "agile",
  "scrum",
  "kanban",
  "project management",
  "analytical",
  "creative",
  "adaptability",
  "collaboration",
  "time management",
]

const SKILL_SYNONYMS: Record<string, string[]> = {
  "data visualization": ["tableau", "power bi", "powerbi", "charts", "graphs", "dashboards"],
  "machine learning": ["ml", "ai", "artificial intelligence", "predictive modeling"],
  nodejs: ["node.js", "node", "express"],
  nextjs: ["next.js", "next"],
  kubernetes: ["k8s", "container orchestration"],
  postgresql: ["postgres", "psql"],
  "scikit-learn": ["sklearn", "scikit learn"],
  "google cloud": ["gcp", "google cloud platform"],
}

const SKILL_WEIGHTS: Record<string, number> = {
  // High priority technical skills
  python: 1.5,
  javascript: 1.5,
  react: 1.4,
  aws: 1.4,
  docker: 1.3,
  kubernetes: 1.3,
  "machine learning": 1.5,
  sql: 1.4,
  // Medium priority
  git: 1.2,
  agile: 1.2,
  // Default weight is 1.0
}

const LEARNING_RESOURCES: Record<string, { url: string; priority: "high" | "medium" | "low" }> = {
  python: { url: "https://www.python.org/about/gettingstarted/", priority: "high" },
  javascript: { url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript", priority: "high" },
  react: { url: "https://react.dev/learn", priority: "high" },
  docker: { url: "https://docs.docker.com/get-started/", priority: "high" },
  kubernetes: { url: "https://kubernetes.io/docs/tutorials/", priority: "high" },
  aws: { url: "https://aws.amazon.com/training/", priority: "high" },
  "machine learning": { url: "https://www.coursera.org/learn/machine-learning", priority: "high" },
  sql: { url: "https://www.w3schools.com/sql/", priority: "medium" },
  git: { url: "https://git-scm.com/doc", priority: "medium" },
  agile: { url: "https://www.atlassian.com/agile", priority: "medium" },
}

const HIGH_DEMAND_SKILLS = new Set([
  "python",
  "javascript",
  "typescript",
  "react",
  "aws",
  "docker",
  "kubernetes",
  "machine learning",
  "ai",
  "data analysis",
  "sql",
  "nodejs",
])

interface ProficiencyLevel {
  level: "basic" | "intermediate" | "advanced"
  yearsOfExperience?: number
}

interface SkillWithProficiency {
  skill: string
  proficiency: ProficiencyLevel
  weight: number
  isHighDemand: boolean
}

interface MissingSkillWithDetails {
  skill: string
  resource: string
  priority: "high" | "medium" | "low"
  isHighDemand: boolean
  alternatives: string[]
}

function detectProficiency(text: string, skill: string): ProficiencyLevel {
  const textLower = text.toLowerCase()
  const skillPattern = new RegExp(`${skill}[^.]{0,100}`, "gi")
  const matches = textLower.match(skillPattern) || []
  const context = matches.join(" ")

  // Check for years of experience
  const yearsMatch = context.match(/(\d+)\s*(?:\+)?\s*(?:years?|yrs?)/i)
  const years = yearsMatch ? Number.parseInt(yearsMatch[1]) : undefined

  // Determine level based on keywords
  if (
    context.includes("expert") ||
    context.includes("advanced") ||
    context.includes("senior") ||
    (years && years >= 5)
  ) {
    return { level: "advanced", yearsOfExperience: years }
  } else if (
    context.includes("intermediate") ||
    context.includes("proficient") ||
    context.includes("experienced") ||
    (years && years >= 2)
  ) {
    return { level: "intermediate", yearsOfExperience: years }
  } else if (
    context.includes("basic") ||
    context.includes("beginner") ||
    context.includes("familiar") ||
    context.includes("learning")
  ) {
    return { level: "basic", yearsOfExperience: years }
  }

  // Default to intermediate if mentioned without clear indicators
  return { level: "intermediate", yearsOfExperience: years }
}

function preprocessText(text: string): string[] {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "been",
    "be",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "must",
    "can",
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
}

function extractSkillsWithProficiency(text: string): Map<string, SkillWithProficiency> {
  const words = preprocessText(text)
  const textLower = text.toLowerCase()
  const foundSkills = new Map<string, SkillWithProficiency>()

  for (const skill of SKILLS) {
    let isFound = false

    // Check for multi-word skills
    if (skill.includes(" ")) {
      if (textLower.includes(skill)) {
        isFound = true
      }
    } else {
      // Check for single-word skills
      if (words.includes(skill) || textLower.includes(skill)) {
        isFound = true
      }
    }

    if (isFound) {
      const proficiency = detectProficiency(text, skill)
      const weight = SKILL_WEIGHTS[skill] || 1.0
      const isHighDemand = HIGH_DEMAND_SKILLS.has(skill)

      foundSkills.set(skill, {
        skill,
        proficiency,
        weight,
        isHighDemand,
      })
    }
  }

  return foundSkills
}

function findSemanticMatches(skill: string, candidateSkills: Map<string, SkillWithProficiency>): string[] {
  const alternatives: string[] = []

  // Check if the skill has known synonyms
  for (const [primary, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    if (synonyms.includes(skill) || primary === skill) {
      // Check if candidate has any synonym
      const relatedSkills = [primary, ...synonyms]
      for (const related of relatedSkills) {
        if (candidateSkills.has(related) && related !== skill) {
          alternatives.push(related)
        }
      }
    }
  }

  return alternatives
}

function generateResumeSuggestions(
  missingSkills: string[],
  matchedSkills: Map<string, SkillWithProficiency>,
  jobDescription: string,
): string[] {
  const suggestions: string[] = []

  // Suggest highlighting matched skills
  if (matchedSkills.size > 0) {
    suggestions.push(
      `Highlight your experience with ${Array.from(matchedSkills.keys()).slice(0, 3).join(", ")} prominently in your resume summary.`,
    )
  }

  // Suggest adding keywords from job description
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3)
    suggestions.push(
      `Consider learning ${topMissing.join(", ")} to match job requirements. Even basic knowledge can help pass ATS screening.`,
    )
  }

  // Suggest quantifying achievements
  suggestions.push(
    "Use numbers and metrics to quantify your achievements (e.g., 'Improved performance by 40%' instead of 'Improved performance').",
  )

  // Suggest matching job description language
  suggestions.push("Mirror the language used in the job description to improve ATS matching and recruiter appeal.")

  // Check for years of experience
  const yearsMatch = jobDescription.toLowerCase().match(/(\d+)\s*(?:\+)?\s*(?:years?|yrs?)/i)
  if (yearsMatch) {
    suggestions.push(
      `Ensure you clearly state your total years of experience. The job requires ${yearsMatch[1]}+ years.`,
    )
  }

  return suggestions
}

function calculateWeightedMatchScore(
  matched: Map<string, SkillWithProficiency>,
  total: Map<string, SkillWithProficiency>,
): number {
  if (total.size === 0) return 0

  let totalWeight = 0
  let matchedWeight = 0

  for (const [skill, details] of total.entries()) {
    const weight = details.weight
    totalWeight += weight

    if (matched.has(skill)) {
      matchedWeight += weight
    }
  }

  return (matchedWeight / totalWeight) * 100
}

export async function analyzeSkillGap(resume: string, jobDescription: string) {
  const resumeSkills = extractSkillsWithProficiency(resume)
  const jobSkills = extractSkillsWithProficiency(jobDescription)

  // Find matched skills
  const matchedSkills = new Map<string, SkillWithProficiency>()
  for (const [skill, details] of resumeSkills.entries()) {
    if (jobSkills.has(skill)) {
      matchedSkills.set(skill, details)
    }
  }

  // Find missing skills with semantic alternatives
  const missingSkillsDetails: MissingSkillWithDetails[] = []
  for (const [skill, details] of jobSkills.entries()) {
    if (!resumeSkills.has(skill)) {
      const alternatives = findSemanticMatches(skill, resumeSkills)
      const resourceInfo = LEARNING_RESOURCES[skill] || {
        url: "https://www.google.com/search?q=learn+" + encodeURIComponent(skill),
        priority: "low" as const,
      }

      missingSkillsDetails.push({
        skill,
        resource: resourceInfo.url,
        priority: resourceInfo.priority,
        isHighDemand: HIGH_DEMAND_SKILLS.has(skill),
        alternatives,
      })
    }
  }

  // Sort missing skills by priority and high demand
  missingSkillsDetails.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const aPriority = priorityOrder[a.priority]
    const bPriority = priorityOrder[b.priority]

    if (a.isHighDemand !== b.isHighDemand) {
      return a.isHighDemand ? -1 : 1
    }
    return aPriority - bPriority
  })

  // Find extra skills
  const extraSkills: SkillWithProficiency[] = []
  for (const [skill, details] of resumeSkills.entries()) {
    if (!jobSkills.has(skill)) {
      extraSkills.push(details)
    }
  }

  // Calculate weighted match score
  const matchScore = calculateWeightedMatchScore(matchedSkills, jobSkills)

  const suggestions = generateResumeSuggestions(
    missingSkillsDetails.map((s) => s.skill),
    matchedSkills,
    jobDescription,
  )

  // Convert matched skills to array with proficiency info
  const matchedSkillsArray = Array.from(matchedSkills.values()).map((details) => ({
    skill: details.skill,
    proficiency: details.proficiency.level,
    years: details.proficiency.yearsOfExperience,
    isHighDemand: details.isHighDemand,
  }))

  // Convert extra skills to simple array with high demand flag
  const extraSkillsArray = extraSkills.map((details) => ({
    skill: details.skill,
    isHighDemand: details.isHighDemand,
  }))

  return {
    matchedSkills: matchedSkillsArray,
    missingSkills: missingSkillsDetails,
    extraSkills: extraSkillsArray,
    matchScore,
    suggestions,
  }
}
