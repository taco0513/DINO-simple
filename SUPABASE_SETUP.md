# Supabase Setup Guide for DINO-simple

This guide will help you set up Supabase for the DINO visa tracker application.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account
2. Click **"New Project"** in your dashboard
3. Fill in the project details:
   - **Name**: Choose a name (e.g., "dino-visa-tracker")
   - **Database Password**: Set a strong password (save this!)
   - **Region**: Choose the closest region to your location
   - **Pricing Plan**: Free tier is sufficient
4. Click **"Create new project"** and wait for setup to complete

## Step 2: Get Your API Keys

1. Once your project is created, go to **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll need two values:
   - **Project URL**: Copy the URL (looks like `https://xxxxx.supabase.co`)
   - **anon (public) key**: Copy the anonymous key (a long string)

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up the Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" message

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

4. Run the migration:
   ```bash
   supabase db push --file supabase-schema.sql
   ```

## Step 5: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Configure email settings:
   - **Enable Email Confirmations**: Can be disabled for testing
   - **Confirm Email**: Can be disabled for development
   - **Site URL**: Set to `http://localhost:3000` for development
   - **Redirect URLs**: Add `http://localhost:3000/*` for development

## Step 6: Test the Setup

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser
4. Try creating an account and logging in

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check that you copied the correct keys
   - Make sure there are no extra spaces in your `.env.local` file

2. **"Auth session missing" error**
   - Check that authentication is enabled in Supabase
   - Verify the Site URL and Redirect URLs are correctly configured

3. **Database connection errors**
   - Ensure the database schema was created successfully
   - Check that Row Level Security (RLS) is enabled on the stays table

4. **Cannot create/view stays**
   - Verify that the RLS policies were created correctly
   - Check that you're logged in with a valid user

### Verifying the Database Setup

To verify your database is set up correctly:

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `stays` table
3. Click on the table to view its structure
4. Check that RLS is enabled (shield icon should be green)
5. Click on the **Policies** tab to verify the four policies are created

## Security Notes

- **Never commit `.env.local`** to version control
- The `.env.local.example` file is safe to commit as it contains no sensitive data
- The `anon` key is safe to use in client-side code as it's protected by Row Level Security
- Always keep RLS enabled on your tables

## Production Deployment

When deploying to production (e.g., Vercel):

1. Add the same environment variables to your deployment platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Update Authentication settings in Supabase:
   - Change Site URL to your production domain
   - Add your production domain to Redirect URLs

3. Consider enabling email confirmation for production

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the `/docs` folder in this project for more information