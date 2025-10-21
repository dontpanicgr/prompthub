# Setup Guide for PromptHub

This guide will help you set up PromptHub on a new device or environment.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prompthub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up Supabase database**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor
   - Get your project URL and anon key from Settings > API

5. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional (for AI features)
- `OPENAI_API_KEY` - For GPT models
- `ANTHROPIC_API_KEY` - For Claude models
- `DEEPSEEK_API_KEY` - For DeepSeek models
- `BYOK_ENC_KEY` - 32-character encryption key for user API keys

### Optional (for analytics)
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` - Google Analytics tracking ID
- `NEXT_PUBLIC_MIXPANEL_TOKEN` - Mixpanel project token

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL to create all tables, policies, and functions

## Authentication Setup

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google OAuth and configure it with your Google OAuth credentials
3. Add your domain to the allowed redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

- **Netlify**: Connect GitHub repo and add build settings
- **Railway**: Deploy with database included
- **Render**: Full-stack deployment with auto-scaling

## Troubleshooting

### Common Issues

1. **"No API key available"**: Check your environment variables
2. **Database connection errors**: Verify Supabase URL and keys
3. **Authentication not working**: Check OAuth configuration in Supabase
4. **Build errors**: Ensure all dependencies are installed

### Getting Help

- Check the main README.md for detailed documentation
- Review the setup guides in the docs directory:
  - `docs/AI_SETUP.md` - For AI features configuration
  - `docs/ANALYTICS_SETUP.md` - For analytics setup
  - `docs/CATEGORIES_SETUP.md` - For categories functionality
  - `docs/ADMIN_SETUP.md` - For admin access configuration

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## File Structure

```
prompthub/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
├── supabase/         # Database migrations
├── scripts/          # Utility scripts
├── .env.example      # Environment variables template
└── README.md         # Main documentation
```

## Support

If you encounter any issues, please check the troubleshooting section above or open an issue on GitHub.
