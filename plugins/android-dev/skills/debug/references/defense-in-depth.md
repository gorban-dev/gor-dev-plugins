# Defense in Depth — Make Bugs Structurally Impossible

After fixing a bug, go beyond the immediate fix. Apply validation at multiple layers so the same class of bug **cannot recur**.

## The Four Layers

### Layer 1: Entry Point Validation

Validate inputs at system boundaries — where external data enters your code.

- API request parameters: type, range, required fields
- User input: format, length, allowed characters
- File content: schema, encoding, size limits
- Environment variables: presence, valid values

```kotlin
// BAD — trusts input
fun getUser(id: String) = repository.findById(id)

// GOOD — validates at entry
fun getUser(id: String): Result<User> {
    require(id.isNotBlank()) { "User ID must not be blank" }
    return repository.findById(id)
}
```

### Layer 2: Business Logic Validation

Enforce invariants inside domain logic — rules that must always hold true.

- State transitions: only valid transitions allowed
- Calculations: inputs within expected ranges
- Relationships: referential integrity between objects
- Preconditions: required state before operations

```kotlin
// BAD — assumes valid state
fun completeOrder(order: Order) {
    order.status = OrderStatus.COMPLETED
}

// GOOD — enforces valid transition
fun completeOrder(order: Order): Result<Order> {
    check(order.status == OrderStatus.PAID) {
        "Cannot complete order in status ${order.status}"
    }
    return Result.success(order.copy(status = OrderStatus.COMPLETED))
}
```

### Layer 3: Environment Guards

Verify runtime environment assumptions — things you take for granted that might not be true.

- Network connectivity before API calls
- File/directory existence before I/O
- Database connection health before queries
- Required services availability
- Sufficient memory/disk space for operations

### Layer 4: Debug Instrumentation

Add observability that survives into production — logging and metrics that help diagnose the **next** bug.

- Log state transitions with before/after values
- Log external call inputs and outputs (redact sensitive data)
- Add correlation IDs for tracing across components
- Include context: timestamps, user IDs, request IDs
- Metric counters for error rates and edge cases

## When to Apply

After every bug fix, ask: **"At which layers could this bug have been caught earlier?"**

Add validation at those layers. The goal is not just to fix the bug, but to make the entire **class** of bug structurally impossible.

## Key Principle

> A bug that can only happen if three independent checks all fail is a bug that almost never happens.
