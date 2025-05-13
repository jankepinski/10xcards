# 10x-cards

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10x-cards is a web application designed to help users quickly create, manage, and study using flashcards. The application leverages advanced LLM APIs to automatically generate flashcard suggestions from user-provided text, streamlining the learning process with spaced repetition. Additionally, users can manually create, edit, and delete flashcards, all within a secure authenticated environment.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase for user management and data storage
- **AI Integration:** Openrouter.ai for accessing various LLMs
- **Testing:** Vitest, React Testing Library for unit tests; Cypress/Playwright for E2E tests
- **CI/CD & Hosting:** GitHub Actions and DigitalOcean
- **Tooling:** ESLint and Prettier for maintaining code quality

## Getting Started Locally

### Prerequisites

- [Node.js v22.14.0](https://nodejs.org/) (as specified in the `.nvmrc` file)
- npm (comes bundled with Node.js)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/jankepinski/10xcards.git
   cd 10xcards
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the development server:
   ```sh
   supabase start
   
   npm run dev
   ```

Remember to setup .env variables!

The application should now be accessible at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- **`npm run dev`**: Starts the development server with hot reloading.
- **`npm run build`**: Builds the application for production.
- **`npm run preview`**: Serves the production build locally.
- **`npm run astro`**: Runs Astro CLI commands.
- **`npm run test`**: Runs Vitest unit tests.
- **`npm run test:e2e`**: Runs E2E tests with Cypress/Playwright.
- **`npm run lint`**: Lints the codebase using ESLint.
- **`npm run lint:fix`**: Automatically fixes linting issues.
- **`npm run format`**: Formats the codebase using Prettier.

## Project Scope

The project aims to deliver an efficient flashcard system featuring:

- **Automated Flashcard Generation:** Users can paste a block of text to receive AI-generated flashcard suggestions.
- **Manual Flashcard Management:** Capabilities for creating, editing, and deleting flashcards manually.
- **User Authentication:** Secure registration, login, and account management ensuring user data privacy.
- **Spaced Repetition Integration:** Incorporation of spaced repetition scheduling for effective learning.
- **Statistical Tracking:** Monitoring of flashcard generation and acceptance rates to gauge effectiveness.

This MVP focuses on the core functionalities, with further enhancements planned based on user feedback.

## Project Status

This project is currently in the **MVP** stage and is under active development. Future updates will include additional features and refinements.

## License

This project is licensed under the **MIT License**.
