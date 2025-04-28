# API Endpoint Implementation Plan: GET /flashcards/{id}

## 1. Przegląd punktu końcowego
Endpoint GET /flashcards/{id} umożliwia pobranie szczegółowych danych konkretnej fiszki. Jego celem jest dostarczenie klientowi kompletnej informacji o fiszce, w tym jej unikalnego identyfikatora, treści przodu i tyłu, źródła, a także dat utworzenia i ostatniej modyfikacji. Endpoint działa w środowisku zabezpieczonym RLS, co zapewnia, że użytkownik może uzyskać dostęp tylko do swoich własnych danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/flashcards/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (ścieżka): identyfikator fiszki (typ: liczba, oczekiwany format: BIGSERIAL)
  - **Opcjonalne:** Brak
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **FlashcardDTO:** Reprezentuje strukturę fiszki, jak zdefiniowano w `src/types.ts`.
- Dodatkowo, nie są potrzebne inne modele ani polecenia (command models) dla operacji odczytu.

## 4. Szczegóły odpowiedzi
- **Odpowiedź przy sukcesie (200):**
  ```json
  { "id": 1, "front": "...", "back": "...", "source": "manual", "created_at": "...", "updated_at": "..." }
  ```
- **Kody statusu:**
  - 200 – Poprawne pobranie fiszki
  - 401 – Nieautoryzowany dostęp (brak lub niewłaściwy token)
  - 404 – Fiszka o podanym `id` nie została znaleziona

## 5. Przepływ danych
1. Klient wysyła żądanie GET `/flashcards/{id}` z poprawnym nagłówkiem autoryzacyjnym (`Authorization: Bearer <token>`).
2. Implementacja endpointa weryfikuje token JWT i ustala tożsamość użytkownika.
3. Warstwa serwisowa (np. `src/lib/services/flashcards.service.ts`) wykonuje zapytanie do bazy danych, wyszukując fiszkę według `id` z dodatkowym filtrem `user_id` zgodnym z identyfikatorem użytkownika z tokena.
4. Jeśli fiszka zostanie znaleziona, dane są mapowane na strukturę `FlashcardDTO` i zwracane jako odpowiedź.
5. W przypadku braku rekordu lub błędu autoryzacji, odpowiednie kody błędów (404 lub 401) są zwracane.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja:** Endpoint wymaga poprawnego tokena JWT. Użycie RLS w Supabase gwarantuje, że użytkownik uzyska dostęp tylko do swoich danych.
- **Walidacja wejścia:** Parametr `id` powinien być walidowany (np. przy użyciu Zod), aby upewnić się, że posiada odpowiedni format i wartość.
- **Ochrona przed atakami:** Sanitizacja parametrów i ograniczenie ekspozycji szczegółowych informacji o błędach w odpowiedziach.

## 7. Obsługa błędów
- **401 Unauthorized:** Gdy token jest niepodany lub niewłaściwy.
- **404 Not Found:** Jeśli nie uda się znaleźć fiszki o podanym `id` lub fiszka nie należy do użytkownika.
- **500 Internal Server Error:** W przypadku błędów serwera (np. problem z połączeniem do bazy danych).

## 8. Rozważania dotyczące wydajności
- **Indeksacja:** Tabele zawierają odpowiednie indeksy na `id` i `user_id` dla szybkich zapytań.
- **Minimalizacja danych:** Zwracanie tylko niezbędnych pól w odpowiedzi minimalizuje obciążenie sieci.

## 9. Etapy wdrożenia
1. **Walidacja wejścia i autoryzacja:**
   - Upewnić się, że implementacja endpointa poprawnie weryfikuje token JWT i ustawia użytkownika.
   - Zaimplementować walidację parametru `id` z użyciem Zod.
2. **Implementacja warstwy serwisowej:**
   - Utworzyć lub zaktualizować serwis w `src/lib/services/flashcards.service.ts`, który odpowiada za pobranie fiszki na podstawie `id` i `user_id`.
3. **Integracja logiki API:**
   - Utworzyć endpoint w `src/pages/api/flashcards/[id].ts` lub zgodnie z przyjętym wzorcem w projekcie.
   - Zaimplementować logikę zwracania odpowiedzi z odpowiednimi statusami (200, 401, 404, 500).