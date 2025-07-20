import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import LandingPage from './pages/LandingPage'
import BrandSetupPage from './pages/BrandSetupPage'
import DashboardPage from './pages/DashboardPage'
import CompetitorAnalysisPage from './pages/CompetitorAnalysisPage'
import { BarChart3 } from 'lucide-react'

type Page = 'landing' | 'setup' | 'dashboard' | 'competitors'

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

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [brandData, setBrandData] = useState<BrandData | null>(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // If user just authenticated and we're on landing page, check for existing data
      if (state.user && !state.isLoading && currentPage === 'landing') {
        try {
          // Check if user has any existing brand analyses
          const existingAnalyses = await blink.db.brand_analyses.list({
            where: { userId: state.user.id },
            limit: 1
          })
          
          if (existingAnalyses.length > 0) {
            // User has existing data, load the most recent analysis
            const latestAnalysis = existingAnalyses[0]
            const brandData = {
              websiteUrl: latestAnalysis.websiteUrl,
              brandName: latestAnalysis.brandName,
              email: state.user.email || '',
              industry: latestAnalysis.industry,
              location: latestAnalysis.location,
              keywords: latestAnalysis.keywords || [],
              competitors: latestAnalysis.competitors || [],
              competitorChoice: latestAnalysis.competitorChoice as 'auto' | 'manual'
            }
            setBrandData(brandData)
            setCurrentPage('dashboard')
          } else {
            // No existing data, go to setup
            setCurrentPage('setup')
          }
        } catch (error) {
          console.error('Error checking existing analyses:', error)
          // On error, just go to setup
          setCurrentPage('setup')
        }
      }
    })
    return unsubscribe
  }, [currentPage])

  const handleGetStarted = (url: string) => {
    setWebsiteUrl(url)
    setCurrentPage('setup')
  }

  const handleBrandSetupComplete = (data: BrandData) => {
    setBrandData(data)
    setCurrentPage('dashboard')
  }

  const handleBackToLanding = () => {
    setCurrentPage('landing')
    setWebsiteUrl('')
    setBrandData(null)
  }

  const handleBackToSetup = () => {
    setCurrentPage('setup')
  }

  const handleViewCompetitors = () => {
    setCurrentPage('competitors')
  }

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard')
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, show sign in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
              </div>
              <span className="text-3xl font-serif font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                RankAI
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to access your brand analytics dashboard</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign In with Blink
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                New to RankAI? Your account will be created automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {currentPage === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      {currentPage === 'setup' && (
        <BrandSetupPage 
          websiteUrl={websiteUrl} 
          onBack={handleBackToLanding}
          onComplete={handleBrandSetupComplete}
        />
      )}
      {currentPage === 'dashboard' && brandData && (
        <DashboardPage 
          brandData={brandData}
          onBack={handleBackToSetup}
          onViewCompetitors={handleViewCompetitors}
        />
      )}
      {currentPage === 'competitors' && brandData && (
        <CompetitorAnalysisPage 
          brandData={brandData}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  )
}

export default App