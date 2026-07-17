# study-buddy-quiz-frontend

Interfejs użytkownika dla aplikacji Study Buddy Quiz. Zbudowany w React + Vite + Tailwind CSS.

## Wymagania

- Node.js 18+
- Własny klucz OpenAI API

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja dostępna pod `http://localhost:5173`.

## Klucz OpenAI API

Użytkownik podaje własny klucz OpenAI API bezpośrednio w formularzu (pole „Twój klucz OpenAI API"). Klucz jest przesyłany do backendu w nagłówku `X-OpenAI-Api-Key` i **nie jest nigdzie zapisywany** — ani w przeglądarce, ani na serwerze.

## Zmienne środowiskowe

| Zmienna | Opis | Domyślna wartość |
|---------|------|-----------------|
| `VITE_API_URL` | Adres URL backendu | `http://localhost:5122` |

Utwórz plik `.env.local` dla lokalnego developmentu:

```
VITE_API_URL=http://localhost:5122
```

## Wdrożenie (Vercel)

1. Zaimportuj repozytorium w panelu Vercel
2. Ustaw zmienną środowiskową `VITE_API_URL` na adres backendu z Render.com
3. Vercel automatycznie wykryje konfigurację Vite
