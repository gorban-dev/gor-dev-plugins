# TDD Anti-Patterns — Common Mocking and Testing Mistakes

## 1. Mock Existence vs. Real Behavior

**Problem**: Testing that a mock returns what you told it to return, instead of testing real component behavior.

```kotlin
// BAD — you're testing the mock, not the code
val mockRepo = mock<UserRepository> {
    on { findById("123") } doReturn User("123", "Alice")
}
val result = mockRepo.findById("123")
assertEquals("Alice", result.name)  // Of course it's Alice — you set it up that way!

// GOOD — test real behavior through the component
val fakeRepo = FakeUserRepository(users = listOf(User("123", "Alice")))
val useCase = GetUserUseCase(fakeRepo)
val result = useCase.execute("123")
assertEquals("Alice", result.getOrNull()?.name)
```

**Gate question**: "Am I testing what my code does, or what my mocks do?"

## 2. Production Bloat — Test-Only Code in Production

**Problem**: Adding methods to production classes solely for testing purposes.

```kotlin
// BAD — testing backdoor in production class
class PaymentProcessor {
    fun processPayment(amount: BigDecimal) { ... }

    // Only exists for tests — pollutes production API
    fun getInternalState(): ProcessorState = ...
    fun resetForTesting() { ... }
}

// GOOD — test through public behavior, use test-specific helpers externally
class PaymentProcessor {
    fun processPayment(amount: BigDecimal): PaymentResult { ... }
}

// In test file:
private fun createProcessorWithState(state: ProcessorState) = ...
```

## 3. Uninformed Mocking — Mocking Without Understanding

**Problem**: Mocking a dependency without understanding its actual behavior and side effects.

```kotlin
// BAD — mock hides that the real API returns paginated results
val mockApi = mock<ProductApi> {
    on { getProducts() } doReturn listOf(product1, product2)
}
// Test passes, but real API returns Page<Product> with hasNext/totalPages

// GOOD — understand the real contract first, then create accurate fakes
class FakeProductApi : ProductApi {
    private val products = mutableListOf<Product>()

    override fun getProducts(page: Int, size: Int): Page<Product> {
        val start = page * size
        val slice = products.subList(start, minOf(start + size, products.size))
        return Page(slice, page, products.size)
    }
}
```

**Rule**: Read the real implementation's contract before writing a mock. Understand error cases, edge cases, and return types.

## 4. Incomplete Mock Data

**Problem**: Mock returns simplified data that doesn't represent real API responses.

```kotlin
// BAD — mock returns bare minimum, hides real data shape
val mockResponse = UserResponse(name = "Alice")
// Real API returns: id, name, email, avatar, roles, createdAt, metadata...

// GOOD — replicate realistic response shape
val mockResponse = UserResponse(
    id = "123",
    name = "Alice",
    email = "alice@example.com",
    avatar = "https://example.com/alice.png",
    roles = listOf("user"),
    createdAt = "2024-01-15T10:30:00Z",
    metadata = mapOf("source" to "registration")
)
```

## 5. Over-Engineering — Complex Mock Infrastructure

**Problem**: Building elaborate mock frameworks when simpler approaches work.

```kotlin
// BAD — custom mock framework for something simple
class MockBuilder<T> {
    private val expectations = mutableMapOf<String, Any>()
    fun expect(method: String, result: Any) = apply { expectations[method] = result }
    fun build(): T = Proxy.newProxyInstance(...) as T
}

// GOOD — simple fake class, easier to understand and maintain
class FakeUserRepository : IUserRepository {
    val users = mutableListOf<User>()

    override suspend fun findById(id: String) = users.find { it.id == id }
    override suspend fun save(user: User) { users.add(user) }
}
```

**Rule**: If the mock is more complex than the real implementation, something is wrong.
