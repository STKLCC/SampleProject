# News Hub - Application Flow Diagram

## 🚀 Application Startup Flow

```
┌─────────────────┐
│   App.vue       │
│   (Entry Point) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  useAuth.init() │
│  - Check localStorage │
│  - Restore user state │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   index.vue     │
│   (Router)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│              Route Decision                     │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │  User Logged In │  │ User Not Logged │     │
│  │                 │  │      In         │     │
│  └─────────┬───────┘  └─────────┬───────┘     │
│            │                     │             │
│            ▼                     ▼             │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │   /dashboard    │  │    /login       │     │
│  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────────┐
│   Login Page    │
│   (/login)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  User Input     │
│  - Email        │
│  - Password     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  useAuth.login()│
│  - API Call     │
│  - Mock Response│
└─────────┬───────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│              Login Result                       │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Success       │  │     Error       │     │
│  └─────────┬───────┘  └─────────┬───────┘     │
│            │                     │             │
│            ▼                     ▼             │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Store Token     │  │ Show Error Msg  │     │
│  │ Store User      │  │ Stay on Login   │     │
│  │ localStorage    │  │                 │     │
│  └─────────┬───────┘  └─────────────────┘     │
│            │                                   │
│            ▼                                   │
│  ┌─────────────────┐                          │
│  │ Navigate to     │                          │
│  │   /dashboard    │                          │
│  └─────────────────┘                          │
└─────────────────────────────────────────────────┘
```

## 📱 Dashboard & Platform Selection Flow

```
┌─────────────────┐
│   Dashboard     │
│   (/dashboard)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Auth Middleware│
│  - Check Token  │
│  - Allow Access │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  onMounted()    │
│  - fetchPlatforms() │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  API Call       │
│  /media-platforms │
└─────────┬───────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│              Platform Data                      │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Success       │  │     Error       │     │
│  └─────────┬───────┘  └─────────┬───────┘     │
│            │                     │             │
│            ▼                     ▼             │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Display Grid    │  │ Show Error      │     │
│  │ - CNN           │  │ - Retry Button  │     │
│  │ - BBC           │  │                 │     │
│  │ - TechCrunch    │  └─────────────────┘     │
│  │ - Reuters       │                          │
│  │ - Guardian      │                          │
│  │ - Wired        │                          │
│  └─────────┬───────┘                          │
│            │                                   │
│            ▼                                   │
│  ┌─────────────────┐                          │
│  │ User Clicks     │                          │
│  │ Platform        │                          │
│  └─────────┬───────┘                          │
│            │                                   │
│            ▼                                   │
│  ┌─────────────────┐                          │
│  │ Navigate to     │                          │
│  │ /news/[id]      │                          │
│  │ with platform   │                          │
│  │ name as query   │                          │
│  └─────────────────┘                          │
└─────────────────────────────────────────────────┘
```

## 📰 News Articles Flow

```
┌─────────────────┐
│   News Page     │
│   (/news/[id])  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Auth Middleware│
│  - Check Token  │
│  - Allow Access │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Extract Route  │
│  - platformId   │
│  - platformName │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  onMounted()    │
│  - fetchNews()  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  API Call       │
│  /news/[id]     │
└─────────┬───────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│              News Data                          │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Success       │  │     Error       │     │
│  └─────────┬───────┘  └─────────┬───────┘     │
│            │                     │             │
│            ▼                     ▼             │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Display Articles│  │ Show Error      │     │
│  │ - Headline      │  │ - Retry Button  │     │
│  │ - Summary       │  │                 │     │
│  │ - Image         │  └─────────────────┘     │
│  │ - Author        │                          │
│  │ - Date          │                          │
│  │ - Read Link     │                          │
│  └─────────┬───────┘                          │
│            │                                   │
│            ▼                                   │
│  ┌─────────────────┐                          │
│  │ User Clicks     │                          │
│  │ "Read Article"  │                          │
│  └─────────┬───────┘                          │
│            │                                   │
│            ▼                                   │
│  ┌─────────────────┐                          │
│  │ Open Original   │                          │
│  │ Article URL     │                          │
│  │ (New Tab)       │                          │
│  └─────────────────┘                          │
└─────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │    │   Components    │    │   State         │
│                 │    │                 │    │                 │
│ - Login Form    │───▶│ - Login.vue     │───▶│ - useAuth()     │
│ - Platform Click│    │ - Dashboard.vue │    │ - user state    │
│ - Article Click │    │ - News.vue      │    │ - token state   │
└─────────────────┘    └─────────┬───────┘    └─────────┬───────┘
                                 │                      │
                                 ▼                      ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   API Client    │    │   Middleware    │
                    │                 │    │                 │
                    │ - Mock Data     │    │ - Route Guard   │
                    │ - HTTP Methods  │    │ - Auth Check    │
                    │ - Error Handling│    │ - Redirects     │
                    └─────────────────┘    └─────────────────┘
```

## 🛡️ Security & Middleware Flow

```
┌─────────────────┐
│   Route Access  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Auth Middleware│
│  (auth.ts)      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Check Auth     │
│  - useAuth()    │
│  - isLoggedIn   │
└─────────┬───────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│              Auth Decision                      │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Authenticated  │  │ Not Authenticated│     │
│  └─────────┬───────┘  └─────────┬───────┘     │
│            │                     │             │
│            ▼                     ▼             │
│  ┌─────────────────┐  ┌─────────────────┐     │
│  │ Allow Access    │  │ Redirect to     │     │
│  │ - Continue to   │  │ /login          │     │
│  │   Page          │  │                 │     │
│  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────┘
```

## 🔄 State Management Flow

```
┌─────────────────┐
│   App Start     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  useAuth()      │
│  - useState()   │
│  - user state   │
│  - token state  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  initAuth()     │
│  - localStorage │
│  - Restore      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Reactive State │
│  - Computed     │
│  - Watchers     │
│  - Updates      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Components     │
│  - Re-render    │
│  - UI Updates   │
└─────────────────┘
```

## 📱 User Journey Summary

```
1. App Launch → Auth Check → Route Decision
2. Login → Authentication → Token Storage
3. Dashboard → Platform Selection → News View
4. News Articles → Content Display → External Links
5. Navigation → Back to Dashboard → Logout
```

## 🔧 Technical Implementation Notes

- **File-based Routing**: Automatic route generation from page files
- **Composition API**: Modern Vue 3 patterns with composables
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom components
- **Mock API**: Simulated backend for development and demo
- **Responsive Design**: Mobile-first approach with breakpoints
- **State Persistence**: localStorage for authentication state
- **Error Handling**: Graceful fallbacks and user feedback
