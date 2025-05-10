# Specyfikacja modułu autoryzacji

Niniejszy dokument przedstawia architekturę funkcjonalności rejestracji, logowania oraz odzyskiwania hasła użytkowników w projekcie 10x-cards. Specyfikacja powinna służyć jako wytyczne dla zespołów frontendowych i backendowych oraz być zgodna z istniejącą dokumentacją i architekturą aplikacji.

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### a) Zmiany w warstwie frontendu:

- **Nowe strony**:

  - `/src/pages/register.astro` – Strona rejestracji, zawierająca formularz rejestracyjny.
  - `/src/pages/login.astro` – Strona logowania z formularzem weryfikacji danych.
  - `/src/pages/forgot-password.astro` – Strona odzyskiwania hasła, umożliwiająca wysłanie instrukcji resetu na podany adres e-mail.

- **Nowe komponenty React** (osadzone w stronach Astro z użyciem `client:load` lub `client:visible`):

  - `<RegisterForm />` – Formularz rejestracji użytkownika. Odpowiada za zbieranie danych (e-mail, hasło), wyświetlanie komunikatów walidacyjnych oraz automatyczne logowanie po pomyślnej rejestracji.
  - `<LoginForm />` – Formularz logowania. Zawiera mechanizmy walidacji, informacja o błędach (np. nieprawidłowy e-mail lub hasło) oraz obsługę stanu ładowania.
  - `<PasswordRecoveryForm />` – Formularz odzyskiwania hasła, który umożliwia użytkownikowi podanie e-maila i wysłanie żądania resetu.

- **Layouty**:

  - Rozdzielenie layoutów na tryby `auth` i `non-auth`.
  - W trybie `auth` (dla zalogowanych użytkowników) interfejs zawiera dodatkowe elementy (np. menu użytkownika, przycisk wylogowania).
  - W trybie `non-auth` wyświetlane są strony publiczne, w których widoczny jest przycisk logowania/rejestracji.

- **Integracja z Shadcn/ui i Tailwind CSS**:
  - Wykorzystanie komponentów z biblioteki Shadcn/ui (np. przyciski, inputy, alerty) dla spójnego wyglądu interfejsu.
  - Stylowanie za pomocą Tailwind CSS, z zachowaniem zasad responsywności i dostępności.

### b) Rozdzielenie odpowiedzialności

- **Strony Astro**:

  - Odpowiadają za renderowanie szablonów oraz wykorzystanie SSR do przekazywania stanu autoryzacji na serwerze.
  - Integracja z middleware w `/src/middleware/index.ts` w celu weryfikacji sesji podczas renderowania.

- **Komponenty React**:

  - Realizują logikę interakcji użytkownika, walidację formularzy w czasie rzeczywistym i dynamiczne wyświetlanie komunikatów o błędach.
  - Odpowiadają za wysyłanie żądań do API lub komunikację z Supabase Auth przy użyciu klienta (SDK).

- **Mechanizm walidacji**:
  - Walidacja po stronie klienta: sprawdzanie poprawności formatu e-mail, minimalnej długości hasła, porównanie haseł itp.
  - Walidacja po stronie serwera: dodatkowe sprawdzenia przy użyciu bibliotek (np. Zod) oraz obsługa wyjątków.

### c) Obsługa przypadków walidacji i komunikatów błędów

- Komponenty formularzy będą wyświetlać komunikaty błędów inline (np. "Nieprawidłowy format e-mail", "Hasło musi zawierać minimum 8 znaków").
- Obsługa błędów sieciowych i timeoutów przy komunikacji z API lub bezpośrednio z Supabase Auth.
- Scenariusze:
  - Nieudana rejestracja (np. e-mail już istnieje) – wyświetlenie odpowiedniego komunikatu.
  - Nieudane logowanie – informowanie użytkownika o błędnych danych.
  - Błędy w procesie resetu hasła – pokazanie statusu wysłania instrukcji resetu.

---

## 2. LOGIKA BACKENDOWA

### a) Struktura endpointów API

W ramach obsługi autoryzacji tworzymy dedykowane endpointy w katalogu `/src/pages/api/auth`:

- `register.ts` – Endpoint obsługujący rejestrację:

  - Przyjmuje dane rejestracyjne w formie DTO (e-mail, hasło).
  - Waliduje dane wejściowe i tworzy konto użytkownika przy użyciu Supabase Auth.

- `login.ts` – Endpoint do logowania:

  - Sprawdza przekazane dane uwierzytelniające, ustawia sesję oraz przekazuje token do klienta.

- `logout.ts` – Endpoint do wylogowywania:

  - Usuwa sesję użytkownika.

- `recover.ts` – Endpoint obsługujący reset hasła:

  - Weryfikuje adres e-mail oraz inicjuje proces wysyłki instrukcji resetu.

- `delete-account.ts` – Endpoint obsługujący usunięcie konta:
  - Weryfikuje autentyczność użytkownika.
  - Usuwa konto oraz wszystkie powiązane dane (np. fiszki) z bazy danych.

### b) Modele danych i walidacja

- **Modele DTO**:

  - Definicje interfejsów (np. `RegisterDTO`, `LoginDTO`, `PasswordRecoveryDTO`) umieszczone w `/src/types.ts` lub dedykowanym module typów.

- **Walidacja danych wejściowych**:
  - Wykorzystanie bibliotek (np. Zod) do walidacji struktury danych oraz spełnienia wymagań (poprawny format e-mail, minimalna długość hasła).

### c) Obsługa wyjątków i bezpieczeństwo

- Centralny mechanizm obsługi błędów:

  - Middleware przechwytujący wyjątki w API, logujący błędy i zwracający czytelne komunikaty do klienta.

- Aktualizacja renderowania stron server-side:
  - Modyfikacja konfiguracji w `astro.config.mjs` umożliwiająca przekazywanie danych o stanie autoryzacji do stron.
  - Integracja z middleware do weryfikacji sesji podczas renderowania stron chronionych.

---

## 3. SYSTEM AUTENTYKACJI

### a) Integracja z Supabase Auth

- Wykorzystanie Supabase Auth w następujących scenariuszach:
  - **Rejestracja**: Utworzenie nowego konta przy użyciu metody `signUp` z SDK Supabase, walidacja i potwierdzenie rejestracji.
  - **Logowanie**: Użycie metody `signIn` do weryfikacji danych logowania i inicjalizacji sesji.
  - **Wylogowywanie**: Wykorzystanie metody `signOut` do zakończenia sesji użytkownika.
  - **Odzyskiwanie hasła**: Wywołanie procedury resetu hasła, która wysyła instrukcje na podany adres e-mail.

### b) Serwisy i kontrakty

- **Serwis autoryzacji (`AuthService`)**:

  - Abstrakcja wywołań metod Supabase Auth, zarządzająca logiką sesji użytkownika.
  - Udostępnienie metod rejestracji, logowania, wylogowywania oraz resetu hasła.

- **Kontrakty**:
  - Zdefiniowanie jednoznacznych interfejsów (DTO) dla komunikacji pomiędzy frontendem a backendem.
  - Ujednolicenie sposobu obsługi komunikatów błędów i statusów operacji.

### c) Mechanizm sesji

- Zarządzanie sesją użytkownika:
  - Wykorzystanie tokenów JWT i cookie do utrzymywania stanu zalogowania.
  - Middleware w `/src/middleware/index.ts` do weryfikacji sesji przy każdym żądaniu chronionych zasobów.
  - Automatyczne przekierowania na strony logowania w przypadku braku aktywnej sesji.

---

## Podsumowanie

Moduł autoryzacji w projekcie 10x-cards opiera się na ścisłej integracji między frontendem (Astro + React) a backendem (API endpointy, Supabase Auth). Kluczowe elementy obejmują:

- Intuicyjny interfejs użytkownika z rozdzieleniem logiki renderowania stron Astro oraz interakcji w komponentach React.
- Bezpieczne endpointy API z walidacją danych wejściowych i centralną obsługą błędów.
- Wykorzystanie Supabase Auth do zarządzania sesją, rejestracją, logowaniem i resetowaniem hasła, wspierane przez dedykowane serwisy i kontrakty.

Ta architektura zapewnia spójność, bezpieczeństwo oraz elastyczność niezbędną do dalszego rozwoju modułu autoryzacji, gwarantując jednocześnie wysoką jakość doświadczenia użytkownika i skalowalność aplikacji.
