# Mocking Strategy — What to Mock and What Not To

## The Rule: Mock System Boundaries Only

Mock **external systems** that you don't control. Never mock **your own code**.

### MOCK (system boundaries):
- HTTP APIs and network calls
- Database queries
- File system operations
- System clock / time
- Random number generators
- External service SDKs
- Push notifications, email services

### DO NOT MOCK (your own code):
- Your own classes and interfaces
- Internal collaborators within the same module
- Data transformations and mappers
- Business logic components
- Utility functions

## Why?

Mocking your own code creates tests that verify **wiring**, not **behavior**. They pass even when the real components are broken.

```kotlin
// BAD — mocking own code, test proves nothing
val mockValidator = mock<OrderValidator>()
val mockCalculator = mock<PriceCalculator>()
val service = OrderService(mockValidator, mockCalculator)
// This test only proves OrderService calls methods — not that it works

// GOOD — use real components, mock only the DB
val validator = OrderValidator()  // real
val calculator = PriceCalculator()  // real
val fakeRepo = FakeOrderRepository()  // fake for DB boundary
val service = OrderService(validator, calculator, fakeRepo)
// This test proves the whole flow works
```

## Fake vs. Mock

| Approach | When to use |
|----------|-------------|
| **Fake** (in-memory implementation) | When you need realistic behavior — repositories, APIs |
| **Mock** (record & verify) | When you need to verify a call was made — notifications, analytics |
| **Stub** (fixed return) | When you just need a value — config, feature flags |

Prefer **fakes** over mocks. A fake `FakeUserRepository` backed by a `MutableList` behaves like the real thing but without a database.

## SDK-Style Interfaces Over Generic Fetchers

```kotlin
// BAD — generic, hard to fake meaningfully
interface HttpClient {
    fun get(url: String): Response
    fun post(url: String, body: String): Response
}

// GOOD — domain-specific, easy to fake
interface PaymentGateway {
    suspend fun charge(amount: BigDecimal, card: CardToken): ChargeResult
    suspend fun refund(chargeId: String): RefundResult
}

class FakePaymentGateway : PaymentGateway {
    val charges = mutableListOf<Charge>()

    override suspend fun charge(amount: BigDecimal, card: CardToken): ChargeResult {
        val charge = Charge(id = UUID.randomUUID().toString(), amount = amount)
        charges.add(charge)
        return ChargeResult.Success(charge.id)
    }
    // ...
}
```

## Key Principle

> Each mock returns one specific shape. If you need complex conditional behavior from a mock, you're mocking too much — use a real component or a richer fake.
