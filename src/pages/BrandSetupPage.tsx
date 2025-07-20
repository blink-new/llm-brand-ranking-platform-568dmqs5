import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowLeft, ArrowRight, Plus, X, BarChart3, Crown, Sparkles, Target, Users } from 'lucide-react'

interface BrandData {
  websiteUrl: string
  brandName: string
  email: string
  industry: string
  location: string
  keywords: string[]
  competitors: string[]
  competitorChoice: 'auto' | 'manual'
}

interface BrandSetupPageProps {
  websiteUrl: string
  onBack: () => void
  onComplete: (data: BrandData) => void
}

export default function BrandSetupPage({ websiteUrl, onBack, onComplete }: BrandSetupPageProps) {
  const [formData, setFormData] = useState({
    brandName: '',
    email: '',
    industry: '',
    location: '',
    keywords: [] as string[],
    competitors: [] as string[],
    competitorChoice: 'auto' as 'auto' | 'manual'
  })
  
  const [newKeyword, setNewKeyword] = useState('')
  const [newCompetitor, setNewCompetitor] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 
    'Real Estate', 'Food & Beverage', 'Travel', 'Fashion', 'Automotive',
    'Marketing', 'Consulting', 'Manufacturing', 'Entertainment', 'Other'
  ]

  const locations = [
    'Global',
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria',
    'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Czech Republic',
    'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Estonia', 'Ethiopia',
    'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala',
    'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg',
    'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
    'Pakistan', 'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
    'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
    'Taiwan', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam',
    'Other'
  ]

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }))
      setNewCompetitor('')
    }
  }

  const removeCompetitor = (competitor: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const brandData: BrandData = {
      websiteUrl,
      ...formData
    }
    
    onComplete(brandData)
    setIsLoading(false)
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
            <Button variant="ghost" onClick={onBack} className="flex items-center hover:bg-slate-100 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Progress indicator */}
        <div className="mb-16">
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                ✓
              </div>
              <span className="ml-3 text-sm font-semibold text-slate-700">Website</span>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"></div>
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg pulse-glow">
                2
              </div>
              <span className="ml-3 text-sm font-bold text-slate-900">Brand Details</span>
            </div>
            <div className="w-24 h-1 bg-slate-200 rounded-full"></div>
            <div className="flex items-center group">
              <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-lg font-bold">
                3
              </div>
              <span className="ml-3 text-sm text-slate-500">Analysis</span>
            </div>
          </div>
        </div>

        {/* Website confirmation */}
        <Card className="mb-12 glass-card border-0 hover:luxury-shadow transition-all duration-300">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Analyzing website:</p>
                  <p className="text-xl font-bold text-slate-900">{websiteUrl}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onBack} className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main form */}
        <Card className="glass-card border-0 luxury-shadow">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-indigo-500" />
              <CardTitle className="text-3xl font-serif">Tell us about your brand</CardTitle>
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <CardDescription className="text-lg text-slate-600 max-w-2xl mx-auto">
              Help us create more accurate queries and better analysis by providing some details about your business.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Required fields */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="brandName" className="text-base font-semibold text-slate-700">Brand Name *</Label>
                  <Input
                    id="brandName"
                    placeholder="Your brand or company name"
                    value={formData.brandName}
                    onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                    className="h-12 text-base border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-semibold text-slate-700">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 text-base border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="industry" className="text-base font-semibold text-slate-700">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger className="h-12 text-base border-slate-200 focus:border-indigo-400 rounded-xl">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry} className="text-base">{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="location" className="text-base font-semibold text-slate-700">Primary Market</Label>
                  <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="h-12 text-base border-slate-200 focus:border-indigo-400 rounded-xl">
                      <SelectValue placeholder="Select your primary market" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      {locations.map(location => (
                        <SelectItem key={location} value={location} className="text-base">{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Keywords section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-indigo-500" />
                  <Label className="text-base font-semibold text-slate-700">Keywords (Optional)</Label>
                </div>
                <p className="text-slate-600">
                  Add relevant keywords that customers might use to find businesses like yours
                </p>
                <div className="flex space-x-3">
                  <Input
                    placeholder="e.g., web design, digital marketing"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="h-12 text-base border-slate-200 focus:border-indigo-400 rounded-xl flex-1"
                  />
                  <Button 
                    type="button" 
                    onClick={addKeyword} 
                    size="sm" 
                    className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-all duration-300"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {formData.keywords.map(keyword => (
                      <Badge key={keyword} variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-all duration-300">
                        {keyword}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors duration-200" 
                          onClick={() => removeKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Competitors section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <Label className="text-base font-semibold text-slate-700">Competitor Analysis</Label>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-8">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="competitorChoice"
                        value="auto"
                        checked={formData.competitorChoice === 'auto'}
                        onChange={(e) => setFormData(prev => ({ ...prev, competitorChoice: e.target.value as 'auto' }))}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-base font-medium text-slate-700 group-hover:text-indigo-600 transition-colors duration-200">Auto-discover competitors</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="competitorChoice"
                        value="manual"
                        checked={formData.competitorChoice === 'manual'}
                        onChange={(e) => setFormData(prev => ({ ...prev, competitorChoice: e.target.value as 'manual' }))}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-base font-medium text-slate-700 group-hover:text-indigo-600 transition-colors duration-200">I'll specify competitors</span>
                    </label>
                  </div>

                  {formData.competitorChoice === 'manual' && (
                    <>
                      <div className="flex space-x-3">
                        <Input
                          placeholder="e.g., competitor.com"
                          value={newCompetitor}
                          onChange={(e) => setNewCompetitor(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
                          className="h-12 text-base border-slate-200 focus:border-purple-400 rounded-xl flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={addCompetitor} 
                          size="sm"
                          className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl transition-all duration-300"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.competitors.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {formData.competitors.map(competitor => (
                            <Badge key={competitor} variant="outline" className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-100 transition-all duration-300">
                              {competitor}
                              <X 
                                className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors duration-200" 
                                onClick={() => removeCompetitor(competitor)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-8">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto h-16 px-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl premium-glow transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading || !formData.brandName || !formData.email || !formData.industry}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Starting Analysis...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="mr-3 h-6 w-6" />
                      Start Premium Analysis
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}