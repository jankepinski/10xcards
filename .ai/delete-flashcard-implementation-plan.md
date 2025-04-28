# API Endpoint Implementation Plan: DELETE /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint DELETE /flashcards/{id} umożliwia usunięcie fiszki z bazy danych. Operacja dotyczy tylko fiszek należących do zalogowanego użytkownika. Implementacja korzysta z wbudowanej ochrony RLS (Row-Level Security) w Supabase, zapewniając, że użytkownik może usuwać tylko swoje rekordy.

## 2. Szczegóły żądania

- **Metoda HTTP:** DELETE
- **Struktura URL:** /flashcards/{id}
- **Parametry:**
  - _id_ (wymagany): Identyfikator fiszki, który ma zostać usunięty (typ: liczbowy, BIGSERIAL).
- **Request Body:** Brak (operacja jest realizowana wyłącznie na podstawie parametru URL).

## 3. Wykorzystywane typy

- **DeleteResponseDTO:** Typ odpowiedzi potwierdzający usunięcie, definiowany w `src/types.ts`.
- Inne typy (np. dane użytkownika) są zarządzane przez mechanizm uwierzytelnienia Supabase.

## 4. Szczegóły odpowiedzi

- **Kod 200:** Fiszka została pomyślnie usunięta. Odpowiedź zawiera komunikat potwierdzający operację.
- **Kod 401:** Brak autoryzacji – dostęp do operacji bez prawidłowego tokena uwierzytelniającego.
- **Kod 404:** Fiszka o podanym identyfikatorze nie została odnaleziona lub nie należy do aktualnie zalogowanego użytkownika.
- **Kod 500:** Błąd serwera – w przypadku nieoczekiwanych błędów podczas wykonywania operacji.

## 5. Przepływ danych

1. Odczytanie parametru `id` z URL.
2. Weryfikacja autoryzacji użytkownika poprzez mechanizm uwierzytelnienia w Supabase.
3. Sprawdzenie, czy fiszka o podanym `id` istnieje i należy do zalogowanego użytkownika (RLS w bazie danych zapewnia ten mechanizm dodatkowo).
4. Wykonanie operacji usunięcia rekordu z tabeli `flashcards`.
5. Zwrócenie odpowiedzi potwierdzającej operację lub odpowiedniego komunikatu błędu.

## 6. Względy bezpieczeństwa

- **Autoryzacja:** Upewnienie się, że użytkownik jest zalogowany. W przypadku braku autoryzacji endpoint powinien zwrócić kod 401.
- **Row-Level Security:** Baza danych korzysta z mechanizmu RLS, dzięki czemu użytkownik ma dostęp jedynie do swoich fiszek.
- **Walidacja wejścia:** Walidacja parametru `id` (np. czy jest liczbą) by uniknąć potencjalnych nadużyć.
- **Obsługa wyjątków:** Zabezpieczenie operacji w bloku try-catch oraz logowanie błędów, aby błędy nie ujawniały szczegółowych informacji o systemie.

## 7. Obsługa błędów

- **401 Unauthorized:** Gdy token uwierzytelniający jest nieprawidłowy lub nie istnieje.
- **404 Not Found:** Gdy fiszka o podanym `id` nie została odnaleziona lub nie należy do zalogowanego użytkownika.
- **500 Internal Server Error:** Dla nieoczekiwanych błędów operacyjnych lub problemów z bazą danych.

## 8. Rozważania dotyczące wydajności

- Korzystanie z indeksów (np. na kolumnie `user_id` oraz `id` w tabeli `flashcards`) zapewnia szybkie wyszukiwanie rekordu.
- Operacja usunięcia jest lekka (delete na pojedynczym rekordzie) i nie powinna znacząco wpływać na wydajność systemu.
- Minimalizacja liczby zapytań do bazy – najpierw weryfikacja istnienia fiszki, następnie jej usunięcie.

## 9. Etapy wdrożenia

1. **Stworzenie pliku endpointu:** Utworzenie pliku API np. `/src/pages/api/flashcards/[id].ts`.
2. **Konfiguracja endpointu:**
   - Ustawienie `export const prerender = false`.
   - Implementacja obsługi metody DELETE.
3. **Parsowanie i walidacja:**
   - Odczytanie parametru `id` z URL i walidacja (np. użycie Zod, jeśli wymagane).
4. **Weryfikacja autoryzacji:** Pobranie danych użytkownika z kontekstu (np. `context.locals` lub middleware).
5. **Sprawdzenie istnienia rekordu:** Weryfikacja, że fiszka istnieje i jest powiązana z aktualnym użytkownikiem.
6. **Operacja usunięcia:** Wykonanie zapytania do bazy danych przy użyciu Supabase.
7. **Generowanie odpowiedzi:** Zwrócenie kodu 200 z komunikatem z użyciem `DeleteResponseDTO`.
8. **Obsługa błędów:** Zapewnienie odpowiednich odpowiedzi dla stanów błędów 401, 404 oraz 500.
