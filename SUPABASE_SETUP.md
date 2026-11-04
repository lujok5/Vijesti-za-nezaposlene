# Supabase setup

The page uses Supabase for published stories and uploaded photos. Until public environment variables are configured, the homepage continues to use vijesti.json.

## One-time setup

1. In the Supabase project, open SQL Editor and run supabase/schema.sql.
2. In Authentication > Users, add a user with your editor email and password.
3. Copy the user's UUID and add it as the only editor by running this query, replacing the placeholder:

    insert into public.admin_users (user_id) values ('PASTE-EDITOR-USER-UUID-HERE');

Only users in admin_users can add or remove stories and photos. The publishable key is public by design; never expose a secret or service-role key.

When updating an existing database for multi-source story clusters, run supabase/news-sources.sql once in the Supabase SQL Editor. It creates the public-read-only source list attached to each clustered story; the bot writes through the existing backend secret key.

## Connect the site

Set these variables in local .env.local and in Vercel > Project Settings > Environment Variables for Production and Preview:

    NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY

After setting Vercel variables, redeploy. Open /admin, sign in, and publish. Images must be JPG, PNG, WebP, or GIF and at most 5 MB.
## Automatic sourced news

The GitHub Actions workflow checks Google News RSS every six hours, looking back up to 30 days. It verifies that a link resolves to an approved HTTPS publisher, extracts available feed thumbnails, groups reports about the same event, drafts a concise sourced summary and headline, and assigns one editorial category. The article keeps links to all the publishers in `news_sources`. When grouped reports already exist as separate automated articles, the bot merges their comments into the story and hides the duplicate article. Editor-written stories stay untouched. If OpenAI is unavailable, it falls back to exact-headline grouping and keeps the original RSS text.

To enable the scheduled bot, add these repository secrets in GitHub at Settings > Secrets and variables > Actions:

- SUPABASE_URL: the project URL above.
- SUPABASE_SECRET_KEY: the project's backend Secret key from Supabase Project Settings > API Keys. Keep it in GitHub Secrets only; never put it in the site or a NEXT_PUBLIC variable.
- OPENAI_API_KEY: an API key for the scheduled story grouping, summaries, headlines, and categories. Without this secret the bot uses the exact-headline fallback.

After pushing the workflow, open the repository's Actions tab and run Collect sourced influencer news once with Run workflow. Later runs are scheduled every six hours. Check the workflow run log if there are no stories; the bot skips names with no recent matches from allowed sources.
