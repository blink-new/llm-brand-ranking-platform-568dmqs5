// Shared brand scoring utilities to ensure consistency across pages

export interface BrandPlatformData {
  platform: string
  logo: string
  rank: number | null
  score: number
  mentions: number
  trend: 'up' | 'down' | 'stable'
}

export interface BrandData {
  name: string
  website: string
  overallScore: number
  platforms: BrandPlatformData[]
}

// Calculate overall score from platform scores
export const calculateOverallScore = (platforms: BrandPlatformData[]): number => {
  const validScores = platforms.filter(p => p.score > 0).map(p => p.score)
  if (validScores.length === 0) return 0
  
  // Weighted average: ChatGPT and Gemini get higher weight
  const weights = {
    'ChatGPT': 0.3,
    'Claude': 0.25,
    'Gemini': 0.3,
    'Perplexity': 0.15
  }
  
  let totalWeightedScore = 0
  let totalWeight = 0
  
  platforms.forEach(platform => {
    const weight = weights[platform.platform as keyof typeof weights] || 0.25
    totalWeightedScore += platform.score * weight
    totalWeight += weight
  })
  
  return Math.round(totalWeightedScore / totalWeight)
}

// Generate consistent mock data for your brand
export const generateYourBrandData = (brandInfo: {
  brandName: string
  websiteUrl: string
  industry: string
  location: string
}): BrandData => {
  const platforms: BrandPlatformData[] = [
    {
      platform: 'ChatGPT',
      logo: '🤖',
      rank: 3,
      score: 78,
      mentions: 12,
      trend: 'up'
    },
    {
      platform: 'Claude',
      logo: '🧠',
      rank: 5,
      score: 65,
      mentions: 8,
      trend: 'stable'
    },
    {
      platform: 'Gemini',
      logo: '✨',
      rank: 2,
      score: 82,
      mentions: 15,
      trend: 'up'
    },
    {
      platform: 'Perplexity',
      logo: '🔍',
      rank: null,
      score: 45,
      mentions: 3,
      trend: 'down'
    }
  ]

  const overallScore = calculateOverallScore(platforms)

  return {
    name: brandInfo.brandName,
    website: brandInfo.websiteUrl,
    overallScore,
    platforms
  }
}

// Generate competitor data with consistent scoring
export const generateCompetitorData = (
  industry: string,
  competitors: string[],
  competitorChoice: 'auto' | 'manual'
): BrandData[] => {
  const competitorsByIndustry: Record<string, string[]> = {
    'Technology': ['TechCorp Solutions', 'InnovateLab', 'DigitalEdge Pro', 'CloudTech Systems'],
    'Healthcare': ['MedTech Solutions', 'HealthCare Plus', 'Medical Innovations', 'WellnessTech'],
    'Finance': ['FinTech Pro', 'Capital Solutions', 'Investment Tech', 'Financial Edge'],
    'E-commerce': ['ShopTech Solutions', 'Commerce Plus', 'RetailEdge Pro', 'MarketPlace Systems'],
    'Education': ['EduTech Solutions', 'Learning Plus', 'Academic Edge', 'StudyTech Pro'],
    'Marketing': ['MarketPro Solutions', 'AdTech Plus', 'Campaign Edge', 'BrandTech Systems'],
    'Real Estate': ['PropTech Solutions', 'RealEstate Plus', 'Property Edge', 'HomeTech Pro'],
    'Food & Beverage': ['FoodTech Solutions', 'Culinary Plus', 'Taste Edge', 'RestaurantTech Pro'],
    'default': ['Industry Leader Corp', 'Market Solutions Pro', 'Business Edge Systems', 'Enterprise Plus']
  }

  const competitorNames = competitorChoice === 'manual' && competitors.length > 0 
    ? competitors.slice(0, 4)
    : (competitorsByIndustry[industry] || competitorsByIndustry['default']).slice(0, 4)

  // Predefined competitor scores to ensure consistency
  const competitorScores = [
    { chatgpt: 92, claude: 88, gemini: 90, perplexity: 70 }, // Strong competitor
    { chatgpt: 85, claude: 75, gemini: 68, perplexity: 60 }, // Medium competitor  
    { chatgpt: 62, claude: 58, gemini: 55, perplexity: 58 }, // Weaker competitor
    { chatgpt: 68, claude: 63, gemini: 61, perplexity: 52 }  // Another competitor
  ]

  return competitorNames.map((name, index) => {
    const scores = competitorScores[index] || competitorScores[3]
    
    const platforms: BrandPlatformData[] = [
      {
        platform: 'ChatGPT',
        logo: '🤖',
        rank: index + 1,
        score: scores.chatgpt,
        mentions: Math.floor(scores.chatgpt / 3) + Math.floor(Math.random() * 5),
        trend: ['up', 'stable', 'down', 'up'][index] as 'up' | 'down' | 'stable'
      },
      {
        platform: 'Claude',
        logo: '🧠',
        rank: index + 2,
        score: scores.claude,
        mentions: Math.floor(scores.claude / 4) + Math.floor(Math.random() * 3),
        trend: ['up', 'down', 'stable', 'up'][index] as 'up' | 'down' | 'stable'
      },
      {
        platform: 'Gemini',
        logo: '✨',
        rank: index + 1,
        score: scores.gemini,
        mentions: Math.floor(scores.gemini / 3) + Math.floor(Math.random() * 6),
        trend: ['stable', 'stable', 'down', 'up'][index] as 'up' | 'down' | 'stable'
      },
      {
        platform: 'Perplexity',
        logo: '🔍',
        rank: index < 3 ? index + 3 : null,
        score: scores.perplexity,
        mentions: Math.floor(scores.perplexity / 5) + Math.floor(Math.random() * 3),
        trend: ['up', 'up', 'stable', 'down'][index] as 'up' | 'down' | 'stable'
      }
    ]

    const overallScore = calculateOverallScore(platforms)

    return {
      name,
      website: `${name.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`,
      overallScore,
      platforms
    }
  })
}

// Cache keys for consistent data storage
export const getCacheKey = (brandName: string, industry: string, location: string) => {
  return `brand_analysis_${brandName.replace(/\s+/g, '_')}_${industry.replace(/\s+/g, '_')}_${location.replace(/\s+/g, '_')}`
}

export const getCompetitorCacheKey = (brandName: string, industry: string, location: string) => {
  return `competitor_analysis_${brandName.replace(/\s+/g, '_')}_${industry.replace(/\s+/g, '_')}_${location.replace(/\s+/g, '_')}`
}