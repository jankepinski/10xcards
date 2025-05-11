# Specyfikacja modułu autoryzacji - 10x-cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Nowe strony i komponenty

- Utworzenie nowych stron w folderze `src/pages`:
  - `/login` – strona logowania zawierająca formularz logowania (e-mail i hasło).
  - `/register` – strona rejestracji z formularzem do tworzenia konta.
  - `/reset-password` – strona do resetowania hasła (użytkownik otrzymuje link/reset po podaniu e-maila).
  - Opcjonalnie `/forgot-password` – umożliwiająca inicjację procesu odzyskiwania hasła.
- Utworzenie dedykowanych komponentów React w katalogu `src/components/ui` (korzystając z Shadcn/ui):
  - `LoginForm`, `RegisterForm`, `PasswordRecoveryForm`.
- Komponenty te będą wykorzystywane na stronach Astro, gdzie layouty odpowiadają za strukturę statyczną, a komponenty React za interaktywność.

### 1.2. Astro Layouts oraz integracja z React

- Wprowadzenie osobnych layoutów Astro:
  - `src/layouts/AuthLayout.astro` – dla stron, gdzie wymagana jest autoryzacja (oraz dla logowania/rejestracji).
  - `src/layouts/PublicLayout.astro` – dla stron dostępnych publicznie.
- Layouty te będą integrować komponenty React, umożliwiając dynamiczne walidacje i interakcje (np. przejścia między stanami, obsługa formularzy).
- Wyraźne oddzielenie odpowiedzialności: strony Astro odpowiadają za renderowanie struktury oraz integrację z backendem, natomiast komponenty React zajmują się logiką interakcji użytkownika.

### 1.3. Walidacja i komunikaty o błędach

- Formularze (logowania, rejestracji, resetowania hasła) będą posiadać:
  - Kliencką walidację (sprawdzanie formatu e-mail, minimalnej długości hasła, pola wymagane) przy użyciu bibliotek TypeScript lub dedykowanych rozwiązań w React.
  - Obsługę błędów pobieranych z API – komunikaty błędów wyświetlane użytkownikowi w sposób zrozumiały.
  - Mechanizmy loading state oraz informowanie użytkownika o powodzeniu lub niepowodzeniu operacji.

### 1.4. Scenariusze użycia

- Rejestracja: wypełnienie formularza, walidacja danych, wysłanie żądania do API, automatyczne logowanie po pomyślnej rejestracji.
- Logowanie: przesłanie danych logowania, uwierzytelnienie poprzez Supabase, przekierowanie do chronionych zasobów.
- Odzyskiwanie hasła: użytkownik inicjuje proces odzyskiwania hasła poprzez podanie e-maila, otrzymuje link resetujący, a następnie resetuje hasło przez formularz.
- Wylogowanie: oczyszczenie sesji zarówno po stronie klienta, jak i backendu, z przekierowaniem użytkownika do strony publicznej.

## 2. LOGIKA BACKENDOWA

### 2.1. Struktura endpointów API

- Utworzenie endpointów w `src/pages/api/auth`:
  - `POST /api/auth/register` – rejestracja nowego użytkownika.
  - `POST /api/auth/login` – logowanie użytkownika.
  - `POST /api/auth/logout` – wylogowanie użytkownika.
  - `POST /api/auth/reset-password` – inicjacja procesu resetowania hasła.
  - `POST /api/auth/delete-account` – usunięcie konta użytkownika oraz powiązanych fiszek.
- Wszystkie endpointy przyjmują dane w formacie JSON i zwracają odpowiedź zawierającą status operacji, komunikaty oraz (w zależności od operacji) dane, takie jak token sesji.

### 2.2. Modele danych i walidacja

- Modele danych definiowane w Supabase (oraz typowane w `src/types.ts`) obejmują:
  - Dane użytkownika: e-mail, zahashowane hasło, daty rejestracji, status konta.
- Walidacja danych wejściowych przy użyciu bibliotek takich jak Zod lub Yup w celu zapewnienia zgodności danych przed przetwarzaniem.
- Obsługa wyjątków:
  - Stosowanie bloków try/catch w endpointach API.
  - Logowanie błędów oraz zwracanie odpowiednich, przyjaznych komunikatów błędu do klienta.

### 2.3. Renderowanie stron po stronie serwera

- Aktualizacja konfiguracji serwera w `astro.config.mjs`:
  - Integracja middleware, które sprawdza stan sesji użytkownika przed renderowaniem chronionych stron.
  - Przekazywanie informacji o autoryzacji do layoutów Astro, umożliwiających warunkowe renderowanie (np. wyświetlanie nawigacji użytkownika vs. opcji logowania).

## 3. SYSTEM AUTENTYKACJI

### 3.1. Wykorzystanie Supabase Auth

- Integracja modułu Supabase Auth do realizacji kluczowych funkcji:
  - Rejestracja: użycie `supabase.auth.signUp` do tworzenia konta.
  - Logowanie: użycie `supabase.auth.signIn` do uwierzytelniania użytkownika.
  - Wylogowanie: wykorzystanie `supabase.auth.signOut` do zakończenia sesji.
  - Odzyskiwanie hasła: wykorzystanie metod Supabase (np. `supabase.auth.resetPasswordForEmail`) do inicjowania resetu hasła.
- Zarządzanie sesjami:
  - Bezpieczne przechowywanie tokenów sesyjnych (w plikach cookie lub lokalnej pamięci) z odpowiednią polityką bezpieczeństwa.
  - Automatyczne odświeżanie sesji w razie potrzeby.

### 3.2. Kontrakty i integracja

- Definicje interfejsów TypeScript w pliku `src/types.ts`:
  - Struktura danych użytkownika, formularzy rejestracji, logowania oraz resetowania hasła.
- Standardowy kontrakt API:
  - Request: dane wejściowe sformatowane jako JSON, spełniające wymogi walidacji.
  - Response: struktura odpowiedzi zawierająca status, dane użytkownika (w przypadku logowania) oraz komunikaty o błędach.
- Integracja middleware Astro do ochrony stron:
  - Mechanizmy przekierowywania niezalogowanych użytkowników na stronę logowania.
  - Aktualizacja serwerowego renderowania w celu uwzględnienia stanu autoryzacji.

## Podsumowanie

Specyfikacja modułu autoryzacji obejmuje:

- Wyraźny podział warstwy UI między Astro (strony, layouty) a React (komponenty interaktywnych formularzy).
- Bezpieczne i skalowalne endpointy API z walidacją danych i obsługą wyjątków.
- Kompleksową integrację Supabase Auth do zarządzania procesami rejestracji, logowania, wylogowania oraz odzyskiwania hasła.
- Definicje kontraktów API i typów danych zapewniające spójność komunikacji między front-endem a backendem.
- Modernizację renderowania stron po stronie serwera przy użyciu middleware w Astro, gwarantującą zabezpieczenie dostępu do chronionych zasobów.

Ta specyfikacja została opracowana z myślą o zachowaniu zgodności z wymaganiami produktu (PRD) oraz wykorzystaniu nowoczesnego stosu technologicznego (Astro, React, TypeScript, Tailwind, Shadcn/ui, Supabase) bez naruszania istniejącej architektury aplikacji.
