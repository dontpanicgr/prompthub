# AI Features Setup

This document explains how to set up and configure AI features in Lexee, including the AI-Assisted Prompt Refinement feature and BYOK (Bring Your Own Key) support.

## Environment Variables

Add these environment variables to your `.env.local` file and Vercel deployment:

### Required for Managed Keys
```bash
# OpenAI API Key (for managed GPT models)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic API Key (for managed Claude models)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# DeepSeek API Key (for managed DeepSeek models)
DEEPSEEK_API_KEY=sk-your-deepseek-key-here

# Master key for encrypting user-provided API keys
BYOK_ENC_KEY=your-32-character-encryption-key-here
```

### Optional Configuration
```bash
# Base URL for OpenAI-compatible endpoints (Ollama, OpenRouter, etc.)
OPENAI_COMPAT_BASE_URL=http://localhost:11434/v1

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Setup

Run the migration to create the required tables:

```bash
# Apply the migration
supabase db push

# Or run the SQL directly
psql -f supabase/migrations/20250101000000_byok_tables.sql
```

This creates:
- `user_provider_keys` - Stores encrypted user API keys
- `ai_usage` - Tracks usage for rate limiting and analytics

## Features

### AI-Assisted Prompt Refinement

Users can improve their prompts using AI with these variants:
- **Rewrite**: Improve clarity and structure
- **Clarify**: Remove ambiguity and add context
- **Shorten**: Make more concise
- **Expand**: Add detail and examples
- **Variables**: Add reusable placeholders

### BYOK (Bring Your Own Key)

Users can connect their own API keys for:
- Higher rate limits (1000/day vs 50/day)
- Access to premium models
- No usage costs for Lexee
- Full control over their data

Supported providers:
- OpenAI (GPT models)
- Anthropic (Claude models)
- DeepSeek (Chat/Coder models)
- OpenAI-compatible endpoints (Ollama, OpenRouter, etc.)

### Rate Limiting

- **Managed keys**: 50 requests/day, 10/hour, 2/minute
- **BYOK**: 1000 requests/day, 100/hour, 10/minute
- Usage tracked in `ai_usage` table
- 429 responses when limits exceeded

## Security

- User API keys encrypted with pgcrypto
- Keys never logged or stored in plain text
- RLS policies ensure users only access their own keys
- Input validation and length limits on all endpoints

## Usage

### For Users

1. **AI Suggest**: Click "AI Suggest" button in create/edit forms
2. **Improve with AI**: Click "Improve with AI" on your own prompts
3. **BYOK Setup**: Go to Settings > AI Providers to add your keys

### For Developers

```typescript
// Track AI usage
import { aiAnalytics } from '@/lib/ai-analytics'

aiAnalytics.trackSuggestionRequest('rewrite', 'gpt-4o-mini', text.length)
aiAnalytics.trackSuggestionSuccess('rewrite', 'gpt-4o-mini', suggestion.length)
```

## API Endpoints

- `POST /api/ai/suggest` - Get AI suggestions
- `POST /api/chat/completions` - Chat completions (for future chatbot)
- `POST /api/ai/test-key` - Test API key connection
- `POST /api/ai/store-key` - Store user API key
- `DELETE /api/ai/remove-key` - Remove user API key

## Troubleshooting

### Common Issues

1. **"No API key available"**: Check environment variables
2. **"Rate limit exceeded"**: User hit daily/hourly limits
3. **"Invalid API key"**: Key test failed, check key validity
4. **"Encryption key not configured"**: Set `BYOK_ENC_KEY`

### Debugging

Enable debug logging:
```bash
DEBUG=ai:* npm run dev
```

Check usage in database:
```sql
SELECT * FROM ai_usage WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
```

## Future Enhancements

- Streaming responses for chat
- Model fine-tuning support
- Usage analytics dashboard
- Team/organization key sharing
- Custom model endpoints
