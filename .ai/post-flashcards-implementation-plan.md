# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego

Endpoint POST /flashcards służy do tworzenia jednego lub wielu flashcards. Umożliwia on dodawanie fiszek zarówno ręcznie (źródło 'manual'), jak i poprzez wyniki generacji AI (źródła 'ai-full' lub 'ai-edited'). Przy operacjach związanych z AI, jeśli flashcard pochodzi z automatycznej generacji, wymagany jest identyfikator sesji generacji (generation_id).

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **URL:** /flashcards
- **Parametry:**
  - **Wymagane:**
    - `flashcards`: tablica obiektów, gdzie każdy obiekt musi zawierać:
      - `front`: tekst fiszki (maksymalnie 200 znaków)
      - `back`: treść z odpowiedzią fiszki (maksymalnie 500 znaków)
      - `source`: źródło danych, przyjmujące wartości: 'manual', 'ai-full', lub 'ai-edited'
  - **Opcjonalne:**
    - `generation_id`: liczba całkowita; obowiązkowe gdy `source` ma wartość 'ai-full' lub 'ai-edited'
- **Request Body Example:**
  ```json
  {
    "flashcards": [
      {
        "front": "Example front text",
        "back": "Example back text",
        "source": "manual",
        "generation_id": null
      }
    ]
  }
  ```

## 3. Wykorzystywane typy

- `FlashcardDTO`: Typ reprezentujący fiszkę zwracaną w odpowiedzi API
- `CreateFlashcardCommand`: Definiuje strukturę pojedynczej fiszki do utworzenia (bez systemowych pól jak id, created_at, updated_at, user_id)
- `CreateFlashcardsCommand`: Typ definiujący ładunek dla tworzenia jednej lub wielu fiszek

## 4. Szczegóły odpowiedzi

- **Kod odpowiedzi:** 201 (utworzenie zasobu)
- **Struktura odpowiedzi:** Obiekt JSON zawierający tablicę utworzonych fiszek:
  ```json
  {
    "flashcards": [
      {
        "id": 1,
        "front": "...",
        "back": "...",
        "source": "manual",
        "generation_id": null,
        "created_at": "...",
        "updated_at": "..."
      }
    ]
  }
  ```

## 5. Przepływ danych

1. Klient wysyła żądanie HTTP POST do endpointu /flashcards z odpowiednim payloadem.
2. Serwer odbiera żądanie i weryfikuje autentyczność użytkownika (np. przez sesję Supabase Auth).
3. Walidacja danych wejściowych przy użyciu biblioteki Zod:
   - Sprawdzanie długości pól `front` (max 200 znaków) oraz `back` (max 500 znaków).
   - Weryfikacja, że `source` ma jedną z dozwolonych wartości ('manual', 'ai-full', 'ai-edited').
   - Jeśli `source` to 'ai-full' lub 'ai-edited', sprawdzenie obecności `generation_id`.
4. Kontrola RLS: upewnienie się, że operacja jest wykonywana przez autoryzowanego użytkownika, a `user_id` jest przypisane do nowej fiszki.
5. Przekazanie żądania do warstwy serwisowej (np. `src/lib/services/flashcards.ts`), która odpowiada za interakcję z bazą danych (wstawienie rekordu do tabeli `flashcards`).
6. W przypadku powodzenia, serwis zwraca utworzone dane, a endpoint odpowiada klientowi z kodem 201 i JSON-em zawierającym dane fiszek.

## 6. Względy bezpieczeństwa

- **Autoryzacja:** Endpoint wymaga, aby użytkownik był zalogowany. Użycie mechanizmu Supabase Auth oraz RLS zapewnia, że użytkownik ma dostęp tylko do swoich danych.
- **Walidacja Danych:** Weryfikacja poprawności danych wejściowych za pomocą Zod minimalizuje ryzyko wprowadzenia nieprawidłowych lub szkodliwych danych.
- **Ochrona przed SQL Injection:** Używanie bezpiecznych metod wstawiania danych do bazy oraz wykorzystanie mechanizmu klauzul RLS

## 7. Obsługa błędów

- **400 Bad Request:** W przypadku błędów walidacji (np. brak pól, nieprawidłowe wartości, niezgodność długości tekstu).
- **401 Unauthorized:** Gdy użytkownik nie jest uwierzytelniony lub nie ma odpowiednich uprawnień.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów po stronie serwera lub problemów z bazą danych.
- Dodatkowo, błędy związane z przetwarzaniem danych AI mogą być logowane w tabeli `generation_error_logs`.

## 8. Rozważenia dotyczące wydajności

- **Batch Insert:** Przyjmowanie wielu fiszek jednocześnie i użycie operacji batch insert aby zminimalizować liczbę zapytań do bazy danych.
- **Indeksy:** Wykorzystanie indeksów na kolumnach `user_id` i `generation_id` optymalizuje wyszukiwanie i filtrowanie.
- **Limity:** Rozważenie limitu wielkości przesyłanego żądania dla bardzo dużej liczby fiszek.

## 9. Etapy wdrożenia

1. **Implementacja walidacji:**
   - Utworzyć schemat walidacji z użyciu Zod w pliku endpointa (np. `src/pages/api/flashcards.ts`).
2. **Implementacja logiki endpointu:**
   - Odbieranie i weryfikacja żądania.
   - Sprawdzanie autoryzacji użytkownika.
   - Warunkowa walidacja obecności `generation_id` przy źródłach AI.
3. **Delegowanie logiki do serwisu:**
   - Utworzyć lub zaktualizować serwis w `src/lib/services/flashcards.ts`, który będzie odpowiedzialny za interakcję z bazą danych (wstawianie rekordów).
4. **Obsługa odpowiedzi i błędów:**
   - Zwracanie poprawnych kodów HTTP oraz komunikatów błędów zgodnie z warunkami specyfikacji.
   - Logowanie błędów do tabeli `generation_error_logs` tam, gdzie to konieczne.
