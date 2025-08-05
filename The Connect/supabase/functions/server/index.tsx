import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// User registration endpoint
app.post('/make-server-b30f3230/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log(`Error creating user: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }

    // Initialize user preferences in KV store
    await kv.set(`user_preferences:${data.user.id}`, {
      favoriteOutlets: [],
      theme: 'light',
      notifications: true
    })

    return c.json({ user: data.user, message: 'User created successfully' })
  } catch (error) {
    console.log(`Error in signup endpoint: ${error}`)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Get user preferences
app.get('/make-server-b30f3230/user-preferences', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log(`Error getting user: ${error?.message}`)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const preferences = await kv.get(`user_preferences:${user.id}`)
    
    return c.json({ 
      preferences: preferences || {
        favoriteOutlets: [],
        theme: 'light',
        notifications: true
      }
    })
  } catch (error) {
    console.log(`Error getting user preferences: ${error}`)
    return c.json({ error: 'Internal server error while fetching preferences' }, 500)
  }
})

// Update user preferences
app.put('/make-server-b30f3230/user-preferences', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      console.log(`Error getting user for preferences update: ${error?.message}`)
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { preferences } = await c.req.json()
    
    await kv.set(`user_preferences:${user.id}`, preferences)
    
    return c.json({ message: 'Preferences updated successfully' })
  } catch (error) {
    console.log(`Error updating user preferences: ${error}`)
    return c.json({ error: 'Internal server error while updating preferences' }, 500)
  }
})

// Get news articles for a specific outlet
app.get('/make-server-b30f3230/news/:outletId', async (c) => {
  try {
    const outletId = c.req.param('outletId')
    const newsApiKey = Deno.env.get('NEWS_API_KEY')
    
    if (!newsApiKey) {
      return c.json({ error: 'News API key not configured' }, 500)
    }

    // Map outlet IDs to NewsAPI sources or domains
    const outletMapping: Record<string, { source?: string; domain?: string; name: string }> = {
      'cnn': { source: 'cnn', name: 'CNN' },
      'bbc': { source: 'bbc-news', name: 'BBC News' },
      'reuters': { source: 'reuters', name: 'Reuters' },
      'fox': { source: 'fox-news', name: 'Fox News' },
      'ap': { source: 'associated-press', name: 'Associated Press' },
      'nbc': { domain: 'nbcnews.com', name: 'NBC News' },
      'abc': { domain: 'abcnews.go.com', name: 'ABC News' },
      'cbs': { domain: 'cbsnews.com', name: 'CBS News' },
      'nyt': { domain: 'nytimes.com', name: 'The New York Times' },
      'guardian': { source: 'the-guardian-uk', name: 'The Guardian' },
      'techcrunch': { source: 'techcrunch', name: 'TechCrunch' },
      'espn': { source: 'espn', name: 'ESPN' }
    }

    const outletConfig = outletMapping[outletId]
    if (!outletConfig) {
      return c.json({ error: 'Outlet not supported' }, 404)
    }

    // Get today's date for filtering
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let apiUrl = 'https://newsapi.org/v2/'
    let params = new URLSearchParams({
      apiKey: newsApiKey,
      from: yesterday,
      to: today,
      sortBy: 'publishedAt',
      pageSize: '20',
      language: 'en'
    })

    if (outletConfig.source) {
      apiUrl += 'top-headlines'
      params.append('sources', outletConfig.source)
    } else if (outletConfig.domain) {
      apiUrl += 'everything'
      params.append('domains', outletConfig.domain)
    }

    const response = await fetch(`${apiUrl}?${params}`)
    const data = await response.json()

    if (!response.ok) {
      console.log(`NewsAPI error for ${outletId}: ${data.message}`)
      return c.json({ error: data.message || 'Failed to fetch news' }, 400)
    }

    // Filter and format articles
    const articles = (data.articles || [])
      .filter((article: any) => 
        article.title && 
        article.description && 
        article.publishedAt &&
        !article.title.includes('[Removed]')
      )
      .map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        author: article.author,
        source: article.source?.name || outletConfig.name
      }))

    return c.json({
      outlet: outletConfig.name,
      articles,
      totalResults: articles.length
    })
  } catch (error) {
    console.log(`Error fetching news for outlet: ${error}`)
    return c.json({ error: 'Internal server error while fetching news' }, 500)
  }
})

// Health check endpoint
app.get('/make-server-b30f3230/health', (c) => {
  return c.json({ status: 'healthy' })
})

Deno.serve(app.fetch)