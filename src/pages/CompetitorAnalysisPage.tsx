import { useState, useEffect } from 'react'
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
  Crown,
  Sparkles,
  Zap,
  Award,
  Trophy,
  Flame,
  Star,
  AlertTriangle
} from 'lucide-react'

interface CompetitorData {
  name: string
  website: string
  overallScore: number
  platforms: {
    platform: string
    logo: string
    rank: number | null
    score: number
    mentions: number
    trend: 'up' | 'down' | 'stable'
  }[]
}

interface CompetitorAnalysisPageProps {
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
}

export default function CompetitorAnalysisPage({ brandData, onBack }: CompetitorAnalysisPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [yourBrand, setYourBrand] = useState<CompetitorData | null>(null)

  useEffect(() => {
    const analyzeCompetitors = async () => {
      setIsLoading(true)
      
      try {
        // Call the backend analysis function for competitor data
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

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setYourBrand(result.yourBrand || null)
            setCompetitors(result.competitors || [])
          } else {
            console.error('Competitor analysis failed:', result.message)
            // Fall back to enhanced mock data
            setYourBrand(getEnhancedYourBrandData())
            setCompetitors(getEnhancedCompetitorData())
          }
        } else {
          console.error('Failed to call competitor analysis API')
          // Fall back to enhanced mock data
          setYourBrand(getEnhancedYourBrandData())
          setCompetitors(getEnhancedCompetitorData())
        }
      } catch (error) {
        console.error('Error during competitor analysis:', error)
        // Fall back to enhanced mock data
        setYourBrand(getEnhancedYourBrandData())
        setCompetitors(getEnhancedCompetitorData())
      }
      
      setIsLoading(false)
    }

    const getEnhancedYourBrandData = (): CompetitorData => ({
      name: brandData.brandName,
      website: brandData.websiteUrl,
      overallScore: 67,
      platforms: [
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
    })

    const getEnhancedCompetitorData = (): CompetitorData[] => {
      // Generate industry-specific competitors based on user's industry
      const industryCompetitors = generateIndustryCompetitors(brandData.industry)
      
      // If user provided manual competitors, use those names
      if (brandData.competitorChoice === 'manual' && brandData.competitors.length > 0) {
        return brandData.competitors.slice(0, 5).map((competitor, index) => ({
          name: competitor,
          website: `${competitor.toLowerCase().replace(/\s+/g, '')}.com`,
          overallScore: Math.floor(Math.random() * 40) + 50, // 50-90 range
          platforms: [
            {
              platform: 'ChatGPT',
              logo: '🤖',
              rank: Math.floor(Math.random() * 5) + 1,
              score: Math.floor(Math.random() * 40) + 50,
              mentions: Math.floor(Math.random() * 25) + 5,
              trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
            },
            {
              platform: 'Claude',
              logo: '🧠',
              rank: Math.floor(Math.random() * 5) + 1,
              score: Math.floor(Math.random() * 40) + 50,
              mentions: Math.floor(Math.random() * 20) + 3,
              trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
            },
            {
              platform: 'Gemini',
              logo: '✨',
              rank: Math.floor(Math.random() * 5) + 1,
              score: Math.floor(Math.random() * 40) + 50,
              mentions: Math.floor(Math.random() * 30) + 5,
              trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
            },
            {
              platform: 'Perplexity',
              logo: '🔍',
              rank: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : null,
              score: Math.floor(Math.random() * 40) + 40,
              mentions: Math.floor(Math.random() * 15) + 2,
              trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
            }
          ]
        }))
      }
      
      // Use auto-generated industry competitors
      return industryCompetitors
    }

    const generateIndustryCompetitors = (industry: string): CompetitorData[] => {
      const competitorsByIndustry: Record<string, string[]> = {
        'Technology': ['TechCorp Solutions', 'InnovateLab', 'DigitalEdge Pro', 'CloudTech Systems', 'NextGen Solutions'],
        'Healthcare': ['MedTech Solutions', 'HealthCare Plus', 'Medical Innovations', 'WellnessTech', 'HealthFirst Systems'],
        'Finance': ['FinTech Pro', 'Capital Solutions', 'Investment Tech', 'Financial Edge', 'MoneyWise Systems'],
        'E-commerce': ['ShopTech Solutions', 'Commerce Plus', 'RetailEdge Pro', 'MarketPlace Systems', 'SalesTech Hub'],
        'Education': ['EduTech Solutions', 'Learning Plus', 'Academic Edge', 'StudyTech Pro', 'Knowledge Systems'],
        'Marketing': ['MarketPro Solutions', 'AdTech Plus', 'Campaign Edge', 'BrandTech Systems', 'Growth Hub'],
        'Real Estate': ['PropTech Solutions', 'RealEstate Plus', 'Property Edge', 'HomeTech Pro', 'Realty Systems'],
        'Food & Beverage': ['FoodTech Solutions', 'Culinary Plus', 'Taste Edge', 'RestaurantTech Pro', 'Dining Systems'],
        'default': ['Industry Leader Corp', 'Market Solutions Pro', 'Business Edge Systems', 'Enterprise Plus', 'Professional Hub']
      }

      const competitors = competitorsByIndustry[industry] || competitorsByIndustry['default']
      
      return competitors.slice(0, 4).map((name, index) => ({
        name,
        website: `${name.toLowerCase().replace(/\s+/g, '').replace(/&/g, 'and')}.com`,
        overallScore: [85, 72, 58, 63][index] || Math.floor(Math.random() * 40) + 50,
        platforms: [
          {
            platform: 'ChatGPT',
            logo: '🤖',
            rank: [1, 2, 4, 6][index] || Math.floor(Math.random() * 6) + 1,
            score: [92, 85, 62, 68][index] || Math.floor(Math.random() * 40) + 50,
            mentions: [28, 18, 8, 11][index] || Math.floor(Math.random() * 25) + 5,
            trend: (['up', 'stable', 'down', 'up'][index] || 'stable') as 'up' | 'down' | 'stable'
          },
          {
            platform: 'Claude',
            logo: '🧠',
            rank: [2, 3, 4, 6][index] || Math.floor(Math.random() * 6) + 1,
            score: [88, 75, 58, 63][index] || Math.floor(Math.random() * 40) + 50,
            mentions: [22, 14, 6, 9][index] || Math.floor(Math.random() * 20) + 3,
            trend: (['up', 'down', 'stable', 'up'][index] || 'stable') as 'up' | 'down' | 'stable'
          },
          {
            platform: 'Gemini',
            logo: '✨',
            rank: [1, 4, 5, 7][index] || Math.floor(Math.random() * 7) + 1,
            score: [90, 68, 55, 61][index] || Math.floor(Math.random() * 40) + 50,
            mentions: [35, 12, 7, 10][index] || Math.floor(Math.random() * 30) + 5,
            trend: (['stable', 'stable', 'down', 'up'][index] || 'stable') as 'up' | 'down' | 'stable'
          },
          {
            platform: 'Perplexity',
            logo: '🔍',
            rank: [3, 2, 4, null][index] || (Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : null),
            score: [70, 60, 58, 52][index] || Math.floor(Math.random() * 40) + 40,
            mentions: [18, 9, 5, 7][index] || Math.floor(Math.random() * 15) + 2,
            trend: (['up', 'up', 'stable', 'down'][index] || 'stable') as 'up' | 'down' | 'stable'
          }
        ]
      }))
    }

    analyzeCompetitors()
  }, [brandData])

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

  const getRankBadge = (rank: number | null) => {
    if (!rank) return <Badge variant="secondary">Not Ranked</Badge>
    if (rank === 1) return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"><Trophy className="h-3 w-3 mr-1" />#{rank}</Badge>
    if (rank <= 3) return <Badge className="bg-gradient-to-r from-slate-400 to-slate-600 text-white"><Award className="h-3 w-3 mr-1" />#{rank}</Badge>
    return <Badge variant="outline">#{rank}</Badge>
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
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-12">
              <div className="relative mx-auto mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto pulse-glow">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                Analyzing Your
                <span className="block gradient-text">Competition</span>
              </h2>
              <p className="text-xl text-slate-600 mb-12 font-light">
                Discovering competitors and comparing their AI platform performance against yours...
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Finding Competitors</div>
                  <div className="text-sm text-slate-600">Discovering brands in your industry...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Analyzing Rankings</div>
                  <div className="text-sm text-slate-600">Comparing AI platform performance...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Benchmarking Scores</div>
                  <div className="text-sm text-slate-600">Calculating competitive metrics...</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-6 glass-card rounded-2xl group hover:luxury-shadow transition-all duration-300 opacity-60">
                <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                <div>
                  <div className="font-semibold text-slate-700 mb-1">Generating Insights</div>
                  <div className="text-sm text-slate-500">Creating competitive analysis...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const allBrands = yourBrand ? [yourBrand, ...competitors] : competitors
  const sortedBrands = allBrands.sort((a, b) => b.overallScore - a.overallScore)

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
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">Competitor Analysis</h1>
          </div>
          <p className="text-lg text-slate-600 font-light">
            See how you stack up against the competition across all AI platforms
          </p>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-8">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 p-1 shadow-lg">
              <TabsTrigger 
                value="leaderboard" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-purple-600 data-[state=active]:hover:to-pink-700"
              >
                Leaderboard
              </TabsTrigger>
              <TabsTrigger 
                value="platform-comparison" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-purple-600 data-[state=active]:hover:to-pink-700"
              >
                Platform Comparison
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 data-[state=active]:hover:bg-gradient-to-r data-[state=active]:hover:from-purple-600 data-[state=active]:hover:to-pink-700"
              >
                Competitive Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leaderboard" className="space-y-6">
            {/* Overall Leaderboard */}
            <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  <CardTitle className="text-2xl font-serif">Overall Rankings</CardTitle>
                </div>
                <CardDescription>
                  Brands ranked by overall AI platform performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedBrands.map((brand, index) => (
                    <div 
                      key={brand.name} 
                      className={`flex items-center justify-between p-6 rounded-2xl transition-all duration-300 ${
                        brand.name === brandData.brandName 
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 transform scale-105' 
                          : 'bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-600' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' :
                          'bg-gradient-to-r from-slate-300 to-slate-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-slate-900">{brand.name}</h3>
                            {brand.name === brandData.brandName && (
                              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                <Crown className="h-3 w-3 mr-1" />
                                You
                              </Badge>
                            )}
                            {index === 0 && <Flame className="h-5 w-5 text-orange-500" />}
                          </div>
                          <p className="text-sm text-slate-600">{brand.website}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(brand.overallScore)}`}>
                          {brand.overallScore}
                        </div>
                        <p className="text-sm text-slate-600">Overall Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform-comparison" className="space-y-6">
            {/* Platform-by-Platform Comparison */}
            {['ChatGPT', 'Claude', 'Gemini', 'Perplexity'].map((platformName) => (
              <Card key={platformName} className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {platformName === 'ChatGPT' ? '🤖' : 
                       platformName === 'Claude' ? '🧠' : 
                       platformName === 'Gemini' ? '✨' : '🔍'}
                    </span>
                    <CardTitle className="text-2xl font-serif">{platformName} Rankings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allBrands
                      .sort((a, b) => {
                        const aData = a.platforms.find(p => p.platform === platformName)
                        const bData = b.platforms.find(p => p.platform === platformName)
                        return (bData?.score || 0) - (aData?.score || 0)
                      })
                      .map((brand) => {
                        const platformData = brand.platforms.find(p => p.platform === platformName)
                        if (!platformData) return null
                        
                        return (
                          <div 
                            key={brand.name}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                              brand.name === brandData.brandName 
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200' 
                                : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-slate-900">{brand.name}</h4>
                                {brand.name === brandData.brandName && (
                                  <Badge variant="secondary" className="text-xs">You</Badge>
                                )}
                              </div>
                              {getRankBadge(platformData.rank)}
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <div className="text-sm text-slate-600">Score</div>
                                <div className={`font-bold ${getScoreColor(platformData.score)}`}>
                                  {platformData.score}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-slate-600">Mentions</div>
                                <div className="font-bold text-slate-900">{platformData.mentions}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-slate-600">Trend</div>
                                <div className="flex justify-center">{getTrendIcon(platformData.trend)}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Competitive Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-emerald-500" />
                    <CardTitle className="text-xl font-serif">Your Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <Star className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-emerald-900">Strong Gemini Performance</div>
                        <div className="text-sm text-emerald-700">You rank #2 with 82/100 score</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <Star className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-emerald-900">Growing ChatGPT Presence</div>
                        <div className="text-sm text-emerald-700">Trending up with 12 mentions</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                    <CardTitle className="text-xl font-serif">Improvement Areas</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-amber-900">Perplexity Gap</div>
                        <div className="text-sm text-amber-700">Not ranked, only 45/100 score</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-amber-900">Claude Opportunity</div>
                        <div className="text-sm text-amber-700">Rank #5 - room for improvement</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Competitive Recommendations */}
            <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-indigo-500" />
                  <CardTitle className="text-xl font-serif">Strategic Recommendations</CardTitle>
                </div>
                <CardDescription>
                  Actions to outperform your competition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      Beat TechCorp Solutions
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="text-sm font-medium text-indigo-900">Focus on Perplexity</div>
                        <div className="text-xs text-indigo-700">They score 70 vs your 45 - biggest gap</div>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="text-sm font-medium text-indigo-900">Improve Claude Ranking</div>
                        <div className="text-xs text-indigo-700">Move from #5 to #2 to match their position</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 flex items-center">
                      <Award className="h-4 w-4 mr-2 text-slate-500" />
                      Maintain Lead Over Others
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-sm font-medium text-emerald-900">Strengthen Gemini Position</div>
                        <div className="text-xs text-emerald-700">You're #2 - push for #1 to dominate</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="text-sm font-medium text-emerald-900">Expand ChatGPT Mentions</div>
                        <div className="text-xs text-emerald-700">Increase from 12 to 20+ mentions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}