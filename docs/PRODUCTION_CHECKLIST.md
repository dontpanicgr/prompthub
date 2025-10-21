# Production Deployment Checklist

This checklist covers all the configurations needed to deploy Lexee to production.

## 🔐 Environment Variables

### Required for Core Functionality
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Access (Required)
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

### Optional for AI Features
```bash
# Managed AI Provider Keys (Optional - for managed AI features)
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
GOOGLE_AI_STUDIO_API_KEY=your-google-ai-studio-key
GROQ_API_KEY=gsk_your-groq-key
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

# BYOK Encryption (Required if using BYOK features)
BYOK_ENC_KEY=your-32-character-encryption-key-here
```

### Analytics (Optional)
```bash
# Google Analytics (Optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXXX

# Mixpanel (Optional - currently disabled by default)
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
NEXT_PUBLIC_MIXPANEL_ENABLED=false  # Set to 'true' to enable
NEXT_PUBLIC_MIXPANEL_API_HOST=https://api.mixpanel.com  # Optional
NEXT_PUBLIC_MIXPANEL_REGION=US  # Optional: US or EU
```

### Debug & Development (Optional)
```bash
# Debug logging (set to 'true' for detailed logs)
NEXT_PUBLIC_DEBUG_LOGS=false
```

## 🚀 Deployment Platforms

### Vercel (Recommended)
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add all required env vars in Vercel dashboard
3. **Build Settings**: 
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy**: Automatic deployment on push to main branch

### Other Platforms
- **Netlify**: Connect GitHub, add env vars, deploy
- **Railway**: Full-stack deployment with database
- **Render**: Auto-scaling with database included

## 🔧 Pre-Deployment Checks

### 1. Database Setup
- [ ] Run all migrations in production Supabase
- [ ] Verify RLS policies are enabled
- [ ] Test database connections
- [ ] Set up database backups

### 2. Authentication
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Set up redirect URLs for production domain
- [ ] Test login/logout flows
- [ ] Verify admin access works

### 3. AI Features (if enabled)
- [ ] Test API key connections
- [ ] Verify rate limiting works
- [ ] Test BYOK functionality
- [ ] Check AI suggestion features

### 4. Analytics (if enabled)
- [ ] Google Analytics tracking works
- [ ] Mixpanel events are firing (if enabled)
- [ ] No console errors in production
- [ ] Privacy policy updated for tracking

### 5. Performance
- [ ] Images optimized (WebP/AVIF)
- [ ] Bundle size reasonable
- [ ] Core Web Vitals good
- [ ] CDN configured (if using)

## 🛡️ Security Checklist

### Environment Security
- [ ] No secrets in code
- [ ] Environment variables properly set
- [ ] Admin emails configured
- [ ] HTTPS enabled
- [ ] Security headers configured

### Database Security
- [ ] RLS policies enabled
- [ ] Service role key secure
- [ ] Database backups enabled
- [ ] Connection strings secure

### Application Security
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection (Next.js built-in)
- [ ] Rate limiting on API routes
- [ ] Error handling doesn't leak info

## 📊 Monitoring & Analytics

### Error Tracking
- [ ] Global error handlers in place
- [ ] Unhandled promise rejection tracking
- [ ] Performance monitoring
- [ ] User action tracking

### Analytics Setup
- [ ] Google Analytics configured (optional)
- [ ] Mixpanel disabled by default (privacy-friendly)
- [ ] Page view tracking working
- [ ] Custom events firing

## 🔍 Testing Checklist

### Functionality Tests
- [ ] User registration/login
- [ ] Prompt creation/editing
- [ ] Search functionality
- [ ] Categories work
- [ ] Projects work
- [ ] Comments work
- [ ] Admin access works

### Performance Tests
- [ ] Page load times < 3s
- [ ] API response times < 1s
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Security Tests
- [ ] Unauthorized access blocked
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

## 📱 Mobile & Accessibility

### Mobile Optimization
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Mobile navigation works
- [ ] Performance on mobile

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast ratios
- [ ] Alt text for images

## 🚨 Post-Deployment

### Immediate Checks
- [ ] Site loads correctly
- [ ] All features work
- [ ] No console errors
- [ ] Analytics tracking
- [ ] Admin access works

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Watch for security issues

### Maintenance
- [ ] Regular security updates
- [ ] Database maintenance
- [ ] Performance optimization
- [ ] User feedback collection

## 🔄 Rollback Plan

### If Issues Occur
1. **Immediate**: Revert to previous deployment
2. **Database**: Restore from backup if needed
3. **Environment**: Check environment variables
4. **Monitoring**: Check error logs
5. **Communication**: Notify users if needed

## 📋 Environment-Specific Notes

### Development
- Mixpanel disabled by default
- Debug logs can be enabled
- All features available for testing

### Production
- Mixpanel disabled by default (privacy-friendly)
- Debug logs disabled
- Performance optimized
- Security hardened

## 🎯 Success Metrics

### Technical
- [ ] 99.9% uptime
- [ ] < 3s page load times
- [ ] < 1% error rate
- [ ] Zero security incidents

### Business
- [ ] User registration working
- [ ] Core features functional
- [ ] Admin tools accessible
- [ ] Analytics data flowing

---

## 🆘 Need Help?

- Check the main [SETUP.md](../SETUP.md) for basic setup
- Review specific guides in the [docs/](./) directory
- Check [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) for analytics
- Review [ADMIN_SETUP.md](./ADMIN_SETUP.md) for admin access
