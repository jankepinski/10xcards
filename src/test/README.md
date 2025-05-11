# Testing Documentation

This directory contains tests for the 10xCards application. It follows the testing plan outlined in `.ai/test-plan.md` and implements the unit testing guidelines from the Cursor Rules.

## Directory Structure

- `src/test/setup.ts` - Global test setup including Testing Library matchers, mocks, and cleanup
- `src/test/components/` - Tests for React components
- `src/test/lib/` - Tests for utility functions, hooks, and services
- `src/test/pages/api/` - Tests for API endpoints

## Testing Approach

We use the following tools for testing:

- **Vitest** - Test runner and framework
- **React Testing Library** - For testing React components
- **JSDOM** - For simulating a browser environment
- **@testing-library/user-event** - For simulating user interactions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Component Tests

For testing React components, use React Testing Library's render, screen, and userEvent utilities:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "../components/MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const onChangeMock = vi.fn();
    render(<MyComponent onChange={onChangeMock} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onChangeMock).toHaveBeenCalled();
  });
});
```

### Utility Tests

For testing utility functions, test inputs and outputs directly:

```ts
import { myUtilityFunction } from "../lib/utils";

describe("myUtilityFunction", () => {
  it("returns expected output for valid input", () => {
    expect(myUtilityFunction("input")).toBe("expected output");
  });

  it("handles edge cases", () => {
    expect(myUtilityFunction("")).toBeNull();
  });
});
```

### Mocking Guidelines

- Use `vi.fn()` for function mocks
- Use `vi.spyOn()` to monitor existing functions
- Use `vi.mock()` for module mocks
- Place mock factory functions at the top level of your test file

Example:

```ts
vi.mock("@supabase/supabase-js", async () => {
  const actual = await vi.importActual("@supabase/supabase-js");
  return {
    ...actual,
    createClient: () => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-id" } } }),
      },
    }),
  };
});
```

## Best Practices

1. Test behavior, not implementation
2. Write small, focused tests
3. Use appropriate selectors (prefer user-centric queries)
4. Clean up after each test
5. Use descriptive test names
6. Structure tests with the Arrange-Act-Assert pattern
7. Leverage TypeScript type checking in tests
8. Use inline snapshots for complex outputs
9. Monitor test coverage with purpose
