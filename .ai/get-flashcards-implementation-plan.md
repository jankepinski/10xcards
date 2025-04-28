# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego

Endpoint GET /flashcards umożliwia pobranie spersonalizowanej, paginowanej listy fiszek powiązanych z obecnie zalogowanym użytkownikiem. Wykorzystując mechanizmy RLS (Row-Level Security) dostępne w Supabase, endpoint gwarantuje, że użytkownik widzi jedynie swoje dane. Endpoint wspiera opcjonalne parametry do sortowania i filtrowania wyników.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Ścieżka URL:** /flashcards
- **Parametry zapytania:**
  - **Opcjonalne:**
    - `page` (domyślnie 1) – numer strony do pobrania
    - `limit` (domyślnie 20) – liczba rekordów na stronę
    - `sort` – kolumna do sortowania, np. `created_at`
    - `filter` – warunek filtrowania, np. po źródle (manual, ai-full, ai-edited)
- **Body:** Brak

## 3. Wykorzystywane typy

- `FlashcardDTO` – reprezentacja pojedynczej fiszki.
- `FlashcardsResponseDTO` – struktura odpowiedzi zawierająca listę fiszek i metadane paginacji.
- `Pagination` – informacje o paginacji (page, limit, total).

## 4. Szczegóły odpowiedzi

- **Struktura odpowiedzi:**
  ```json
  {
    "flashcards": [
      { "id": 1, "front": "...", "back": "...", "source": "manual", "created_at": "..." },
      ...
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- **Kody statusu:**
  - 200 – sukces, dane zostały pobrane
  - 401 – nieautoryzowany dostęp
  - 500 – błąd serwera

## 5. Przepływ danych

1. **Autoryzacja:** Endpoint pobiera obiekt `supabase` z `locals` i wywołuje metodę `supabase.auth.getSession()` w celu pobrania sesji użytkownika. Jeśli sesja nie istnieje, zwracana jest odpowiedź 401 Unauthorized.
2. **Walidacja parametrów:** Endpoint parsuje i weryfikuje opcjonalne parametry `page`, `limit`, `sort` i `filter`, przypisując wartości domyślne tam, gdzie to konieczne.
3. **Zapytanie do bazy:** Za pomocą Supabase klienta wykonywane jest zapytanie do tabeli `flashcards` z filtrem `user_id = auth.uid()` oraz zastosowaniem mechanizmu RLS.
4. **Sortowanie i paginacja:** Dane są sortowane wg parametru `sort` (np. `created_at`) i dzielone na strony za pomocą LIMIT/OFFSET zgodnie z wartościami `page` i `limit`.
5. **Formatowanie odpowiedzi:** Wynik zapytania jest transformowany do struktury `FlashcardsResponseDTO` i zwracany jako JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Endpoint sprawdza sesję użytkownika poprzez wywołanie `supabase.auth.getSession()` z lokalnych zmiennych. Brak sesji skutkuje zwróceniem błędu 401 Unauthorized.
- **Autoryzacja:** Wykorzystanie mechanizmu RLS w Supabase zapewnia, że użytkownik otrzyma tylko swoje fiszki.
- **Walidacja wejścia:** Wszystkie przyjmowane parametry są walidowane pod kątem właściwych typów i wartości domyślnych.
- **Zapobieganie atakom:** Użycie parametrów i mechanizmów ORM Supabase zapobiega SQL Injection.

## 7. Obsługa błędów

- **401 Unauthorized:** Zwracane, gdy użytkownik nie jest zalogowany.
- **400 Bad Request:** Zwracane, gdy parametry zapytania są niepoprawne (np. wartość `page` lub `limit` nie jest liczbą).
- **500 Internal Server Error:** Zwracane w przypadku nieoczekiwanych błędów podczas przetwarzania żądania lub zapytań do bazy.

## 8. Rozważania dotyczące wydajności

- **Indeksy:** Wykorzystanie indeksów na kolumnach `user_id` (i ewentualnie `created_at` dla sortowania) w tabeli `flashcards`.
- **Paginacja:** Użycie LIMIT/OFFSET do efektywnego dzielenia dużych zbiorów danych.
- **Optymalizacja:** Monitorowanie i ewentualna optymalizacja zapytań do bazy, szczególnie przy rosnącej liczbie rekordów.

## 9. Etapy wdrożenia

1. **Utworzenie endpointu:** Stworzenie pliku `src/pages/api/flashcards.ts` z metodą GET.
2. **Implementacja autoryzacji:** Dodanie logiki weryfikacji sesji użytkownika poprzez wywołanie `supabase.auth.getSession()` w endpointzie. Brak sesji powinien skutkować zwróceniem odpowiedzi 401 Unauthorized.
3. **Walidacja parametrów:** Implementacja funkcji odpowiedzialnej za parsowanie i walidację parametrów zapytania.
4. **Integracja z usługą:** Wywołanie metody serwisowej, np. `flashcardsService.getFlashcards()`, która komunikuje się z bazą danych przez Supabase z uwzględnieniem mechanizmu RLS.
5. **Formatowanie odpowiedzi:** Transformacja wyników zapytania do struktury `FlashcardsResponseDTO`.
6. **Obsługa błędów:** Dodanie logiki obsługi błędów, zwracanie odpowiednich kodów statusu oraz logowanie błędów.
