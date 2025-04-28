# API Endpoint Implementation Plan: PUT /flashcards/{id}

## 1. Przegląd punktu końcowego

Endpoint służy do aktualizacji istniejącej fiszki (flashcard). Użytkownik przesyła zmodyfikowane dane (front i back), które zostaną zaktualizowane w rekordzie bazy danych. Endpoint jest zabezpieczony mechanizmem autoryzacji (Supabase Auth) i wykorzystuje kontrolę dostępu RLS, aby zapewnić, że użytkownik aktualizuje jedynie swoje fiszki.

## 2. Szczegóły żądania

- Metoda HTTP: PUT
- Struktura URL: /flashcards/{id}
- Parametry:
  - Wymagany: `id` (parametr ścieżki identyfikujący fiszkę)
- Request Body:
  ```json
  {
    "front": "Updated front text",
    "back": "Updated back text"
  }
  ```
  - Wartości:
    - `front`: tekst, maksymalnie 200 znaków (wymagany)
    - `back`: tekst, maksymalnie 500 znaków (wymagany)

## 3. Wykorzystywane typy

- DTO: `FlashcardDTO`
- Command Model: `UpdateFlashcardCommand` (definiowany jako: Pick<TablesUpdate<"flashcards">, "front" | "back">). Uwaga: Pole `source` nie jest przekazywane w ciele żądania, lecz jego wartość jest ustalana automatycznie na podstawie poprzedniej wartości: jeśli oryginalne `source` było ustawione jako `ai-full`, zostanie zmienione na `ai-edited`; w przeciwnym razie pozostaje bez zmian (np. `manual`).

## 4. Szczegóły odpowiedzi

- Sukces: kod statusu 200, zwraca zaktualizowany obiekt fiszki w formacie JSON.
- Kody błędów:
  - 400: błędy walidacji (np. przekroczenie limitów znaków)
  - 401: brak autoryzacji lub niewłaściwe dane uwierzytelniające
  - 404: fiszka o podanym `id` nie istnieje lub nie należy do zalogowanego użytkownika
  - 500: błędy serwera

## 5. Przepływ danych

1. Klient wysyła żądanie PUT /flashcards/{id} z nagłówkiem `Authorization: Bearer <token>` oraz JSON zawierającym nowe wartości pól `front` i `back`.
2. Serwer weryfikuje token autoryzacyjny przy użyciu Supabase Auth.
3. Dane wejściowe są walidowane przy użyciu np. biblioteki `zod`:
   - Sprawdzenie długości pól `front` (max 200) i `back` (max 500).
4. Po poprawnej walidacji, serwer wyszukuje fiszkę w bazie danych, sprawdzając zgodność `user_id` i `id` rekordu.
5. Jeśli rekord istnieje, serwer aktualizuje fiszkę z podanymi danymi. Podczas aktualizacji, wartość pola `source` jest ustalana automatycznie: jeśli istniejąca wartość to `ai-full`, to nowa wartość będzie ustawiona na `ai-edited`, a w każdym innym przypadku (np. `manual`) pozostanie niezmieniona.
6. Zaktualizowany rekord jest zwracany w odpowiedzi.
7. W przypadku nieznalezienia rekordu lub błędów walidacji, serwer zwraca odpowiedni kod błędu.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Weryfikacja tokenu JWT przy użyciu Supabase Auth.
- Autoryzacja: Wymuszenie RLS, aby użytkownik mógł aktualizować tylko własne fiszki.
- Walidacja danych: Użycie `zod` do walidacji request body.
- Ochrona przed atakami: Sanitizacja danych wejściowych dla uniknięcia ataków injection.
- Sprawdzenie uprawnień: Aktualizacja tylko istniejącego rekordu, należącego do zalogowanego użytkownika.

## 7. Obsługa błędów

- 400: Zwracane w przypadku błędnych lub niekompletnych danych – np. zbyt długa treść pola `front` lub `back`.
- 401: Brak ważnego tokenu lub brak autoryzacji.
- 404: Fiszka o danym `id` nie istnieje lub należy do innego użytkownika.
- 500: Inne błędy po stronie serwera, które nie zostały przewidziane.

## 8. Rozważania dotyczące wydajności

- Zapytania do bazy danych są zoptymalizowane dzięki indeksom na kolumnach `user_id`, `id` oraz ewentualnie `generation_id`.
- Aktualizacja jest operacją lekką na tabeli `flashcards`.

## 9. Etapy wdrożenia

1. Utworzenie endpointu PUT /flashcards/{id} w katalogu `/src/pages/api/flashcards/` (lub zgodnie z przyjętym wzorcem routingu).
2. Implementacja mechanizmu walidacji danych wejściowych przy użyciu `zod`.
3. Implementacja logiki pobierania i aktualizacji rekordu w bazie danych z uwzględnieniem mechanizmu RLS.
4. Wdrożenie autoryzacji za pomocą Supabase Auth – weryfikacja tokenu JWT.
5. Zaimplementowanie obsługi błędów: zwracanie kodów 400, 401, 404 i 500.
