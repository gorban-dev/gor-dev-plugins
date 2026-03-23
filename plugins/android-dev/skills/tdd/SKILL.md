---
description: |
  Test-Driven Development workflow: RED → GREEN → REFACTOR. Write a failing test first, then write minimal code to pass it, then refactor while keeping tests green. Best for business logic (UseCases, mappers, utils, repositories), not for UI code.

  This skill should be used when the user says "tdd", "test first", "test driven", "red green refactor", "write tests before code", or when implementing business logic that benefits from test-first approach.

  <example>
  Context: User wants to implement a use case with TDD
  user: "implement the login use case with TDD"
  assistant: "I'll use the TDD skill — starting with a failing test for the login use case."
  <commentary>
  Explicit TDD request for business logic — perfect use case.
  </commentary>
  </example>

  <example>
  Context: User wants to add a data mapper
  user: "create the user mapper, let's do it test-first"
  assistant: "I'll use the TDD workflow — RED phase first with a test for the mapper."
  <commentary>
  Test-first request for a mapper — ideal for TDD.
  </commentary>
  </example>

  <example>
  Context: User is building a utility function
  user: "I need a date formatter, can we use TDD?"
  assistant: "Starting with RED phase — writing a failing test for the date formatter."
  <commentary>
  Pure function with clear inputs/outputs — TDD shines here.
  </commentary>
  </example>
---

# TDD — Test-Driven Development

You implement code using the strict RED-GREEN-REFACTOR cycle. Tests come first, always.

## Core Rule

**If you didn't watch the test fail, you don't know if it tests the right thing.**

Production code cannot exist without a preceding failing test that demanded it.

## Input

Implementation task from user: **$ARGUMENTS**

## When to Use TDD

**Good fit** (use this skill):
- UseCases, Interactors
- Data mappers and transformers
- Utility functions and helpers
- Repository implementations (with mocked data sources)
- Business rules and validation logic
- Algorithms and data processing

**Not a good fit** (use other approaches instead):
- Compose UI code → use `android-dev:test-ui` for device testing
- Navigation setup → test manually or with integration tests
- DI module configuration → validated by compile-time checks
- Simple data classes → no logic to test

## Workflow

### Phase 1: RED — Write a Failing Test

1. **Identify the behavior** to implement. What should the function/class do?
2. **Write a minimal test** that demonstrates the desired behavior:
   - Test name describes the behavior: `should return user profile when id is valid`
   - Test calls the function/method that doesn't exist yet (or exists but lacks the behavior)
   - Test asserts the expected result
3. **Run the test** — confirm it **fails** with an expected error (compilation error or assertion failure).
4. **Report**: "RED phase complete — test fails as expected: {error message}"

```
// Example RED phase
@Test
fun `should return formatted date for valid timestamp`() {
    val formatter = DateFormatter()
    val result = formatter.format(1679500000000L)
    assertEquals("2023-03-22", result)
}
// This fails because DateFormatter doesn't exist yet or format() isn't implemented
```

### Phase 2: GREEN — Write Minimal Code to Pass

1. **Write the simplest code** that makes the test pass. Nothing more.
   - Do NOT add error handling for cases not yet tested.
   - Do NOT add features not yet demanded by a test.
   - Do NOT optimize — just make it work.
2. **Run the test** — confirm it **passes**.
3. **Run all related tests** — confirm nothing is broken.
4. **Report**: "GREEN phase complete — test passes."

```
// Example GREEN phase — simplest implementation
class DateFormatter {
    fun format(timestamp: Long): String {
        val date = Instant.ofEpochMilli(timestamp).atZone(ZoneOffset.UTC).toLocalDate()
        return date.toString() // Returns "2023-03-22" format by default
    }
}
```

### Phase 3: REFACTOR — Improve While Staying Green

1. **Review** the code for improvements:
   - Remove duplication
   - Improve naming
   - Simplify logic
   - Extract constants
2. **Run all tests** after each change — they must stay green.
3. **Report**: "REFACTOR phase complete — all tests still pass."

### Repeat the Cycle

After one RED-GREEN-REFACTOR cycle, identify the next behavior to implement:

1. Write the next failing test (RED)
2. Make it pass (GREEN)
3. Refactor (REFACTOR)

Continue until all required behaviors are implemented.

## Completion Checklist

Before declaring TDD work complete:

- [ ] Every public function has at least one test
- [ ] Each test failed first (RED) before the implementation made it pass (GREEN)
- [ ] Edge cases are covered (null inputs, empty collections, boundary values, error cases)
- [ ] All tests pass after final refactoring
- [ ] No production code exists without a test that demanded it

## Anti-Patterns to Avoid

- 🚫 Writing the implementation first, then adding tests after ("test-after development")
- 🚫 Writing a test that passes immediately without code changes
- 🚫 Writing multiple tests before any implementation
- 🚫 Skipping the REFACTOR phase
- 🚫 Writing complex tests — each test should verify one behavior
- 🚫 Rationalizing "this is too simple to test" — simple code has simple tests

For detailed mocking anti-patterns and examples, see `references/anti-patterns.md`.

## Deep Dive References

- `references/testable-design.md` — Principles for writing testable code: dependency injection, pure functions, minimal public surface area.
- `references/anti-patterns.md` — 5 common mocking and testing mistakes with code examples and gate questions.
- `references/mocking-strategy.md` — What to mock (system boundaries) and what not to mock (your own code). Fake vs. mock vs. stub decision guide.

## Rules

- Follow the cycle strictly: RED → GREEN → REFACTOR. Never skip a phase.
- In the RED phase, the test MUST fail. If it passes, the test is wrong or the behavior already exists.
- In the GREEN phase, write the MINIMUM code to pass. Resist the urge to add more.
- In the REFACTOR phase, do NOT add new functionality — only restructure existing code.
- Report each phase transition clearly so the user can follow the process.
