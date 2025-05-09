# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Aplikacja 10x-cards umożliwia użytkownikom tworzenie oraz zarządzanie fiszkami, zarówno generowanymi przez AI, jak i stworzonymi manualnie. Interfejs opiera się na Astro, React, Tailwind CSS oraz komponentach shadcn/ui. Główne elementy obejmują autoryzację, widok generacji fiszek, recenzję generowanych fiszek (akceptacja, edycja, odrzucenie), widok zarządzania fiszkami oraz widok sesji nauki w oparciu o algorytm powtórek.

## 2. Lista widoków

1. **Widok rejestracji**

   - **Ścieżka:** `/register`
   - **Główny cel:** Umożliwienie użytkownikowi rejestracji konta przy użyciu formularza rejestracyjnego.
   - **Kluczowe informacje:** Formularz rejestracyjny zawierający pola e-mail i hasło, komunikaty o sukcesie lub błędach, wskazówki dotyczące zabezpieczeń.
   - **Kluczowe komponenty widoku:** Formularz rejestracji, pola input, przyciski, komunikaty inline.
   - **UX, dostępność i bezpieczeństwo:** Poprawna walidacja danych, responsywność, zabezpieczenie danych użytkownika.

2. **Widok logowania**

   - **Ścieżka:** `/login`
   - **Główny cel:** Autoryzacja użytkownika poprzez Supabase Auth.
   - **Kluczowe informacje:** Formularz logowania, komunikaty błędów.
   - **Kluczowe komponenty widoku:** Formularz logowania, pola input, przyciski, komunikaty inline.
   - **UX, dostępność i bezpieczeństwo:** Responsywny formularz, wyraźne komunikaty błędów, zabezpieczenie danych logowania.

3. **Widok generacji fiszek**

   - **Ścieżka:** `/generate-flashcards`
   - **Główny cel:** Umożliwienie użytkownikowi wprowadzenia tekstu, generowanie propozycji fiszek przez AI oraz ich recenzję.
   - **Kluczowe informacje:** Pole do wprowadzania tekstu (1000–10000 znaków), lista generowanych fiszek, status operacji (loading, error, success).
   - **Kluczowe komponenty widoku:** Formularz do wprowadzania tekstu, lista fiszek z opcjami akceptacji/edycji/odrzucenia, przycisk "Zapisz wszystkie".
   - **UX, dostępność i bezpieczeństwo:** Intuicyjny interfejs, loading state na przyciskach, inline komunikaty o błędach, walidacja danych wejściowych.

4. **Widok recenzji i zarządzania fiszkami**

   - **Ścieżka:** `/my-flashcards`
   - **Główny cel:** Przegląd, edycja oraz usuwanie zapisanych fiszek.
   - **Kluczowe informacje:** Lista fiszek użytkownika, opcje edycji oraz usuwania fiszek.
   - **Kluczowe komponenty widoku:** Lista fiszek, modal edycji, modal potwierdzenia usunięcia, przyciski operacyjne.
   - **UX, dostępność i bezpieczeństwo:** Łatwa nawigacja, responsywne modalne okna, potwierdzenie krytycznych operacji (usunięcie), ochrona danych użytkownika.

5. **Widok sesji nauki (powtórki)**
   - **Ścieżka:** `/learn`
   - **Główny cel:** Umożliwienie użytkownikowi nauki poprzez przegląd fiszek zgodnie z algorytmem powtórek.
   - **Kluczowe informacje:** Prezentacja fiszek (przód i tył), oceny przyswojenia, kolejna fiszka do nauki.
   - **Kluczowe komponenty widoku:** Interaktywny widok fiszek, przyciski oceny, mechanizm nawigacji pomiędzy fiszkami.
   - **UX, dostępność i bezpieczeństwo:** Przejrzysty interfejs, responsywność, jasne komunikaty statusu, zabezpieczenie sesji nauki.

## 3. Mapa podróży użytkownika

1. Użytkownik rozpoczyna na stronie logowania (`/login`), gdzie wprowadza dane autoryzacyjne i loguje się przez Supabase Auth.
2. Po pomyślnym logowaniu użytkownik jest przekierowywany do widoku generacji fiszek (`/generuj-fiszki`).
3. W widoku generacji, użytkownik wprowadza tekst i inicjuje proces generacji fiszek. System komunikuje się z API (POST /generations), aby wygenerować propozycje fiszek
4. Użytkownik recenzuje wyświetlone fiszki, akceptując te poprawne, edytując lub odrzucając pozostałe.
5. Po zatwierdzeniu wybiera opcję "Zapisz wszystkie", która zapisuje fiszki poprzez wywołanie API (POST /flashcards).
6. Następnie użytkownik może przejść do widoku zarządzania fiszkami (`/moje-fiszki`), aby edytować lub usuwać zapisane fiszki, lub do widoku sesji nauki (`/sesja-nauki`), aby rozpocząć naukę.

## 4. Układ i struktura nawigacji

- Głównym elementem nawigacyjnym jest topbar (z shadcn/ui) umieszczony u góry strony, zawierający:
  - Linki do głównych widoków: Generacja fiszek, Moje fiszki, Sesja nauki.
  - Ikonę profilu / przycisk wylogowania.
- Na mniejszych ekranach topbar adaptuje się do formatu menu hamburger, zachowując pełną funkcjonalność.
- Dynamiczne komunikaty (toast notifications) informują użytkownika o sukcesach oraz błędach operacyjnych, a krytyczne błędy są wyświetlane inline.

## 5. Kluczowe komponenty

- **Topbar:** Główny pasek nawigacyjny z linkami do widoków i informacjami o użytkowniku.
- **Formularz logowania:** Komponent umożliwiający autoryzację z walidacją pól i komunikatami błędów.
- **Formularz generacji:** Pole tekstowe oraz przycisk do inicjacji generacji fiszek, z obsługą loading state.
- **Lista fiszek:** Komponent wyświetlający fiszki z opcjami operacji (akceptacja, edycja, odrzucenie, usunięcie).
- **Modal edycji/usuwania:** Modalne okna potwierdzenia akcji, umożliwiające edycję lub usunięcie fiszki po potwierdzeniu przez użytkownika.
- **Toast Notifications:** System powiadomień informujący o sukcesach, błędach i innych ważnych komunikatach.
- **Loading State Indicators:** Wskaźniki ładowania zintegrowane z przyciskami oraz formularzami, informujące o postępie operacji.
