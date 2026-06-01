---
name: testing-standards
description: Стандарты тестирования по Myers «The Art of Software Testing» применительно к стеку metal-art-site (Vitest unit/integration, Storybook + a11y, Playwright visual + e2e). Загружай при написании или ревью тестов, рефакторинге test-suite, проектировании test cases, отладке падающих тестов.
---

# Стандарты тестирования

## Когда применять
Этот skill — обязательный для любых задач, связанных с тестами: создание нового теста, рефакторинг существующего, разбор падений, проектирование test cases для нового компонента или фичи.

База: Glenford J. Myers, Corey Sandler, Tom Badgett — «The Art of Software Testing, 3rd Edition».
Адаптация: реальный стек проекта `metal-art-site` — Vitest 4, Storybook 10, Playwright 1.59, Testing Library Vue.

---

## Часть I — Принципы Myers (применимые к любому языку/стеку)

### Аксиома: тестирование = поиск ошибок
> Тест успешен, если **обнаружил ошибку**, а не если «прошёл».

Из этого следует:
- Хороший test case — тот, у которого высокая вероятность найти ошибку.
- Тест, который никогда не падает, не приносит ценности. Если изменения кода никогда не ломают тест — он либо проверяет тривиальное, либо не проверяет ничего.

### 10 принципов Myers
1. **Обязательная часть теста — определение ожидаемого результата.** Без ожидания нельзя сказать, нашли ли мы ошибку.
2. **Программист не должен тестировать собственный код в одиночку как финальную проверку.** Психологическая предвзятость. Пары/ревью обязательны для критических модулей.
3. **Организация не должна тестировать собственные программы как финальную проверку.** В нашем масштабе — CI и отдельные слои тестов выполняют эту роль.
4. **Каждый результат теста должен быть полностью проверен.** Не верь «зелёному» — читай ассерты.
5. **Test cases должны покрывать как валидные, так и невалидные/неожиданные входы.** Это центральный принцип. Большинство ошибок — на «краях».
6. **Проверяй, что программа делает то, что нужно, И что не делает того, чего не нужно.** Negative testing.
7. **Избегай выбрасывания test cases после прогона.** Регрессионный набор — актив.
8. **Не планируй тестирование исходя из предположения, что ошибок не будет.** Планируй ресурсы на отладку.
9. **Вероятность найти ещё одну ошибку в модуле пропорциональна уже найденным в нём.** Багги-модуль остаётся багги-модулем. Усиливай тесты вокруг «горячих» мест.
10. **Тестирование — глубоко творческая и интеллектуальная задача.** Это не «прогнать и забыть».

---

## Часть II — Дизайн test cases (Myers)

Стратегия: комбинируй **чёрный** и **белый** ящики, потому что ни один по отдельности не покрывает всё.

### A. Black-box (по спецификации)

#### 1. Equivalence Partitioning (классы эквивалентности)
Разбей входы на классы, где программа должна вести себя одинаково. По одному test case на класс — валидный и невалидный.

Пример: поле «возраст», 1..120
- Валидные классы: `1..120`
- Невалидные: `< 1`, `> 120`, не число, пусто, отрицательное
- 5 test cases вместо «прогонять все 120 значений».

#### 2. Boundary Value Analysis (граничные значения)
**Самый продуктивный метод.** Ошибки концентрируются на границах.
- Возраст 1..120 → проверь: `0, 1, 2, 119, 120, 121`.
- Список 0..N элементов → проверь: пустой, 1 элемент, N, N+1.
- Строка макс 100 символов → 0, 1, 99, 100, 101.
- `null`, `undefined`, `''`, `0`, `NaN`, `Infinity` — стандартные границы JS.

#### 3. Cause-Effect Graphing
Для логики с комбинациями входов: построй таблицу истинности (декартово произведение причин), сократи через ограничения, получи минимальный набор тестов.

#### 4. Error Guessing
Опираясь на опыт, целенаправленно ищи типичные ошибки:
- Деление на 0
- Пустые массивы/строки
- Отрицательные числа там, где ждут положительные
- Off-by-one (длина против индекса)
- Перегрузка (1000+ элементов)
- Конкурентные запросы (race conditions)
- Unicode, эмодзи, RTL-текст

### B. White-box (по коду)

Уровни покрытия по силе (каждый следующий включает предыдущий):
1. **Statement coverage** — каждая строка выполнена хотя бы раз. Слабейший уровень.
2. **Decision (branch) coverage** — каждая ветка `if/else`/`switch` пройдена.
3. **Condition coverage** — каждое атомарное условие принимало `true` и `false`.
4. **Decision/Condition coverage** — оба сразу.
5. **Multiple-condition coverage** — все комбинации атомарных условий. Цель для критических модулей.

В проекте `metal-art-site` istanbul/v8 даёт `lines/branches/functions/statements`. Цели: 75/65/70/75 в CI (`build/tests/vitest.config.ts`), 100% per-file для `src/components/**/*.vue` в `test:components:coverage`.

### Стратегия выбора методов
Myers рекомендует комбинацию в таком порядке:
1. Cause-effect graphing (если есть формальная спецификация)
2. Boundary value analysis (всегда)
3. Equivalence partitioning (всегда)
4. Error guessing (опыт + интуиция)
5. White-box проверка покрытия → дополнительные тесты для непокрытых веток

---

## Часть III — Уровни тестирования (Myers + наш стек)

### 1. Module / Unit testing
**Цель**: проверить отдельный модуль (компонент, composable, утилита) изолированно.

**Стек**: Vitest + Testing Library Vue в jsdom.

**Где**: `src/**/*.spec.ts` рядом с тестируемым файлом.

**Setup**: `build/tests/setup-vitest.ts` — `cleanup`, `restoreAllMocks`, мок `ResizeObserver`, `window.open/prompt/confirm`.

**Пример (`BaseButton.spec.ts`)**:
```ts
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import BaseButton from './BaseButton.vue';

describe('BaseButton — unit', () => {
  it('эмитит click при клике на активную кнопку', async () => {
    const { emitted } = render(BaseButton, { slots: { default: 'Кнопка' } });
    await fireEvent.click(screen.getByRole('button'));
    expect(emitted()).toHaveProperty('click');
  });

  it('не эмитит click если isDisabled=true', async () => {
    const { emitted } = render(BaseButton, {
      props: { isDisabled: true },
      slots: { default: 'Кнопка' },
    });
    await fireEvent.click(screen.getByRole('button'));
    expect(emitted().click).toBeUndefined();
  });

  it('применяет класс варианта', () => {
    render(BaseButton, { props: { variant: 'ghost' }, slots: { default: 'X' } });
    expect(screen.getByRole('button')).toHaveClass('base-button--ghost');
  });
});
```

**Правила для unit-тестов в этом проекте**:
- Используй `@testing-library/vue` + `@testing-library/jest-dom/vitest`, а не `mount` из `@vue/test-utils` напрямую (есть в зависимостях, но основной паттерн — TL).
- Селекторы по роли: `screen.getByRole('button')`, `getByLabelText('Email')`. Не по классам и `data-test-id` без необходимости.
- `fireEvent` для простых событий, `userEvent` (через `@testing-library/user-event`) для сценариев с фокусом, клавиатурой, типизацией.
- Snapshot-тесты — только для стабильной разметки (иконки, статические шаблоны). Для интерактива — assertions по поведению.

### 2. Integration testing
**Цель**: связка нескольких модулей, проверка взаимодействия.

**Файлы**: `*.integration.spec.ts` рядом с компонентом.

**Подход (Myers)**:
- **Top-down** — собирай от верхнего компонента вниз, заглушки для нижних.
- **Bottom-up** — сначала листья, потом сборки.
- **Sandwich** — комбинация: критические нижние + критические верхние, встречаются в середине.

В UI Kit нашего проекта типичная integration-проверка:
- Компонент-композиция (`BaseForm` + `BaseInput` + `BaseFormField`) собран и реагирует на ввод/submit.
- Слоты и emit-ы пробрасываются корректно сквозь слои.
- Поведение с реальным `v-model` через родителя.

```ts
// BaseForm.integration.spec.ts
it('передаёт submit с собранными значениями полей', async () => {
  const { emitted } = render(TestForm); // обёртка с BaseForm + BaseInput
  await userEvent.type(screen.getByLabelText('Email'), 'a@b.c');
  await userEvent.click(screen.getByRole('button', { name: 'Отправить' }));
  expect(emitted().submit?.[0]?.[0]).toEqual({ email: 'a@b.c' });
});
```

### 3. Visual regression
**Стек**: Playwright (project `visual-chromium`) + Storybook iframe.

**Файлы**: `*.visual.spec.ts`. Один скриншот на одну тестируемую визуальную ситуацию.

**Правила**:
- Тест открывает story через `?path=/story/...&viewMode=story` или iframe URL.
- Используй `await page.waitForLoadState('networkidle')` + `await page.waitForTimeout(100)` для анимаций.
- Сравнение через `expect(page).toHaveScreenshot('name.png')`.
- Маскируй динамические элементы (`mask: [page.locator('.timestamp')]`).
- Обновление baseline: `npm run test:visual:update`. Делай это **только осознанно** и фиксируй в PR с приложенным скриншотом.

### 4. End-to-end
**Стек**: Playwright project `e2e-chromium`. Файлы `*.e2e.spec.ts`. Применяется для тяжёлых компонентов (BaseChat, BaseEditor, BaseDatePicker, BaseCalendar, BaseTable, BaseFileUpload) — там, где есть сценарий пользователя сквозь несколько действий.

**Правила**:
- Один сценарий = один тест.
- Никаких зависимостей между тестами (см. F.I.R.S.T.).
- Селекторы: роли > `getByText` > `data-testid`. Не цепляйся за классы стилей.
- Время выполнения — лимитируй: e2e дороже unit на 2-3 порядка, держи их короткими.

### 5. Accessibility tests
**Stack**: Storybook `addon-a11y` + `@storybook/addon-vitest` + axe.

**Конфиг**: `build/storybook/preview.ts` — `error` в CI, `off` в Storybook UI, `todo` в dev.

**Правила**:
- Каждая story (в `.stories.ts`) обязана иметь `play()` хотя бы с базовыми взаимодействиями.
- Нарушение a11y в CI = падение пайплайна.
- Используй семантические роли: `<button>`, `<label for>`, `aria-*` атрибуты, `alt` у изображений.

---

## Часть IV — F.I.R.S.T. (применимо ко всем уровням)

| Буква | Что значит | Как обеспечить |
|---|---|---|
| **F**ast | Быстрый | Юнит-тесты — миллисекунды. Стабы вместо реального I/O. |
| **I**ndependent | Независимый | Любой порядок и подмножество. Нет общего изменяемого состояния. `cleanup` после каждого теста (есть в `setup-vitest.ts`). |
| **R**epeatable | Повторяемый | Один и тот же результат в любой среде. Никаких `new Date()` без fake-таймера. Никаких сетевых вызовов в unit. |
| **S**elf-validating | Самопроверяемый | Pass/fail через `expect`. Никаких `console.log` для глаз. |
| **T**imely | Своевременный | Тест пишется одновременно с кодом или до (TDD). Не «потом, если будет время». |

---

## Часть V — Структура теста

### Arrange-Act-Assert (AAA)
```ts
it('фильтрует пользователей по статусу', () => {
  // Arrange
  const users = [u('active'), u('disabled'), u('active')];
  const store = createTestStore({ items: users });

  // Act
  const result = store.filteredItems;

  // Assert
  expect(result).toHaveLength(2);
  expect(result.every(x => x.isActive)).toBe(true);
});
```

### Given-When-Then
Вариант AAA с другими словами. Полезен для BDD-стиля.

### Один концепт на тест
- Один `it()` проверяет **один сценарий**.
- Несколько `expect` допустимы, если они описывают одну логическую проверку (например, состояние объекта после действия).
- Если хочется `expect_X_and_then_expect_Y_completely_different` — раздели на два `it()`.

### Имя теста
- Полное описание сценария: `it('эмитит click при клике на активную кнопку')` — а не `it('test1')` или `it('works')`.
- Шаблон: «**что делает** / **при каком условии** / **какой ожидаемый результат**».
- Русский язык — допустим и приветствуется в этом проекте.

---

## Часть VI — Test doubles (доли тестирования)

| Тип | Назначение | Когда использовать |
|---|---|---|
| **Dummy** | Заглушка-«пустышка», нужна только чтобы вызвать функцию | Когда параметр обязателен, но не используется |
| **Stub** | Возвращает фиксированные данные | Когда нужно подсунуть конкретный ответ |
| **Spy** | Регистрирует, как был вызван | Когда важна верификация взаимодействия |
| **Mock** | Стаб + ожидания + автоматическая проверка | Когда поведение объекта-сотрудника критично |
| **Fake** | Упрощённая работающая реализация (`InMemoryDb`) | Для интеграционных тестов |

В Vitest: `vi.fn()`, `vi.spyOn()`, `vi.mock()`. **Всегда** `vi.restoreAllMocks()` после теста (уже настроено в `setup-vitest.ts`).

### Чем меньше моков — тем лучше
Если тест требует мокать 5 объектов — это сигнал высокой связанности кода. Сначала рефакторь продакшн-код (DI, чистые функции), потом пиши тест.

---

## Часть VII — Что тестировать в этом проекте

### Для каждого нового Base-компонента (полный набор)
```
BaseX/
├── BaseX.spec.ts                  ← unit, jsdom, TL
├── BaseX.integration.spec.ts      ← integration в jsdom
├── BaseX.stories.ts               ← Storybook CSF3 + play() + a11y
└── BaseX.visual.spec.ts           ← Playwright VRT
```
Heavy (BaseChat/Editor/DatePicker/Calendar/Table/FileUpload) добавляют ещё:
```
BaseX.e2e.spec.ts                  ← Playwright e2e
```

### Чек-лист test cases для компонента
- [ ] Рендер с дефолтными пропсами
- [ ] Рендер со всеми вариантами `variant`, `size`, `color` (boundary)
- [ ] Рендер со слотами (default + named)
- [ ] Эмиссия событий при пользовательских действиях
- [ ] Отсутствие эмиссий, когда `isDisabled` / `isLoading`
- [ ] `v-model` (если есть): чтение + запись
- [ ] Граничные значения числовых пропсов (0, max, max+1, отрицательные)
- [ ] Невалидные пропсы (тип Union, не входит) — не падает, ведёт себя предсказуемо
- [ ] A11y: правильная role, aria-атрибуты, фокус-менеджмент
- [ ] Keyboard navigation (Tab, Enter, Space, Escape, стрелки)
- [ ] Visual: все ключевые состояния (default, hover, focus, active, disabled, loading, error)

### Для composables (`src/composables/useX/useX.spec.ts`)
- [ ] Возвращает ожидаемую структуру
- [ ] Реактивные значения обновляются
- [ ] Очистка side-effects при `onUnmounted` (если есть — смонтируй в test-компонент, размонтируй, проверь что нет утечек)
- [ ] Граничные входы: пустой массив, `null`, отсутствие DOM

### Для utilities (`src/utils/xUtils/xUtils.spec.ts`)
- [ ] Чистая функция: одинаковый вход → одинаковый выход
- [ ] Все классы эквивалентности
- [ ] Все границы (null/undefined/empty/min/max/over)
- [ ] Не бросает на ожидаемых ошибочных входах

---

## Часть VIII — Coverage в `metal-art-site`

### Конфиг (`build/tests/vitest.config.ts`)
- Provider: `istanbul` (или `v8` для скорости).
- Глобальные пороги CI: lines 75 / functions 70 / branches 65 / statements 75.
- Per-file пороги для `src/components/**/*.vue`: 100% (команда `test:components:coverage`).
- Stories coverage: `test:stories-coverage`.

### Запуск
```bash
npm run test:unit              # unit + integration
npm run test:integration       # только integration
npm run test:storybook         # Storybook test runner
npm run test:storybook:coverage
npm run test:a11y              # accessibility
npm run test:components:coverage
npm run test:visual            # Playwright VRT
npm run test:visual:update     # обновить baseline (ОСОЗНАННО)
npm run test:e2e               # Playwright e2e
npm run test:all               # всё подряд
```

### Покрытие — не цель, а инструмент
80% покрытия может означать прекрасные тесты или прохождение каждой строки без единого ассерта. Coverage даёт **нижнюю границу качества**, не верхнюю. Тратить силы на «добивание процента» бесполезно — лучше добавить boundary cases в существующих тестах.

---

## Часть IX — Антипаттерны (что НЕ делать)

| Антипаттерн | Симптом | Лечение |
|---|---|---|
| Тест без ассерта | `it('works', () => { component.do(); })` | Добавь `expect` ожидаемого результата |
| `expect(true).toBe(true)` | Заглушка ради coverage | Удали, напиши настоящий тест |
| Зависимость порядка | `test_2` падает без `test_1` | Каждый тест — самодостаточен |
| Magic delays | `await sleep(1000)` | `waitFor()`, `waitForLoadState` |
| Тестирование реализации | `expect(component.vm.privateMethod()).toBe(...)` | Тестируй поведение через публичный интерфейс |
| Чрезмерные моки | 10 `vi.mock` в одном файле | Рефактори продакшн-код, упрости зависимости |
| Закомментированные тесты | `it.skip` без причины | Или удали, или почини с тикетом |
| Гигантский setup | 50 строк подготовки на 5 строк теста | Вынеси в фабрику (`createUser()`, `renderWithProviders()`) |
| Дублирование сетапа | Один и тот же `beforeEach` в 20 файлах | Извлеки в test-helper |
| Тестирование чужого кода | Тесты на поведение Vue/Pinia/Vitest | Доверяй платформе, тестируй СВОЁ |
| Snapshot всего DOM | `toMatchSnapshot()` на 500 строк HTML | Snapshot — для маленьких стабильных кусков |
| «Test что-то работает» как описание | Бесполезно при падении | Полное описание сценария |

---

## Часть X — Workflow добавления теста

1. **Сформулируй гипотезу об ошибке** (Myers: тест ищет ошибку, а не подтверждает «работу»).
2. **Выпиши классы эквивалентности и границы** входов.
3. **Напиши test case с явным ожидаемым результатом** в комментарии или имени теста.
4. **Запусти — он должен упасть** (если код ещё не реализован, или сломаешь — должен упасть).
5. **Реализуй / поправь продакшн-код**, пока тест не позеленеет.
6. **Прогон всех связанных тестов** (`npm run test:unit -- BaseButton`).
7. **Проверь coverage непокрытых ветвей** — добавь test case на каждую.
8. **Сохрани тест в регрессионный набор** — никогда не выбрасывай.
9. **Если найдена ошибка в продакшене** — сначала тест, воспроизводящий её, потом фикс.

---

## Чеклист готовности набора тестов

- [ ] Каждый test case имеет явный ожидаемый результат
- [ ] Применены equivalence partitioning + boundary analysis
- [ ] Покрыты валидные И невалидные входы
- [ ] Negative testing: проверено, что лишнего не делается
- [ ] F.I.R.S.T. соблюдён: быстрые, независимые, повторяемые, самопроверяемые, своевременные
- [ ] AAA-структура (Arrange-Act-Assert) во всех тестах
- [ ] Один концепт на тест
- [ ] Имена тестов описывают сценарий полностью
- [ ] Моки минимальны и сбрасываются (`restoreAllMocks`)
- [ ] Coverage порог пройден (lines 75 / functions 70 / branches 65 для CI)
- [ ] Для компонента есть: `*.spec.ts`, `*.integration.spec.ts`, `*.stories.ts`, `*.visual.spec.ts`
- [ ] Для тяжёлого компонента дополнительно есть `*.e2e.spec.ts`
- [ ] A11y-проверки покрывают role, aria, keyboard navigation
- [ ] Нет тестов без ассертов
- [ ] Нет зависимости от порядка запуска
- [ ] Нет произвольных `sleep` — только `waitFor`
- [ ] Все падения воспроизводимы, ни одного «иногда зелёный»
