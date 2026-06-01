# Metal Art Site — UI Kit

Библиотека Vue 3 UI-компонентов с полной типизацией TypeScript, дизайн-системой на CSS-переменных, тёмной темой и многоуровневым тестированием.

## Технологический стек

| Категория | Технология |
|---|---|
| Фреймворк | Vue 3 (`<script setup lang="ts">`) |
| Язык | TypeScript ~6.0 |
| Сборка | Vite 8 (модульная архитектура `build/`) |
| Стили | SCSS + CSS-переменные + BEM |
| Unit / Integration | Vitest + @testing-library/vue + @vue/test-utils |
| Visual Regression | Playwright + Storybook screenshot |
| Accessibility | Storybook test runner + addon-a11y |
| E2E | Playwright (Chromium) |
| Storybook | 10.x (Vue 3 + Vite) |
| Линтинг | ESLint 9 (flat config) + typescript-eslint + eslint-plugin-vue |
| Прекоммит-хуки | Husky |
| Node.js | 22 |

## Установка

```bash
npm install metal-art-site
```

## Подключение

### Глобальная регистрация через плагин

```ts
// main.ts
import { createApp } from 'vue'
import { createUiKitPlugin } from 'metal-art-site'
import 'metal-art-site/styles'

const app = createApp(App)
app.use(createUiKitPlugin())
app.mount('#app')
```

Все компоненты регистрируются с префиксом `Base` (например `<BaseButton>`, `<BaseInput>`).

Кастомный префикс:

```ts
app.use(createUiKitPlugin({ prefix: 'Ma' }))
// → <MaButton>, <MaInput>
```

### Tree-shaking: точечный импорт

```ts
import { BaseButton } from 'metal-art-site/components/BaseButton'
import { BaseInput } from 'metal-art-site/components/BaseInput'
```

### Composables

```ts
import { useDebounce, useClickOutside, useBreakpoint } from 'metal-art-site/composables'
```

### Утилиты

```ts
import { formatDate, formatFileSize, assertNonNullable } from 'metal-art-site/utils'
```

### Иконки

```ts
import { ICON_SPRITE_PATH } from 'metal-art-site/icons'
```

Иконки поставляются как SVG-спрайт, генерируемый из `src/icons/svg/` (90+ иконок). Используются через `<BaseIcon name="icon-name" />`.

## Компоненты

Библиотека содержит **50 компонентов** в формате `Base*`:

| Категория | Компоненты |
|---|---|
| **Кнопки и действия** | BaseButton, BaseSwitch, BaseCheckbox, BaseRadio, BaseRating |
| **Поля ввода** | BaseInput, BaseTextarea, BaseSelect, BaseSearch, BaseColorPicker, BaseSlider, BaseRange, BaseFileUpload |
| **Данные** | BaseTable, BasePagination, BaseTree, BaseProgress, BaseBadge, BaseChip, BasePin |
| **Навигация** | BaseTabs, BaseStepper, BaseBreadcrumbs, BaseMenu, BaseDropdown, BaseMegaMenu, BaseSideBar |
| **Поверхности** | BaseCard, BaseModal, BaseSlideover, BasePopover, BaseTooltip, BaseAccordion |
| **Контент** | BaseText, BaseSeparator, BaseEmpty, BaseImage, BaseIcon, BaseAnimation |
| **Формы** | BaseForm, BaseFormField |
| **Обратная связь** | BaseAlert, BaseNotification, BaseLoader, BaseSkeleton |
| **Аватары** | BaseAvatar |
| **Сложные** | BaseChat, BaseEditor, BaseCalendar, BaseDatePicker, BaseTour |

### Тяжёлые компоненты (async-чанки)

Шесть компонентов вынесены в отдельные асинхронные чанки через `defineAsyncComponent` и не попадают в основной бандл:

- `BaseChat`
- `BaseEditor`
- `BaseCalendar`
- `BaseDatePicker`
- `BaseTable`
- `BaseFileUpload`

При глобальной регистрации через плагин они загружаются лениво. При точечном импорте — подключаются напрямую.

## Структура компонента

Каждый `Base*`-компонент следует единой файловой структуре:

```
src/components/BaseButton/
├── BaseButton.vue              ← SFC (template + script setup, без <style>)
├── BaseButton.types.ts         ← Props, Emits, Slots, константы
├── BaseButton.style.scss       ← BEM-стили с CSS-переменными
├── BaseButton.spec.ts          ← Unit-тесты (Vitest + @testing-library/vue)
├── BaseButton.integration.spec.ts ← Integration-тесты (userEvent)
├── BaseButton.visual.spec.ts   ← Visual regression (Playwright + Storybook)
├── BaseButton.stories.ts       ← Storybook stories с play-функциями
└── index.ts                    ← Публичный API компонента
```

Состав файлов может варьироваться: сложные компоненты (BaseChat, BaseModal) включают доп. e2e-тесты, вложенные подкомпоненты и composables.

## Дизайн-система

### CSS-переменные

Все визуальные параметры управляются через CSS-переменные, определённые в `src/styles/_variables.scss`:

**Цвета:**

```scss
--color-primary, --color-accent, --color-accent-hover
--color-text, --color-text-muted
--color-bg, --color-surface, --color-surface-muted
--color-border, --color-white
--color-error, --color-success, --color-warning, --color-info
--color-primary-soft, --color-primary-soft-hover
```

**Типографика:**

```scss
--font-family-base    // Inter, Segoe UI, Roboto, Arial, sans-serif
--font-family-heading // = --font-family-base
--font-family-mono    // JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace
```

**Остальное:**

```scss
--transition-base      // 200ms cubic-bezier(0.4, 0, 0.2, 1)
--border-radius-sm     // 4px
--border-radius-base   // 8px
--border-radius-lg     // 12px
--border-radius-full   // 9999px
--shadow-sm / --shadow-md / --shadow-lg / --shadow-xl
```

### Тёмная тема

Переключение через атрибут `data-theme="dark"` на корневом элементе:

```html
<html data-theme="dark">
```

Все CSS-переменные автоматически переопределяются для тёмной темы в `_variables.scss`.

### SCSS-миксины

Библиотека предоставляет набор миксинов в `src/styles/_mixins.scss`:

| Миксин | Описание |
|---|---|
| `flex-center` | `display: flex; align-items: center; justify-content: center` |
| `respond-to($name)` | Mobile-first media query от брейкпоинта |
| `respond-below($name)` | Media query до брейкпоинта |
| `respond-between($from, $to)` | Диапазон между брейкпоинтами |
| `transition($props...)` | Переход с `--transition-base` |
| `hover` / `active` / `focus` | Интерактивные состояния (исключают disabled) |
| `interactive` | Комплексный переход для интерактивных элементов |
| `custom-bg-*` / `custom-text-*` | Кастомные цвета с fallback-цепочками |

### Брейкпоинты

| Имя | Значение |
|---|---|
| `xs` | 320px |
| `sm` | 480px |
| `mobile` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1440px |
| `xxl` | 1920px |

### SCSS-функция `sz()`

Масштабирует значение пропорционально `--size-scale`:

```scss
padding: sz(10px 20px);
// → padding: calc(10px * var(--size-scale, 1)) calc(20px * var(--size-scale, 1));
```

## Composables

27 composable-функций, используемых внутри компонентов и доступных для внешнего потребления:

| Composable | Назначение |
|---|---|
| `useClickOutside` | Детект клика вне элемента |
| `useEscapeKey` | Обработка Escape |
| `useScrollLock` | Блокировка прокрутки body |
| `useDebounce` | Дебаунс значений |
| `useBreakpoint` | Реактивные брейкпоинты |
| `useSwipe` | Свайп-жесты |
| `useCustomColor` | Кастомные цвета bg/text с hover/active/focus |
| `useCustomClass` | Кастомные CSS-классы (строка или объект) |
| `useCustomStyle` | Инлайн-стили |
| `usePadding` | Вычисление padding (число или объект с осями) |
| `useSizeScale` | Масштабирование компонента (50%–200%) |
| `useVariant` | BEM-модификаторы вариантов |
| `usePopup` | Позиционирование попапов |
| `useFlyoutPosition` | Позиционирование выпадающих элементов |
| `useDropdownPosition` | Позиционирование дропдаунов |
| `useIcon` | Работа с SVG-иконками из спрайта |
| `useImageZoom` | Зум изображений |
| `useInputMask` | Маски ввода |
| `useListNavigation` | Навигация по списку клавиатурой |
| `useMegaMenuTree` | Дерево для мега-меню |
| `usePasswordVisibility` | Переключение видимости пароля |
| `useSlider` | Логика слайдера |
| `useTableData` | Данные таблицы |
| `useCalendar` | Логика календаря |
| `useColorPicker` | Логика Color Picker |
| `useEditorToolbar` | Тулбар редактора |
| `useAutoScroll` | Автопрокрутка |

## Утилиты

| Модуль | Назначение |
|---|---|
| `assertUtils` | Утверждения (assertNonNullable и др.) |
| `colorUtils` | Работа с цветами |
| `dateUtils` | Форматирование дат |
| `fileUtils` | Работа с файлами и MIME-типами |
| `formatUtils` | Форматирование значений |
| `imageUtils` | Обработка изображений |
| `navigationUtils` | Навигационные утилиты |
| `paginationUtils` | Расчёт пагинации |
| `rangeUtils` | Утилиты для Range |
| `schemaUtils` | Схемы валидации |
| `storybookUtils` | Хелперы для Storybook |
| `tableUtils` | Утилиты таблиц |
| `tooltipUtils` | Позиционирование тултипов |
| `editorDomInspect` | Инспекция DOM редактора |

## Тестирование

Библиотека использует четырёхуровневую стратегию тестирования:

### 1. Unit-тесты (Vitest)

Изолированная проверка пропсов, emits, CSS-модификаторов, слотов:

```bash
npm run test:unit
```

### 2. Integration-тесты (Vitest + @testing-library/user-event)

Проверка пользовательских взаимодействий (клики, фокус, Tab):

```bash
npm run test:unit  # запускает и unit, и integration
```

### 3. Storybook-тесты (Storybook test runner)

Интерактивные тесты через `play`-функции в stories + accessibility-проверки:

```bash
npm run test:storybook
npm run test:a11y
```

### 4. Visual Regression + E2E (Playwright)

Скриншот-тесты ключевых состояний компонентов и сквозное тестирование:

```bash
npm run test:visual
npm run test:e2e
```

Обновление скриншотов:

```bash
npm run test:visual:update
```

### Покрытие

```bash
# Полное покрытие с объединением отчётов
npm run test:coverage:merged

# Отдельные отчёты
npm run test:components:coverage    # Лёгкие компоненты (100% порог)
npm run test:components-heavy:coverage  # Тяжёлые компоненты (порог 0%)
npm run test:composables:coverage   # Composables (100% порог)
npm run test:utils:coverage         # Утилиты (100% порог)
```

## Скрипты

| Скрипт | Описание |
|---|---|
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Production-сборка (vue-tsc + vite build) |
| `npm run preview` | Превью production-сборки |
| `npm run lint` | ESLint проверка |
| `npm run lint:fix` | ESLint автофикс |
| `npm run storybook` | Запуск Storybook |
| `npm run build-storybook` | Сборка Storybook |
| `npm run test:unit` | Unit + Integration тесты |
| `npm run test:storybook` | Storybook тесты |
| `npm run test:a11y` | Accessibility тесты |
| `npm run test:e2e` | E2E тесты (Playwright) |
| `npm run test:visual` | Visual regression тесты |
| `npm run test:visual:update` | Обновление скриншотов |
| `npm run test:coverage:merged` | Полное покрытие (объединённый отчёт) |
| `npm run test:all` | Компоненты + E2E + Visual |

## Архитектура сборки

Конфигурация Vite разбита на модули в `build/`:

```
build/
├── config/
│   ├── alias.ts       ← Пути и алиасы (@components, @composables, @utils, @icons)
│   ├── build.ts       ← Production-сборка (чанки, минификация oxc, treeshake)
│   ├── css.ts         ← SCSS-автоинжект, lightningcss
│   ├── resolve.ts     ← Разрешение модулей
│   └── server.ts      ← Dev/preview сервер
├── plugins/           ← Vite-плагины (SVG, изображения, компрессия)
├── storybook/         ← Конфигурация Storybook
├── tests/             ← Конфигурации Vitest и Playwright
├── utils/             ← Вспомогательные функции сборки
├── constants.ts       ← Общие константы
└── husky/             ← Прекоммит-хуки
```

### Алиасы

| Алиас | Путь |
|---|---|
| `@components` | `src/components` |
| `@composables` | `src/composables` |
| `@utils` | `src/utils` |
| `@icons` | `src/icons` |
| `@styles` | `src/styles` |

### Стратегия чанков

- **Лёгкие компоненты** — в основном бандле
- **Тяжёлые компоненты** (BaseChat, BaseEditor, BaseCalendar, BaseDatePicker, BaseTable, BaseFileUpload) — отдельные async-чанки через `defineAsyncComponent`
- **Vendor** — отделён от app-кода (`vendor-vue`, `vendor-libs`)
- **Минификация** — oxc (нативный минификатор rolldown)

## Принципы библиотеки

1. **Без внешних зависимостей** — только `vue` и `sass` в runtime-зависимостях
2. **Полная типизация** — все Props, Emits, Slots типизированы через TypeScript-интерфейсы
3. **CSS-переменные** — кастомизация без переопределения стилей
4. **BEM-нейминг** — `.base-button`, `.base-button--ghost`, `.base-button__loader`
5. **Тёмная тема** — из коробки через `data-theme="dark"`
6. **Tree-shakeable** — ESM-экспорты для точечного подключения
7. **Масштабирование** — проп `sizeScale` на каждом компоненте (50%–200%)
8. **Кастомные цвета** — проп `color` с fallback на тему
9. **Accessibility** — ARIA-атрибуты, фокус по Tab, клавиатурная навигация
10. **100% покрытие тестами** — для лёгких компонентов, composables и утилит

## Лицензия

Private
