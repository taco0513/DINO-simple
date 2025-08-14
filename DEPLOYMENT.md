# DINO Visa Tracker - Deployment Guide

This guide will help you deploy the DINO visa tracker to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Supabase project already set up

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: DINO visa tracker"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/DINO-simple.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` or `yarn build`
   - **Output Directory**: .next (default)

#### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important**: Use your production Supabase URL and key, not development ones.

#### Step 4: Update Supabase Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update these settings:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/*`

#### Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete (usually 1-2 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy to Other Platforms

#### Netlify

1. Build your project locally:
```bash
npm run build
```

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Deploy:
```bash
netlify deploy --prod --dir=.next
```

4. Add environment variables in Netlify dashboard

#### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Initialize and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables via Railway dashboard

## Production Checklist

### Before Deployment

- [x] Build passes without errors (`npm run build`)
- [ ] Remove all `console.log` statements
- [ ] Test all features locally with production build
- [ ] Ensure all environment variables are set
- [ ] Update Supabase authentication URLs
- [ ] Check Row Level Security policies are enabled

### Security Considerations

1. **Environment Variables**:
   - Never commit `.env.local` to version control
   - Use different Supabase projects for dev/prod if possible
   - Rotate API keys regularly

2. **Database**:
   - Ensure RLS is enabled on all tables
   - Review and test all policies
   - Consider enabling email confirmation for production

3. **Authentication**:
   - Enable email confirmation in Supabase
   - Set up proper password requirements
   - Configure session timeout

### Post-Deployment

1. **Test Core Features**:
   - [ ] User registration and login
   - [ ] Adding/editing stays
   - [ ] Visa calculations
   - [ ] CSV import/export
   - [ ] Profile management

2. **Monitor**:
   - Set up Vercel Analytics (free tier available)
   - Monitor Supabase usage and limits
   - Check error logs regularly

3. **Backup**:
   - Export Supabase data regularly
   - Keep database schema in version control
   - Document any manual configuration

## Custom Domain Setup

To use a custom domain:

1. In Vercel:
   - Go to Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

2. In Supabase:
   - Update Site URL to your custom domain
   - Add custom domain to Redirect URLs

## Troubleshooting

### Common Issues

1. **"Failed to fetch" errors**:
   - Check environment variables are set correctly
   - Verify Supabase project is accessible
   - Check CORS settings if using custom domain

2. **Authentication not working**:
   - Verify Site URL in Supabase matches deployment URL
   - Check Redirect URLs include your domain
   - Ensure cookies are enabled

3. **Database errors**:
   - Verify RLS policies are correct
   - Check user has proper permissions
   - Ensure all migrations have been run

### Getting Help

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

## Environment Variables Reference

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Your Supabase anonymous key

# Optional (for future features)
# NEXT_PUBLIC_APP_URL=            # Your deployed app URL
# NEXT_PUBLIC_ENABLE_ANALYTICS=   # Enable analytics (true/false)
```

## Performance Optimization

The app is already optimized with:
- Server-side rendering where appropriate
- Optimized images and assets
- Efficient state management with Zustand
- Minimal bundle size (~140KB First Load JS)

## Maintenance

Regular maintenance tasks:
- Update dependencies monthly
- Review and rotate API keys quarterly
- Backup database weekly
- Monitor usage and performance metrics

---

## Quick Deploy Button

For the easiest deployment, use the Deploy to Vercel button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/DINO-simple&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Required%20Supabase%20environment%20variables&project-name=dino-visa-tracker)

Remember to replace `YOUR_USERNAME` with your actual GitHub username.