# OpenRouter Service Implementation Plan

## 1. Opis usługi

Usługa OpenRouter ma na celu integrację z API OpenRouter w celu uzupełnienia czatów opartych na LLM. Pozwala ona na wysyłanie zapytań do API OpenRouter oraz obsługę ustrukturyzowanych odpowiedzi, które umożliwiają dynamiczne dopasowanie interfejsu czatu. Usługa obsługuje konfigurację komunikatów systemowych, komunikatów użytkownika, schemat odpowiedzi oraz parametrów modeli.

## 2. Opis konstruktora

Konstruktor usługi powinien inicjalizować komponenty niezbędne do wykonania żądania do API OpenRouter. Kluczowe zadania konstruktora:

1. Inicjalizacja klienta API z odpowiednimi kluczami i tokenami.
2. Konfiguracja domyślnych parametrów (system message, user message, response_format, nazwa modelu, parametry modelu).
3. Ustawienie strategii obsługi błędów i logowania.

## 3. Publiczne metody i pola

### Kluczowe metody:

1. `sendRequest(requestPayload: RequestPayload): Promise<ResponseData>`
   - Odpowiada za wysyłanie żądań do API OpenRouter oraz zwracanie ustrukturyzowanej odpowiedzi.
2. `setConfiguration(newConfig: Partial<OpenRouterConfig>): void`
   - Umożliwia aktualizację konfiguracji usługi (np. zmiana komunikatu systemowego, parametrów modelu).
3. `getConfiguration(): OpenRouterConfig`
   - Zwraca aktualne ustawienia konfiguracji.

### Kluczowe pola:

- `apiKey: string` - Klucz API potrzebny do autoryzacji.
- `defaultConfig: OpenRouterConfig` - Domyślne ustawienia dla komunikatów systemowych, użytkownika, schematu odpowiedzi, nazwy modelu oraz parametrów modelu.

## 4. Prywatne metody i pola

### Kluczowe metody:

1. `_buildPayload(userInput: string): RequestPayload`
   - Buduje pełny ładunek żądania, łącząc komunikat systemowy, komunikat użytkownika oraz ustawienia response_format.
2. `_parseResponse(rawResponse: any): ResponseData`
   - Przetwarza surową odpowiedź z API, weryfikuje zgodność ze schematem JSON oraz zwraca ustrukturyzowane dane.
3. `_handleError(error: Error): void`
   - Przeprowadza jednolitą obsługę błędów, logując problemy i podejmując działania naprawcze (np. ponowne wysłanie żądania).

### Kluczowe pola:

- `logger` - Narzędzie do logowania zdarzeń i błędów.
- `httpClient` - Klient HTTP do komunikacji z API (np. Axios, fetch).

## 5. Obsługa błędów

### Potencjalne scenariusze błędów:

1. Błąd sieciowy lub timeout.
2. Nieprawidłowa autoryzacja (np. błędny klucz API).
3. Błąd walidacji odpowiedzi – odpowiedź niezgodna ze schematem JSON.
4. Nieoczekiwane błędy serwera API (np. 5xx).

### Proponowane rozwiązania:

1. Wdrożenie mechanizmu ponawiania żądania oraz timeout w przypadku błędów sieciowych.
2. Weryfikacja autoryzacji przed wysłaniem żądania oraz odpowiednia obsługa błędu 401 z komunikatem dla użytkownika.
3. Stosowanie walidacji odpowiedzi wg schematu JSON i zwracanie precyzyjnych komunikatów o błędach podczas niezgodności.
4. Zaimplementowanie centralnego mechanizmu logowania oraz powiadamiania o krytycznych błędach.

## 6. Kwestie bezpieczeństwa

- Przechowywanie kluczy API w bezpiecznym miejscu, np. jako zmienne środowiskowe.
- Zapewnienie szyfrowania komunikacji (HTTPS) podczas wysyłania żądań.
- Walidacja danych wejściowych, aby uniknąć ataków typu injection.
- Implementacja ograniczenia ilości żądań (rate limiting) w celu zapobiegania nadużyciom.
- Regularne monitorowanie logów oraz wdrożenie mechanizmów alertów w przypadku wykrycia anomalii.

## 7. Plan wdrożenia krok po kroku

1. **Moduł klienta API**

   - Implementacja interfejsu komunikacji z API OpenRouter za pomocą biblioteki HTTP (np. Axios lub fetch).
   - Konfiguracja persistent connection z wykorzystaniem zmiennych środowiskowych do przechowywania kluczy.

2. **Moduł budujący żądania**

   - Utworzenie metody `_buildPayload`, która scala wszystkie niezbędne dane: komunikat systemowy, komunikat użytkownika, response_format, nazwę modelu oraz parametry modelu.
   - Przykładowe konfiguracje:
     1. Komunikat systemowy: "You are a helpful assistant specialized in chat interactions."
     2. Komunikat użytkownika: dynamiczny tekst wejściowy od użytkownika.
     3. Response_format: `{ type: 'json_schema', json_schema: { name: 'chat_response', strict: true, schema: { answer: 'string', info: 'string' } } }`
     4. Nazwa modelu: np. "gpt-4-advanced"
     5. Parametry modelu: `{ temperature: 0.7, max_tokens: 1500, top_p: 1.0 }`

3. **Implementacja metody wysyłającej żądanie**

   - Stworzenie publicznej metody `sendRequest`, która wykorzystuje `_buildPayload`, wysyła żądanie do API OpenRouter i przetwarza odpowiedź przy użyciu `_parseResponse`.
   - Dodanie mechanizmu ponownych prób (retries) w przypadku wystąpienia błędów sieciowych i timeout.

4. **Parser odpowiedzi**

   - Utworzenie metody `_parseResponse` odpowiedzialnej za walidację i przekształcenie danych zwróconych przez API do ustrukturyzowanego formatu zgodnego z JSON schema.
   - Wykorzystanie narzędzi do walidacji JSON (np. ajv) w celu sprawdzenia poprawności schematu.

5. **Obsługa błędów**

   - Implementacja metody `_handleError` w celu centralizacji logiki obsługi błędów we wszystkich metodach.
   - Zapewnienie odpowiedniego poziomu logowania i przekazywania precyzyjnych komunikatów o błędach do użytkownika.

---

Plan wdrożenia został zaprojektowany z myślą o integracji z istniejącym stackiem technologicznym (Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui) i spełnia wymagania dotyczące obsługi błędów, bezpieczeństwa oraz ustrukturyzowanych odpowiedzi.
