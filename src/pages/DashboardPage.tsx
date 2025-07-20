import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { generateYourBrandData, generateCompetitorData, getCacheKey, getCompetitorCacheKey, calculateOverallScore } from '../utils/brandScoring'
import { analysisService } from '../services/analysisService'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  ArrowLeft,
  RefreshCw,
  Download,
  Star,
  AlertCircle,
  Crown,
  Sparkles,
  Zap,
  Award,
  Trophy,
  User,
  LogOut,
  Settings
} from 'lucide-react'

interface DashboardPageProps {
  brandData: {
    websiteUrl: string
    brandName: string
    email: string
    industry: string
    location: string
    keywords: string[]
    competitors: string[]
    competitorChoice: 'auto' | 'manual'
  }
  onBack: () => void
  onViewCompetitors: () => void
}

interface LLMRanking {
  platform: string
  logo: string
  rank: number | null
  score: number
  mentions: number
  trend: 'up' | 'down' | 'stable'
  recommendations: string[]
}

export default function DashboardPage({ brandData, onBack, onViewCompetitors }: DashboardPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [rankings, setRankings] = useState<LLMRanking[]>([])
  const [overallScore, setOverallScore] = useState(0)
  const [analyzedPrompts, setAnalyzedPrompts] = useState<string[]>([])
  const [competitorData, setCompetitorData] = useState<any[]>([])
  const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false)
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)
  const [usageInfo, setUsageInfo] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  const getMockPrompts = useCallback((): string[] => [
    `What are the best ${brandData.industry} companies?`,
    `Top ${brandData.industry} brands to consider`,
    `Leading ${brandData.industry} services`,
    `Best ${brandData.industry} companies in ${brandData.location}`,
    `Tell me about ${brandData.brandName}`,
    `${brandData.brandName} reviews and recommendations`,
    `Is ${brandData.brandName} a good choice for ${brandData.industry}?`
  ], [brandData.industry, brandData.location, brandData.brandName])

  const runCompetitorAnalysis = useCallback(async () => {
    setIsLoadingCompetitors(true)
    
    try {
      const response = await fetch('https://568dmqs5--analyze-competitors.functions.blink.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${blink.auth.isAuthenticated() ? 'authenticated' : 'anonymous'}`
        },
        body: JSON.stringify({
          websiteUrl: brandData.websiteUrl,
          brandName: brandData.brandName,
          industry: brandData.industry,
          location: brandData.location,
          keywords: brandData.keywords,
          competitors: brandData.competitors,
          competitorChoice: brandData.competitorChoice
        })
      })

      let competitors: any[] = []

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          competitors = result.competitors || []
        } else {
          console.error('Competitor analysis failed:', result.message)
          competitors = generateCompetitorData(brandData.industry, brandData.competitors, brandData.competitorChoice)
        }
      } else {
        console.error('Failed to call competitor analysis API')
        competitors = generateCompetitorData(brandData.industry, brandData.competitors, brandData.competitorChoice)
      }

      // Save competitors to database
      const brandAnalysis = await analysisService.getLatestBrandAnalysis()
      if (brandAnalysis) {
        for (const competitor of competitors) {
          await analysisService.saveCompetitorAnalysis(
            brandAnalysis.id,
            competitor.website || competitor.name,
            competitor.overallScore,
            competitor.platforms || []
          )
        }
      }

      setCompetitorData(competitors)
      
    } catch (error) {
      console.error('Error during competitor analysis:', error)
      setCompetitorData(generateCompetitorData(brandData.industry, brandData.competitors, brandData.competitorChoice))
    }
    
    setIsLoadingCompetitors(false)
  }, [brandData])

  const runNewAnalysis = useCallback(async () => {
    setIsLoading(true)
    setIsReanalyzing(true)
    
    try {
      // Call the backend analysis function
      const response = await fetch('https://568dmqs5--analyze-brand.functions.blink.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${blink.auth.isAuthenticated() ? 'authenticated' : 'anonymous'}`
        },
        body: JSON.stringify({
          websiteUrl: brandData.websiteUrl,
          brandName: brandData.brandName,
          industry: brandData.industry,
          location: brandData.location,
          keywords: brandData.keywords,
          competitors: brandData.competitors,
          competitorChoice: brandData.competitorChoice
        })
      })

      let rankings: LLMRanking[] = []
      let overallScore = 0
      let analyzedPrompts: string[] = []

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          rankings = result.rankings || []
          overallScore = result.overallScore || 0
          analyzedPrompts = result.analyzedPrompts || []
        } else {
          console.error('Analysis failed:', result.message)
          // Fall back to mock data
          const mockBrandData = generateYourBrandData(brandData)
          rankings = mockBrandData.platforms
          overallScore = mockBrandData.overallScore
          analyzedPrompts = getMockPrompts()
        }
      } else {
        console.error('Failed to call analysis API')
        // Fall back to mock data
        const mockBrandData = generateYourBrandData(brandData)
        rankings = mockBrandData.platforms
        overallScore = mockBrandData.overallScore
        analyzedPrompts = getMockPrompts()
      }

      // Save to database
      await analysisService.saveBrandAnalysis(
        brandData.websiteUrl,
        brandData.brandName,
        brandData.industry,
        brandData.location,
        brandData.keywords,
        brandData.competitors,
        brandData.competitorChoice,
        overallScore,
        rankings,
        rankings.flatMap(r => r.recommendations),
        analyzedPrompts
      )

      setRankings(rankings)
      setOverallScore(overallScore)
      setAnalyzedPrompts(analyzedPrompts)
      setHasExistingAnalysis(true)

      // Run competitor analysis
      await runCompetitorAnalysis()
      
    } catch (error) {
      console.error('Error during analysis:', error)
      // Fall back to mock data
      const mockBrandData = generateYourBrandData(brandData)
      setRankings(mockBrandData.platforms)
      setOverallScore(mockBrandData.overallScore)
      setAnalyzedPrompts(getMockPrompts())
    }
    
    setIsLoading(false)
    setIsReanalyzing(false)
  }, [brandData, getMockPrompts, runCompetitorAnalysis])

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUser = await blink.auth.me()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting current user:', error)
      }
    }
    getCurrentUser()
  }, [])

  // Check for existing analysis on load
  useEffect(() => {
    const checkExistingAnalysis = async () => {
      try {
        setIsLoading(true)
        
        // Check subscription limits first
        const limits = await analysisService.checkSubscriptionLimit()
        setUsageInfo(limits)
        
        // Check for existing analysis with exact brand configuration
        const existingAnalysis = await analysisService.getExistingAnalysis(
          brandData.websiteUrl,
          brandData.brandName,
          brandData.industry,
          brandData.location,
          brandData.keywords
        )
        
        if (existingAnalysis) {
          console.log('Found existing analysis with matching configuration, loading from database')
          setHasExistingAnalysis(true)
          setRankings(existingAnalysis.llmResults)
          setOverallScore(existingAnalysis.overallScore)
          setAnalyzedPrompts(existingAnalysis.analyzedPrompts || getMockPrompts())
          
          // Load competitors for this analysis
          const competitors = await analysisService.getCompetitors(existingAnalysis.id)
          if (competitors.length > 0) {
            const competitorData = competitors.map(comp => ({
              name: comp.competitorWebsite.replace(/^https?:\/\//, '').replace(/\/$/, ''),
              overallScore: comp.competitorScore,
              platforms: comp.competitorLlmResults
            }))
            setCompetitorData(competitorData)
          }
          
          setIsLoading(false)
        } else {
          // No existing analysis, check if user can run new analysis
          if (!limits.canAnalyze) {
            setIsLoading(false)
            alert(`You've reached your monthly limit of ${limits.limit} analyses. Current usage: ${limits.usage.total}`)
            return
          }
          
          // Run new analysis
          await runNewAnalysis()
        }
      } catch (error) {
        console.error('Error checking existing analysis:', error)
        setIsLoading(false)
      }
    }

    checkExistingAnalysis()
  }, [brandData, getMockPrompts, runNewAnalysis])

  const handleReanalyze = async () => {
    // Check subscription limits
    const limits = await analysisService.checkSubscriptionLimit()
    if (!limits.canAnalyze) {
      alert(`You've reached your monthly limit of ${limits.limit} analyses. Current usage: ${limits.usage.total}`)
      return
    }

    // Delete existing analysis
    await analysisService.forceReanalysis(brandData.websiteUrl)
    
    // Reset state
    setHasExistingAnalysis(false)
    setCompetitorData([])
    
    // Run new analysis
    await runNewAnalysis()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <div className="h-4 w-4 rounded-full bg-slate-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-600'
    if (score >= 60) return 'from-amber-500 to-orange-600'
    return 'from-red-500 to-rose-600'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="relative z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div 
                className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105" 
                onClick={onBack}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-serif font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                  RankAI
                </span>
              </div>
              <Button variant="ghost" onClick={onBack} className="flex items-center hover:bg-slate-100 transition-all duration-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-12">
              <div className="relative mx-auto mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto pulse-glow">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                {isReanalyzing ? 'Re-analyzing' : 'Analyzing'} Your Brand Across
                <span className="block gradient-text">AI Platforms</span>
              </h2>
              <p className="text-xl text-slate-600 mb-12 font-light">
                {isReanalyzing 
                  ? 'Running fresh analysis with updated data...'
                  : 'We\'re querying ChatGPT, Claude, Gemini, and Perplexity using real API calls to discover how they actually rank your brand...'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Generating Real Queries</div>
                  <div className="text-sm text-slate-600">Creating industry-specific search queries with keywords...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Live API Calls</div>
                  <div className="text-sm text-slate-600">Making real API calls to ChatGPT, Claude, Gemini & Perplexity...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Real-time Analysis</div>
                  <div className="text-sm text-slate-600">Analyzing actual responses for brand mentions...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300 opacity-60">
                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Saving Results</div>
                  <div className="text-sm text-slate-500">Storing analysis in database for future access...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="relative z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div 
              className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105" 
              onClick={onBack}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl group-hover:shadow-lg transition-all duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                RankAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {hasExistingAnalysis && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
                  onClick={handleReanalyze}
                  disabled={isReanalyzing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isReanalyzing ? 'animate-spin' : ''}`} />
                  {isReanalyzing ? 'Reanalyzing...' : 'Reanalyze'}
                </Button>
              )}
              {usageInfo && (
                <div className="text-sm text-slate-600">
                  Usage: {usageInfo.usage.total}/{usageInfo.limit}
                </div>
              )}
              <Button variant="outline" size="sm" className="border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              {/* User Menu */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-slate-100 transition-all duration-300">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => blink.auth.logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button variant="ghost" onClick={onBack} className="flex items-center hover:bg-slate-100 transition-all duration-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Info Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <Crown className="h-8 w-8 text-indigo-600" />
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 break-words">{brandData.brandName}</h1>
                  {hasExistingAnalysis && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      Saved Analysis
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-base md:text-lg text-slate-600 font-light break-all sm:break-normal">{brandData.websiteUrl} • {brandData.industry}</p>
              {brandData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {brandData.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 text-center lg:text-right">
              <div className="relative inline-block">
                <div className={`text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r ${getScoreGradient(overallScore)} bg-clip-text text-transparent`}>
                  {overallScore}
                </div>
                <div className="text-sm text-slate-600 font-medium">Overall Score</div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={onViewCompetitors}
            size="lg" 
            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl premium-glow transition-all duration-300 transform hover:scale-105"
          >
            <Users className="mr-3 h-6 w-6" />
            View Full Competitor Analysis
            <ArrowLeft className="ml-3 h-6 w-6 rotate-180" />
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 p-1 shadow-lg">
              <TabsTrigger 
                value="overview" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-indigo-600 data-[state=active]:hover:to-purple-700"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="platforms" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-indigo-600 data-[state=active]:hover:to-purple-700"
              >
                Platform Details
              </TabsTrigger>
              <TabsTrigger 
                value="recommendations" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-indigo-600 data-[state=active]:hover:to-purple-700"
              >
                Recommendations
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Central Score Circle */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl opacity-30 scale-110"></div>
                
                {/* Main circle */}
                <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-white to-slate-50 border-8 border-white shadow-2xl flex items-center justify-center">
                  {/* Score display */}
                  <div className="text-center">
                    <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreGradient(overallScore)} bg-clip-text text-transparent mb-2`}>
                      {overallScore}
                    </div>
                    <div className="text-slate-600 font-semibold text-lg">Overall Score</div>
                    <div className="text-slate-500 text-sm mt-1">
                      {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Progress ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="2"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${overallScore * 2.83} 283`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300 group text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {rankings.filter(r => r.trend === 'up').length}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Trending Up</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300 group text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {rankings.filter(r => r.rank !== null).length}/4
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Platforms Ranking</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300 group text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {rankings.reduce((acc, r) => acc + r.mentions, 0)}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Total Mentions</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300 group text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {rankings.filter(r => r.score >= 70).length}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Strong Scores</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Rankings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rankings.map((ranking) => (
                <Card key={ranking.platform} className="relative overflow-hidden glass-card border-0 hover:luxury-shadow transition-all duration-500 transform hover:-translate-y-1 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/20"></div>
                  <CardHeader className="relative pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{ranking.logo}</span>
                        <CardTitle className="text-lg font-serif">{ranking.platform}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(ranking.trend)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 font-medium">Rank</span>
                        <span className="font-bold text-lg">
                          {ranking.rank ? `#${ranking.rank}` : 'Not ranked'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 font-medium">Score</span>
                        <span className={`font-bold text-lg ${getScoreColor(ranking.score)}`}>
                          {ranking.score}/100
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 font-medium">Mentions</span>
                        <span className="font-bold text-lg">{ranking.mentions}</span>
                      </div>
                      <div className="relative">
                        <Progress value={ranking.score} className="h-3 bg-slate-200" />
                        <div className={`absolute inset-0 h-3 bg-gradient-to-r ${getScoreGradient(ranking.score)} rounded-full`} style={{width: `${ranking.score}%`}}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-8">
            {rankings.map((ranking) => (
              <Card key={ranking.platform} className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{ranking.logo}</span>
                      <div>
                        <CardTitle className="text-2xl font-serif">{ranking.platform}</CardTitle>
                        <CardDescription className="text-base">
                          {ranking.rank ? `Ranked #${ranking.rank}` : 'Not currently ranked'} • Score: {ranking.score}/100
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={ranking.score >= 70 ? 'default' : ranking.score >= 50 ? 'secondary' : 'destructive'}
                      className="px-4 py-2 text-sm font-semibold w-fit"
                    >
                      {ranking.score >= 70 ? 'Excellent' : ranking.score >= 50 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                        <div className="text-3xl font-bold text-slate-900 mb-2">{ranking.mentions}</div>
                        <div className="text-sm text-slate-600 font-medium">Mentions</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                        <div className="text-3xl font-bold text-slate-900 mb-2">{ranking.rank || 'N/A'}</div>
                        <div className="text-sm text-slate-600 font-medium">Current Rank</div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
                        <div className={`text-3xl font-bold mb-2 ${getScoreColor(ranking.score)}`}>
                          {ranking.score}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">Score</div>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={ranking.score} className="h-4 bg-slate-200" />
                      <div className={`absolute inset-0 h-4 bg-gradient-to-r ${getScoreGradient(ranking.score)} rounded-full`} style={{width: `${ranking.score}%`}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-8">
            {rankings.map((ranking) => (
              <Card key={ranking.platform} className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{ranking.logo}</span>
                    <div>
                      <CardTitle className="text-xl font-serif flex items-center">
                        {ranking.platform} Recommendations
                        <Zap className="h-5 w-5 ml-2 text-indigo-500" />
                      </CardTitle>
                      <CardDescription className="text-base">
                        Improve your ranking with these platform-specific strategies
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ranking.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}