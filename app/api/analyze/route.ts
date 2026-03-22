import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import type { NextRequest } from 'next/server'

const MAX_TEXT_LENGTH = 14000

// Define schemas for each analysis type
const resumeAnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  vibeFeedback: z.string().min(20).max(220),
  jobMatches: z.array(z.object({
    role: z.string(),
    match: z.number().min(0).max(100)
  })).length(4),
  strengths: z.array(z.string().min(25)).length(4),
  improvements: z.array(z.string().min(25)).length(4),
  missingKeywords: z.array(z.string()).min(3).max(6)
})

const linkedinAnalysisSchema = z.object({
  profileScore: z.number().min(0).max(100),
  vibeFeedback: z.string().min(20).max(220),
  sections: z.object({
    headline: z.object({ score: z.number(), feedback: z.string().min(25) }),
    summary: z.object({ score: z.number(), feedback: z.string().min(25) }),
    experience: z.object({ score: z.number(), feedback: z.string().min(25) }),
    skills: z.object({ score: z.number(), feedback: z.string().min(25) }),
    education: z.object({ score: z.number(), feedback: z.string().min(25) }),
    recommendations: z.object({ score: z.number(), feedback: z.string().min(25) })
  }),
  strengths: z.array(z.string().min(25)).length(4),
  improvements: z.array(z.string().min(25)).length(4)
})

const githubAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  vibeFeedback: z.string().min(20).max(220),
  strengths: z.array(z.string().min(25)).length(4),
  improvements: z.array(z.string().min(25)).length(4)
})

const githubResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  vibeFeedback: z.string().min(20).max(220),
  stats: z.object({
    totalRepos: z.number(),
    publicRepos: z.number(),
    stars: z.number(),
    forks: z.number(),
    followers: z.number(),
    following: z.number()
  }),
  repoAnalysis: z.object({
    withReadme: z.number(),
    withoutReadme: z.number(),
    averageStars: z.number(),
    topLanguages: z.array(z.string()).min(2).max(5)
  }),
  strengths: z.array(z.string()).length(4),
  improvements: z.array(z.string()).length(4),
  topRepos: z.array(z.object({
    name: z.string(),
    stars: z.number(),
    language: z.string(),
    hasReadme: z.boolean()
  })).length(4)
})

type GitHubRepo = {
  name: string
  stargazers_count: number
  forks_count: number
  language: string | null
  archived: boolean
  fork: boolean
}

type GitHubUser = {
  public_repos: number
  followers: number
  following: number
}

class AppError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'AppError'
  }
}

async function generateWithFallback<T extends z.ZodTypeAny>(input: {
  schema: T
  system: string
  prompt: string
}) {
  return await generateObject({
    model: google('gemini-2.5-flash'),
    schema: input.schema,
    system: input.system,
    prompt: input.prompt,
    maxRetries: 0,
  })
}

function mapAnalysisError(error: unknown): { status: number; message: string } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      message: error.message,
    }
  }

  const maybeError = error as {
    statusCode?: number
    message?: string
    responseBody?: string
  }

  if (maybeError?.statusCode === 429) {
    return {
      status: 429,
      message:
        'AI quota exceeded. Please enable Gemini billing/quota and retry. Details: RESOURCE_EXHAUSTED.',
    }
  }

  if (maybeError?.statusCode === 401 || maybeError?.statusCode === 403) {
    return {
      status: 401,
      message: 'AI API key is invalid or lacks permissions. Please verify your Gemini key settings.',
    }
  }

  if (maybeError?.statusCode && maybeError.statusCode >= 400 && maybeError.statusCode < 600) {
    return {
      status: maybeError.statusCode,
      message: maybeError.message || 'AI provider request failed.',
    }
  }

  return {
    status: 500,
    message: 'Failed to analyze. Please try again.',
  }
}

function truncateContent(content: string): string {
  if (content.length <= MAX_TEXT_LENGTH) {
    return content
  }
  return `${content.slice(0, MAX_TEXT_LENGTH)}\n\n[TRUNCATED FOR ANALYSIS]`
}

function scoreFromStats(input: {
  withReadme: number
  totalRepos: number
  averageStars: number
  topLanguageCount: number
  followers: number
}): number {
  const readmeRatio = input.totalRepos > 0 ? input.withReadme / input.totalRepos : 0
  const readmeScore = Math.min(45, Math.round(readmeRatio * 45))
  const starScore = Math.min(20, Math.round(input.averageStars * 4))
  const diversityScore = Math.min(20, input.topLanguageCount * 4)
  const socialScore = Math.min(15, Math.round(Math.log2(input.followers + 1) * 3))
  const total = 35 + readmeScore + starScore + diversityScore + socialScore
  return Math.max(0, Math.min(100, total))
}

async function fetchGitHubFacts(username: string) {
  const token = process.env.GITHUB_TOKEN
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'devscorer-ai',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers, cache: 'no-store' }),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers, cache: 'no-store' }),
  ])

  if (userRes.status === 404) {
    throw new AppError('GitHub username not found. Please check the username and try again.', 404)
  }

  if (userRes.status === 403 || reposRes.status === 403) {
    throw new AppError(
      'GitHub API rate limit reached. Please try again later or configure GITHUB_TOKEN in .env.local for higher limits.',
      429
    )
  }

  if (!userRes.ok || !reposRes.ok) {
    throw new AppError('Unable to fetch GitHub profile data right now. Please try again.', 502)
  }

  const user = (await userRes.json()) as GitHubUser
  const repos = (await reposRes.json()) as GitHubRepo[]

  if (!Array.isArray(repos)) {
    throw new Error('Invalid GitHub repository response')
  }

  const activeRepos = repos.filter((repo) => !repo.archived)
  const topRepos = [...activeRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 4)

  const topLanguageEntries = Object.entries(
    activeRepos.reduce<Record<string, number>>((acc, repo) => {
      if (!repo.language) {
        return acc
      }
      acc[repo.language] = (acc[repo.language] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topLanguages = topLanguageEntries.map(([language]) => language)

  const averageStars = activeRepos.length
    ? Number((activeRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0) / activeRepos.length).toFixed(1))
    : 0

  const reposForReadmeCheck = activeRepos.filter((repo) => !repo.fork).slice(0, 20)
  const readmeChecks = await Promise.all(
    reposForReadmeCheck.map(async (repo) => {
      const response = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
        headers,
        cache: 'no-store',
      })
      return response.ok
    })
  )

  const sampledWithReadme = readmeChecks.filter(Boolean).length
  const sampledRatio = reposForReadmeCheck.length ? sampledWithReadme / reposForReadmeCheck.length : 0
  const totalRepos = activeRepos.length
  const withReadme = Math.round(sampledRatio * totalRepos)
  const withoutReadme = Math.max(0, totalRepos - withReadme)

  return {
    user,
    topLanguages: topLanguages.length >= 2 ? topLanguages : ['JavaScript', 'TypeScript'],
    topRepos,
    repoAnalysis: {
      withReadme,
      withoutReadme,
      averageStars,
      totalRepos,
    },
    totalStars: activeRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: activeRepos.reduce((sum, repo) => sum + repo.forks_count, 0),
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, content, username } = await request.json()

    if (!type) {
      return new Response('Analysis type is required', { status: 400 })
    }

    let schema: z.ZodType
    let systemPrompt: string
    let userPrompt: string

    switch (type) {
      case 'resume':
        if (!content) {
          return new Response('Resume content is required', { status: 400 })
        }
        schema = resumeAnalysisSchema
        systemPrompt = `You are DevScorer AI, an expert resume analyzer. Always use evidence from the resume text. Avoid generic advice. Each strength and improvement must include concrete context (specific section, tool, tech, or phrasing from the resume). Keep scores realistic: most resumes are 60-85.`
        userPrompt = `Analyze this resume text:\n\n${truncateContent(content)}\n\nReturn:
- ATS score (0-100)
      - 1 vibeFeedback line (single sentence, personalized and witty; if score < 60 use light comedy + encouragement)
- 4 role matches with percentage
- 4 strengths (specific and evidence-based)
- 4 improvements (specific, actionable, and measurable)
- 3-6 missing keywords relevant to likely target roles`
        break

      case 'linkedin':
        if (!content) {
          return new Response('LinkedIn content is required', { status: 400 })
        }
        schema = linkedinAnalysisSchema
        systemPrompt = `You are DevScorer AI, an expert LinkedIn profile analyzer. Avoid generic statements. Every section feedback must cite a concrete profile signal (example wording, missing element, or clarity issue) and give one clear improvement direction.`
        userPrompt = `Analyze this LinkedIn profile export:\n\n${truncateContent(content)}\n\nProvide:
- Overall profile score
      - 1 vibeFeedback line (single sentence, personalized and witty; if score < 60 use light comedy + encouragement)
- Section scores for headline, summary, experience, skills, education, recommendations
- Rich feedback per section (not generic)
- 4 strengths
- 4 actionable improvements`
        break

      case 'github':
        if (!username) {
          return new Response('GitHub username is required', { status: 400 })
        }
        schema = githubAnalysisSchema

        const githubData = await fetchGitHubFacts(username)
        const overallScore = scoreFromStats({
          withReadme: githubData.repoAnalysis.withReadme,
          totalRepos: githubData.repoAnalysis.totalRepos,
          averageStars: githubData.repoAnalysis.averageStars,
          topLanguageCount: githubData.topLanguages.length,
          followers: githubData.user.followers,
        })

        const githubTopRepos = githubData.topRepos.map((repo) => ({
          name: repo.name,
          stars: repo.stargazers_count,
          language: repo.language || 'Unknown',
          hasReadme: true,
        }))

        while (githubTopRepos.length < 4) {
          githubTopRepos.push({
            name: `sample-repo-${githubTopRepos.length + 1}`,
            stars: 0,
            language: 'Unknown',
            hasReadme: false,
          })
        }

        systemPrompt = `You are DevScorer AI, a strict GitHub profile reviewer. Use only the provided facts. Strengths and improvements must reference explicit metrics or repo names.`
        userPrompt = `Analyze this GitHub profile data for @${username}:
- public repos: ${githubData.user.public_repos}
- followers: ${githubData.user.followers}
- following: ${githubData.user.following}
- total stars: ${githubData.totalStars}
- total forks: ${githubData.totalForks}
- top languages: ${githubData.topLanguages.join(', ')}
- avg stars/repo: ${githubData.repoAnalysis.averageStars}
- top repos: ${githubTopRepos.map((repo) => `${repo.name} (${repo.stars} stars, ${repo.language})`).join('; ')}

Give:
- overallScore aligned with this data
- 1 vibeFeedback line (single sentence, personalized and witty; if score < 60 use light comedy + encouragement)
- 4 concrete strengths
- 4 concrete improvements`

        const githubAiResult = await generateWithFallback({
          schema,
          system: systemPrompt,
          prompt: userPrompt,
        })

        const githubResult = githubResultSchema.parse({
          overallScore: Math.round((overallScore + githubAiResult.object.overallScore) / 2),
          vibeFeedback: githubAiResult.object.vibeFeedback,
          stats: {
            totalRepos: githubData.repoAnalysis.totalRepos,
            publicRepos: githubData.user.public_repos,
            stars: githubData.totalStars,
            forks: githubData.totalForks,
            followers: githubData.user.followers,
            following: githubData.user.following,
          },
          repoAnalysis: {
            withReadme: githubData.repoAnalysis.withReadme,
            withoutReadme: githubData.repoAnalysis.withoutReadme,
            averageStars: githubData.repoAnalysis.averageStars,
            topLanguages: githubData.topLanguages,
          },
          strengths: githubAiResult.object.strengths,
          improvements: githubAiResult.object.improvements,
          topRepos: githubTopRepos,
        })

        return Response.json(githubResult)
        break

      default:
        return new Response('Invalid analysis type', { status: 400 })
    }

    const result = await generateWithFallback({
      schema,
      system: systemPrompt,
      prompt: userPrompt,
    })

    return Response.json(result.object)
  } catch (error) {
    console.error('Error analyzing:', error)
    const mapped = mapAnalysisError(error)
    return new Response(mapped.message, { status: mapped.status })
  }
}
