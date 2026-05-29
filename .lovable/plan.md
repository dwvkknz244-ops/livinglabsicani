## Obiettivo
Costruire il sito vetrina del consorzio **LivingLab Sicani** seguendo la direzione "Swiss Minimalist v3" selezionata: palette neutra (off-white #FCFCFB) + accento viola **#8685FD**, tipografia Instrument Sans, navigazione "pill" sticky, card morbide, animazioni fluide (float, fade-up, hover scale).

## Architettura pagine (route separate)
- `/` — Homepage: hero, blocco servizi, **sezione "Ultime notizie"** dinamica da database, CTA, footer
- `/chi-siamo` — Storia, missione, territorio dei Sicani
- `/servizi` — Servizi e attività del consorzio (Agro-Tech Hub, Design Lab, Tracciabilità, ecc.)
- `/partecipa` — Come aderire al consorzio (form richiesta adesione)
- `/contatti` — Form contatti + info sede
- `/news` — Archivio completo notizie
- `/news/$slug` — Dettaglio singola notizia
- `/admin` — Pannello protetto per creare/modificare news (login richiesto)
- `/login` — Autenticazione admin (email + password)

Ogni route ha `head()` con title/description/og specifici.

## Backend (Lovable Cloud)
Abilito Cloud per gestire le news dinamicamente.

**Tabella `news`:**
- `id` uuid, `slug` text unique, `title` text, `excerpt` text, `body` text (markdown)
- `category` text (es. Ricerca, Storytelling, Community)
- `cover_url` text, `published_at` timestamptz, `created_at`, `updated_at`
- RLS: SELECT pubblico per news con `published_at <= now()`; INSERT/UPDATE/DELETE solo per ruolo `admin`

**Tabella `user_roles`** (pattern sicuro, ruoli separati da profili):
- enum `app_role` ('admin', 'editor')
- `user_roles(user_id, role)` + funzione `has_role(uid, role)` SECURITY DEFINER

**Tabella `contact_submissions`** e **`membership_requests`**:
- INSERT pubblico (anonimo), SELECT solo admin

## Server functions
- `getLatestNews()` — pubblica, ultime 3-4 news per homepage (`supabaseAdmin` scoped)
- `getAllNews()` — pubblica, archivio paginato
- `getNewsBySlug(slug)` — pubblica
- `createNews/updateNews/deleteNews` — protette con `requireSupabaseAuth` + check `has_role(uid,'admin')`
- `submitContact(data)` — pubblica, insert validato Zod
- `submitMembership(data)` — pubblica, insert validato Zod

## Componenti riutilizzabili
- `SiteHeader` (nav pill sticky)
- `SiteFooter`
- `NewsCard` (variante featured + compatta)
- `Section` wrapper con padding standard
- `AnimatedReveal` (fade-up on scroll, framer-motion)

## Design system (`src/styles.css`)
Token semantici in `oklch`:
- `--background` off-white caldo
- `--accent` viola #8685FD (convertito in oklch)
- neutri zinc-like per testi e bordi
- font `Instrument Sans` via Google Fonts
- keyframes `float`, `fade-up`, `reveal`

Niente colori hardcoded nei componenti — solo classi token (`bg-accent`, `text-accent`, `bg-background`).

## Immagini
Genero le immagini placeholder del prototipo (paesaggio Sicani, grano, formaggio, contadini con tablet, ecc.) con `imagegen` e le importo in `src/assets/`.

## Note tecniche
- TanStack Start + TanStack Query: loader homepage usa `ensureQueryData(latestNewsQueryOptions)` + `useSuspenseQuery`
- `/admin` sotto layout `_authenticated` con `beforeLoad` che redirige a `/login`
- Login con email+password Supabase (non Google, salvo richiesta)
- `attachSupabaseAuth` middleware globale per chiamate autenticate
- Animazioni: combinazione CSS keyframes (float hero) + framer-motion per reveal on scroll

## Cosa non includo (per restare focalizzati)
- Multilingua (solo italiano)
- Newsletter / commenti sulle news
- Sezione e-commerce o catalogo prodotti
- Mappa interattiva produttori

Posso aggiungerli in un secondo step se vuoi.

## Cosa farai dopo l'approvazione
1. Abilito Lovable Cloud
2. Creo tabelle + RLS + funzione `has_role`
3. Aggiorno design tokens in `styles.css`
4. Genero immagini hero e news
5. Costruisco le route una per una partendo da homepage
6. Aggiungo backend functions e pannello admin
