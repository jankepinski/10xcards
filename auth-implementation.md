# Authentication Implementation

This document describes the implementation of the authentication system for the 10x Cards application, including registration, login, and session management.

## Architecture

The authentication system follows a server-side approach, using Astro API endpoints and Supabase Auth:

1. **Client-side components** - React forms for login and registration
2. **Server-side endpoints** - Astro API routes that handle authentication requests
3. **Middleware** - Session validation and user context injection
4. **Auth service** - Abstraction layer for Supabase Auth operations

## Authentication Flow

### Registration

1. User enters email, password, and confirms password on the registration form
2. Client-side validation ensures data integrity
3. Form submits data to `/api/auth/register` endpoint
4. Server validates the data and calls Supabase Auth `signUp` method
5. On success, session cookies are set and user is redirected to the dashboard

### Login

1. User enters credentials on the login form
2. Client-side validation checks for valid format
3. Form submits data to `/api/auth/login` endpoint
4. Server validates the data and calls Supabase Auth `signInWithPassword` method
5. On success, session cookies are set and user is redirected to the dashboard

### Session Management

- Sessions are maintained using HTTP-only cookies for security
- The middleware checks for valid session on each request
- Protected routes redirect unauthenticated users to the login page
- Session tokens are refreshed automatically if needed

## Implementation Details

### Components

- `RegisterForm.tsx` - Registration form with validation and API communication
- `LoginForm.tsx` - Login form with validation and API communication

### API Endpoints

- `/api/auth/register.ts` - Handles user registration
- `/api/auth/login.ts` - Handles user login
- `/api/auth/logout.ts` - Handles user logout

### Services

- `authService.ts` - Provides methods for user authentication and session management

### Middleware

- Injects Supabase client into all API routes
- Validates and refreshes session tokens
- Adds user information to Astro.locals

## Security Considerations

- Passwords are never stored directly, Supabase Auth handles secure storage
- Session tokens are stored as HTTP-only cookies to prevent XSS attacks
- CSRF protection through SameSite cookie attribute
- Server-side validation in addition to client-side validation

## Future Improvements

- Email verification flow
- Password reset functionality
- Rate limiting for auth endpoints
- Refresh token rotation
- Enhanced logging and monitoring
