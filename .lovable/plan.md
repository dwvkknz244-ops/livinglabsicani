## Cosa cambia

Solo l'aspetto del riquadro che contiene la mappa, la legenda, le liste dei comuni e la riga di statistiche — su `src/routes/territorio.tsx`. **La mappa SVG, l'outline della Sicilia, il bordo tratteggiato della Città Metropolitana di Palermo e tutte le posizioni dei punti restano identiche.**

Direzione scelta (Griglia architetturale + chip): conserva la palette del sito (off-white caldo + viola `#8685FD`) ma rende il blocco molto più curato e moderno.

## Modifiche puntuali

1. **Cornice della mappa**
   - Aggiungere un sottile alone viola morbido dietro la card della mappa (gradient soft `blur` + `opacity`).
   - Aumentare il raggio dei bordi (`rounded-[2rem]`) e l'ombra (`shadow-2xl`).
   - Mantenere il fondo scuro attuale `#2b3445` (o spostarlo a `#1A1A1E` per maggiore contrasto col viola).
   - Pulsante "Mostra intera Sicilia": stile glass più raffinato (`bg-white/10 backdrop-blur-md border border-white/20`).

2. **Pannello Legenda**
   - Card bianca con bordo sottile `border-foreground/8`, raggio `rounded-3xl`, padding più generoso.
   - Pallini con anello (`ring-4 ring-accent/20`) per dare profondità.
   - Etichetta "LEGENDA" in tracking ampio.

3. **Comuni → chip pill (cambiamento più visibile)**
   - Sostituire le due liste verticali con due gruppi di **chip pill** (`px-3 py-1.5 rounded-full border`).
   - Provincia Agrigento: chip neutri, hover viola; Bivona è il chip pieno viola con badge "CAPOFILA".
   - Provincia Palermo: chip neutri con accento viola-light.
   - Mantiene il click/hover esistente che apre il drawer del comune.

4. **Riga statistiche**
   - Card più ariose (`rounded-[2rem]`, padding maggiore).
   - Numero principale in font monospace (es. JetBrains Mono via Google Fonts) per stacco "dato".
   - Lieve hover-lift `hover:-translate-y-1`.

5. **Header sezione**
   - Aumentare leggermente il titolo (`text-6xl md:text-7xl`) e la spaziatura sopra la griglia.

## Cosa NON cambia

- Il file SVG della Sicilia (`SICILY_PATH`, viewBox, proiezione).
- Coordinate e marker dei 12 comuni, l'animazione del capofila, il bordo tratteggiato di Palermo, le etichette "AGRIGENTO" / "CITTÀ METROPOLITANA DI PALERMO".
- Il drawer di dettaglio del comune e la sua logica.
- Header, footer, routing, dati `COMUNI`.

## Note tecniche

- Tutte le modifiche in `src/routes/territorio.tsx` tra la riga ~660 (griglia mappa+sidebar) e ~770 (statistiche).
- Aggiungere import di `JetBrains Mono` in `src/styles.css` con `@import url(...)` e token `--font-mono` sotto `@theme`, oppure usare `font-mono` di Tailwind (DejaVu/ui-monospace) senza nuovi font per restare leggeri.
- Nessun nuovo pacchetto, nessuna modifica al backend, nessun nuovo asset.