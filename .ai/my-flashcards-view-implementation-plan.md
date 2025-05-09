# Plan implementacji widoku Moje Fiszki

## 1. Przegląd

Widok "Moje Fiszki" umożliwia zalogowanym użytkownikom przeglądanie, edytowanie oraz usuwanie swoich zapisanych fiszek. Jest to centralne miejsce do zarządzania osobistą bazą fiszek, zarówno tych stworzonych ręcznie, jak i wygenerowanych przez AI, a następnie zaakceptowanych.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/my-flashcards`

## 3. Struktura komponentów

```
src/pages/my-flashcards.astro (Strona Astro)
└── src/components/FlashcardListContainer.tsx (Główny komponent React)
    ├── src/components/FlashcardListItem.tsx (Element listy fiszek)
    │   ├── Button (Shadcn/ui - Edytuj)
    │   └── Button (Shadcn/ui - Usuń)
    ├── src/components/EditFlashcardModal.tsx (Modal edycji fiszki)
    │   ├── Dialog (Shadcn/ui)
    │   ├── Input (Shadcn/ui - Pole "Przód")
    │   ├── Textarea (Shadcn/ui - Pole "Tył")
    │   ├── Button (Shadcn/ui - Zapisz)
    │   └── Button (Shadcn/ui - Anuluj)
    ├── src/components/ConfirmDeleteModal.tsx (Modal potwierdzenia usunięcia)
    │   ├── Dialog (Shadcn/ui)
    │   ├── Button (Shadcn/ui - Potwierdź usunięcie)
    │   └── Button (Shadcn/ui - Anuluj)
    └── src/components/PaginationControls.tsx (Komponent do obsługi paginacji)
        └── Button (Shadcn/ui - Poprzednia/Następna strona)
```

## 4. Szczegóły komponentów

### `MyFlashcardsPage.astro`

- **Opis komponentu:** Główny plik strony Astro dla widoku `/my-flashcards`. Odpowiada za podstawowy layout strony oraz renderowanie głównego komponentu React (`FlashcardListContainer`) z odpowiednią dyrektywą kliencką (np. `client:visible`). Może potencjalnie przekazywać początkowe dane do komponentu React, jeśli stosujemy Server-Side Rendering dla pierwszej partii danych, jednak bardziej prawdopodobne jest, że komponent React sam pobierze dane po stronie klienta.
- **Główne elementy:** Standardowa struktura strony Astro, `<Layout>`, osadzenie `<FlashcardListContainer client:visible />`.
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak bezpośrednich.
- **Propsy:** Brak.

### `FlashcardListContainer.tsx`

- **Opis komponentu:** Główny komponent React zarządzający logiką wyświetlania listy fiszek, modalów edycji i usuwania oraz paginacją. Odpowiada za pobieranie danych z API, zarządzanie stanem listy fiszek, obsługę błędów i stanu ładowania.
- **Główne elementy:**
  - Lista komponentów `FlashcardListItem`.
  - Komponent `EditFlashcardModal` (renderowany warunkowo).
  - Komponent `ConfirmDeleteModal` (renderowany warunkowo).
  - Komponent `PaginationControls`.
  - Komunikaty o stanie ładowania, błędach lub braku fiszek.
- **Obsługiwane interakcje:**
  - Inicjalizacja pobierania fiszek przy montowaniu komponentu.
  - Otwarcie modala edycji po kliknięciu "Edytuj" na fiszce.
  - Otwarcie modala potwierdzenia usunięcia po kliknięciu "Usuń" na fiszce.
  - Obsługa zapisu zmian z modala edycji.
  - Obsługa potwierdzenia usunięcia z modala usuwania.
  - Zmiana strony (paginacja).
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji; deleguje do `EditFlashcardModal`.
- **Typy:** `FlashcardListItemViewModel[]`, `Pagination`, `FlashcardListItemViewModel | null` (dla aktualnie edytowanej/usuwanej fiszki).
- **Propsy:** Brak (pobiera dane samodzielnie).

### `FlashcardListItem.tsx`

- **Opis komponentu:** Wyświetla pojedynczą fiszkę na liście. Pokazuje przód, tył (lub ich skróconą wersję/możliwość rozwinięcia) oraz przyciski akcji.
- **Główne elementy:**
  - Tekst przodu fiszki.
  - Tekst tyłu fiszki.
  - `Button` "Edytuj".
  - `Button` "Usuń".
  - Opcjonalnie: data utworzenia/modyfikacji, źródło fiszki.
- **Obsługiwane interakcje:**
  - `onClickEdit(flashcard: FlashcardListItemViewModel)`: Wywołuje funkcję przekazaną z rodzica, aby otworzyć modal edycji.
  - `onClickDelete(flashcardId: string)`: Wywołuje funkcję przekazaną z rodzica, aby otworzyć modal potwierdzenia usunięcia.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardListItemViewModel`.
- **Propsy:**
  - `flashcard: FlashcardListItemViewModel`
  - `onEdit: (flashcard: FlashcardListItemViewModel) => void`
  - `onDelete: (flashcardId: string) => void`

### `EditFlashcardModal.tsx`

- **Opis komponentu:** Modal (okno dialogowe) służące do edycji treści wybranej fiszki. Zawiera formularz z polami na przód i tył fiszki.
- **Główne elementy:**
  - Komponent `Dialog` z Shadcn/ui (obejmujący `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`).
  - `Input` dla przodu fiszki.
  - `Textarea` dla tyłu fiszki.
  - `Button` "Zapisz".
  - `Button` "Anuluj".
  - Komunikaty błędów walidacji.
- **Obsługiwane interakcje:**
  - `onSave(updatedData: EditFlashcardFormData)`: Wywołuje funkcję przekazaną z rodzica po walidacji i kliknięciu "Zapisz".
  - `onClose()`: Wywołuje funkcję przekazaną z rodzica do zamknięcia modala.
  - Aktualizacja wewnętrznego stanu formularza przy wpisywaniu tekstu.
- **Obsługiwana walidacja:**
  - Pole "Przód":
    - Wymagane. Komunikat: "Pole 'Przód' jest wymagane."
    - Maksymalna długość: 200 znaków. Komunikat: "Pole 'Przód' może mieć maksymalnie 200 znaków."
  - Pole "Tył":
    - Wymagane. Komunikat: "Pole 'Tył' jest wymagane."
    - Maksymalna długość: 500 znaków. Komunikat: "Pole 'Tył' może mieć maksymalnie 500 znaków."
- **Typy:** `EditFlashcardFormData`, `FlashcardListItemViewModel` (dla początkowych danych).
- **Propsy:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onSave: (flashcardId: string, data: EditFlashcardFormData) => Promise<void>`
  - `flashcard: FlashcardListItemViewModel | null` (dane fiszki do edycji)

### `ConfirmDeleteModal.tsx`

- **Opis komponentu:** Modal (okno dialogowe) służące do potwierdzenia operacji usunięcia fiszki.
- **Główne elementy:**
  - Komponent `Dialog` z Shadcn/ui.
  - Tekst pytający o potwierdzenie usunięcia.
  - `Button` "Potwierdź usunięcie" (lub "Usuń").
  - `Button` "Anuluj".
- **Obsługiwane interakcje:**
  - `onConfirmDelete(flashcardId: string)`: Wywołuje funkcję przekazaną z rodzica po kliknięciu "Potwierdź usunięcie".
  - `onClose()`: Wywołuje funkcję przekazaną z rodzica do zamknięcia modala.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `string` (dla `flashcardId`).
- **Propsy:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onConfirm: (flashcardId: string) => Promise<void>`
  - `flashcardId: string | null` (ID fiszki do usunięcia)

### `PaginationControls.tsx`

- **Opis komponentu:** Komponent do nawigacji między stronami listy fiszek.
- **Główne elementy:**
  - `Button` "Poprzednia".
  - `Button` "Następna".
  - Informacja o bieżącej stronie i całkowitej liczbie stron/elementów.
- **Obsługiwane interakcje:**
  - `onPageChange(newPage: number)`: Wywołuje funkcję przekazaną z rodzica do zmiany strony.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `Pagination`.
- **Propsy:**
  - `pagination: Pagination`
  - `onPageChange: (page: number) => void`

## 5. Typy

Oprócz typów DTO z `src/types.ts` (`FlashcardDTO`, `UpdateFlashcardCommand`, `DeleteResponseDTO`, `FlashcardsResponseDTO`, `Pagination`), zdefiniujemy następujące typy ViewModel:

- **`FlashcardListItemViewModel`**: Typ używany do wyświetlania fiszek na liście i przekazywania danych do modala edycji.

  ```typescript
  interface FlashcardListItemViewModel {
    id: string; // Zakładając UUID
    front: string;
    back: string;
    source: string | null;
    // Opcjonalnie, jeśli potrzebne do wyświetlenia:
    // created_at?: string;
    // updated_at?: string;
  }
  ```

  _Uwaga: `FlashcardDTO` zawiera wiele pól związanych z algorytmem powtórek, które mogą nie być potrzebne w tym widoku. `FlashcardListItemViewModel` może być podzbiorem `FlashcardDTO`._

- **`EditFlashcardFormData`**: Typ dla danych formularza w modalu edycji.
  ```typescript
  interface EditFlashcardFormData {
    front: string;
    back: string;
  }
  ```

## 6. Zarządzanie stanem

Stan będzie zarządzany głównie w komponencie `FlashcardListContainer.tsx` przy użyciu hooków React (`useState`, `useEffect`).

- **`flashcards: FlashcardListItemViewModel[]`**: Lista fiszek pobranych z API.
- **`pagination: Pagination | null`**: Informacje o paginacji (`{ page, limit, total }`).
- **`currentPage: number`**: Aktualnie wybrana strona.
- **`isLoading: boolean`**: Flaga informująca o stanie ładowania danych (np. podczas pobierania listy, zapisywania, usuwania).
- **`error: string | null`**: Komunikat o błędzie, jeśli wystąpił problem z API.
- **`editingFlashcard: FlashcardListItemViewModel | null`**: Fiszka aktualnie wybrana do edycji. Przekazywana do `EditFlashcardModal`.
- **`showEditModal: boolean`**: Kontroluje widoczność `EditFlashcardModal`.
- **`deletingFlashcardId: string | null`**: ID fiszki wybranej do usunięcia. Przekazywane do `ConfirmDeleteModal`.
- **`showDeleteModal: boolean`**: Kontroluje widoczność `ConfirmDeleteModal`.

Rozważenie stworzenia custom hooka `useFlashcards(initialPage: number, initialLimit: number)`:

- **Odpowiedzialności:**
  - Pobieranie fiszek (`fetchFlashcards`).
  - Aktualizacja fiszki (`updateFlashcard`).
  - Usuwanie fiszki (`deleteFlashcard`).
  - Zarządzanie stanami `flashcards`, `pagination`, `isLoading`, `error`, `currentPage`.
- **Zwracane wartości:** `{ flashcards, pagination, isLoading, error, currentPage, updateFlashcard, deleteFlashcard, setCurrentPage }`.

## 7. Integracja API

Integracja z API będzie realizowana poprzez wywołania `fetch` do odpowiednich endpointów zdefiniowanych w `src/pages/api/flashcards.ts` i `src/pages/api/flashcards/[id].ts`.

- **Pobieranie listy fiszek:**

  - Endpoint: `GET /api/flashcards`
  - Parametry zapytania: `page` (numer strony, domyślnie 1), `limit` (liczba elementów na stronie, domyślnie np. 10 lub 20).
  - Typ odpowiedzi: `Promise<FlashcardsResponseDTO>`
  - Użycie: Przy pierwszym renderowaniu komponentu `FlashcardListContainer` oraz przy zmianie strony przez `PaginationControls`.

- **Aktualizacja fiszki:**

  - Endpoint: `PUT /api/flashcards/{id}` (gdzie `{id}` to ID edytowanej fiszki)
  - Metoda: `PUT`
  - Ciało żądania (JSON): `UpdateFlashcardCommand` czyli `{ front: string, back: string }`.
    _Uwaga: Opis API wspomina o możliwości aktualizacji `source`, jednak obecna implementacja endpointu `PUT /api/flashcards/[id].ts` aktualizuje tylko `front` i `back`. Ten plan zakłada zgodność z implementacją endpointu. Jeśli `source` ma być aktualizowane, endpoint musi zostać zmodyfikowany._
  - Typ odpowiedzi: `Promise<FlashcardDTO>` (zaktualizowana fiszka)
  - Użycie: Po zatwierdzeniu zmian w `EditFlashcardModal`.

- **Usuwanie fiszki:**
  - Endpoint: `DELETE /api/flashcards/{id}` (gdzie `{id}` to ID usuwanej fiszki)
  - Metoda: `DELETE`
  - Typ odpowiedzi: `Promise<DeleteResponseDTO>` (komunikat potwierdzający)
  - Użycie: Po potwierdzeniu usunięcia w `ConfirmDeleteModal`.

Wszystkie wywołania API powinny obsługiwać stany ładowania oraz potencjalne błędy, aktualizując odpowiednio stan komponentu.

## 8. Interakcje użytkownika

- **Przeglądanie listy:** Użytkownik widzi listę swoich fiszek. Jeśli lista jest długa, może używać kontrolek paginacji do nawigacji.
- **Inicjacja edycji:** Użytkownik klika przycisk "Edytuj" przy wybranej fiszce. Otwiera się modal `EditFlashcardModal` z danymi tej fiszki.
- **Edycja danych:** Użytkownik modyfikuje pola "Przód" i/lub "Tył" w modalu.
- **Zapis zmian:** Użytkownik klika "Zapisz" w `EditFlashcardModal`.
  - Jeśli walidacja przejdzie: Dane są wysyłane do API, lista fiszek jest aktualizowana, modal się zamyka. Wyświetlany jest wskaźnik ładowania podczas operacji.
  - Jeśli walidacja nie przejdzie: Pod polami formularza wyświetlane są komunikaty o błędach.
- **Anulowanie edycji:** Użytkownik klika "Anuluj" w `EditFlashcardModal`. Modal się zamyka bez zapisywania zmian.
- **Inicjacja usuwania:** Użytkownik klika przycisk "Usuń" przy wybranej fiszce. Otwiera się modal `ConfirmDeleteModal`.
- **Potwierdzenie usunięcia:** Użytkownik klika "Potwierdź usunięcie" w `ConfirmDeleteModal`. Fiszka jest usuwana poprzez API, lista fiszek jest aktualizowana, modal się zamyka. Wyświetlany jest wskaźnik ładowania.
- **Anulowanie usuwania:** Użytkownik klika "Anuluj" w `ConfirmDeleteModal`. Modal się zamyka, fiszka nie jest usuwana.
- **Zmiana strony (paginacja):** Użytkownik klika przyciski "Następna"/"Poprzednia strona". Lista fiszek jest aktualizowana o dane z nowej strony.

## 9. Warunki i walidacja

- **`EditFlashcardModal` (walidacja po stronie klienta przed wysłaniem do API):**
  - **Pole `front`**:
    - Nie może być puste.
    - Maksymalna długość: 200 znaków.
  - **Pole `back`**:
    - Nie może być puste.
    - Maksymalna długość: 500 znaków.
  - W przypadku niespełnienia warunków, wyświetlane są odpowiednie komunikaty przy polach formularza, a przycisk "Zapisz" może być nieaktywny lub kliknięcie nie wywoła wysłania danych.
- **Stan interfejsu:**
  - Przyciski "Edytuj" i "Usuń" są dostępne dla każdej fiszki na liście.
  - Podczas operacji API (pobieranie, zapis, usuwanie) wyświetlany jest globalny lub lokalny wskaźnik ładowania (np. spinner, dezaktywacja przycisków).
  - Jeśli lista fiszek jest pusta, wyświetlany jest odpowiedni komunikat (np. "Nie masz jeszcze żadnych fiszek.").
  - Błędy API są komunikowane użytkownikowi (np. za pomocą tostów lub komunikatów w obszarze listy).

## 10. Obsługa błędów

- **Błędy sieciowe / serwera (np. 500, 503):**
  - Przy pobieraniu listy: Wyświetlić komunikat "Nie udało się pobrać fiszek. Spróbuj odświeżyć stronę." Możliwość ponowienia akcji.
  - Przy zapisie/usuwaniu: Wyświetlić komunikat "Operacja nie powiodła się. Spróbuj ponownie." w modalu lub jako tost. Nie zamykać modala automatycznie, aby umożliwić ponowną próbę.
- **Błąd 404 (Not Found):**
  - Przy aktualizacji/usuwaniu fiszki, której już nie ma: Wyświetlić komunikat "Nie znaleziono fiszki. Mogła zostać usunięta wcześniej." Zaktualizować listę.
- **Błąd 400 (Bad Request - błąd walidacji po stronie serwera):**
  - Chociaż walidacja frontendowa powinna temu zapobiegać, jeśli API zwróci 400 z `details`, można spróbować wyświetlić te błędy użytkownikowi w modalu edycji.
- **Błąd 401 (Unauthorized):**
  - Obecnie endpointy mają wyłączoną autentykację. W przyszłości: przekierowanie do strony logowania lub wyświetlenie komunikatu o braku autoryzacji.
- **Wyświetlanie błędów:** Użycie tostów (np. z biblioteki takiej jak `react-hot-toast` lub wbudowanych w Shadcn/ui) lub dedykowanych miejsc na komunikaty o błędach w interfejsie.

## 11. Kroki implementacji

1.  **Przygotowanie struktury plików:**
    - Utworzenie pliku strony `src/pages/my-flashcards.astro`.
    - Utworzenie katalogu `src/components/my-flashcards/` (lub podobnego) na komponenty React tego widoku.
    - Utworzenie plików: `FlashcardListContainer.tsx`, `FlashcardListItem.tsx`, `EditFlashcardModal.tsx`, `ConfirmDeleteModal.tsx`, `PaginationControls.tsx`.
2.  **Implementacja strony Astro (`MyFlashcardsPage.astro`):**
    - Dodanie podstawowego layoutu.
    - Osadzenie komponentu `<FlashcardListContainer client:visible />` (lub `client:load`).
3.  **Implementacja typów ViewModel:**
    - Zdefiniowanie `FlashcardListItemViewModel` i `EditFlashcardFormData` w odpowiednim pliku (np. `src/types/viewModels.ts` lub bezpośrednio w komponentach, jeśli są lokalne).
4.  **Implementacja komponentu `FlashcardListContainer.tsx`:**
    - Zarządzanie stanem (lista fiszek, paginacja, ładowanie, błędy, stan modali).
    - Implementacja logiki pobierania fiszek z API (`GET /api/flashcards`) przy użyciu `useEffect` i `fetch`. Obsługa paginacji.
    - Przekazanie funkcji do otwierania modali edycji/usuwania.
    - Implementacja funkcji callback dla zapisu (`handleSaveFlashcard`) i usunięcia (`handleDeleteFlashcard`), które będą wywoływać odpowiednie API (`PUT`, `DELETE`).
    - Renderowanie listy `FlashcardListItem`, `EditFlashcardModal`, `ConfirmDeleteModal` i `PaginationControls`.
    - Wyświetlanie stanów ładowania i błędów.
5.  **Implementacja komponentu `PaginationControls.tsx`:**
    - Przyjmowanie propsów `pagination` i `onPageChange`.
    - Renderowanie przycisków nawigacyjnych i informacji o stronach.
    - Wywoływanie `onPageChange` przy kliknięciu.
6.  **Implementacja komponentu `FlashcardListItem.tsx`:**
    - Przyjmowanie propsa `flashcard: FlashcardListItemViewModel` oraz funkcji `onEdit`, `onDelete`.
    - Wyświetlanie danych fiszki.
    - Dodanie przycisków "Edytuj" i "Usuń" wywołujących odpowiednie funkcje callback.
7.  **Implementacja komponentu `EditFlashcardModal.tsx`:**
    - Użycie komponentu `Dialog` z Shadcn/ui.
    - Zarządzanie stanem formularza (`formData`).
    - Implementacja walidacji pól `front` i `back`.
    - Wywołanie `onSave` z `flashcardId` i danymi formularza po pomyślnej walidacji.
    - Wywołanie `onClose` przy anulowaniu.
8.  **Implementacja komponentu `ConfirmDeleteModal.tsx`:**
    - Użycie komponentu `Dialog` z Shadcn/ui.
    - Wyświetlenie komunikatu potwierdzenia.
    - Wywołanie `onConfirm` z `flashcardId` po potwierdzeniu.
    - Wywołanie `onClose` przy anulowaniu.
9.  **Styling:**
    - Użycie Tailwind CSS do stylowania wszystkich komponentów.
    - Wykorzystanie predefiniowanych stylów i komponentów z Shadcn/ui.
10. **Testowanie:**
    - Testowanie ręczne wszystkich interakcji użytkownika (przeglądanie, edycja, usuwanie, paginacja).
    - Testowanie obsługi błędów (symulowanie błędów API, wprowadzanie niepoprawnych danych).
    - Testowanie responsywności na różnych urządzeniach.
11. **Refaktoryzacja i optymalizacja:**
    - Rozważenie wydzielenia logiki zarządzania stanem do custom hooka `useFlashcards`, jeśli komponent `FlashcardListContainer` stanie się zbyt złożony.
    - Optymalizacja liczby renderowań.
