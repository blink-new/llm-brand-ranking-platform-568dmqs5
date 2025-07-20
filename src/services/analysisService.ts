import { createClient } from '@blinkdotnew/sdk'

const blink = createClient({
  projectId: 'llm-brand-ranking-platform-568dmqs5',
  authRequired: true
})

export interface BrandAnalysisResult {
  id: string
  userId: string
  website: string
  brandName: string
  industry: string
  location: string
  keywords: string[]
  competitors: string[]
  competitorChoice: 'auto' | 'manual'
  overallScore: number
  llmResults: any[]
  recommendations: any[]
  analyzedPrompts: string[]
  createdAt: string
  updatedAt: string
}

export interface CompetitorAnalysisResult {
  id: string
  userId: string
  brandAnalysisId: string
  competitorWebsite: string
  competitorScore: number
  competitorLlmResults: any[]
  createdAt: string
}

export interface ApiUsage {
  id: string
  userId: string
  analysisType: 'brand' | 'competitor'
  queriesUsed: number
  createdAt: string
}

class AnalysisService {
  // Check if analysis exists for this brand configuration
  async getExistingAnalysis(
    website: string,
    brandName: string,
    industry: string,
    location: string,
    keywords: string[]
  ): Promise<BrandAnalysisResult | null> {
    const user = await blink.auth.me()
    
    const analyses = await blink.db.brandAnalyses.list({
      where: {
        AND: [
          { userId: user.id },
          { website },
          { brandName },
          { industry },
          { location: location || '' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      limit: 1
    })

    if (analyses.length === 0) return null

    const analysis = analyses[0]
    
    // Parse stored data
    const storedKeywords = JSON.parse(analysis.keywords || '[]')
    const storedCompetitors = JSON.parse(analysis.competitors || '[]')
    
    // Check if keywords match (order doesn't matter)
    const keywordsMatch = keywords.length === storedKeywords.length && 
      keywords.every(k => storedKeywords.includes(k))
    
    // If configuration matches, return existing analysis
    if (keywordsMatch) {
      return {
        id: analysis.id,
        userId: analysis.userId,
        website: analysis.website,
        brandName: analysis.brandName,
        industry: analysis.industry,
        location: analysis.location,
        keywords: storedKeywords,
        competitors: storedCompetitors,
        competitorChoice: analysis.competitorChoice as 'auto' | 'manual',
        overallScore: analysis.overallScore,
        llmResults: JSON.parse(analysis.llmResults),
        recommendations: JSON.parse(analysis.recommendations || '[]'),
        analyzedPrompts: JSON.parse(analysis.analyzedPrompts || '[]'),
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt
      }
    }

    return null
  }

  // Save brand analysis to database
  async saveBrandAnalysis(
    website: string,
    brandName: string,
    industry: string,
    location: string,
    keywords: string[],
    competitors: string[],
    competitorChoice: 'auto' | 'manual',
    overallScore: number,
    llmResults: any[],
    recommendations: any[],
    analyzedPrompts: string[]
  ): Promise<string> {
    const user = await blink.auth.me()
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Delete any existing analysis for this exact configuration
    await this.deleteExistingAnalysis(website, brandName, industry, location, keywords)
    
    await blink.db.brandAnalyses.create({
      id: analysisId,
      userId: user.id,
      website,
      brandName,
      industry,
      location: location || '',
      keywords: JSON.stringify(keywords),
      competitors: JSON.stringify(competitors),
      competitorChoice,
      overallScore,
      llmResults: JSON.stringify(llmResults),
      recommendations: JSON.stringify(recommendations),
      analyzedPrompts: JSON.stringify(analyzedPrompts),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Track API usage
    await this.trackApiUsage('brand')
    
    return analysisId
  }

  // Delete existing analysis for reanalysis
  async deleteExistingAnalysis(
    website: string,
    brandName: string,
    industry: string,
    location: string,
    keywords: string[]
  ): Promise<void> {
    const existing = await this.getExistingAnalysis(website, brandName, industry, location, keywords)
    if (existing) {
      // Delete competitors first
      const competitors = await this.getCompetitors(existing.id)
      for (const competitor of competitors) {
        await blink.db.competitorAnalyses.delete(competitor.id)
      }
      
      // Delete the brand analysis
      await blink.db.brandAnalyses.delete(existing.id)
    }
  }

  // Get latest brand analysis for user (for dashboard display)
  async getLatestBrandAnalysis(): Promise<BrandAnalysisResult | null> {
    const user = await blink.auth.me()
    
    const analyses = await blink.db.brandAnalyses.list({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      limit: 1
    })

    if (analyses.length === 0) return null

    const analysis = analyses[0]
    return {
      id: analysis.id,
      userId: analysis.userId,
      website: analysis.website,
      brandName: analysis.brandName,
      industry: analysis.industry,
      location: analysis.location,
      keywords: JSON.parse(analysis.keywords || '[]'),
      competitors: JSON.parse(analysis.competitors || '[]'),
      competitorChoice: analysis.competitorChoice as 'auto' | 'manual',
      overallScore: analysis.overallScore,
      llmResults: JSON.parse(analysis.llmResults),
      recommendations: JSON.parse(analysis.recommendations || '[]'),
      analyzedPrompts: JSON.parse(analysis.analyzedPrompts || '[]'),
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt
    }
  }

  // Save competitor analysis
  async saveCompetitorAnalysis(
    brandAnalysisId: string,
    competitorWebsite: string,
    competitorScore: number,
    competitorLlmResults: any[]
  ): Promise<string> {
    const user = await blink.auth.me()
    const competitorId = `competitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await blink.db.competitorAnalyses.create({
      id: competitorId,
      userId: user.id,
      brandAnalysisId,
      competitorWebsite,
      competitorScore,
      competitorLlmResults: JSON.stringify(competitorLlmResults),
      createdAt: new Date().toISOString()
    })

    // Track API usage
    await this.trackApiUsage('competitor')
    
    return competitorId
  }

  // Get competitors for a brand analysis
  async getCompetitors(brandAnalysisId: string): Promise<CompetitorAnalysisResult[]> {
    const competitors = await blink.db.competitorAnalyses.list({
      where: { brandAnalysisId },
      orderBy: { createdAt: 'desc' }
    })

    return competitors.map(comp => ({
      id: comp.id,
      userId: comp.userId,
      brandAnalysisId: comp.brandAnalysisId,
      competitorWebsite: comp.competitorWebsite,
      competitorScore: comp.competitorScore,
      competitorLlmResults: JSON.parse(comp.competitorLlmResults),
      createdAt: comp.createdAt
    }))
  }

  // Check if competitor analysis exists
  async getExistingCompetitorAnalysis(
    brandAnalysisId: string,
    competitorWebsite: string
  ): Promise<CompetitorAnalysisResult | null> {
    const competitors = await blink.db.competitorAnalyses.list({
      where: {
        AND: [
          { brandAnalysisId },
          { competitorWebsite }
        ]
      },
      limit: 1
    })

    if (competitors.length === 0) return null

    const comp = competitors[0]
    return {
      id: comp.id,
      userId: comp.userId,
      brandAnalysisId: comp.brandAnalysisId,
      competitorWebsite: comp.competitorWebsite,
      competitorScore: comp.competitorScore,
      competitorLlmResults: JSON.parse(comp.competitorLlmResults),
      createdAt: comp.createdAt
    }
  }

  // Track API usage for subscription management
  async trackApiUsage(analysisType: 'brand' | 'competitor'): Promise<void> {
    const user = await blink.auth.me()
    const usageId = `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await blink.db.apiUsage.create({
      id: usageId,
      userId: user.id,
      analysisType,
      queriesUsed: 1,
      createdAt: new Date().toISOString()
    })
  }

  // Get monthly API usage for user
  async getMonthlyUsage(): Promise<{ brand: number; competitor: number; total: number }> {
    const user = await blink.auth.me()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const usage = await blink.db.apiUsage.list({
      where: { userId: user.id }
    })

    // Filter by current month (client-side for now)
    const currentMonthUsage = usage.filter(u => 
      new Date(u.createdAt) >= startOfMonth
    )

    const brandUsage = currentMonthUsage
      .filter(u => u.analysisType === 'brand')
      .reduce((sum, u) => sum + u.queriesUsed, 0)

    const competitorUsage = currentMonthUsage
      .filter(u => u.analysisType === 'competitor')
      .reduce((sum, u) => sum + u.queriesUsed, 0)

    return {
      brand: brandUsage,
      competitor: competitorUsage,
      total: brandUsage + competitorUsage
    }
  }

  // Check if user has reached their subscription limit
  async checkSubscriptionLimit(): Promise<{ canAnalyze: boolean; usage: any; limit: number }> {
    const usage = await this.getMonthlyUsage()
    
    // Default limits (you can make this dynamic based on user subscription)
    const limits = {
      free: 5,
      starter: 25,
      pro: 100,
      enterprise: 1000
    }

    // For now, assume all users are on free tier
    // You can extend this to check actual user subscription
    const userLimit = limits.free
    
    return {
      canAnalyze: usage.total < userLimit,
      usage,
      limit: userLimit
    }
  }

  // Force reanalysis by deleting existing data
  async forceReanalysis(website: string): Promise<void> {
    const user = await blink.auth.me()
    
    // Get all analyses for this website
    const analyses = await blink.db.brandAnalyses.list({
      where: {
        AND: [
          { userId: user.id },
          { website }
        ]
      }
    })

    // Delete all related data
    for (const analysis of analyses) {
      // Delete competitors first
      const competitors = await this.getCompetitors(analysis.id)
      for (const competitor of competitors) {
        await blink.db.competitorAnalyses.delete(competitor.id)
      }
      
      // Delete the brand analysis
      await blink.db.brandAnalyses.delete(analysis.id)
    }
  }
}

export const analysisService = new AnalysisService()