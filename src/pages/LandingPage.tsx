import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ArrowRight, BarChart3, Target, TrendingUp, Sparkles, Zap, Shield, Crown, Settings } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: (url: string) => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!websiteUrl.trim()) return

    setIsLoading(true)
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500))
    onGetStarted(websiteUrl.trim())
    setIsLoading(false)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-white/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div 
              className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105" 
              onClick={() => window.location.reload()}
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
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#features" 
                className="text-slate-600 hover:text-slate-900 transition-all duration-300 font-medium cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-slate-600 hover:text-slate-900 transition-all duration-300 font-medium cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Pricing
              </a>

              <Button 
                variant="outline" 
                size="sm" 
                className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
                onClick={() => alert('Sign in functionality would be implemented here')}
              >
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center mesh-gradient">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl floating-animation" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full glass-card mb-8 group hover:scale-105 transition-all duration-300">
              <Crown className="h-5 w-5 mr-3 text-indigo-600" />
              <span className="text-indigo-700 font-semibold">Premium AI Brand Intelligence</span>
              <Sparkles className="h-4 w-4 ml-2 text-purple-500" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-tight">
              <span className="block text-slate-900">Dominate</span>
              <span className="block gradient-text">AI Search Results</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Discover how ChatGPT, Claude, Gemini, and Perplexity rank your brand. 
              Get actionable insights to boost your AI visibility and outrank competitors.
            </p>

            {/* CTA Form */}
            <div className="max-w-lg mx-auto mb-16">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <Input
                    type="text"
                    placeholder="Enter your website URL (e.g., example.com)"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="relative h-16 text-lg px-6 rounded-2xl border-2 border-white/20 bg-white/80 backdrop-blur-sm focus:border-indigo-400 focus:bg-white transition-all duration-300 placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="relative w-full h-16 text-lg rounded-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 premium-glow transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading || !websiteUrl.trim() || !isValidUrl(websiteUrl)}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Analyzing Your Brand...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Zap className="mr-3 h-6 w-6" />
                      Get My Premium Report
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                </Button>
              </form>
              <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-green-500" />
                  Free Analysis
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                  No Credit Card
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-1 text-indigo-500" />
                  60 Second Results
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">4.9/5</div>
                <div className="text-sm text-slate-500">User Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">10K+</div>
                <div className="text-sm text-slate-500">Brands Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">4</div>
                <div className="text-sm text-slate-500">AI Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-700">24/7</div>
                <div className="text-sm text-slate-500">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
              <Target className="h-4 w-4 mr-2" />
              Premium Features
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
              Everything You Need to
              <span className="block gradient-text">Dominate AI Search</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Comprehensive analytics and actionable insights to improve your brand's AI visibility across all major platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="relative p-8 rounded-3xl glass-card hover:luxury-shadow transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 text-center">Multi-LLM Tracking</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Monitor your brand rankings across ChatGPT, Claude, Gemini, and Perplexity with real-time updates and detailed analytics
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative p-8 rounded-3xl glass-card hover:luxury-shadow transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 text-center">Competitor Intelligence</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Compare your performance against competitors and identify opportunities to outrank them with strategic insights
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative p-8 rounded-3xl glass-card hover:luxury-shadow transition-all duration-500 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 rounded-3xl"></div>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4 text-center">Actionable Insights</h3>
                  <p className="text-slate-600 text-center leading-relaxed">
                    Get platform-specific recommendations and proven strategies to improve your rankings and AI visibility
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-slate-300 font-light">
              Join thousands of brands optimizing their AI presence
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                99.9%
              </div>
              <div className="text-slate-300 font-medium">Uptime</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                &lt;50ms
              </div>
              <div className="text-slate-300 font-medium">Response Time</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                1M+
              </div>
              <div className="text-slate-300 font-medium">Queries Analyzed</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl md:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-slate-300 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gradient-to-br from-slate-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6">
              <Crown className="h-4 w-4 mr-2" />
              Simple Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
              Start Free, Scale as You
              <span className="block gradient-text">Grow</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Get started with our free analysis, then upgrade for advanced features and deeper insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300 relative">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Free</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-6">$0</div>
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">1 brand analysis</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">4 AI platforms</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Basic recommendations</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800">
                    Get Started Free
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-6">$29<span className="text-lg text-slate-600">/mo</span></div>
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Unlimited analyses</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Competitor tracking</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Advanced insights</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Monthly reports</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Start Pro Trial
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="glass-card border-0 hover:luxury-shadow transition-all duration-300 relative">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-slate-900 mb-6">Custom</div>
                  <ul className="space-y-4 text-left mb-8">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Multiple brands</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">API access</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Custom integrations</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-slate-700">Dedicated support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}