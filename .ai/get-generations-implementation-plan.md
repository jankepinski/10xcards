# API Endpoint Implementation Plan: GET /generations

## 1. Przegląd punktu końcowego

Ten punkt końcowy umożliwia pobranie sesji generacji dla zalogowanego użytkownika. Endpoint wykorzystuje mechanizmy uwierzytelniania Supabase oraz RLS, aby zapewnić, że użytkownik otrzymuje jedynie swoje dane. Funkcjonalność obejmuje wsparcie paginacji, co pozwala na efektywne przeglądanie wyników.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Endpoint URL:** /generations
- **Parametry zapytania:**
  - Wymagane: Brak
  - Opcjonalne (dla paginacji):
    - `page`: Numer strony (domyślnie 1)
    - `limit`: Liczba elementów na stronę (domyślnie 10)
- **Request Body:** Nie dotyczy

## 3. Wykorzystywane typy

- **GenerationDTO:** Reprezentuje pojedynczą sesję generacji. (Zdefiniowany jako `Tables<"generations">` w `src/types.ts`)
- **GenerationsResponseDTO:** Obejmuje tablicę obiektów `GenerationDTO`. (Również zdefiniowany w `src/types.ts`)
- **Pagination:** Struktura metadanych paginacji (np. `page`, `limit`, `total`), jeśli ma być zwrócona w odpowiedzi.

## 4. Szczegóły odpowiedzi

- **Kod sukcesu:** 200
- **Struktura odpowiedzi JSON:**
  ```json
  {
    "generations": [
      {
        "id": 1,
        "model": "gpt-4",
        "source_text_hash": "hash",
        "source_text_length": 1500,
        "generated_count": 10,
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50
    }
  }
  ```
- **Kody błędów:**
  - 401: Brak autoryzacji (użytkownik nie jest zalogowany)
  - 400: Nieprawidłowe dane wejściowe (np. nieprawidłowe wartości paginacji)
  - 500: Błąd wewnętrzny serwera

## 5. Przepływ danych

1. Żądanie GET /generations trafia do serwera.
2. Middleware autoryzacyjny weryfikuje token i ustawia `auth.uid()` w kontekście.
3. Parametry paginacji (np. `page`, `limit`) są ekstraktowane i walidowane (z użyciem zod).
4. Warstwa serwisu (`GenerationService`) wykonuje zapytanie do tabeli `generations` filtrowane wg `user_id` oraz stosuje mechanizm paginacji (LIMIT/OFFSET).
5. Wyniki zapytania są mapowane na `GenerationDTO` i opakowywane w strukturę `GenerationsResponseDTO`.
6. Odpowiedź jest zwracana do klienta.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:** Endpoint dostępny wyłącznie dla zalogowanych użytkowników; uwierzytelnianie odbywa się przez Supabase Auth, a dostęp do danych jest kontrolowany przez RLS.
- **Walidacja danych:** Użycie `zod` do weryfikacji parametrów zapytania (paginycji) minimalizuje ryzyko wstrzyknięć i błędów walidacji.
- **Bezpieczne zapytania do bazy danych:** Korzystanie z bezpiecznych metod Supabase, które zapobiegają SQL injection.

## 7. Obsługa błędów

- **401 Unauthorized:** Zwracane, gdy użytkownik nie jest zalogowany.
- **400 Bad Request:** Zwracane w przypadku nieprawidłowych danych wejściowych, np. błędnych parametrów paginacji.
- **500 Internal Server Error:** Zwracane, gdy wystąpi błąd po stronie serwera lub zapytania do bazy danych.
- **Logowanie błędów:** Błędy powinny być logowane z odpowiednimi szczegółami, aby ułatwić diagnozę problemu.

## 8. Rozważania dotyczące wydajności

- **Paginacja:** Implementacja z wykorzystaniem LIMIT/OFFSET wsparta przez indeks na kolumnie `user_id` zapewnia wysoką wydajność.
- **Optymalizacja zapytań:** Wybieranie tylko potrzebnych kolumn pomaga zmniejszyć czas odpowiedzi oraz obciążenie serwera.
- **Cache:** W przypadku bardzo dużego obciążenia, rozważenie cache'owania wyników może poprawić wydajność endpointu.

## 9. Kroki implementacji

1. Utworzenie pliku endpointu w: `./src/pages/api/generations.ts`.
2. Zaimplementowanie middleware uwierzytelniającego, które przypisze wartość `auth.uid()` z Supabase do kontekstu.
3. Ekstrakcja parametrów paginacji z zapytania i walidacja przy użyciu `zod`.
4. Utworzenie lub wykorzystanie istniejącego serwisu `GenerationService` do wykonywania zapytań do tabeli `generations`:
   - Filtrowanie rekordów wg. `user_id`.
   - Zastosowanie paginacji (LIMIT/OFFSET).
5. Mapowanie wyników zapytania na `GenerationDTO` i opakowanie ich w `GenerationsResponseDTO`.
6. Implementacja obsługi błędów przy użyciu try-catch, zwracanie odpowiednich komunikatów o błędach (401, 400, 500).
