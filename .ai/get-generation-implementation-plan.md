# API Endpoint Implementation Plan: GET /generations/{id}

## 1. Przegląd punktu końcowego

Endpoint umożliwia pobranie szczegółowych informacji o sesji generacji. Użytkownik, będąc zalogowanym, może uzyskać dane dotyczące konkretnej sesji generacji, zgodnie z zasadami RLS, co gwarantuje dostęp tylko do własnych zasobów.

## 2. Szczegóły żądania

- **Metoda HTTP:** GET
- **Struktura URL:** /generations/{id}
- **Parametry:**
  - **Wymagane:**
    - `id` (ścieżkowy, liczba) – identyfikator sesji generacji
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy

- **GenerationDTO:** Reprezentuje strukturę danych sesji generacji zgodnie z definiowanymi typami w projekcie.
- (Opcjonalnie) **GenerationErrorLogDTO:** Do logowania błędów, jeśli wdrożymy dodatkowe mechanizmy monitoringu.

## 4. Szczegóły odpowiedzi

- **200 OK:** Zwraca obiekt typu `GenerationDTO` zawierający szczegóły sesji generacji.
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony.
- **404 Not Found:** Sesja generacji o podanym `id` nie została znaleziona lub nie należy do uwierzytelnionego użytkownika.
- **400 Bad Request:** Błędny format lub brak parametru `id`.
- **500 Internal Server Error:** Wewnętrzny błąd serwera.

## 5. Przepływ danych

1. Klient wysyła żądanie GET na `/generations/{id}` z prawidłowym tokenem autoryzacyjnym.
2. Po stronie serwera:
   - Walidacja tokenu oraz uwierzytelnienie użytkownika (używając `supabase` z `context.locals`).
   - Walidacja parametru `id` (sprawdzenie, czy jest liczbą).
   - Wykonanie zapytania do bazy danych tabeli `generations`, filtrując rekord według `id` oraz `user_id` odpowiadającego zalogowanemu użytkownikowi.
3. W przypadku pomyślnego znalezienia rekordu:
   - Zwrócenie danych sesji generacji (objekt `GenerationDTO`) z kodem 200.
4. W przypadku nieznalezienia rekordu:
   - Zwrócenie błędu 404.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie:** Sprawdzenie poprawności tokenu użytkownika. Jeśli użytkownik nie jest uwierzytelniony, zwracamy 401.
- **Autoryzacja:** Zapewnienie, że sesja generacji należy do użytkownika poprzez sprawdzenie `user_id`, zgodnie z RLS w bazie danych.
- **Walidacja danych:** Zapewnienie, że parametr `id` jest liczbą, aby zapobiec SQL Injection i błędom formatu.

## 7. Obsługa błędów

- **401 Unauthorized:** Brak autoryzacji.
- **404 Not Found:** Sesja generacji o podanym `id` nie istnieje lub nie należy do użytkownika.
- **400 Bad Request:** Nieprawidłowy format parametru `id` lub jego brak.
- **500 Internal Server Error:** Nieoczekiwany błąd podczas przetwarzania żądania. Możliwe dodatkowe logowanie błędów do systemu monitorowania lub tabeli `generation_error_logs`.

## 8. Rozważania dotyczące wydajności

- Użycie indeksów na kolumnach `id` i `user_id` w tabeli `generations` zapewnia szybkie wyszukiwanie.
- Optymalizacja zapytania: pobieranie tylko niezbędnych pól.
- Rozważenie cache'owania dla często odczytywanych sesji generacji, jeśli to konieczne.

## 9. Etapy wdrożenia

1. **Inicjalizacja endpointu:** Utworzenie pliku API endpointu, np. `src/pages/api/generations/[id].ts`.
2. **Implementacja uwierzytelniania:** Wykorzystanie `supabase` z `context.locals` do weryfikacji tokenu/sesji użytkownika.
3. **Walidacja parametrów:** Sprawdzenie, czy parametr `id` jest obecny i ma prawidłowy format (liczba).
4. **Zapytanie do bazy:** Wykonanie zapytania do tabeli `generations` z filtrem po `id` oraz `user_id` odpowiadającym zalogowanemu użytkownikowi.
5. **Obsługa wyników:**
   - W przypadku sukcesu: zwrócenie danych sesji generacji z kodem 200.
   - W przypadku braku rekordu: zwrócenie 404 Not Found.
6. **Obsługa wyjątków:** Implementacja mechanizmu try-catch zapewniającego zwrócenie odpowiednich kodów błędów (400, 401, 500).
