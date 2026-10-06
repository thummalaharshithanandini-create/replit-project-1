# Rasoi

Rasoi is a pantry-first cooking app. It ships with a local recipe catalog and an illustrated step guide, so recipe discovery works without AI, video, or database credentials.

## Run

- Start the app with `npm start` (or the **Start application** workflow).
- The Node server serves the app on `0.0.0.0:5000`.
- No package installation is required.

## Language and local data

The language selector supports English, Telugu, Hindi, Tamil, Kannada, and Malayalam. The selected language, pantry ingredients, and saved recipes are stored in the browser.

## Optional Supabase preference sync

Local storage remains the fallback. To enable cross-session cloud sync, configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as Replit environment variables, then apply `supabase/schema.sql` to that Supabase project. The service-role key is read only by the Node server and is never sent to the browser. Do not use the service-role key in client-side code.

The table contains a random per-browser device ID, selected language, pantry ingredients, and an update timestamp. There is no account system; clearing the browser's local storage also removes its device ID.

## AI/video fallback

No AI or video provider is configured. Recipes come from the built-in multilingual catalog. The cooking-video action creates a recipe-specific prompt and opens an illustrated, navigable step-by-step guide instead of a broken video player.
