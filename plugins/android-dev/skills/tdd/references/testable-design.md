# Testable Design — Principles for Code That's Easy to Test

Code that's hard to test is usually hard to maintain. These principles make code naturally testable.

## 1. Accept Dependencies, Don't Create Them

**Dependency Injection**: Pass dependencies through constructors instead of creating them internally.

```kotlin
// BAD — creates its own dependency, impossible to test in isolation
class OrderProcessor {
    private val repository = OrderRepository(Database.getInstance())

    fun process(order: Order) = repository.save(order)
}

// GOOD — accepts dependency, easy to test with a fake
class OrderProcessor(private val repository: IOrderRepository) {
    fun process(order: Order) = repository.save(order)
}

// In test:
val fakeRepo = FakeOrderRepository()
val processor = OrderProcessor(fakeRepo)
```

## 2. Return Results, Don't Produce Side Effects

**Pure Functions**: Given the same inputs, always return the same output with no side effects.

```kotlin
// BAD — mutates external state, hard to verify
fun applyDiscount(order: Order) {
    order.total = order.total * 0.9  // side effect
    analytics.track("discount_applied")  // side effect
}

// GOOD — returns new value, caller decides what to do
fun calculateDiscount(total: BigDecimal): BigDecimal {
    return total * BigDecimal("0.9")
}
```

Benefits:
- No setup needed — just call with inputs and assert output
- No teardown needed — nothing to clean up
- Parallelizable — no shared state to conflict

## 3. Minimal Public Surface Area

Fewer public methods = fewer things to test = fewer things that can break.

- Make helpers `private` — only test through public API
- One clear responsibility per class
- Deep modules: simple interface, complex internals

```kotlin
// BAD — exposes internal steps as public API
class PriceCalculator {
    fun getBasePrice(item: Item): BigDecimal = ...
    fun applyTax(price: BigDecimal): BigDecimal = ...
    fun applyDiscount(price: BigDecimal, code: String): BigDecimal = ...
    fun calculateFinal(item: Item, code: String?): BigDecimal = ...
}

// GOOD — one public method, internals are private
class PriceCalculator {
    fun calculate(item: Item, discountCode: String? = null): BigDecimal {
        val base = getBasePrice(item)
        val discounted = discountCode?.let { applyDiscount(base, it) } ?: base
        return applyTax(discounted)
    }

    private fun getBasePrice(item: Item): BigDecimal = ...
    private fun applyTax(price: BigDecimal): BigDecimal = ...
    private fun applyDiscount(price: BigDecimal, code: String): BigDecimal = ...
}
```

## Post-TDD Refinement

After completing a RED-GREEN-REFACTOR cycle, check:

1. **Duplication** — Extract repeated code into shared helpers
2. **Oversized methods** — Decompose into smaller, focused functions
3. **Code smells** — Long parameter lists, feature envy, inappropriate intimacy
4. **Test clarity** — Can someone read the test and understand the behavior without reading the implementation?
