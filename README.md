# Kaktusy i Sukulenty

Statyczna strona (HTML/CSS/JS) z bazą wiedzy o kaktusach i sukulentach oraz sekcją „Rozmaitości”.

## Zawartość i struktura

- `index.html` — strona główna.
- `main.css` — wspólne style dla strony głównej.
- `kaktusy/` — podstrony kaktusów + `spis-kaktusow.html` i `kaktusy.css`.
- `sukulenty/` — podstrony sukulentów + `spis-sukulentow.html` i `sukulenty.css`.
- `rozmaitosci/` — sekcja dodatkowa (`dodatkowe.html`) + zasoby (`dodatki.css`, `dodatki.js`, `lightbox.js`).
- `IMG/` oraz podkatalogi `*/IMG/` — grafiki, favicony itp.
- `sitemap.xml` — mapa strony dla wyszukiwarek (docelowa domena: `https://kaktusy-i-sukulenty.com/`).

## Jak uruchomić lokalnie

To jest projekt statyczny — wystarczy otworzyć `index.html` w przeglądarce.

Jeśli wolisz podgląd przez lokalny serwer (lepsze dla zasobów i ścieżek), uruchom dowolny prosty serwer HTTP w katalogu projektu.

## Jak dodać nową roślinę (kaktus lub sukulent)

1. Skopiuj jedną z istniejących podstron jako szablon:
   - `kaktusy/<nazwa>.html` albo `sukulenty/<nazwa>.html`
2. Uzupełnij treść i podmień obrazki (zwykle do `kaktusy/IMG/` lub `sukulenty/IMG/`).
3. Dodaj link do nowej strony w spisie:
   - `kaktusy/spis-kaktusow.html` lub `sukulenty/spis-sukulentow.html`
4. Zaktualizuj `sitemap.xml`:
   - dodaj nowy wpis `<url>...</url>` z właściwym `<loc>` (pełny adres) i opcjonalnie zaktualizuj `<lastmod>`

## Zasady/konwencje (praktyczne)

- Linki w HTML trzymaj względne (tak jak obecnie), żeby strona działała lokalnie i po wrzuceniu na hosting.
- Po dodaniu/zmianie podstron pamiętaj o spisie (`spis-*.html`) oraz `sitemap.xml` — to najczęściej pomijane kroki.