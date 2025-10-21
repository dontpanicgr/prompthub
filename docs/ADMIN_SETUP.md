# Admin Access Setup

This guide explains how to configure admin-only access for the PromptHub admin dashboard.

## Setup Options

### Option 1: Environment Variable (Recommended)

Add your email to the environment variables:

```bash
# In your .env.local file
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

**Benefits:**
- ✅ Easy to manage multiple admins
- ✅ No code changes needed to add/remove admins
- ✅ Works with both client-side and server-side protection
- ✅ Can be different for different environments

### Option 2: Hardcoded in Code

Edit `src/app/admin/page.tsx` and update the `ADMIN_EMAILS` array:

```typescript
const ADMIN_EMAILS = [
  'your-email@example.com',
  'another-admin@example.com',
  // Add more admin emails as needed
]
```

**Benefits:**
- ✅ Simple and direct
- ✅ No environment variable needed

**Drawbacks:**
- ❌ Requires code changes to add/remove admins
- ❌ Admin emails are visible in the codebase

## Security Features

### Multi-Layer Protection

1. **Client-Side Protection** - React component checks authorization
2. **Server-Side Protection** - Middleware blocks unauthorized access
3. **Authentication Required** - Must be logged in to access admin
4. **Email Verification** - Only specified emails can access

### What Happens When Unauthorized

- **Not logged in**: Redirected to login page with return URL
- **Wrong email**: Redirected to home page with access denied message
- **Loading state**: Shows loading spinner while checking authorization

## Testing Admin Access

1. **Login with admin email** - Should see admin dashboard
2. **Login with non-admin email** - Should be redirected to home
3. **Not logged in** - Should be redirected to login page
4. **Direct URL access** - Middleware should block unauthorized access

## Adding New Admins

### Using Environment Variables:
```bash
# Add to .env.local
ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

### Using Hardcoded Array:
```typescript
const ADMIN_EMAILS = [
  'admin1@example.com',
  'admin2@example.com', 
  'admin3@example.com'
]
```

## Admin Dashboard Features

The admin dashboard includes:
- **Development Tools** - Testing utilities and demos
- **Analytics Testing** - Analytics event monitoring
- **UI Components** - Component showcase and testing
- **Model Badges** - AI model badge demonstrations
- **Performance Tools** - Loading states and skeleton testing

## Security Best Practices

1. **Use HTTPS** - Always use HTTPS in production
2. **Regular Review** - Periodically review admin access
3. **Environment Separation** - Different admin lists for dev/prod
4. **Monitor Access** - Consider adding access logging
5. **Strong Authentication** - Use strong passwords and 2FA

## Troubleshooting

### "Access Denied" but should have access
- Check email spelling and case sensitivity
- Verify environment variable is set correctly
- Clear browser cache and cookies
- Check if logged in with correct account

### Redirected to login repeatedly
- Check if authentication is working
- Verify Supabase configuration
- Check browser console for errors

### Admin dashboard not loading
- Check if all dependencies are installed
- Verify Next.js configuration
- Check for TypeScript errors
