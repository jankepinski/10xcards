# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

Celem tego punktu końcowego jest zainicjowanie sesji generacji fiszek przy użyciu zewnętrznej usługi AI (Openrouter.ai). Endpoint przyjmuje tekst wejściowy (source_text), waliduje długość tekstu, wywołuje usługę AI w celu wygenerowania fiszek, zapisuje rekord generacji w bazie danych oraz zwraca dane generacji wraz z wygenerowanymi fiszkami.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** /generations
- **Parametry:**
  - **Wymagane:**
    - `source_text`: tekst do przetworzenia przez AI (1000-10000 znaków)
  - **Opcjonalne:** Brak
- **Request Body:**
  ```json
  {
    "source_text": "Text to be processed by the AI (1000-10000 characters)"
  }
  ```

## 3. Wykorzystywane typy

- **DTOs:**
  - `GenerationDTO` (reprezentuje rekord generacji w bazie danych)
  - `FlashcardDTO` (reprezentuje pojedynczą fiszkę)
- **Command Modele:**
  - `CreateGenerationCommand` (z polami: source_text)
  - `GenerationResultDTO` (zawiera dane generacji oraz listę wygenerowanych fiszek)

## 4. Szczegóły odpowiedzi

- **Response JSON:**
  ```json
  {
    "generation": { "id": 1, "model": "gpt-4", "generated_count": 10, ... },
    "flashcards": [
      { "front": "...", "back": "...", "source": "ai-full" },
      ...
    ]
  }
  ```
- **Kody Statusu:**
  - 201: Pomyślne utworzenie rekordu
  - 400: Błędne dane wejściowe
  - 401: Brak autoryzacji
  - 500: Błąd serwera

## 5. Przepływ danych

1. **Walidacja danych wejściowych:**
   - Sprawdzenie, czy `source_text` ma długość między 1000 a 10000 znaków (zgodnie z DB CHECK constraint).
   - Walidacja parametrów za pomocą Zod.
2. **Wywołanie usługi AI:**
   - Przekazanie `source_text` do Openrouter.ai w celu wygenerowania fiszek.
3. **Zapis danych:**
   - Utworzenie rekordu w tabeli `generations` zawierającego m.in. wykorzystany model ai, hash i długość tekstu oraz metadane generacji (czas przetwarzania, liczba wygenerowanych fiszek itd.).
   - Utworzenie powiązanych rekordów fiszek w tabeli `flashcards` (przy zachowaniu ograniczeń, np. długość frontu i backu, source jako 'ai-full', 'ai-edited' lub 'manual').
4. **Zwrot odpowiedzi:**
   - Zwrócenie potwierdzenia z danymi nowo utworzonego rekordu generacji oraz listą wygenerowanych fiszek.

## 6. Względy bezpieczeństwa

- **Autoryzacja:**
  - Upewnij się, że użytkownik jest uwierzytelniony (Supabase Auth) i ma dostęp do tworzenia rekordów (RLS).
- **Walidacja danych:**
  - Użyj Zod do walidacji `CreateGenerationCommand`.
- **Ochrona przed nadużyciami:**
  - Sprawdzenie poprawności długości `source_text` zgodnie z ograniczeniami w bazie danych.

## 7. Obsługa błędów

- **Błędy walidacji:**
  - W przypadku niepoprawnych danych wejściowych (np. zbyt krótki lub zbyt długi `source_text`) zwróć kod 400.
- **Brak autoryzacji:**
  - Użytkownik nieautoryzowany – zwróć kod 401.
- **Błędy zewnętrzne:**
  - W przypadku niepowodzenia wywołania do usługi AI, zapisz błąd w tabeli `generation_error_logs` i zwróć kod 500.
- **Ogólna obsługa błędów:**
  - Użyj guard clauses i wczesnych zwrotów w przypadku wystąpienia błędów.

## 8. Rozważenia dotyczące wydajności

- **Asynchroniczność:**
  - Wywołanie do zewnętrznej usługi AI powinno działać asynchronicznie, aby nie blokować głównego wątku.
- **Indeksy:**
  - Wykorzystanie indeksów (np. na kolumnach `user_id` i `source_text_hash`) w celu optymalizacji zapytań do bazy.

## 9. Etapy wdrożenia

1. Implementacja walidacji wejścia przy użyciu Zod dla `CreateGenerationCommand`.
2. Utworzenie usługi generującej w `src/lib/services/generationService.ts`, która obsługuje logikę generowania fiszek, integruje wywołanie AI oraz zapis do bazy.
3. Implementacja endpointa REST API w `src/pages/api/generations.ts`, odpowiedzialnego za odbiór i walidację danych wejściowych.
4. Integracja z zewnętrzną usługą AI (Openrouter.ai) w celu generowania fiszek.
5. Zapis danych do tabel `generations` i `flashcards` oraz rejestracja przebiegu procesu generacji.
6. Implementacja mechanizmu obsługi błędów, w tym logowanie oraz zapisywanie błędów do `generation_error_logs`.

## 10. Uwagi końcowe

Endpoint POST /generations nie zapisuje żadnych flashcards do bazy danych - zwraca je tylko na w response.
