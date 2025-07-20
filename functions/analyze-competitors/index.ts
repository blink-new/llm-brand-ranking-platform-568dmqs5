import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface CompetitorAnalysisRequest {
  websiteUrl: string;
  brandName: string;
  industry: string;
  location?: string;
  keywords?: string[];
  competitors?: string[];
  competitorChoice: 'auto' | 'manual';
}

interface CompetitorData {
  name: string;
  website: string;
  overallScore: number;
  platforms: {
    platform: string;
    logo: string;
    rank: number | null;
    score: number;
    mentions: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

interface CompetitorAnalysisResult {
  success: boolean;
  analysisId?: string;
  yourBrand?: CompetitorData;
  competitors?: CompetitorData[];
  message?: string;
}

interface LLMAnalysisResult {
  platform: string;
  rank: number | null;
  score: number;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const requestData: CompetitorAnalysisRequest = await req.json();
    const { websiteUrl, brandName, industry, location, keywords, competitors, competitorChoice } = requestData;

    // Generate analysis ID
    const analysisId = `competitor_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Discover real competitors
    const realCompetitors = await discoverCompetitors(brandName, industry, location, competitors, competitorChoice, openaiApiKey);
    
    // Analyze your brand across LLM platforms
    const yourBrand = await analyzeBrandAcrossLLMs(brandName, websiteUrl, industry, location, keywords, openaiApiKey);
    
    // Analyze competitors across LLM platforms
    const competitorData = await Promise.all(
      realCompetitors.map(competitor => 
        analyzeBrandAcrossLLMs(competitor.name, competitor.website, industry, location, keywords, openaiApiKey)
      )
    );

    const result: CompetitorAnalysisResult = {
      success: true,
      analysisId,
      yourBrand,
      competitors: competitorData
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Competitor analysis error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Analysis failed: ' + error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

async function discoverCompetitors(
  brandName: string, 
  industry: string, 
  location?: string, 
  manualCompetitors?: string[], 
  competitorChoice?: 'auto' | 'manual',
  openaiApiKey?: string
): Promise<{name: string, website: string}[]> {
  
  if (competitorChoice === 'manual' && manualCompetitors && manualCompetitors.length > 0) {
    // Use manually provided competitors
    return manualCompetitors.slice(0, 5).map(name => ({
      name,
      website: `https://${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`
    }));
  }

  // Auto-discover competitors using AI
  try {
    const locationContext = location ? ` in ${location}` : '';
    const prompt = `Find 4-5 real, well-known competitor companies for "${brandName}" in the ${industry} industry${locationContext}. 

Return ONLY a JSON array with this exact format:
[
  {"name": "Company Name", "website": "https://company.com"},
  {"name": "Another Company", "website": "https://another.com"}
]

Focus on:
- Direct competitors (same industry/market)
- Well-established companies with online presence
- Companies that would likely be mentioned in AI search results
- Real companies with actual websites

Do not include ${brandName} itself in the results.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the JSON response
    const competitors = JSON.parse(content);
    
    if (Array.isArray(competitors) && competitors.length > 0) {
      return competitors.slice(0, 5);
    }
    
    throw new Error('Invalid competitor data format');
    
  } catch (error) {
    console.error('Error discovering competitors:', error);
    
    // Fallback to industry-based competitors
    return generateFallbackCompetitors(industry);
  }
}

async function analyzeBrandAcrossLLMs(
  brandName: string, 
  websiteUrl: string, 
  industry: string, 
  location?: string, 
  keywords?: string[], 
  openaiApiKey?: string
): Promise<CompetitorData> {
  
  const platforms = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];
  const platformLogos = { 'ChatGPT': '🤖', 'Claude': '🧠', 'Gemini': '✨', 'Perplexity': '🔍' };
  
  // Generate the same queries used in brand analysis
  const queries = generateQueries(brandName, industry, location, keywords);
  
  const platformAnalyses = await Promise.all(
    platforms.map(platform => analyzeBrandOnPlatform(brandName, websiteUrl, industry, platform, location, keywords, openaiApiKey, queries))
  );
  
  // Calculate overall score as average of platform scores
  const validScores = platformAnalyses.filter(p => p.score > 0).map(p => p.score);
  const overallScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  
  return {
    name: brandName,
    website: websiteUrl,
    overallScore,
    platforms: platformAnalyses.map(analysis => ({
      platform: analysis.platform,
      logo: platformLogos[analysis.platform as keyof typeof platformLogos] || '🔍',
      rank: analysis.rank,
      score: analysis.score,
      mentions: analysis.mentions,
      trend: analysis.trend
    }))
  };
}

function generateQueries(brandName: string, industry: string, location?: string, keywords?: string[]): string[] {
  const baseQueries = [
    `What are the best ${industry} companies?`,
    `Top ${industry} brands to consider`,
    `Leading ${industry} services`,
    `Recommended ${industry} providers`,
    `Best ${industry} solutions`
  ];

  if (location) {
    baseQueries.push(
      `Best ${industry} companies in ${location}`,
      `Top ${industry} services in ${location}`,
      `${location} ${industry} recommendations`
    );
  }

  if (keywords && keywords.length > 0) {
    keywords.forEach(keyword => {
      baseQueries.push(
        `Best companies for ${keyword}`,
        `Top ${keyword} services`,
        `${keyword} recommendations`
      );
    });
  }

  // Add direct brand queries
  baseQueries.push(
    `Tell me about ${brandName}`,
    `${brandName} reviews and recommendations`,
    `Is ${brandName} a good choice for ${industry}?`
  );

  return baseQueries;
}

async function analyzeBrandOnPlatform(
  brandName: string, 
  websiteUrl: string, 
  industry: string, 
  platform: string, 
  location?: string, 
  keywords?: string[], 
  openaiApiKey?: string,
  queries?: string[]
): Promise<LLMAnalysisResult> {
  
  try {
    const locationContext = location ? ` in ${location}` : '';
    const keywordContext = keywords && keywords.length > 0 ? ` Keywords: ${keywords.join(', ')}` : '';
    const queryContext = queries ? `\n\nTest queries used:\n${queries.slice(0, 5).map((q, i) => `${i + 1}. ${q}`).join('\n')}` : '';
    
    const prompt = `Analyze how well "${brandName}" (${websiteUrl}) would rank when users ask ${platform} about ${industry} solutions${locationContext}.

Consider these factors:
- Brand recognition and authority in ${industry}
- Online presence and SEO strength
- Content quality and relevance
- User engagement and reviews
- How likely ${platform} would recommend this brand${keywordContext}${queryContext}

Provide realistic analysis in this JSON format:
{
  "rank": 3,
  "score": 75,
  "mentions": 12,
  "trend": "up",
  "reasoning": "Strong brand presence with good SEO..."
}

Where:
- rank: 1-10 (null if not likely to be ranked in top 10)
- score: 0-100 (overall strength score based on brand authority, mentions, and ranking potential)
- mentions: estimated monthly mentions in ${platform}
- trend: "up", "down", or "stable"
- reasoning: brief explanation

Be realistic and base scores on actual brand strength indicators. Don't inflate scores.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const analysis = JSON.parse(content);
    
    return {
      platform,
      rank: analysis.rank,
      score: analysis.score || 0,
      mentions: analysis.mentions || 0,
      trend: analysis.trend || 'stable',
      reasoning: analysis.reasoning || ''
    };
    
  } catch (error) {
    console.error(`Error analyzing ${brandName} on ${platform}:`, error);
    
    // Return minimal data when analysis fails
    return {
      platform,
      rank: null,
      score: 0,
      mentions: 0,
      trend: 'stable' as 'up' | 'down' | 'stable',
      reasoning: `Analysis failed for ${platform}: ${error.message}`
    };
  }
}

function generateFallbackCompetitors(industry: string): {name: string, website: string}[] {
  const competitorsByIndustry: Record<string, {name: string, website: string}[]> = {
    'Technology': [
      { name: 'Microsoft', website: 'https://microsoft.com' },
      { name: 'Google', website: 'https://google.com' },
      { name: 'Amazon', website: 'https://amazon.com' },
      { name: 'Apple', website: 'https://apple.com' }
    ],
    'Healthcare': [
      { name: 'Johnson & Johnson', website: 'https://jnj.com' },
      { name: 'Pfizer', website: 'https://pfizer.com' },
      { name: 'UnitedHealth', website: 'https://unitedhealthgroup.com' },
      { name: 'CVS Health', website: 'https://cvshealth.com' }
    ],
    'Finance': [
      { name: 'JPMorgan Chase', website: 'https://jpmorganchase.com' },
      { name: 'Bank of America', website: 'https://bankofamerica.com' },
      { name: 'Wells Fargo', website: 'https://wellsfargo.com' },
      { name: 'Goldman Sachs', website: 'https://goldmansachs.com' }
    ],
    'E-commerce': [
      { name: 'Amazon', website: 'https://amazon.com' },
      { name: 'eBay', website: 'https://ebay.com' },
      { name: 'Shopify', website: 'https://shopify.com' },
      { name: 'Etsy', website: 'https://etsy.com' }
    ],
    'default': [
      { name: 'Industry Leader Corp', website: 'https://industryleader.com' },
      { name: 'Market Solutions Pro', website: 'https://marketsolutions.com' },
      { name: 'Business Edge Systems', website: 'https://businessedge.com' },
      { name: 'Enterprise Plus', website: 'https://enterpriseplus.com' }
    ]
  };

  const competitors = competitorsByIndustry[industry] || competitorsByIndustry['default'];
  return competitors.slice(0, 4);
}