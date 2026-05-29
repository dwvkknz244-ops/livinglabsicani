# Aprire la modifica del sito a tutti gli utenti registrati

Obiettivo: chiunque sia loggato (anche senza riga in `user_roles`) può usare `/admin` per modificare news, blocchi di pagina e immagini.

## ⚠️ Avviso di sicurezza
Questa modifica significa che **chiunque riesca a registrarsi** (anche un visitatore casuale, dato che la registrazione è aperta) potrà pubblicare news, cambiare i testi di tutte le pagine e sostituire le immagini del sito. È un'apertura forte: se in futuro vuoi limitarla, l'unica difesa resterà chiudere/moderare le registrazioni.

## Modifiche

### 1. Database (migrazione SQL)
Sostituire le policy RLS che richiedono `has_role(..., 'admin')` con policy che richiedono solo `auth.uid() IS NOT NULL`, sulle tabelle:
- `news` (INSERT / UPDATE / DELETE / SELECT-all)
- `page_blocks` (INSERT / UPDATE / DELETE / SELECT-all)
- `image_overrides` (ALL)

Le policy pubbliche di lettura (`Anyone can view published news`, `Anyone can view visible blocks`, `Anyone can view image overrides`) restano invariate.

### 2. Server functions
In `src/lib/news.functions.ts`, `src/lib/blocks.functions.ts`, `src/lib/images.functions.ts`: rimuovere il controllo `user_roles → role = 'admin'` dalle mutation (create/update/delete/upload) e dalla query `listAdminNews`. Resta `requireSupabaseAuth` come unico gate.

### 3. Frontend
- `src/lib/news.queries.ts` / `news.functions.ts`: `isCurrentUserAdmin` ritorna `true` per ogni utente loggato (così l'UI admin si sblocca senza toccare `admin.tsx`).
- `src/components/SiteHeader.tsx`: il link "Admin" viene mostrato a tutti gli utenti loggati (non più solo admin).
- `src/routes/admin.tsx`: nessuna modifica strutturale necessaria — basta che `isAdminQuery` ritorni true.

### 4. Pulizia opzionale
La tabella `user_roles` e la funzione `has_role` restano in piedi (non rimosse) nel caso volessi reintrodurre i ruoli in futuro.
