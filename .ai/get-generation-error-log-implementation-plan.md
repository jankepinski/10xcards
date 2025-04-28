# API Endpoint Implementation Plan: GET /generation-error-logs/{id}

## 1. Przegląd punktu końcowego

Endpoint GET /generation-error-logs/{id} służy do pobrania szczegółów pojedynczego wpisu błędu generacji (log błędu) na podstawie jego identyfikatora. Endpoint umożliwia użytkownikowi dostęp tylko do własnych wpisów, co jest egzekwowane przez mechanizmy RLS (Row-Level Security).

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** /generation-error-logs/{id}
- **Parametry ścieżki:**
  - `id` (wymagany): identyfikator logu błędu (np. liczba całkowita)
- **Request Body:** Brak

## 3. Wykorzystywane typy

- **GenerationErrorLogDTO:** DTO zawierające pola:
  - `id`
  - `error_code`
  - `error_message`
  - `created_at`
- Uwierzytelnienie: wykorzystanie kontekstu Supabase Auth do pobrania identyfikatora użytkownika.

## 4. Szczegóły odpowiedzi

- **Kod 200:** Sukces. Zwraca obiekt `GenerationErrorLogDTO` o strukturze:
  ```json
  {
    "id": 123,
    "error_code": "ERR_XYZ",
    "error_message": "Opis błędu",
    "created_at": "2023-XX-XXTXX:XX:XXZ"
  }
  ```
- **Kod 401:** Nieautoryzowany dostęp, gdy użytkownik nie jest zalogowany lub token jest nieprawidłowy.
- **Kod 404:** Rekord o podanym `id` nie został znaleziony lub nie należy do zalogowanego użytkownika.
- **Kod 500:** Błąd po stronie serwera (opcjonalnie).

## 5. Przepływ danych

1. **Uwierzytelnienie:** Weryfikacja tokenu/Supabase Auth; pobranie `user_id` z kontekstu (np. `context.locals.supabaseClient`).
2. **Ekstrakcja parametru:** Pobranie `id` z parametrów ścieżki i walidacja jego formatu (np. liczba).
3. **Zapytanie do bazy:** Wykonanie zapytania do tabeli `generation_error_logs`, filtrowanego po `id` oraz `user_id` (zgodnie z RLS).
4. **Odpowiedź:** Jeśli rekord istnieje – zwrócenie danych z kodem 200, w przeciwnym razie zwrócenie kodu 404.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie:** Weryfikacja tożsamości użytkownika za pomocą Supabase Auth.
- **Autoryzacja:** Mechanizm RLS w bazie danych zapewnia, że użytkownik widzi tylko własne dane.
- **Walidacja danych:** Walidacja parametru `id` (np. przy użyciu Zod) oraz ochrona przed SQL Injection poprzez stosowanie parametrów zapytań.

## 7. Obsługa błędów

- **401 Unauthorized:** Gdy brak prawidłowego uwierzytelnienia.
- **404 Not Found:** Gdy rekord nie istnieje lub nie jest dostępny dla użytkownika.
- **500 Internal Server Error:** Obsługa nieoczekiwanych błędów, opakowana w blok try/catch z logowaniem błędów.

## 8. Rozważania dotyczące wydajności

- Wykorzystanie indeksów na kolumnach `id` i `user_id` w tabeli `generation_error_logs` zapewnia szybkie zapytania.
- Optymalizacja zapytań oraz ewentualne wdrożenie cache'owania, gdyby wystąpił wzrost liczby zapytań.

## 9. Kroki implementacji

1. Utworzenie nowego pliku endpointu w lokalizacji: `src/pages/api/generation-error-logs/[id].ts`.
2. Import niezbędnych modułów: Supabase client (z `src/db/supabase.client.ts`), typy z `src/types.ts`, oraz opcjonalnie Zod do walidacji.
3. Obsługa wyłącznie metody GET; odrzucenie innych metod.
4. Ekstrakcja i walidacja parametru `id` z URL.
5. Uwierzytelnienie użytkownika i pobranie `user_id` z kontekstu.
6. Wykonanie zapytania do bazy danych z filtracją po `id` oraz `user_id`.
7. Zwrócenie odpowiedzi:
   - Sukces: JSON zawierający `GenerationErrorLogDTO` oraz kod 200.
   - W przypadku braku rekordu: kod 404.
8. Implementacja obsługi wyjątków (try/catch) i logowanie błędów, zwracając odpowiedni kod 500.
