# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd

Widok "Generowanie Fiszek" umożliwia zalogowanym użytkownikom wklejenie tekstu źródłowego, zainicjowanie procesu generowania fiszek przez AI za pomocą dedykowanego endpointu API, a następnie przeglądanie, edytowanie, akceptowanie lub odrzucanie wygenerowanych propozycji. Zaakceptowane fiszki mogą zostać zapisane w kolekcji użytkownika za pomocą innego endpointu API. Widok obsługuje również stany ładowania i błędów podczas komunikacji z API.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/generate-flashcards`. Dostęp do tej ścieżki powinien być ograniczony tylko dla zalogowanych użytkowników (ochrona trasy).

## 3. Struktura komponentów

Hierarchia komponentów dla tego widoku będzie następująca:

```
src/pages/generate-flashcards.astro (GenerateFlashcardsPage)
└── src/components/FlashcardGenerator.tsx
    ├── src/components/GenerationForm.tsx (Textarea, Button)
    └── src/components/GeneratedFlashcardsList.tsx
        ├── src/components/ui/button.tsx (Button "Zapisz zaakceptowane")
        └── src/components/GeneratedFlashcardItem.tsx (Card, Input, Textarea, Button)
            └── [Elementy trybu edycji: Input, Textarea, Button, Button]
```

Komponenty UI (`button`, `textarea`, `card`, `input`) pochodzą z biblioteki Shadcn/ui.

## 4. Szczegóły komponentów

### `GenerateFlashcardsPage.astro`

- **Opis komponentu:** Główna strona Astro. Odpowiada za routing, ochronę trasy (sprawdzenie sesji użytkownika przy użyciu middleware Astro lub logiki po stronie serwera Astro), ustawienie podstawowego layoutu strony i renderowanie głównego komponentu React (`FlashcardGenerator.tsx`) z dyrektywą `client:load` (lub inną odpowiednią).
- **Główne elementy:** Standardowa struktura strony Astro (`Layout`), renderowanie `<FlashcardGenerator client:load />`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika.
- **Obsługiwana walidacja:** Sprawdzenie statusu zalogowania użytkownika przed renderowaniem zawartości.
- **Typy:** Brak specyficznych typów dla komponentu. Może przekazywać informacje o sesji/użytkowniku jako props do `FlashcardGenerator`.
- **Propsy:** Potencjalnie `userSession`.

### `FlashcardGenerator.tsx`

- **Opis komponentu:** Główny kontener React zarządzający logiką generowania fiszek. Zawiera formularz wprowadzania tekstu oraz listę wygenerowanych propozycji. Zarządza stanem całego procesu: tekstem źródłowym, stanami ładowania (generowanie, zapis), błędami (generowania, zapisu, walidacji), listą wygenerowanych fiszek (`GeneratedFlashcardViewModel[]`) oraz ID sesji generowania (`generationId`). Odpowiada za wywołania API (`POST /generations`, `POST /flashcards`). Zalecane użycie customowego hooka (`useFlashcardGeneration`) do enkapsulacji logiki stanu.
- **Główne elementy:** Renderuje `GenerationForm` i `GeneratedFlashcardsList`. Może zawierać elementy do wyświetlania ogólnych błędów (np. Shadcn `Alert`).
- **Obsługiwane interakcje:** Przekazuje handlery do komponentów podrzędnych (`handleGenerate`, `handleSaveAccepted`, `handleUpdateCardStatus`, `handleUpdateCardContent`).
- **Obsługiwana walidacja:** Koordynuje walidację tekstu źródłowego przed wysłaniem żądania generowania.
- **Typy:** `GenerationResultDTO`, `CreateGenerationCommand`, `CreateFlashcardsCommand`, `FlashcardDTO`, `GeneratedFlashcardViewModel`.
- **Propsy:** Potencjalnie `userSession`.

### `GenerationForm.tsx`

- **Opis komponentu:** Kontrolowany komponent formularza React. Zawiera pole `Textarea` (Shadcn) dla tekstu źródłowego oraz `Button` (Shadcn) "Generuj". Wyświetla błędy walidacji dotyczące pola tekstowego.
- **Główne elementy:** `form`, `Textarea`, `Button`, element do wyświetlania błędu walidacji.
- **Obsługiwane interakcje:** Zmiana tekstu w `Textarea` (`onChange`), Submisja formularza / kliknięcie przycisku "Generuj" (`onSubmit`).
- **Obsługiwana walidacja:** Długość tekstu źródłowego musi mieścić się w zakresie 1000–10000 znaków. Wyświetla komunikat błędu przekazany przez props `validationError`. Przycisk "Generuj" jest nieaktywny (`disabled`), gdy trwa ładowanie (`isLoading`) lub gdy tekst jest nieprawidłowy.
- **Typy:** Interfejs propsów: `{ sourceText: string; onSourceTextChange: (text: string) => void; onSubmit: () => void; isLoading: boolean; validationError: string | null; }`
- **Propsy:** `sourceText`, `onSourceTextChange`, `onSubmit`, `isLoading`, `validationError`.

### `GeneratedFlashcardsList.tsx`

- **Opis komponentu:** Komponent React wyświetlający listę wygenerowanych propozycji fiszek (`GeneratedFlashcardItem`). Renderowany warunkowo (tylko gdy istnieją wygenerowane fiszki). Zawiera przycisk "Zapisz zaakceptowane".
- **Główne elementy:** Kontener listy (np. `div`), mapowanie tablicy `flashcards` na komponenty `GeneratedFlashcardItem`, `Button` "Zapisz zaakceptowane".
- **Obsługiwane interakcje:** Kliknięcie przycisku "Zapisz zaakceptowane". Przekazuje handlery do `GeneratedFlashcardItem`. Przycisk "Zapisz..." jest nieaktywny, gdy trwa zapis (`isLoadingSave`) lub gdy żadna fiszka nie jest zaakceptowana.
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji, ale logika renderowania i stan przycisku zależą od stanu (`flashcards`, `isLoadingSave`).
- **Typy:** `GeneratedFlashcardViewModel[]`, `number | null` (dla `generationId`). Interfejs propsów: `{ flashcards: GeneratedFlashcardViewModel[]; generationId: number | null; onUpdateCardStatus: (index: number, status: GeneratedFlashcardViewModel['status']) => void; onUpdateCardContent: (index: number, front: string, back: string) => void; onSaveAccepted: () => void; isLoadingSave: boolean; }`
- **Propsy:** `flashcards`, `generationId`, `onUpdateCardStatus`, `onUpdateCardContent`, `onSaveAccepted`, `isLoadingSave`.

### `GeneratedFlashcardItem.tsx`

- **Opis komponentu:** Komponent React reprezentujący pojedynczą wygenerowaną propozycję fiszki. Wyświetla tekst przodu i tyłu w komponencie `Card` (Shadcn). Udostępnia kontrolki (przyciski `Button` Shadcn): "Akceptuj", "Edytuj", "Odrzuć". Umożliwia edycję inline tekstu przodu (`Input` Shadcn) i tyłu (`Textarea` Shadcn) po kliknięciu "Edytuj". Stan wizualny zmienia się w zależności od statusu (`pending`, `accepted`, `rejected`, `editing`).
- **Główne elementy:** `Card`, `div`y do wyświetlania tekstu, `Input` (edycja frontu), `Textarea` (edycja tyłu), `Button` ("Akceptuj", "Odrzuć", "Edytuj", "Zapisz" [edycja], "Anuluj" [edycja]). Elementy edycji są renderowane warunkowo.
- **Obsługiwane interakcje:** Kliknięcie przycisków Akceptuj/Odrzuć/Edytuj. W trybie edycji: zmiana tekstu w polach `Input`/`Textarea`, kliknięcie Zapisz/Anuluj.
- **Obsługiwana walidacja:** W trybie edycji: walidacja długości `front` (max 200 znaków) i `back` (max 500 znaków) - dobra praktyka, zgodna z opisem `POST /flashcards`. Przycisk "Zapisz" (edycja) jest nieaktywny, jeśli walidacja nie przejdzie.
- **Typy:** `GeneratedFlashcardViewModel`. Interfejs propsów: `{ flashcard: GeneratedFlashcardViewModel; index: number; onUpdateStatus: (index: number, status: GeneratedFlashcardViewModel['status']) => void; onUpdateContent: (index: number, front: string, back: string) => void; }`
- **Propsy:** `flashcard`, `index`, `onUpdateStatus`, `onUpdateContent`.

## 5. Typy

Oprócz typów DTO i Command zdefiniowanych w `src/types.ts` (`CreateGenerationCommand`, `GenerationResultDTO`, `GenerationDTO`, `FlashcardDTO`, `CreateFlashcardsCommand`, `CreateFlashcardCommand`), potrzebny jest następujący niestandardowy typ ViewModel:

```typescript
// Definicja w obrębie FlashcardGenerator.tsx lub w dedykowanym pliku typów dla widoku
interface GeneratedFlashcardViewModel {
  originalFront: string; // Oryginalny tekst przodu z API
  originalBack: string; // Oryginalny tekst tyłu z API
  currentFront: string; // Bieżący tekst przodu (może być edytowany)
  currentBack: string; // Bieżący tekst tyłu (może być edytowany)
  source: "ai-full" | "ai-edited"; // Śledzi, czy fiszka była edytowana
  status: "pending" | "accepted" | "rejected" | "editing"; // Stan UI dla danej propozycji
}
```

- `originalFront`, `originalBack`: Przechowują niezmieniony tekst z API, aby umożliwić porównanie i anulowanie edycji.
- `currentFront`, `currentBack`: Przechowują aktualny tekst, który jest wyświetlany i modyfikowany w trybie edycji.
- `source`: Początkowo `'ai-full'`. Zmienia się na `'ai-edited'`, jeśli użytkownik zapisze zmiany w trybie edycji. Używane podczas wysyłania do `POST /flashcards`.
- `status`: Zarządza stanem interakcji użytkownika z propozycją:
  - `pending`: Stan początkowy po wygenerowaniu.
  - `accepted`: Użytkownik kliknął "Akceptuj".
  - `rejected`: Użytkownik kliknął "Odrzuć".
  - `editing`: Użytkownik kliknął "Edytuj", trwa edycja inline.

## 6. Zarządzanie stanem

Stan komponentu `FlashcardGenerator.tsx` będzie zarządzał całym procesem. Kluczowe zmienne stanu:

- `sourceText: string`: Tekst w polu `Textarea`.
- `isLoadingGeneration: boolean`: Stan ładowania dla `POST /generations`.
- `isLoadingSave: boolean`: Stan ładowania dla `POST /flashcards`.
- `generationError: string | null`: Komunikat błędu z `POST /generations`.
- `saveError: string | null`: Komunikat błędu z `POST /flashcards`.
- `generatedFlashcards: GeneratedFlashcardViewModel[]`: Lista propozycji fiszek.
- `generationId: number | null`: ID sesji generowania zwrócone przez API.
- `validationError: string | null`: Błąd walidacji frontendu dla `sourceText`.

**Zalecenie:** Stworzenie customowego hooka `useFlashcardGeneration` w `src/lib/hooks/useFlashcardGeneration.ts` (lub podobnej lokalizacji). Hook ten enkapsulowałby całą logikę zarządzania stanem, walidacją, wywołań API i aktualizacji stanu listy `generatedFlashcards`, co znacząco uprościłoby komponent `FlashcardGenerator.tsx`.

## 7. Integracja API

- **Generowanie fiszek:**
  - Wywołanie: `POST /api/generations`
  - Trigger: Kliknięcie przycisku "Generuj" (po walidacji frontendu).
  - Ciało żądania (`CreateGenerationCommand`): `{ "source_text": "..." }` (gdzie `...` to zawartość `sourceText`).
  - Odpowiedź sukcesu (201 - `GenerationResultDTO`): `{ generation: GenerationDTO, flashcards: FlashcardDTO[] }`. Frontend zapisuje `generation.id` i mapuje `flashcards` na `GeneratedFlashcardViewModel[]`.
  - Odpowiedź błędu (400, 401, 500): JSON z polem `error`, `message`, `details`. Frontend wyświetla błąd.
- **Zapisywanie zaakceptowanych fiszek:**
  - Wywołanie: `POST /api/flashcards`
  - Trigger: Kliknięcie przycisku "Zapisz zaakceptowane".
  - Ciało żądania (`CreateFlashcardsCommand`):
    ```json
    {
      "flashcards": [
        // Mapowane z generatedFlashcards gdzie status === 'accepted'
        {
          "front": "...", // vm.currentFront
          "back": "...",  // vm.currentBack
          "source": "ai-full" | "ai-edited", // vm.source
          "generation_id": ... // Zapisane generationId
        },
        // ... więcej zaakceptowanych fiszek
      ]
    }
    ```
  - Odpowiedź sukcesu (201): `{ flashcards: FlashcardDTO[] }`. Frontend może wyczyścić listę/formularz lub pokazać komunikat sukcesu.
  - Odpowiedź błędu (400, 401, 500): JSON z polem `error`, `message`, `details`. Frontend wyświetla błąd.

Należy używać `fetch` API lub biblioteki typu `axios` lub `tanstack-query` do obsługi żądań API, zarządzania stanami ładowania i błędów.

## 8. Interakcje użytkownika

- **Wpisywanie tekstu:** Aktualizuje stan `sourceText`. Walidacja długości odbywa się na bieżąco lub przed wysłaniem.
- **Kliknięcie "Generuj":** Uruchamia walidację. Jeśli poprawna, ustawia `isLoadingGeneration`, wywołuje API. Wynik aktualizuje listę lub pokazuje błąd.
- **Kliknięcie "Akceptuj" / "Odrzuć" / "Edytuj" na fiszce:** Aktualizuje `status` odpowiedniego elementu w stanie `generatedFlashcards`. Zmienia UI elementu listy.
- **Edycja fiszki (inline):** Zmiana tekstu aktualizuje `currentFront`/`currentBack` w stanie tymczasowym edycji. Kliknięcie "Zapisz" (edycja) aktualizuje stan `generatedFlashcards` (zmieniając `currentFront/Back` i `source` na `'ai-edited'`, status na `'pending'`) i zamyka tryb edycji. Kliknięcie "Anuluj" odrzuca zmiany i zamyka tryb edycji.
- **Kliknięcie "Zapisz zaakceptowane":** Filtruje `generatedFlashcards` po `status === 'accepted'`, konstruuje payload, ustawia `isLoadingSave`, wywołuje API. Wynik czyści listę/formularz lub pokazuje błąd/sukces.

## 9. Warunki i walidacja

- **Dostęp do widoku:** Wymagane zalogowanie (sprawdzane na poziomie strony/middleware).
- **Generowanie (`POST /generations`):**
  - `sourceText`: Długość 1000-10000 znaków. Walidacja w `FlashcardGenerator.tsx` przed wysłaniem. Komunikat błędu w `GenerationForm.tsx`. Przycisk "Generuj" nieaktywny, jeśli warunek niespełniony lub trwa ładowanie.
- **Edycja fiszki (`GeneratedFlashcardItem.tsx`):**
  - `currentFront`: Max 200 znaków (dobra praktyka).
  - `currentBack`: Max 500 znaków (dobra praktyka).
  - Walidacja podczas edycji inline. Przycisk "Zapisz" (edycja) nieaktywny, jeśli warunki niespełnione.
- **Zapisywanie (`POST /flashcards`):**
  - Co najmniej jedna fiszka musi mieć `status === 'accepted'`. Przycisk "Zapisz zaakceptowane" nieaktywny, jeśli warunek niespełniony lub trwa zapis.
  - `generationId` musi być dostępne (z poprzedniego udanego wywołania `/generations`).

## 10. Obsługa błędów

- **Brak autoryzacji (401):** Przekierowanie na stronę logowania (middleware/strona). API zwraca 401, co frontend może (choć nie powinien musieć) obsłużyć komunikatem.
- **Błąd walidacji frontendu (`sourceText`):** Komunikat inline w `GenerationForm.tsx`, blokada przycisku "Generuj".
- **Błąd walidacji frontendu (edycja fiszki):** Komunikat inline w `GeneratedFlashcardItem.tsx` w trybie edycji, blokada przycisku "Zapisz" (edycja).
- **Błędy API (`POST /generations`, `POST /flashcards` - 4xx, 5xx, błędy sieci):**
  - Ustawienie odpowiedniego stanu błędu (`generationError`, `saveError`).
  - Wyświetlenie generycznego komunikatu o błędzie użytkownikowi (np. "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.") za pomocą komponentu `Alert` (Shadcn).
  - Opcjonalnie: wyświetlenie szczegółów błędu z API (jeśli są dostępne i zrozumiałe dla użytkownika).
  - Zresetowanie stanu ładowania (`isLoadingGeneration = false`, `isLoadingSave = false`).
- **Brak zaakceptowanych fiszek przy próbie zapisu:** Dezaktywacja przycisku "Zapisz zaakceptowane" lub krótki komunikat (Toast).

## 11. Kroki implementacji

1.  **Utworzenie strony Astro:** Stworzyć plik `src/pages/generate-flashcards.astro`. Dodać podstawowy layout i ochronę trasy (sprawdzenie sesji).
2.  **Stworzenie głównego komponentu React:** Stworzyć `src/components/FlashcardGenerator.tsx`. Dodać podstawową strukturę i renderować go w stronie Astro (`client:load`).
3.  **Implementacja formularza:** Stworzyć `src/components/GenerationForm.tsx`. Dodać `Textarea`, `Button` (Shadcn). Podłączyć stan `sourceText` i walidację z `FlashcardGenerator.tsx`. Dodać obsługę stanu ładowania i błędów walidacji.
4.  **Implementacja logiki generowania:** W `FlashcardGenerator.tsx` (lub hooku `useFlashcardGeneration`), zaimplementować funkcję `handleGenerate`, która waliduje tekst i wywołuje `POST /api/generations`. Dodać zarządzanie stanami `isLoadingGeneration`, `generationError`, `generatedFlashcards`, `generationId`.
5.  **Definicja ViewModelu:** Zdefiniować typ `GeneratedFlashcardViewModel`.
6.  **Implementacja listy fiszek:** Stworzyć `src/components/GeneratedFlashcardsList.tsx`. Dodać logikę renderowania listy na podstawie stanu `generatedFlashcards`.
7.  **Implementacja elementu listy:** Stworzyć `src/components/GeneratedFlashcardItem.tsx`. Dodać `Card`, przyciski Akceptuj/Odrzuć/Edytuj. Podłączyć handlery do aktualizacji stanu w `FlashcardGenerator.tsx`.
8.  **Implementacja edycji inline:** Dodać logikę warunkowego renderowania pól `Input`/`Textarea` i przycisków Zapisz/Anuluj w `GeneratedFlashcardItem.tsx`. Zaimplementować walidację i zapis edytowanych treści (`onUpdateContent`).
9.  **Implementacja zapisu zaakceptowanych:** Dodać przycisk "Zapisz zaakceptowane" w `GeneratedFlashcardsList.tsx`. W `FlashcardGenerator.tsx` (lub hooku), zaimplementować funkcję `handleSaveAccepted`, która filtruje zaakceptowane fiszki, konstruuje payload i wywołuje `POST /api/flashcards`. Dodać zarządzanie stanami `isLoadingSave`, `saveError`.
10. **Styling:** Użyć Tailwind i komponentów Shadcn/ui do ostylowania widoku zgodnie z designem aplikacji.
11. **Obsługa błędów i stanów krańcowych:** Upewnić się, że wszystkie scenariusze błędów są obsługiwane (komunikaty dla użytkownika, odpowiednie stany UI).
12. **Testowanie:** Przetestować cały przepływ: wprowadzanie tekstu (walidacja), generowanie (sukces, błąd), przeglądanie listy, akceptacja/odrzucenie/edycja, zapis (sukces, błąd). Sprawdzić responsywność i dostępność.
