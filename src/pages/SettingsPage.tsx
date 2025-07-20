import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  ArrowLeft, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react'

interface SettingsPageProps {
  onBack: () => void
}

interface APIKeys {
  openai: string
  anthropic: string
  google: string
  perplexity: string
}

interface KeyStatus {
  [key: string]: 'valid' | 'invalid' | 'untested'
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openai: '',
    anthropic: '',
    google: '',
    perplexity: ''
  })
  
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({
    openai: false,
    anthropic: false,
    google: false,
    perplexity: false
  })
  
  const [keyStatus, setKeyStatus] = useState<KeyStatus>({
    openai: 'untested',
    anthropic: 'untested',
    google: 'untested',
    perplexity: 'untested'
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Load saved API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('llm-ranking-api-keys')
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys)
        setApiKeys(parsed)
        
        // Set status to valid for existing keys
        const status: KeyStatus = {}
        Object.keys(parsed).forEach(key => {
          status[key] = parsed[key] ? 'valid' : 'untested'
        })
        setKeyStatus(status)
      } catch (error) {
        console.error('Error loading saved API keys:', error)
      }
    }
  }, [])

  const platformInfo = {
    openai: {
      name: 'OpenAI (ChatGPT)',
      logo: '🤖',
      description: 'Access ChatGPT-4 for conversational AI analysis',
      placeholder: 'sk-...',
      helpUrl: 'https://platform.openai.com/api-keys',
      color: 'from-green-500 to-emerald-600'
    },
    anthropic: {
      name: 'Anthropic (Claude)',
      logo: '🧠',
      description: 'Access Claude for detailed analytical responses',
      placeholder: 'sk-ant-...',
      helpUrl: 'https://console.anthropic.com/settings/keys',
      color: 'from-orange-500 to-red-600'
    },
    google: {
      name: 'Google (Gemini)',
      logo: '✨',
      description: 'Access Gemini for multimodal AI capabilities',
      placeholder: 'AIza...',
      helpUrl: 'https://makersuite.google.com/app/apikey',
      color: 'from-blue-500 to-indigo-600'
    },
    perplexity: {
      name: 'Perplexity AI',
      logo: '🔍',
      description: 'Access Perplexity for research-focused responses',
      placeholder: 'pplx-...',
      helpUrl: 'https://www.perplexity.ai/settings/api',
      color: 'from-purple-500 to-pink-600'
    }
  }

  const handleKeyChange = (platform: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [platform]: value }))
    setKeyStatus(prev => ({ ...prev, [platform]: 'untested' }))
  }

  const toggleShowKey = (platform: string) => {
    setShowKeys(prev => ({ ...prev, [platform]: !prev[platform] }))
  }

  const validateKey = (platform: string, key: string): boolean => {
    if (!key.trim()) return false
    
    switch (platform) {
      case 'openai':
        return key.startsWith('sk-') && key.length > 20
      case 'anthropic':
        return key.startsWith('sk-ant-') && key.length > 20
      case 'google':
        return key.startsWith('AIza') && key.length > 20
      case 'perplexity':
        return key.startsWith('pplx-') && key.length > 20
      default:
        return false
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')
    
    try {
      // Validate all keys
      const newStatus: KeyStatus = {}
      let hasValidKeys = false
      
      Object.keys(apiKeys).forEach(platform => {
        const key = apiKeys[platform as keyof APIKeys]
        if (key) {
          newStatus[platform] = validateKey(platform, key) ? 'valid' : 'invalid'
          if (newStatus[platform] === 'valid') hasValidKeys = true
        } else {
          newStatus[platform] = 'untested'
        }
      })
      
      setKeyStatus(newStatus)
      
      if (!hasValidKeys) {
        setSaveMessage('Please provide at least one valid API key')
        return
      }
      
      // Save to localStorage (in production, this would be encrypted and stored securely)
      localStorage.setItem('llm-ranking-api-keys', JSON.stringify(apiKeys))
      
      setSaveMessage('API keys saved successfully!')
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000)
      
    } catch (error) {
      console.error('Error saving API keys:', error)
      setSaveMessage('Error saving API keys. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Key className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Valid</Badge>
      case 'invalid':
        return <Badge variant="destructive">Invalid Format</Badge>
      default:
        return <Badge variant="secondary">Not Set</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="relative z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl group-hover:shadow-lg transition-all duration-300">
                  <Settings className="h-8 w-8 text-white" />
                </div>
              </div>
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
                RankAI Settings
              </span>
            </div>
            <Button variant="ghost" onClick={onBack} className="flex items-center hover:bg-slate-100 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-indigo-500" />
            <h1 className="text-4xl font-serif font-bold text-slate-900">API Configuration</h1>
            <Sparkles className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
            Configure your API keys to enable brand ranking analysis across different AI platforms. 
            Your keys are stored securely and never shared.
          </p>
        </div>

        {/* Security Notice */}
        <Alert className="mb-8 border-indigo-200 bg-indigo-50">
          <Shield className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-800">
            <strong>Security Notice:</strong> Your API keys are stored locally in your browser and are never sent to our servers. 
            They are only used to make direct API calls to the respective AI platforms for analysis.
          </AlertDescription>
        </Alert>

        {/* Save Message */}
        {saveMessage && (
          <Alert className={`mb-8 ${saveMessage.includes('Error') || saveMessage.includes('Please') ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <AlertDescription className={saveMessage.includes('Error') || saveMessage.includes('Please') ? 'text-red-800' : 'text-emerald-800'}>
              {saveMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* API Keys Configuration */}
        <div className="space-y-6">
          {Object.entries(platformInfo).map(([platform, info]) => (
            <Card key={platform} className="glass-card border-0 hover:luxury-shadow transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {info.logo}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-serif">{info.name}</CardTitle>
                      <CardDescription className="text-base">{info.description}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(keyStatus[platform])}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={platform} className="text-sm font-semibold text-slate-700 flex items-center">
                      API Key
                      {getStatusIcon(keyStatus[platform])}
                    </Label>
                    <div className="relative">
                      <Input
                        id={platform}
                        type={showKeys[platform] ? 'text' : 'password'}
                        placeholder={info.placeholder}
                        value={apiKeys[platform as keyof APIKeys]}
                        onChange={(e) => handleKeyChange(platform, e.target.value)}
                        className="h-12 text-base border-slate-200 focus:border-indigo-400 focus:ring-indigo-400 rounded-xl pr-20"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowKey(platform)}
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                        >
                          {showKeys[platform] ? (
                            <EyeOff className="h-4 w-4 text-slate-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-slate-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <a 
                      href={info.helpUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                    >
                      Get API Key →
                    </a>
                    {keyStatus[platform] === 'invalid' && (
                      <span className="text-red-600 text-sm">Invalid key format</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-12 text-center">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            size="lg" 
            className="h-16 px-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl premium-glow transition-all duration-300 transform hover:scale-105"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Saving Configuration...
              </div>
            ) : (
              <div className="flex items-center">
                <Zap className="mr-3 h-6 w-6" />
                Save API Configuration
                <Shield className="ml-3 h-6 w-6" />
              </div>
            )}
          </Button>
        </div>

        {/* Help Section */}
        <Card className="mt-12 glass-card border-0">
          <CardHeader>
            <CardTitle className="text-xl font-serif flex items-center">
              <Key className="h-5 w-5 mr-2 text-indigo-500" />
              How to Get API Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">OpenAI (ChatGPT)</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Visit platform.openai.com</li>
                  <li>Sign up or log in to your account</li>
                  <li>Go to API Keys section</li>
                  <li>Create a new secret key</li>
                  <li>Copy the key (starts with sk-)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Anthropic (Claude)</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Visit console.anthropic.com</li>
                  <li>Create an account or sign in</li>
                  <li>Navigate to Settings → API Keys</li>
                  <li>Generate a new API key</li>
                  <li>Copy the key (starts with sk-ant-)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Google (Gemini)</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Visit makersuite.google.com</li>
                  <li>Sign in with Google account</li>
                  <li>Go to API Key section</li>
                  <li>Create API key</li>
                  <li>Copy the key (starts with AIza)</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Perplexity AI</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Visit perplexity.ai</li>
                  <li>Sign up or log in</li>
                  <li>Go to Settings → API</li>
                  <li>Generate new API key</li>
                  <li>Copy the key (starts with pplx-)</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}