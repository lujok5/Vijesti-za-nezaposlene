# Supabase setup

The page uses Supabase for published stories and uploaded photos. Until public environment variables are configured, the homepage continues to use vijesti.json.

## One-time setup

1. In the Supabase project, open SQL Editor and run supabase/schema.sql.
2. In Authentication > Users, add a user with your editor email and password.
3. Copy the user's UUID and add it as the only editor by running this query, replacing the placeholder:

    insert into public.admin_users (user_id) values ('PASTE-EDITOR-USER-UUID-HERE');

Only users in admin_users can add or remove stories and photos. The publishable key is public by design; never expose a secret or service-role key.

## Connect the site

Set these variables in local .env.local and in Vercel > Project Settings > Environment Variables for Production and Preview:

    NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY

After setting Vercel variables, redeploy. Open /admin, sign in, and publish. Images must be JPG, PNG, WebP, or GIF and at most 5 MB.