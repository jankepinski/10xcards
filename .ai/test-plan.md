# Plan testów

## 1. Wprowadzenie i cele testowania

Celem testowania jest zapewnienie, że cały system – od warstwy prezentacji, przez logikę biznesową, aż po integrację z backendem – działa zgodnie z wymaganiami oraz spełnia standardy jakości. Testy mają na celu wykrycie błędów, zapewnienie poprawności działania kluczowych funkcjonalności oraz utrzymanie wysokiej jakości kodu przy wprowadzaniu kolejnych zmian.

## 2. Zakres testów

- **Testy jednostkowe:** Sprawdzenie poprawności działania pojedynczych funkcji, komponentów React oraz helperów z katalogu `./src/lib`.
- **Testy integracyjne:** Weryfikacja współdziałania komponentów, API endpoints w `./src/pages/api`, integracji z Supabase w `./src/db` oraz middleware.
- **Testy funkcjonalne i UI:** Testy interakcji użytkownika na stronach Astro, dynamicznych komponentach opartych na React z wykorzystaniem Shadcn/ui oraz Tailwind.
- **Testy wydajnościowe:** Ocena czasu ładowania, responsywności oraz zachowania systemu pod większym obciążeniem.
- **Testy regresji wizualnej:** Sprawdzenie, czy zmiany w kodzie nie wpływają niekorzystnie na układ graficzny i interfejs użytkownika.
- **Testy bezpieczeństwa:** Weryfikacja mechanizmów autoryzacyjnych i autentykacyjnych, szczególnie w kontekście integracji z Supabase.

## 3. Typy testów

- **Testy jednostkowe:** Użycie bibliotek takich jak Jest oraz React Testing Library.
- **Testy integracyjne:** Łączenie komponentów i testowanie interakcji między warstwami (użycie mocków i stubów).
- **Testy End-to-End (E2E):** Automatyzacja scenariuszy użytkownika przy użyciu narzędzi takich jak Cypress lub Playwright.
- **Testy wydajnościowe:** Narzędzia do pomiaru czasu reakcji i obciążenia, np. Lighthouse lub dedykowane skrypty.
- **Testy regresji wizualnej:** Porównania z wykorzystaniem snapshotów, np. przy użyciu Chromatic lub innego narzędzia do wizualnej regresji komponentów.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

- **Strony statyczne i dynamiczne:**
  - Weryfikacja poprawności renderowania stron Astro.
  - Sprawdzenie działania interaktywnych komponentów React (np. nawigacja, formularze).
- **Integracja z API:**
  - Testy poprawności komunikacji z API endpoints.
  - Weryfikacja obsługi błędów i walidacji danych w warstwie API.
- **Integracja z bazą danych (Supabase):**
  - Testy autoryzacji i uwierzytelnienia.
  - Weryfikacja poprawności zapisu/odczytu danych.
- **Middleware i zarządzanie routingiem:**
  - Testy reguł bezpieczeństwa, przekierowań oraz obsługi błędów.
- **Komponenty UI:**
  - Sprawdzenie stanu komponentów interaktywnych z Shadcn/ui.
  - Testy zastosowania klas Tailwind i poprawności stylów.
- **Wydajność:**
  - Testy szybkości ładowania kluczowych stron.
  - Testy skalowalności przy wysokim obciążeniu.

## 5. Środowisko testowe

- **Lokalne:** Środowisko developerskie do szybkiej weryfikacji poprawek.
- **Staging:** Środowisko przypominające produkcyjne, gdzie przeprowadzane będą testy integracyjne i E2E.
- **CI/CD:** Automatyczne uruchamianie testów przy każdym pushu na repozytorium za pomocą Github Actions.

## 6. Narzędzia do testowania

- **Vitest:** Testy jednostkowe oraz integracyjne.
- **React Testing Library:** Testowanie komponentów React.
- **Cypress/Playwright:** Testy End-to-End.
- **Lighthouse:** Testy wydajnościowe i optymalizacyjne.
- **Chromatic/Snapshot testing:** Testy regresji wizualnej.
- **TypeScript:** Statyczna analiza typów w celu wykrycia potencjalnych błędów już na etapie kompilacji.
- **Supabase CLI/Testy:** Testowanie integracji z backendem.

## 7. Harmonogram testów

- **Faza I – Przygotowanie:**
  - Konfiguracja środowisk testowych oraz CI/CD.
  - Opracowanie wstępnych scenariuszy testowych.
- **Faza II – Testy jednostkowe i integracyjne:**
  - Uruchamianie kompletu testów jednostkowych i integracyjnych.
  - Wykrywanie i naprawa krytycznych błędów.
- **Faza III – Testy E2E i regresji wizualnej:**
  - Przeprowadzenie automatycznych testów E2E w środowisku staging.
  - Testy regresji wizualnej.
- **Faza IV – Testy wydajnościowe:**
  - Testowanie obciążenia i optymalizacji strony.
- **Faza V – Zatwierdzenie przed produkcją:**
  - Podsumowanie wyników, przegląd błędów oraz finalne testy akceptacyjne.

## 8. Kryteria akceptacji testów

- Uzyskanie wysokiego pokrycia kodu testami (np. powyżej 80%).
- Brak krytycznych oraz blokujących błędów.
- Pozytywne wyniki testów integracyjnych i E2E.
- Zatwierdzenie przez zespół QA oraz developerów po testach akceptacyjnych.

## 9. Role i odpowiedzialności

- **Inżynierowie QA:** Tworzenie i utrzymanie scenariuszy testowych, automatyzacja testów, analiza wyników.
- **Developerzy:** Naprawa wykrytych błędów, pisanie testów jednostkowych, udział w testach integracyjnych.
- **Inżynier DevOps:** Konfiguracja środowisk testowych oraz pipeline'u CI/CD.
- **Product Manager:** Koordynacja harmonogramu testów oraz zatwierdzanie wyników.

## 10. Procedury raportowania błędów

- **Zgłaszanie:** Każdy wykryty błąd należy zgłaszać w systemie do śledzenia błędów (np. JIRA, GitHub Issues) z dokładnym opisem, krokami reprodukcji, zrzutami ekranu i logami.
- **Priorytetyzacja:** Błędy będą klasyfikowane według stopnia krytyczności (krytyczne, wysokie, średnie, niskie).
- **Weryfikacja i eskalacja:** Po zgłoszeniu błędy są weryfikowane przez inżynierów QA, a w przypadku krytycznych problemów natychmiast eskalowane do developerów.
- **Retrospektywa:** Regularne przeglądy wyników testów oraz analizy błędów, aby usprawnić procesy testowe i wdrożenia.

---
