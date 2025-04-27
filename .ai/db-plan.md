# Schemat Bazy Danych - 10x-cards

## 1. Tabele

### a. `users`

This table is managed by Supabase Auth.

- **id**: UUID PRIMARY KEY
- **email**: VARCHAR(255) NOT NULL UNIQUE
- **encrypted_password**: VARCHAR NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **confirmed_at**: TIMESTAMPTZ

### b. `flashcards`

- **id**: BIGSERIAL PRIMARY KEY
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **source**: VARCHAR NOT NULL, CHECK constraint: source IN ('ai-full', 'ai-edited', 'manual')
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **generation_id**: BIGINT, REFERENCES `generations(id)` ON DELETE CASCADE
- **user_id**: UUID NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE

**Indeksy:**

- INDEX na kolumnie `user_id`
- INDEX na kolumnie `generation_id`

**RLS:**

- Włącz RLS (Row-Level Security): Każdy wiersz dostępny tylko dla właściwego użytkownika (user_id = auth.uid()).

---

### c. `generations`

- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE
- **model**: TEXT NOT NULL
- **source_text_hash**: TEXT NOT NULL
- **source_text_length**: INTEGER NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)
- **generated_count**: INTEGER NOT NULL
- **accepted_unedited_count**: INTEGER NULLABLE
- **accepted_edited_count**: INTEGER NULLABLE
- **generation_duration**: INTEGER NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

**Indeksy:**

- INDEX na kolumnie `user_id`
- INDEX na kolumnie `source_text_hash`

**RLS:**

- Włącz RLS: Użytkownik widzi tylko swoje rekordy (user_id = auth.uid()).

---

### d. `generation_error_logs`

- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE
- **model**: TEXT NOT NULL
- **source_text_hash**: TEXT NOT NULL
- **source_text_length**: INTEGER NOT NULL, CHECK (source_text_length BETWEEN 1000 AND 10000)
- **error_code**: VARCHAR(100) NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMPZ NOT NULL DEFAULT now()

**Indeksy:**

- INDEX na kolumnie `user_id`
- INDEX na kolumnie `source_text_hash`

**RLS:**

- Włącz RLS: Dostęp tylko dla właściciela rekordu (user_id = auth.uid()).

## 2. Relacje między tabelami

- Każdy rekord w `flashcards` odnosi się do użytkownika poprzez `user_id`.
- Każdy rekord w `flashcards` opcjonalnie odnosi się do rekordu w `generations` poprzez `generation_id`.
- Rekordy w `generations` oraz `generation_error_logs` są powiązane z użytkownikiem przez `user_id`.

## 3. Indeksy (Podsumowanie)

- `flashcards`: indeksy na kolumnach `user_id`, `generation_id`
- `generations`: indeksy na kolumnach `user_id`, `source_text_hash`
- `generation_error_logs`: indeksy na kolumnach `user_id`, `source_text_hash`

## 4. Dodatkowe Uwagi

- Ograniczenia długości pól są wymuszane przez typy danych (VARCHAR) oraz CHECK constraints.
- Usuwanie użytkownika (zarządzanego przez Supabase Auth) skutkuje kaskadowym usunięciem związanych rekordów w tabelach `flashcards`, `generations` oraz `generation_error_logs`.
- RLS (Row-Level Security) jest wymagane we wszystkich tabelach, aby zapewnić, że użytkownicy mają dostęp tylko do swoich danych.
- Schemat jest zaprojektowany zgodnie z zasadami normalizacji (3NF) i pozostawia przestrzeń do przyszłych rozszerzeń (np. implementacja sesji nauki).
