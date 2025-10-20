# Lexee 🚀

A modern prompt discovery and sharing platform built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication** - Google OAuth integration with Supabase Auth
- 📝 **Prompt Management** - Create, edit, and delete prompts with public/private visibility
- 🔍 **Discovery** - Browse and search prompts by title and model
- ❤️ **Social Features** - Like and bookmark prompts with real-time updates
- 👤 **User Profiles** - Public profiles showing user's prompts and stats
- 🌙 **Dark Mode** - System-aware theme switching
- 📱 **Responsive** - Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel + Supabase
- **UI Components**: Lucide React icons, custom components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd lexee-app
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Managed AI provider keys
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
GOOGLE_AI_STUDIO_API_KEY=your-google-ai-studio-key
GROQ_API_KEY=gsk_your-groq-key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-jwt

# BYOK encryption (required for storing user keys securely)
BYOK_ENC_KEY=your-32-character-encryption-key-here

# OpenAI-compatible endpoints (Ollama/OpenRouter/Groq etc.)
OPENAI_COMPAT_BASE_URL=http://localhost:11434/v1
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
# GROQ_BASE_URL=https://api.groq.com/openai/v1
# GOOGLE_AI_STUDIO_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

### 3. Set up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create all tables, policies, and functions

### 4. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google OAuth and configure it with your Google OAuth credentials
3. Add your domain to the allowed redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication routes
│   ├── create/            # Create prompt page
│   ├── me/                # User dashboard
│   ├── popular/           # Popular prompts page
│   ├── prompt/[id]/       # Individual prompt pages
│   └── user/[id]/         # User profile pages
├── components/            # React components
│   ├── auth-provider.tsx  # Authentication context
│   ├── layout/            # Layout components
│   ├── prompts/           # Prompt-related components
│   ├── theme-provider.tsx # Theme management
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── supabase.ts        # Client-side Supabase client
│   ├── supabase-server.ts # Server-side Supabase client
│   └── utils.ts           # Helper functions
└── middleware.ts          # Next.js middleware for auth
```

## Database Schema

The app uses the following main tables:

- **profiles** - User profiles (extends Supabase auth.users)
- **prompts** - User-created prompts with visibility settings
- **likes** - User likes on prompts
- **bookmarks** - User bookmarks on prompts

All tables have Row Level Security (RLS) enabled for data protection.

## 🚀 Production Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready: optimizations and monitoring"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   In your Vercel dashboard, add these environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Optional: Analytics
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXXX
   NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
   ```

4. **Deploy!**
   - Vercel will automatically deploy your app
   - Monitor the build in the Vercel dashboard
   - Your app will be live at `your-app.vercel.app`

### Performance Features
- ✅ **Automatic optimization** (images, fonts, code splitting)
- ✅ **CDN distribution** worldwide
- ✅ **Edge caching** for fast global performance
- ✅ **Analytics integration** ready
- ✅ **Error monitoring** built-in

### Other Deployment Options
- **Netlify**: Connect GitHub repo and add build settings
- **Railway**: Deploy with database included
- **Render**: Full-stack deployment with auto-scaling
- **Self-hosted**: Docker container with environment setup

## 📊 Performance & Monitoring

### Bundle Analysis
- **Total Bundle**: ~178 kB shared by all pages
- **First Load JS**: ~220 kB for most pages
- **Optimized Chunks**: Automatic code splitting by route
- **Image Optimization**: WebP/AVIF support with responsive sizing

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Monitoring Features
- ✅ **Error boundaries** with user-friendly fallbacks
- ✅ **Client-side analytics** with event tracking
- ✅ **Performance monitoring** with Core Web Vitals
- ✅ **Global error handlers** for uncaught exceptions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

If you encounter any issues, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for the AI community