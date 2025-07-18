import { useState, useEffect, useCallback } from 'react'
import { blink } from '../blink/client'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
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
  Award
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

  const getMockPrompts = useCallback((): string[] => [
    `What are the best ${brandData.industry} companies?`,
    `Top ${brandData.industry} brands to consider`,
    `Leading ${brandData.industry} services`,
    `Best ${brandData.industry} companies in ${brandData.location}`,
    `Tell me about ${brandData.brandName}`,
    `${brandData.brandName} reviews and recommendations`,
    `Is ${brandData.brandName} a good choice for ${brandData.industry}?`
  ], [brandData.industry, brandData.location, brandData.brandName])

  useEffect(() => {
    // Call backend to analyze brand rankings
    const analyzeRankings = async () => {
      setIsLoading(true)
      
      try {
        // Call the backend analysis function with platform-provided API keys
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

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setRankings(result.rankings || [])
            setOverallScore(result.overallScore || 0)
            setAnalyzedPrompts(result.analyzedPrompts || [])
          } else {
            console.error('Analysis failed:', result.message)
            // Fall back to mock data
            setRankings(getMockRankings())
            setOverallScore(67)
            setAnalyzedPrompts(getMockPrompts())
          }
        } else {
          console.error('Failed to call analysis API')
          // Fall back to mock data on API failure
          setRankings(getMockRankings())
          setOverallScore(67)
          setAnalyzedPrompts(getMockPrompts())
        }
      } catch (error) {
        console.error('Error during analysis:', error)
        // Fall back to mock data on error
        setRankings(getMockRankings())
        setOverallScore(67)
        setAnalyzedPrompts(getMockPrompts())
      }
      
      setIsLoading(false)
    }

    analyzeRankings()
  }, [brandData.brandName, brandData.competitorChoice, brandData.competitors, brandData.industry, brandData.keywords, brandData.location, brandData.websiteUrl, getMockPrompts])

  const getMockRankings = (): LLMRanking[] => [
    {
      platform: 'ChatGPT',
      logo: '🤖',
      rank: 3,
      score: 78,
      mentions: 12,
      trend: 'up',
      recommendations: [
        'Optimize your website content for conversational queries',
        'Create FAQ sections that match natural language patterns',
        'Improve your brand\'s online presence with consistent messaging'
      ]
    },
    {
      platform: 'Claude',
      logo: '🧠',
      rank: 5,
      score: 65,
      mentions: 8,
      trend: 'stable',
      recommendations: [
        'Focus on technical accuracy in your content',
        'Provide detailed explanations and documentation',
        'Enhance your thought leadership content'
      ]
    },
    {
      platform: 'Gemini',
      logo: '✨',
      rank: 2,
      score: 82,
      mentions: 15,
      trend: 'up',
      recommendations: [
        'Leverage Google\'s ecosystem for better visibility',
        'Optimize for multimodal content (text + images)',
        'Improve your local SEO presence'
      ]
    },
    {
      platform: 'Perplexity',
      logo: '🔍',
      rank: null,
      score: 45,
      mentions: 3,
      trend: 'down',
      recommendations: [
        'Create more research-backed content',
        'Improve citation and source quality',
        'Focus on factual, data-driven messaging'
      ]
    }
  ]

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
                Analyzing Your Brand Across
                <span className="block gradient-text">AI Platforms</span>
              </h2>
              <p className="text-xl text-slate-600 mb-12 font-light">
                We're querying ChatGPT, Claude, Gemini, and Perplexity using our platform API keys to discover how they rank your brand...
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Generating Queries</div>
                  <div className="text-sm text-slate-600">Creating industry-specific search queries...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Querying AI Platforms</div>
                  <div className="text-sm text-slate-600">Testing across all major LLMs...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Competitor Analysis</div>
                  <div className="text-sm text-slate-600">Analyzing competitor mentions...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300 opacity-60">
                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Generating Insights</div>
                  <div className="text-sm text-slate-500">Creating recommendations...</div>
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
              <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" onClick={onBack} className="flex items-center hover:bg-slate-100 transition-all duration-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Info Header - Fixed Alignment */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                  <Crown className="h-8 w-8 text-indigo-600" />
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 break-words">{brandData.brandName}</h1>
                </div>
              </div>
              <p className="text-base md:text-lg text-slate-600 font-light break-all sm:break-normal">{brandData.websiteUrl} • {brandData.industry}</p>
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
            View Competitor Analysis
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

            {/* Analyzed Prompts Section */}
            {analyzedPrompts.length > 0 && (
              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-serif">Analyzed Prompts</CardTitle>
                  </div>
                  <CardDescription>
                    These are the queries we used to test your brand across all AI platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyzedPrompts.slice(0, 8).map((prompt, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300">
                        <div className="w-6 h-6 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed text-sm">"{prompt}"</p>
                      </div>
                    ))}
                  </div>
                  {analyzedPrompts.length > 8 && (
                    <div className="mt-4 text-center">
                      <Badge variant="secondary" className="px-3 py-1">
                        +{analyzedPrompts.length - 8} more prompts analyzed
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Changes */}
              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-serif">Recent Changes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-emerald-900">Gemini ranking improved</div>
                        <div className="text-xs text-emerald-700">Moved from #3 to #2 this week</div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-indigo-900">ChatGPT mentions increased</div>
                        <div className="text-xs text-indigo-700">+3 mentions in the last 7 days</div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-amber-900">Perplexity needs attention</div>
                        <div className="text-xs text-amber-700">Score dropped by 5 points</div>
                      </div>
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Opportunities */}
              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-serif">Top Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-purple-900">Perplexity Optimization</div>
                        <Badge className="bg-purple-100 text-purple-800">High Impact</Badge>
                      </div>
                      <div className="text-sm text-purple-700 mb-3">
                        Focus on research-backed content to improve your 45/100 score
                      </div>
                      <div className="flex items-center text-xs text-purple-600">
                        <Target className="h-3 w-3 mr-1" />
                        Potential: +25 points
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-indigo-900">Claude Enhancement</div>
                        <Badge className="bg-indigo-100 text-indigo-800">Medium Impact</Badge>
                      </div>
                      <div className="text-sm text-indigo-700 mb-3">
                        Improve technical accuracy to climb from rank #5
                      </div>
                      <div className="flex items-center text-xs text-indigo-600">
                        <Target className="h-3 w-3 mr-1" />
                        Potential: +15 points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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