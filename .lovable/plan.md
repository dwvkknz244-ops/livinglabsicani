## Obiettivo
Trasformare la pagina di lettura di una notizia (`/news/$slug`) in un'esperienza editoriale calda ed elegante, mantenendo palette, font e stile del sito.

## Cosa cambia
Solo `src/routes/news.$slug.tsx`. Header, footer, route, dati e logica restano invariati.

## Nuovo layout (direzione "Editorial elegante")
1. **Back link** "Tutte le notizie" con freccia che scorre a sinistra in hover.
2. **Meta** — chip categoria viola pillola + data in grigio chiaro.
3. **Titolo** grande (fino a `text-6xl` su lg), `font-semibold`, leading stretto, **niente uppercase**.
4. **Lede / excerpt** in `text-xl/2xl` grigio, larghezza limitata, ariosa.
5. **Cover image** in `aspect-video`, `rounded-3xl`, **più larga della colonna di testo** (negative margin su desktop), ombra morbida viola, con `figcaption` italico centrato.
6. **Corpo articolo** in colonna stretta `max-w-[68ch]` per misura di lettura comoda:
   - paragrafi `text-lg`, leading rilassato, spaziatura generosa
   - `blockquote` con barra viola spessa a sinistra, italico, font più grande
   - h2/h3 con ritmo chiaro
   - link in viola accent
7. **Footer tag** opzionale: divisore sottile + categoria come tag (riusa il campo `category` esistente, niente nuove tabelle).

## Dettagli tecnici
- Sostituire i colori hard-coded del prototipo con i token semantici del progetto (`bg-background`, `text-foreground`, `text-ink-muted`, `text-accent`, `bg-accent/10`, `border-accent`, `bg-surface`) per restare allineati a `src/styles.css`.
- Mantenere `ReactMarkdown` per il body, aggiungendo classi `prose` estese per blockquote/heading/link.
- Aggiungere micro-animazioni `framer-motion` (fade-up su header, lede, cover, body) coerenti con il resto del sito.
- Aggiunta di breakout della cover via negative margin solo su `md:` e `lg:`, niente overflow orizzontale su mobile.
- Nessuna modifica a server function, query, schema, header o footer.

## Fuori scopo
- Tag multipli (richiederebbero nuovo campo DB) → si usa solo la `category` esistente.
- Condivisione social, autore, reading time → non presenti nei dati attuali.
- Modifiche a `NewsCard`, `news.index.tsx`, admin editor.
