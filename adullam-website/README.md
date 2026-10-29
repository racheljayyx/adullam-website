# Adullam Academy website

React 19 + Vite 7 website for Adullam Academy, including the Watch Parties registration and administration system.

## Watch Parties architecture

- React/Vite renders the public search, host application, booking, email-preference and organiser experiences.
- Supabase Postgres stores programme, party, booking, interest and notification records.
- Supabase Edge Functions validate every public write, enforce rate limits and keep privileged operations server-side.
- Supabase Auth is used only for organiser accounts. Membership of `admin_users` is checked inside the admin Edge Function on every request.
- Resend sends verification, booking, host and nearby-party emails.
- Public browser roles can read only `public_watch_parties`, a deliberately sanitised view. Private tables have RLS enabled and browser access revoked.
- Full UK postcodes are validated server-side with Postcodes.io. Private postcode points are stored as PostGIS geography values; public distance searches return only a rounded distance and approximate neighbourhood/city.
- Booking capacity is enforced by `reserve_watch_party`, which locks the party row and completes the capacity check and insert in one database transaction.

There are no fabricated fallback listings. With no approved database records, search correctly returns the waiting-list experience.

## Local frontend setup

The Vite app lives in this directory (the repository currently contains this app inside an outer folder).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set only these browser-visible values in `.env.local`:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Never put a service-role key or Resend key in a `VITE_` variable.

## Supabase setup

Install the Supabase CLI, create or select a project, then run from this app directory:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Create the real programme record before accepting submissions. No event is inserted by the migration because programme details should not be invented:

```sql
insert into public.events (name, slug, status, starts_at, ends_at)
values (
  'YOUR PROGRAMME NAME',
  'your-programme-slug',
  'planned',
  '2027-01-01T18:00:00Z',
  '2027-01-03T21:00:00Z'
);
```

Only one `planned` or `live` event should be active for the initial release. Change it to `closed` after the programme.

### Create an organiser

1. In Supabase Authentication, create an email/password user and confirm their email.
2. Copy that user's UUID.
3. Add the server-side role:

```sql
insert into public.admin_users (user_id, role)
values ('AUTH_USER_UUID', 'owner');
```

Merely knowing `/admin/watch-parties` does not grant access. The Edge Function validates the JWT and then checks `admin_users`.

### Edge Function secrets

Copy `supabase/.env.example` as a reference and set the values as Supabase secrets. Generate independent random values for each secret; do not commit them.

```bash
supabase secrets set \
  RESEND_API_KEY='re_...' \
  EMAIL_FROM='Adullam Academy <watchparties@your-verified-domain.example>' \
  SITE_URL='https://your-production-site.example' \
  ALLOWED_ORIGINS='https://your-production-site.example,http://localhost:5173' \
  RATE_LIMIT_SALT='LONG_RANDOM_VALUE' \
  PREFERENCES_SIGNING_SECRET='DIFFERENT_RANDOM_VALUE_AT_LEAST_32_CHARACTERS' \
  MATCHING_CRON_SECRET='ANOTHER_LONG_RANDOM_VALUE'
```

Supabase supplies `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEYS`, and `SUPABASE_SECRET_KEYS` to hosted Edge Functions. The shared client also supports the legacy `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` variables for older/local projects. For local functions, copy `supabase/.env.example` to an untracked file and pass it with `supabase functions serve --env-file`.

Verify the sending domain in Resend before setting `EMAIL_FROM`. The Resend key and Supabase service-role key remain server-side only.

Deploy the functions:

```bash
supabase functions deploy watch-parties-public
supabase functions deploy submit-watch-party
supabase functions deploy create-booking
supabase functions deploy register-interest
supabase functions deploy manage-interest
supabase functions deploy admin-watch-parties
supabase functions deploy notify-approved-parties
```

The `config.toml` file keeps public form functions callable without user accounts; they perform their own validation, CORS checks, honeypot checks and database-backed rate limiting. Admin requests still require an authenticated organiser and are checked server-side.

## Postcode distance matching

- Visitors search with a full UK postcode and a 5, 10, 25 or 50 mile radius.
- Hosts provide a full private venue address and postcode. The address, full postcode and coordinates never appear in public database views or search responses.
- Edge Functions validate postcodes with `https://api.postcodes.io`; no postcode API key is required.
- PostGIS `ST_DWithin` performs indexed server-side radius matching using genuine postcode coordinates. The displayed mileage is a rounded straight-line approximation between postcode centroids, not a driving distance.
- Existing parties created before migration `202610290001_postcode_distance.sql` have no geographic point. They must be resubmitted or privately backfilled with a validated postcode before they can appear in distance searches.

## Matching and notification behaviour

New records use the person's selected radius through PostGIS. Legacy records without a geographic point retain the exact locality/outward-postcode fallback until they are backfilled.

Approval in the organiser dashboard immediately runs matching. An optional scheduled retry can call `notify-approved-parties` with a service-role bearer token and `x-matching-secret: MATCHING_CRON_SECRET`. Each `(interest, party, notification type)` is unique, and a database claim occurs before sending, preventing duplicate alerts. Failed sends can be retried up to three times after five minutes. Capacity is checked before every invitation; invitations never reserve places.

Interest alerts remain inactive until the email verification link is used. Every match email includes a signed preference link that allows the recipient to update the area/group size or unsubscribe without exposing database IDs alone as authorization.

## Tests and checks

```bash
npm test
npm run lint
npm run build
```

The Node tests cover shared validation, capacity UI rules, atomic-lock and privacy contracts. With a local Supabase stack running, the pgTAP suite checks RLS/grants, pending-to-public approval, multi-place reservations, overbooking protection, duplicates, matching and notification deduplication:

```bash
supabase start
supabase db reset
supabase test db
```

The database is the final authority for capacity, so concurrent Edge Function requests serialize on `SELECT ... FOR UPDATE` and cannot overbook even if two visitors submit at the same time.

An opt-in integration test sends two real reservations at the same time and confirms that only one succeeds. Run it only against a disposable development project:

```bash
RUN_SUPABASE_INTEGRATION_TESTS=true \
SUPABASE_URL='https://YOUR_DEV_PROJECT.supabase.co' \
SUPABASE_PUBLISHABLE_KEY='YOUR_DEV_PUBLISHABLE_KEY' \
SUPABASE_SERVICE_ROLE_KEY='YOUR_DEV_SERVICE_ROLE_KEY' \
npm test
```

## Production routing

This is a client-side React Router application, so the host must rewrite unknown paths to `index.html`. `public/_redirects` provides this rule for Netlify-compatible hosts:

```text
/* /index.html 200
```

For Vercel use a rewrite from `/(.*)` to `/index.html`; for nginx use `try_files $uri $uri/ /index.html`. Configure the equivalent fallback before deploying, otherwise refreshing `/watch-parties/...` will return a host-level 404.

## Connection status

The integration code, migrations, functions, emails and UI are present, but the feature is not operational until a real Supabase project, active event, organiser account, Resend domain/key and production URLs are configured. The UI reports a connection error when browser environment variables are absent instead of pretending a submission worked.
