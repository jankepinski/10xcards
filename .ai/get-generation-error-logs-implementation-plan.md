# API Endpoint Implementation Plan: GET /generation-error-logs

## 1. Przegląd punktu końcowego

Endpoint służy do pobierania listy dziennika błędów generacji AI dla aktualnie zalogowanego użytkownika. Umożliwia diagnostykę błędów, które wystąpiły podczas generacji treści przez system AI.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** /generation-error-logs
- **Parametry:**
  - Wymagane: Brak dodatkowych parametrów (autoryzacja odbywa się przez sesję użytkownika)
  - Opcjonalne: Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy

- **GenerationErrorLogDTO:** Zdefiniowany w `src/types.ts`, obejmuje pola: `id`, `error_code`, `error_message`, `created_at`.

## 4. Szczegóły odpowiedzi

- **Kody statusu:**
  - 200: Sukces – zwraca listę błędów
  - 401: Nieautoryzowany – gdy użytkownik nie jest zalogowany
  - 500: Błąd serwera – w przypadku awarii
- **Struktura odpowiedzi:**
  ```json
  {
    "error_logs": [
      { "id": 1, "error_code": "ERR001", "error_message": "Detailed error message", "created_at": "..." }
      // ... kolejne logi
    ]
  }
  ```

## 5. Przepływ danych

1. Odbiór żądania GET na endpoint `/generation-error-logs`.
2. Weryfikacja sesji użytkownika przy użyciu Supabase (używamy `context.locals.supabase` do autoryzacji).
3. Wykonanie zapytania do tabeli `generation_error_logs`, filtrowanie po `user_id` (RLS gwarantuje dostęp tylko do logów danego użytkownika).
4. Ekstrakcja wymaganych pól (zgodnie z `GenerationErrorLogDTO`).
5. Zwrócenie wyników w formacie JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie i autoryzacja:** Użycie Supabase Auth; RLS w tabeli `generation_error_logs` zapewnia, że użytkownik widzi tylko swoje logi.
- **Walidacja:** Sprawdzenie poprawności sesji; brak dodatkowych danych wejściowych, więc walidacja ogranicza się do weryfikacji autentyczności.
- **Ochrona przed nadużyciami:** Rozważenie implementacji limitów zapytań lub paginacji dla dużych zbiorów danych.

## 7. Obsługa błędów

- **401 Unauthorized:** Zwracane gdy użytkownik nie jest uwierzytelniony.
- **500 Internal Server Error:** Zwracane w przypadku błędów przy dostępie do bazy danych lub nieoczekiwanych wyjątków.
- **Mechanizm:** Użycie bloków try-catch do wychwytywania wyjątków, logowanie błędów oraz zwracanie przyjaznych komunikatów błędów.

## 8. Rozważania dotyczące wydajności

- **Indeksy:** Wykorzystanie indeksu na kolumnie `user_id` w tabeli `generation_error_logs` dla szybkiego filtrowania logów.
- **Optymalizacja zapytań:** Upewnienie się, że zapytania SQL są zoptymalizowane. W przyszłości, jeśli liczba logów znacząco wzrośnie, rozważyć implementację paginacji (limit/offset).

## 9. Etapy wdrożenia

1. **Stworzenie endpointa:** Utworzenie nowego pliku w `./src/pages/api` (np. `generation-error-logs.ts`).
2. **Autoryzacja:** Implementacja weryfikacji sesji przy użyciu Supabase (pobranie danych z `context.locals.supabase`).
3. **Service layer:** Wyodrębnienie logiki zapytań do nowego serwisu, np. `errorLogsService.ts` w katalogu `./src/lib/services`.
4. **Zapytanie do bazy:** W serwisie, wykonanie zapytania do tabeli `generation_error_logs` z filtrowaniem po `user_id`.
5. **Mapowanie wyników:** Przekształcenie wyników zapytania tak, aby odpowiadały strukturze `GenerationErrorLogDTO`.
6. **Obsługa błędów:** Dodanie bloków try-catch dla wychwytywania błędów, zwracanie statusów 401 lub 500 odpowiednio.
