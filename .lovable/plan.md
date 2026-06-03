## Obiettivo
Aggiungere una nuova sezione **sopra l'hero** della home (`/`), della stessa dimensione visiva, contenente:
- un **video di sfondo** placeholder (qualsiasi mp4 dimostrativo, sostituibile in seguito)
- il **logo allegato** centrato sopra il video, come elemento separato e sovrapposto

## Cosa fare
1. **Caricare il logo allegato come asset CDN** tramite `lovable-assets`:
   - `lovable-assets create --file /mnt/user-uploads/Asset_21.png --filename logo-mark.png > src/assets/logo-mark.png.asset.json`
2. **Modificare `src/routes/index.tsx`**:
   - Inserire una nuova `<section>` come primo figlio di `<main>`, **prima** della sezione hero esistente.
   - Contenitore `relative overflow-hidden` con altezza `min-h-screen` (stessa scala visiva della hero).
   - `<video autoPlay muted loop playsInline>` posizionato `absolute inset-0 w-full h-full object-cover` con `src` placeholder (es. un sample mp4 pubblico come `https://cdn.coverr.co/videos/coverr-...` o `https://www.w3schools.com/html/mov_bbb.mp4` — file demo sostituibile).
   - Un overlay scuro leggero (`absolute inset-0 bg-foreground/20`) per dare contrasto al logo.
   - Il **logo importato** dal pointer JSON, renderizzato con `<img>` centrato via wrapper `absolute inset-0 flex items-center justify-center`, dimensione contenuta (es. `w-[280px] md:w-[360px]`), `pointer-events-none`.
   - I due elementi (video e logo) restano **separati nel markup**, non annidati.
3. **Nessuna modifica** a header, footer, hero esistente, design tokens o backend.

## Dettagli tecnici
- Import: `import logoMark from "@/assets/logo-mark.png.asset.json";` e uso di `logoMark.url` nell'`<img>`.
- Video placeholder: URL di un file mp4 demo pubblico; l'utente lo sostituirà fornendo il proprio file (che poi caricheremo come asset CDN).
- Altezza sezione: `min-h-screen` per impatto pari alla hero; padding zero (il video riempie tutto).
- Accessibilità: `alt` descrittivo sul logo, `aria-hidden` sul video decorativo.

## Fuori scopo
- Caricamento del video finale (lo fornirà l'utente in seguito).
- Editor admin per video/logo di questa sezione.
- Animazioni o controlli video personalizzati.