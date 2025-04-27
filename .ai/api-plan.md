# REST API Plan

## 1. Resources

### 1.1 Users

- Corresponds to the `users` table managed by Supabase Auth.
- Key fields: id (UUID), email, encrypted_password, created_at, confirmed_at.
- Note: Authentication and user-related operations (e.g., registration, login) are handled by Supabase Auth.

### 1.2 Flashcards

- Corresponds to the `flashcards` table.
- Key fields: id, front (max 200 chars), back (max 500 chars), source (must be one of 'ai-full', 'ai-edited', 'manual'), created_at, updated_at, generation_id, user_id.
- Indexed by user_id and generation_id.

### 1.3 Generations

- Corresponds to the `generations` table used to track flashcard generation sessions.
- Key fields: id, user_id, model, source_text_hash, source_text_length (must be between 1000 and 10000), generated_count, accepted_unedited_count, accepted_edited_count, generation_duration, created_at, updated_at.
- Indexed by user_id and source_text_hash.

### 1.4 GenerationErrorLogs

- Corresponds to the `generation_error_logs` table used for logging AI generation errors.
- Key fields: id, user_id, model, source_text_hash, source_text_length (between 1000 and 10000), error_code, error_message, created_at.
- Indexed by user_id and source_text_hash.

## 2. Endpoints

### 2.1 Flashcards Endpoints

#### GET /flashcards

- **Description:** Retrieve a paginated list of flashcards belonging to the authenticated user.
- **Query Parameters:**
  - page (optional, default 1)
  - limit (optional, default 20)
  - sort (e.g., created_at)
  - filter (e.g., by source)
- **Response JSON:**
  ```json
  {
    "flashcards": [
      { "id": 1, "front": "...", "back": "...", "source": "manual", "created_at": "..." },
      ...
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100 }
  }
  ```
- **Success Codes:** 200
- **Error Codes:** 401, 500

#### GET /flashcards/{id}

- **Description:** Retrieve details of a specific flashcard.
- **Response JSON:**
  ```json
  { "id": 1, "front": "...", "back": "...", "source": "manual", "created_at": "...", "updated_at": "..." }
  ```
- **Success Codes:** 200
- **Error Codes:** 401, 404

#### POST /flashcards

- **Description:** Create one or multiple flashcards either manually or from approved AI generation results.
- **Request JSON:**
  ```json
  {
    "flashcards": [
      {
        "front": "Flashcard front text (max 200 chars)",
        "back": "Flashcard back text (max 500 chars)",
        "source": "manual", // or 'ai-full' / 'ai-edited'
        "generation_id": null // optional, required when source is 'ai-full' or 'ai-edited'
      }
    ]
  }
  ```
- **Response JSON:**
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
- **Success Codes:** 201
- **Error Codes:** 400 (validation errors), 401

#### PUT /flashcards/{id}

- **Description:** Update an existing flashcard.
- **Request JSON:**
  ```json
  {
    "front": "Updated front text",
    "back": "Updated back text",
    "source": "ai-edited" // if applicable
  }
  ```
- **Response JSON:** Updated flashcard object.
- **Success Codes:** 200
- **Error Codes:** 400, 401, 404

#### DELETE /flashcards/{id}

- **Description:** Delete a flashcard.
- **Response:** Confirmation message.
- **Success Codes:** 200
- **Error Codes:** 401, 404

---

### 2.2 Generations Endpoints

#### GET /generations

- **Description:** Retrieve a list of generation sessions for the user.
- **Query Parameters:** pagination parameters as needed
- **Response JSON:**
  ```json
  { "generations": [
      { "id": 1, "model": "gpt-4", "source_text_hash": "hash", "source_text_length": 1500, "generated_count": 10, ... },
      ...
    ]
  }
  ```
- **Success Codes:** 200
- **Error Codes:** 401, 500

#### GET /generations/{id}

- **Description:** Retrieve details of a specific generation session.
- **Response JSON:** Generation session object with associated metadata.
- **Success Codes:** 200
- **Error Codes:** 401, 404

#### POST /generations

- **Description:** Initiate a new flashcard generation session using AI.
- **Request JSON:**
  ```json
  { "source_text": "Text to be processed by the AI (1000-10000 characters)" }
  ```
- **Business Logic:**
  - Validate that `source_text` length is between 1000 and 10000 characters.
  - Call the external AI service (via Openrouter.ai) to generate flashcards.
  - Create a generation record capturing metadata such as generation_duration, generated_count, etc.
- **Response JSON:**
  ```json
  { "generation": { "id": 1, "model": "gpt-4", "generated_count": 10, ... },
    "flashcards": [
      { "front": "...", "back": "...", "source": "ai-full" },
      ...
    ]
  }
  ```
- **Success Codes:** 201
- **Error Codes:** 400, 401, 500

---

### 2.3 Generation Error Logs Endpoints

#### GET /generation-error-logs

- **Description:** Retrieve a list of AI generation error logs for the user.
- **Response JSON:**
  ```json
  { "error_logs": [
      { "id": 1, "error_code": "ERR001", "error_message": "Detailed error message", "created_at": "..." },
      ...
    ]
  }
  ```
- **Success Codes:** 200
- **Error Codes:** 401, 500

#### GET /generation-error-logs/{id}

- **Description:** Retrieve details of a specific error log entry.
- **Success Codes:** 200
- **Error Codes:** 401, 404

_Note: A POST endpoint for error logging might be internal and not exposed publicly since error logs are typically created by the system rather than the client._

## 3. Authentication and Authorization

- **Mechanism:** Utilize Supabase Auth with JWT tokens. All protected endpoints require an Authorization header of the form:

  `Authorization: Bearer <token>`

- **Row-Level Security (RLS):** Database RLS rules ensure users access only their own data (e.g., flashcards where user_id = auth.uid()).

- **Endpoints Affected:** All endpoints except public ones (if any) must enforce authentication.

---

## 4. Validation and Business Logic

### 4.1 Validation

- **Flashcards:**

  - `front` must not exceed 200 characters.
  - `back` must not exceed 500 characters.
  - `source` must be one of 'ai-full', 'ai-edited', or 'manual'.

- **Generations:**
  - `source_text` length must be between 1000 and 10000 characters (enforced by DB CHECK constraint).
  - Other numerical fields (e.g., generated_count) must be non-negative integers.

### 4.2 Business Logic

- **AI Generation Flow:**

  - Upon receiving a POST to /generations, the system validates the `source_text` length.
  - The request is forwarded to an external AI service (Openrouter.ai) to generate flashcards.
  - A new generation session is recorded with metadata (model used, processing time, counts).
  - The generated flashcards are returned to the client for review and approval.
  - Approved flashcards may then be created via the POST /flashcards endpoint, associating them with the generation record.

- **Manual Flashcard Management:**

  - Users can create, update, and delete flashcards via the respective endpoints. No additional business logic is applied aside from basic validation.

### 4.3 Security and Performance Considerations

- **Rate Limiting:** Especially on endpoints interfacing with external AI services to prevent abuse.
- **Error Handling:** Return appropriate HTTP status codes (e.g., 400 for bad requests, 401 for unauthorized access, 404 for resources not found, and 500 for server errors) with consistent error response structures.
- **Data Sanitization:** Ensure all input data is sanitized to prevent injection attacks.

---

## Assumptions

- Endpoints are built using Astro 5 and TypeScript 5 with React components for the client-side.
- Supabase is used for both authentication and as the primary database provider, leveraging its RLS features.
- Integration with Openrouter.ai is synchronous for the purpose of flashcard generation, though asynchronous processing may be considered in future iterations.
