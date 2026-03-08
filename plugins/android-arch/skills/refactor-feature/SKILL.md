---
description: "Рефакторинг существующего Android кода к архитектурному стандарту: разделение Screen/View, миграция на BaseSharedViewModel, миграция Kodein→Koin, приведение пакетов к стандарту. Используй когда нужно отрефакторить, мигрировать, привести к стандарту существующий экран или фичу."
---

# Refactor Feature — приведение кода к архитектурному стандарту

Ты анализируешь существующий код и трансформируешь его к целевой архитектуре.

## Workflow

### Шаг 1: Аудит текущего кода
Прочитай все файлы фичи и проверь по чеклисту:

**Screen:**
- [ ] Существует отдельный Screen файл
- [ ] Screen только читает viewState и передаёт в View
- [ ] Screen не содержит логику, remember, вычисления

**View:**
- [ ] Каждый View в отдельном файле
- [ ] View принимает viewState и eventHandler
- [ ] View не содержит логику, remember, side-effects
- [ ] Есть Preview: `{Feature}View_Preview` (private fun, обёрнутый в `{App}Theme { }`)

**ViewModel:**
- [ ] Наследует BaseSharedViewModel<State, Action, Event>
- [ ] Не импортирует Compose
- [ ] Вся логика в handleEvent() и приватных методах
- [ ] Навигация через ViewAction

**ViewState / ViewEvent / ViewAction:**
- [ ] Каждый в отдельном файле
- [ ] ViewState — data class с дефолтами
- [ ] ViewEvent — sealed class
- [ ] ViewAction — sealed class

**UseCase:**
- [ ] Наследует UseCase<Params, T>
- [ ] Функция execute() (не operator fun)
- [ ] Возвращает Result<T>
- [ ] Обработка ошибок внутри

**Repository:**
- [ ] Есть интерфейс I{Feature}Repository
- [ ] Зависит только от DataSources
- [ ] Возвращает чистые данные

**Структура пакетов:**
- [ ] presentation/screen/, presentation/view/, presentation/viewmodel/
- [ ] domain/usecase/, domain/repository/
- [ ] data/datasource/, data/repository/
- [ ] di/

**Файлы:**
- [ ] Каждый класс в отдельном файле
- [ ] Нет god-файлов

### Шаг 2: Составь план миграции
На основе аудита определи отклонения и спланируй порядок исправлений:
1. Сначала создай недостающую структуру пакетов
2. Разделение файлов (выноси классы в отдельные файлы)
3. Создание недостающих слоёв (ViewState/Event/Action, UseCase, Repository)
4. Рефакторинг ViewModel к BaseSharedViewModel
5. Разделение Screen и View
6. Миграция DI (если нужно)
7. Обновление импортов

### Шаг 3: Миграция DI (Kodein → Koin)
Если требуется — см. references/migration-guide.md

### Шаг 4: Выполнение рефакторинга
Трансформируй файлы по плану. Каждый шаг — атомарный.

### Шаг 5: Валидация
Пройди чеклист из Шага 1 повторно — все пункты должны быть выполнены.

### Шаг 6: Вывод
1. **Audit report** — найденные отклонения
2. **Migration plan** — порядок исправлений
3. **Changed files** — что изменено
4. **New files** — что создано
5. **Deleted/moved files** — что удалено или перемещено
6. **Full code** — финальный код всех файлов
7. **Architecture validation** — подтверждение соответствия стандарту
