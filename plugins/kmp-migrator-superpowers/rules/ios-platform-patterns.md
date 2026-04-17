# iOS Platform Patterns

Common idiomatic patterns for native iOS in Swift. Reference for migration; **the project's existing patterns take priority** (see `project-architecture-audit.md`).

## State Management

### ObservableObject + @Published (UIKit-friendly + SwiftUI)

```swift
final class FooViewModel: ObservableObject {
    @Published private(set) var items: [Item] = []
    @Published private(set) var isLoading = false
    @Published private(set) var error: AppError?

    private let repository: ItemRepository

    init(repository: ItemRepository) {
        self.repository = repository
    }

    func load() {
        Task { [weak self] in
            guard let self else { return }
            await MainActor.run { self.isLoading = true }
            do {
                let items = try await repository.fetch()
                await MainActor.run {
                    self.items = items
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.error = .from(error)
                    self.isLoading = false
                }
            }
        }
    }
}
```

### @Observable (iOS 17+ Swift 5.9+)

```swift
@Observable
final class FooViewModel {
    private(set) var items: [Item] = []
    private(set) var isLoading = false
    // ...
}
```

Use `@Observable` only if the project already targets iOS 17+ and uses it elsewhere.

## Async / Concurrency

```swift
// Task — fire and forget
Task { [weak self] in
    guard let self else { return }
    await self.load()
}

// async throws
func fetch() async throws -> [Item] {
    try await repository.fetch()
}

// Task.sleep
try? await Task.sleep(nanoseconds: 300_000_000)  // 300 ms

// MainActor.run for UI mutations from background context
await MainActor.run {
    self.state = newState
}
```

## DI Patterns

### Service Container (singleton with lazy registrations)

```swift
final class ServiceContainer {
    static let shared = ServiceContainer()
    private init() {}

    lazy var orderRepository: OrderRepository = OrderRepositoryImpl(
        dataSource: orderDataSource
    )

    private lazy var orderDataSource: OrderDataSource = OrderDataSourceImpl(
        client: networkClient
    )

    private lazy var networkClient: NetworkClient = URLSessionNetworkClient()

    // ViewModels created fresh per call
    func orderListViewModel() -> OrderListViewModel {
        OrderListViewModel(repository: orderRepository)
    }
}
```

### Constructor Injection

```swift
final class OrderListViewModel: ObservableObject {
    private let repository: OrderRepository

    init(repository: OrderRepository) {
        self.repository = repository
    }
}
```

Avoid `@Inject`-style property wrappers unless the project already uses them.

## Navigation

### Coordinator Pattern (UIKit)

```swift
protocol Coordinator: AnyObject {
    var navigationController: UINavigationController { get }
    func start()
}

final class OrdersCoordinator: Coordinator {
    let navigationController: UINavigationController

    init(navigationController: UINavigationController) {
        self.navigationController = navigationController
    }

    func start() {
        let vm = ServiceContainer.shared.orderListViewModel()
        let vc = OrderListViewController(viewModel: vm)
        vc.onSelectOrder = { [weak self] order in
            self?.showOrderDetail(order)
        }
        navigationController.pushViewController(vc, animated: true)
    }

    private func showOrderDetail(_ order: Order) {
        // ...
    }
}
```

### NavigationStack (SwiftUI iOS 16+)

```swift
struct OrdersFlow: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            OrderListView()
                .navigationDestination(for: Order.self) { order in
                    OrderDetailView(order: order)
                }
        }
    }
}
```

## ViewModels — Direct Methods vs Event Enums

iOS code typically prefers **direct methods on the ViewModel** over event/action enums:

```swift
// Preferred (idiomatic iOS)
viewModel.refresh()
viewModel.deleteOrder(orderId)
viewModel.toggleFavorite(itemId, isFavorite: true)

// Avoid (Android MVI pattern, awkward in Swift)
viewModel.send(.refresh)
viewModel.send(.deleteOrder(orderId))
```

If the project already uses event enums (because the team prefers MVI), follow the project. Migration is not the time to switch architectural style.

## SwiftUI Bindings

```swift
struct OrderListView: View {
    @StateObject private var viewModel: OrderListViewModel

    init(viewModel: @autoclosure @escaping () -> OrderListViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel())
    }

    var body: some View {
        List(viewModel.items) { item in
            OrderRow(item: item)
        }
        .refreshable { await viewModel.refresh() }
        .task { await viewModel.load() }
    }
}
```

## UIKit View Controller

```swift
final class OrderListViewController: UIViewController {
    private let viewModel: OrderListViewModel
    private var cancellables = Set<AnyCancellable>()

    init(viewModel: OrderListViewModel) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError() }

    override func viewDidLoad() {
        super.viewDidLoad()
        bind()
        viewModel.load()
    }

    private func bind() {
        viewModel.$items
            .receive(on: DispatchQueue.main)
            .sink { [weak self] items in
                self?.render(items)
            }
            .store(in: &cancellables)
    }
}
```

## Networking

### URLSession baseline

```swift
struct NetworkClient {
    let session: URLSession
    let baseURL: URL

    func get<T: Decodable>(_ path: String) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        let (data, response) = try await session.data(from: url)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw NetworkError.badStatus
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

API paths typically live in a dedicated constants enum/namespace — follow the project's convention (e.g. `Const.Net.Paths.*`, `APIRoutes.*`, etc.).

## Persistence

Common options: Core Data, SwiftData (iOS 17+), Realm, plain `FileManager` + `Codable`, Keychain (for credentials), `UserDefaults` (small key-value).

Pick whatever the project already uses. Do not introduce a new persistence layer during migration.

## Error Modeling

```swift
enum AppError: Error, Equatable {
    case network
    case unauthorized
    case notFound
    case decoding
    case unknown(String)
}

extension AppError {
    static func from(_ error: Error) -> AppError {
        if let appError = error as? AppError { return appError }
        // map URLError, DecodingError, etc.
        return .unknown(error.localizedDescription)
    }
}
```

## File Organization

Common conventions (audit project to confirm):

- One class / struct / enum per file
- Extensions of the same type allowed in the same file
- Extensions of external types in `Helpers/Extensions/TypeName+Feature.swift`
- Protocols in `Domain/` (or feature folder)
- Implementations in `Data/` (or feature folder)
- ViewModels in `Presentation/` (or feature folder)
- Views in `UI/` or `Views/` (or feature folder)

## Common Anti-Patterns to Avoid

- **`@MainActor` on ViewModels** — usually overkill; dispatch UI work explicitly with `MainActor.run` or `DispatchQueue.main`
- **Force unwraps (`!`)** — almost always wrong outside of test fixtures
- **`Class` for value-type-shaped data** — use `struct`
- **Singletons everywhere** — only the DI container itself; everything else gets constructor-injected
- **Global mutable state** — pass dependencies explicitly
- **Mixing UIKit and SwiftUI without a clear boundary** — pick a side per screen
- **Adding "IOS" / "Native" suffix to types** — types are named for what they are, not where they live
