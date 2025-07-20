import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import LandingPage from './pages/LandingPage'
import BrandSetupPage from './pages/BrandSetupPage'
import DashboardPage from './pages/DashboardPage'
import CompetitorAnalysisPage from './pages/CompetitorAnalysisPage'

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
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

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