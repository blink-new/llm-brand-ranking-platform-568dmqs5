import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface APIKeyRequest {
  platform: string;
  apiKey: string;
}

interface APIKeyResponse {
  success: boolean;
  message: string;
  platforms?: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

    const token = authHeader.replace('Bearer ', '');
    
    // For now, we'll store API keys in localStorage on the frontend
    // In production, these would be encrypted and stored securely
    
    if (req.method === 'POST') {
      const { platform, apiKey }: APIKeyRequest = await req.json();
      
      if (!platform || !apiKey) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Platform and API key are required' 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Validate API key format based on platform
      const isValidKey = validateAPIKey(platform, apiKey);
      if (!isValidKey) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: `Invalid API key format for ${platform}` 
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `${platform} API key saved successfully` 
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (req.method === 'GET') {
      // Return list of configured platforms
      // In a real implementation, this would query the database
      return new Response(JSON.stringify({ 
        success: true,
        platforms: ['openai', 'anthropic', 'google', 'perplexity']
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('API Keys function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Internal server error' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

function validateAPIKey(platform: string, apiKey: string): boolean {
  switch (platform.toLowerCase()) {
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    case 'anthropic':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    case 'google':
      return apiKey.length > 20; // Google API keys vary in format
    case 'perplexity':
      return apiKey.startsWith('pplx-') && apiKey.length > 20;
    default:
      return false;
  }
}