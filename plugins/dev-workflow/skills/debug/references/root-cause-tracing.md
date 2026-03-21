# Root Cause Tracing — Find the Origin, Not the Symptom

When debugging, the error you see is rarely the actual problem. Trace **upward** through the call stack to find where things first went wrong.

## The Tracing Process

### 1. Start at the Symptom

Read the error message and stack trace completely. Note:
- The exact error type and message
- The line where the error occurs
- The full call chain leading to it

### 2. Trace Upward

From the error site, ask at each level:
- **Where did this value come from?** Follow the data backward.
- **What assumption was violated?** The code expected X but got Y — why?
- **When was the last point where things were correct?** The bug is between that point and the error.

### 3. Identify the Original Trigger

The root cause is the **first point** in the execution where behavior diverged from intent. Common locations:

- **Initialization**: wrong defaults, missing setup
- **Data transformation**: lossy conversion, wrong mapping
- **State mutation**: unexpected side effect, stale reference
- **Async boundary**: timing issue, missing await, callback order
- **External input**: unexpected format, missing field, encoding issue

## Instrumentation Techniques

### Add Logging at Boundaries

When the trace isn't clear from code reading alone, add temporary instrumentation:

```kotlin
// Add at function entry/exit to trace data flow
fun processUser(input: UserInput): Result<User> {
    println("[DEBUG] processUser input: $input")
    val result = validate(input)
    println("[DEBUG] processUser after validate: $result")
    // ... rest of function
}
```

### Include Context in Logs

Always include:
- **What**: the operation being performed
- **With what**: the input data (redact sensitive fields)
- **Where**: file path, working directory, environment
- **When**: timestamp or sequence number

```
[DEBUG] parseConfig: reading /app/config/settings.yml
[DEBUG] parseConfig: raw content = "port: abc" (expected integer)
[DEBUG] parseConfig: FAILED — NumberFormatException at line 1
```

### Use Assertions for Assumptions

Make implicit assumptions explicit:

```kotlin
fun transfer(from: Account, to: Account, amount: BigDecimal) {
    assert(amount > BigDecimal.ZERO) { "Transfer amount must be positive: $amount" }
    assert(from.id != to.id) { "Cannot transfer to same account: ${from.id}" }
    // Now the real logic...
}
```

## Common Tracing Patterns

| Symptom | Likely Root Cause Location |
|---------|--------------------------|
| NullPointerException | Initialization or data loading |
| Wrong output value | Data transformation or mapping |
| Intermittent failure | Async timing or shared state |
| Works locally, fails in CI | Environment difference (paths, config, versions) |
| Regression after refactor | Implicit dependency that was accidentally broken |

## Key Principle

> Don't fix the line that throws — fix the line that creates the bad state. They are rarely the same line.
