## Diagnosi
La pagina `/chi-siamo` è vuota perché la tabella `page_blocks` non contiene alcun blocco per `page = 'chi-siamo'` (0 righe). Il componente `PageBlocks` ritorna `null` quando non c'è contenuto, quindi sotto al chip "Il consorzio" non viene mostrato nulla.

## Soluzione
Popolare la pagina con contenuti iniziali editoriali sul consorzio LivingLab Sicani, in modo coerente con il resto del sito. L'admin potrà comunque modificarli in seguito dal pannello.

## Cosa fare
1. **Migrazione DB** — inserire ~6 blocchi `page_blocks` per `page='chi-siamo'`:
   - **Hero text**: titolo "Custodi delle terre Sicane." + paragrafo introduttivo sul consorzio.
   - **Text "La nostra storia"** — origini del progetto LivingLab Sicani.
   - **Text "Missione"** — valorizzazione delle filiere agroalimentari, biodiversità mediterranea, innovazione rurale.
   - **Text "Visione"** — un ecosistema di produttori, ricerca e territorio.
   - **3 blocchi `stat`** — es. "12 Comuni", "40+ Produttori", "5 Filiere".
   - **CTA finale** — "Diventa socio" → `/partecipa`.
2. **Migliorare il rendering** in `chi-siamo.tsx`: aggiungere un h1 di pagina sopra i blocchi così la pagina ha sempre un titolo visibile anche se i blocchi venissero rimossi dall'admin.
3. Nessuna modifica a schema, RLS, server function, header o footer.

## Fuori scopo
- Editor admin (già esistente).
- Modifiche grafiche profonde al componente `PageBlocks`.
