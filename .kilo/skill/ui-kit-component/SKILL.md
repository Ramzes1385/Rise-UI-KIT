---
name: ui-kit-component
description: Создание/рефакторинг компонента UI Kit `metal-art-site` — реальная структура BaseX/ (vue+types+style+spec+integration+stories+visual+index), регистрация в plugin.ts и barrel, async-чанки для тяжёлых компонентов, CSS-токены, SVG-спрайт, aliases в 5 местах. Загружай при работе с любым Base*-компонентом.
---

# UI Kit Component — реальные стандарты `metal-art-site`

## Когда применять
Этот skill — единственный источник правды о том, как устроены компоненты в `metal-art-site`. Загружай при создании нового `BaseX`, рефакторинге существующего, добавлении истории/теста, изменении публичного API библиотеки.

> Этот репозиторий — **UI Kit библиотека**, не приложение. Никаких FSD-слоёв, Pinia, vue-router, vue-i18n, API-слоёв, mocks. Если задача предполагает «добавь страницу/роут/store/i18n» — задавай уточняющий вопрос: «Это точно сюда, а не во внешний проект?».

---

## Структура репозитория (фактическая)

```
src/
├── App.vue                 — рендерит <PlaygroundApp />
├── main.ts                 — createApp + createUiKitPlugin()
├── index.ts                — публичный barrel библиотеки
├── plugin.ts               — createUiKitPlugin() + UI_COMPONENTS map
├── components/             — 48 Base*-компонентов + index.ts
├── composables/            — 22 use*-папки + index.ts
├── utils/                  — 13 утилит + index.ts
├── icons/                  — 82 SVG-файла + index.ts с константами
├── styles/                 — _variables.scss, _mixins.scss, _functions.scss, index.scss
└── playground/             — демо-стенд для dev
```

**Запрещённые предположения** (этих папок НЕТ и они не нужны):
- `src/app/`, `src/pages/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`
- `src/stores/` (Pinia не используется)
- `src/api/` (API-слоя нет)
- `src/locales/` (i18n нет)
- `src/router/` (vue-router не используется)

---

## Каноническая структура нового компонента

```
src/components/BaseX/
├── BaseX.vue                       — SFC, импорт './BaseX.style.scss' внутри <script setup>
├── BaseX.types.ts                  — Props/Emits/Slots interfaces + const-tuples
├── BaseX.style.scss                — стили, БЭМ-нейминг, CSS-переменные из :root
├── BaseX.stories.ts                — Storybook CSF3 + play() + a11y
├── BaseX.spec.ts                   — unit (jsdom, @testing-library/vue)
├── BaseX.integration.spec.ts       — integration (jsdom)
├── BaseX.visual.spec.ts            — Playwright VRT (visual-chromium)
└── index.ts                        — barrel
```

Heavy (BaseChat / BaseEditor / BaseDatePicker / BaseCalendar / BaseTable / BaseFileUpload) добавляют:
```
BaseX.e2e.spec.ts                  — Playwright e2e
```

И требуют регистрации:
1. В `src/plugin.ts` через `defineAsyncComponent` (не статически).
2. В `build/config/build.ts` в `HEAVY_APP_CHUNKS` для manualChunks.

---

## Шаблон `BaseX.types.ts`

```ts
export const BASE_X_VARIANTS = ['default', 'ghost', 'outline'] as const;
export const BASE_X_SIZES = ['sm', 'md', 'lg'] as const;

export type BaseXVariant = (typeof BASE_X_VARIANTS)[number];
export type BaseXSize = (typeof BASE_X_SIZES)[number];

export interface BaseXProps {
  /** Заголовок компонента */
  title?: string;
  /** Визуальный вариант */
  variant?: BaseXVariant;
  /** Размер */
  size?: BaseXSize;
  /** Состояние загрузки */
  isLoading?: boolean;
  /** Заблокирован */
  isDisabled?: boolean;
  /** Кастомный класс */
  customClass?: CustomClassProp;
  /** Кастомный цвет */
  color?: CustomColor;
}

export interface BaseXEmits {
  (event: 'click', payload: MouseEvent): void;
  (event: 'update:modelValue', value: string): void;
}

export interface BaseXSlots {
  default?: () => unknown;
  prefix?: () => unknown;
  suffix?: () => unknown;
}
```

### Правила типов
- Все варианты — `as const`-tuple + `(typeof X)[number]` type. **Никаких enum**.
- Каждый prop с JSDoc на русском, описывающий **намерение**.
- Опциональные пропы — с `?`.
- Boolean-пропы — префикс `is`/`has`/`can`/`should`.
- Типы изолированы в `*.types.ts`. В `.vue` импортируются как `import type {...}`.

---

## Шаблон `BaseX.vue`

```vue
<template>
  <div
    :class="[
      'base-x',
      `base-x--${variant}`,
      `base-x--${size}`,
      {
        'base-x--loading': isLoading,
        'base-x--disabled': isDisabled,
      },
      customClass,
    ]"
  >
    <slot name="prefix" />
    <span v-if="title" class="base-x__title">{{ title }}</span>
    <slot />
    <slot name="suffix" />
  </div>
</template>

<script setup lang="ts">
import type { BaseXProps, BaseXEmits, BaseXSlots } from './BaseX.types';
import './BaseX.style.scss';

const props = withDefaults(defineProps<BaseXProps>(), {
  variant: 'default',
  size: 'md',
  isLoading: false,
  isDisabled: false,
});

const emit = defineEmits<BaseXEmits>();
defineSlots<BaseXSlots>();
</script>
```

### Правила Vue-файла
- **Только `<script setup lang="ts">`**. Никаких Options API, никаких `<style>`-блоков в `.vue`.
- Импорт стилей `import './BaseX.style.scss'` — обязательно внутри `<script setup>`.
- Импорт типов `import type {...}` — для всех типов.
- `withDefaults` для пропов с дефолтами.
- `defineSlots` для типизированных слотов.
- Логика >10 строк → выноси в composable (`useBaseX*`) в том же файле или соседнем `useBaseXLogic.ts`.

### Лимиты
| Что | Лимит |
|---|---|
| `<template>` | 50 строк |
| `<script setup>` | 100 строк |
| Функция в setup | 20 строк |
| Уровни v-if/v-for | 2 |
| Props | 8 (больше → группируй в объекты) |
| Вложенные тернарники | Запрещены |

Превышение — раздели на подкомпоненты (`BaseXHeader`, `BaseXBody` в той же папке).

---

## Шаблон `BaseX.style.scss`

```scss
.base-x {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--border-radius-base);
  background: var(--color-surface);
  color: var(--color-text);
  transition: var(--transition-base);

  &--default {
    background: var(--color-primary);
    color: var(--color-white);
  }

  &--ghost {
    background: transparent;
  }

  &--outline {
    background: transparent;
    border: 1px solid var(--color-border);
  }

  &--sm { padding: 4px 8px; font-size: 0.75rem; }
  &--md { padding: 8px 12px; font-size: 0.875rem; }
  &--lg { padding: 12px 16px; font-size: 1rem; }

  &--loading {
    pointer-events: none;
    opacity: 0.7;
  }

  &--disabled {
    pointer-events: none;
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__title {
    font-weight: 500;
  }
}
```

### Правила стилей
- **Только CSS custom properties из `:root`** (`var(--color-...)`, `var(--transition-base)`, `var(--border-radius-base)`). См. `src/styles/_variables.scss` для полного списка.
- Поддержка тёмной темы — автоматически через переопределение переменных в `[data-theme='dark']`. Не пиши свои `[data-theme]` правила.
- Глобальные SCSS-utility (`@styles/variables`, `@styles/mixins`, `@styles/functions`) **уже автоинжектятся** через `additionalData` (`build/config/css.ts`). **Не пиши `@use`** в файле компонента — будет ошибка дублирования.
- БЭМ: `block__element--modifier`, kebab-case.
- Запрещены вложенные БЭМ-элементы: `&__a { &__b {} }`. Каждый элемент — отдельная цепочка от блока.
- Не используй селекторы по тегу (`button`, `div`) — всегда через класс блока.
- Никаких `!important` без крайней необходимости с комментарием.

### Доступные CSS-переменные
**Цвета**: `--color-primary`, `--color-accent` (`#f97316`), `--color-text`, `--color-text-muted`, `--color-bg`, `--color-white`, `--color-border`, `--color-error`, `--color-success`, `--color-warning`, `--color-info`, `--color-surface`, `--color-surface-muted`, `--color-primary-soft`, `--color-primary-soft-hover`.

**Типографика**: `--font-family-base` (Inter), `--font-family-heading`, `--font-family-mono` (JetBrains Mono).

**Анимация**: `--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)`.

**Радиусы**: `--border-radius-sm`, `--border-radius-base`, `--border-radius-lg`, `--border-radius-full`.

**Тени**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`.

**SCSS-breakpoints** (только для `@media`): `$breakpoint-xs/sm/md/lg/xl/xxl` = 320/480/768/1024/1440/1920.

---

## Шаблон `BaseX.stories.ts` (Storybook CSF3)

```ts
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { userEvent, within, expect } from 'storybook/test';
import BaseX from './BaseX.vue';

const meta: Meta<typeof BaseX> = {
  title: 'Components/BaseX',
  component: BaseX,
  tags: ['autodocs'],
  args: {
    title: 'Заголовок',
    variant: 'default',
    size: 'md',
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'ghost', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;

type Story = StoryObj<typeof BaseX>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Заголовок')).toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByText('Заголовок').closest('.base-x');
    await expect(root).toHaveClass('base-x--loading');
  },
};

export const AllVariants: Story = {
  render: (args) => ({
    components: { BaseX },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 16px;">
        <BaseX v-bind="args" variant="default" />
        <BaseX v-bind="args" variant="ghost" />
        <BaseX v-bind="args" variant="outline" />
      </div>
    `,
  }),
};
```

### Правила историй
- Каждая story обязана иметь `play()` — это критерий a11y и storybook-coverage.
- Минимум 3 story: `Default`, ключевое состояние (`Disabled`/`Loading`), композиция всех вариантов.
- Используй `args` + `argTypes` для интерактивных контролов.
- В `play()` — реалистичные пользовательские действия через `userEvent`, не `fireEvent`.
- Не дублируй то же поведение в `play()` что уже покрыто в `.spec.ts` — stories тестируют **визуальные комбинации**, не логику.

---

## Шаблон `BaseX.spec.ts`

```ts
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import BaseX from './BaseX.vue';

describe('BaseX — unit', () => {
  it('рендерит заголовок из prop title', () => {
    render(BaseX, { props: { title: 'Тест' } });
    expect(screen.getByText('Тест')).toBeInTheDocument();
  });

  it('применяет класс варианта', () => {
    render(BaseX, { props: { title: 'X', variant: 'ghost' } });
    expect(screen.getByText('X').closest('.base-x')).toHaveClass('base-x--ghost');
  });

  it('эмитит click при клике на активный компонент', async () => {
    const { emitted } = render(BaseX, { props: { title: 'X' } });
    await fireEvent.click(screen.getByText('X').closest('.base-x')!);
    expect(emitted()).toHaveProperty('click');
  });

  it('не эмитит click если isDisabled=true', async () => {
    const { emitted } = render(BaseX, { props: { title: 'X', isDisabled: true } });
    await fireEvent.click(screen.getByText('X').closest('.base-x')!);
    expect(emitted().click).toBeUndefined();
  });

  it('рендерит слоты prefix и suffix', () => {
    render(BaseX, {
      props: { title: 'X' },
      slots: { prefix: 'PRE', suffix: 'SUF' },
    });
    expect(screen.getByText('PRE')).toBeInTheDocument();
    expect(screen.getByText('SUF')).toBeInTheDocument();
  });
});
```

Подробнее по тестированию — skill `testing-standards`.

---

## Шаблон `BaseX.integration.spec.ts`

Проверяет компонент в композиции (родитель + child, форма + поле, etc):

```ts
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';
import BaseX from './BaseX.vue';

const Host = defineComponent({
  components: { BaseX },
  setup() {
    const count = ref(0);
    return { count };
  },
  template: `
    <BaseX title="X" @click="count++" />
    <span data-testid="counter">{{ count }}</span>
  `,
});

describe('BaseX — integration', () => {
  it('увеличивает счётчик в родителе при клике', async () => {
    render(Host);
    await userEvent.click(screen.getByText('X'));
    await userEvent.click(screen.getByText('X'));
    expect(screen.getByTestId('counter')).toHaveTextContent('2');
  });
});
```

---

## Шаблон `BaseX.visual.spec.ts`

```ts
import { expect, test } from '@playwright/test';

const STORY_URL = '/iframe.html?id=components-basex--default';

test.describe('BaseX — visual', () => {
  test('default state', async ({ page }) => {
    await page.goto(STORY_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.base-x')).toHaveScreenshot('basex-default.png');
  });

  test('hover state', async ({ page }) => {
    await page.goto(STORY_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('.base-x').hover();
    await expect(page.locator('.base-x')).toHaveScreenshot('basex-hover.png');
  });

  test('disabled state', async ({ page }) => {
    await page.goto('/iframe.html?id=components-basex--disabled');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.base-x')).toHaveScreenshot('basex-disabled.png');
  });
});
```

Update baseline: `npm run test:visual:update` — **только осознанно**, с приложением скриншотов в PR.

---

## Шаблон `index.ts` (barrel)

```ts
export { default as BaseX } from './BaseX.vue';
export type {
  BaseXProps,
  BaseXEmits,
  BaseXSlots,
  BaseXVariant,
  BaseXSize,
} from './BaseX.types';
export { BASE_X_VARIANTS, BASE_X_SIZES } from './BaseX.types';
```

---

## Регистрация нового компонента (5 шагов)

### 1. `src/components/index.ts` (общий barrel компонентов)
```ts
export * from './BaseX';
```

### 2. `src/plugin.ts` (UI_COMPONENTS)

Для лёгкого компонента — статический импорт:
```ts
import BaseX from './components/BaseX/BaseX.vue';

const UI_COMPONENTS: Record<string, Component> = {
  // ...
  BaseX,
};
```

Для тяжёлого — `defineAsyncComponent`:
```ts
import { defineAsyncComponent } from 'vue';

const UI_COMPONENTS: Record<string, Component> = {
  // ...
  BaseHeavy: defineAsyncComponent(() => import('./components/BaseHeavy/BaseHeavy.vue')),
};
```

### 3. `src/index.ts` (публичный API библиотеки)
Если компонент должен быть экспортирован как именованный импорт для потребителей:
```ts
export { BaseX } from './components/BaseX';
export type { BaseXProps, BaseXVariant } from './components/BaseX';
```

### 4. `build/config/build.ts` (только heavy)
Если компонент тяжёлый — добавь в `HEAVY_APP_CHUNKS` для manualChunks:
```ts
const HEAVY_APP_CHUNKS = ['BaseChat', 'BaseEditor', /* ..., */ 'BaseHeavy'];
```

### 5. Aliases синхронизированы в 5 местах
Если добавляешь новый alias (редко):
- `tsconfig.json`
- `tsconfig.app.json`
- `build/config/alias.ts`
- `build/tests/vitest.config.ts`
- `build/storybook/main.ts`

Существующие aliases:
| Alias | Указывает на |
|---|---|
| `@/*` | `src/*` |
| `@components` / `@components/*` | `src/components/index.ts` / `src/components/*` |
| `@composables` / `@composables/*` | `src/composables/index.ts` / `src/composables/*` |
| `@icons` / `@icons/*` | `src/icons/index.ts` / `src/icons/*` |
| `@styles` / `@styles/*` | `src/styles/index.scss` / `src/styles/*` |
| `@ui` / `@ui/*` | `src/components/index.ts` / `src/components/*` |
| `@utils` / `@utils/*` | `src/utils/index.ts` / `src/utils/*` |

---

## Иконки

- Все SVG лежат в `src/icons/svg/`.
- Спрайт собирается автоматически из этой папки → `/icons.svg`.
- Константы пути — в `src/icons/index.ts`: `ICON_SPRITE_PATH`, `ICON_SOURCE_DIR`.
- Использовать иконку через `<BaseIcon name="my-icon" />`.
- Добавляешь иконку — просто положи `.svg` в `src/icons/svg/`. Перезапусти dev-сервер.

---

## Composables (`src/composables/useX/`)

```
useX/
├── useX.ts
├── useX.types.ts     ← опционально, если типов много
├── useX.spec.ts
└── index.ts
```

```ts
// useX/useX.ts
import { onUnmounted, ref } from 'vue';

export interface UseXOptions {
  delay?: number;
}

export interface UseXReturn {
  value: Readonly<Ref<number>>;
  set: (n: number) => void;
  reset: () => void;
}

export function useX(options: UseXOptions = {}): UseXReturn {
  const delay = options.delay ?? 300;
  const value = ref(0);
  // логика
  onUnmounted(() => { /* cleanup */ });
  return { value, set: (n) => { value.value = n; }, reset: () => { value.value = 0; } };
}
```

```ts
// useX/index.ts
export { useX } from './useX';
export type { UseXOptions, UseXReturn } from './useX';
```

Регистрация в `src/composables/index.ts`:
```ts
export * from './useX';
```

### Правила composables
- Имя файла = имя функции = `useX.ts`.
- Опции — единственный объектный параметр (с дефолтами).
- Возврат — типизированный объект, обязательно `Use{X}Return` тип.
- Все side-effects — в `onUnmounted` cleanup.
- Тесты — обязательно: реактивность, граничные входы, очистка.

---

## Utilities (`src/utils/xUtils/`)

```
xUtils/
├── xUtils.ts
├── xUtils.spec.ts
└── index.ts
```

- Чистые функции, без `this`, без зависимостей от Vue.
- Все public-функции — с явным возвращаемым типом.
- Группировка по теме: `dateUtils`, `formatUtils`, `imageUtils` и т.п.

---

## TypeScript strict (`tsconfig.json`)

Уровень: `strict: true` + `noUnusedLocals` + `noUnusedParameters` + `erasableSyntaxOnly` + `noFallthroughCasesInSwitch`.

**Запрещено**:
- `any` — используй `unknown` + narrowing
- `as Something` — кроме `as const` и crash-cast при guard'е
- non-null assertion `x!` — только с явным комментарием почему безопасно
- `enum` — используй `as const` tuples + union
- неиспользуемые импорты, переменные, параметры — упадёт `vue-tsc --noEmit` при build

---

## Стиль кода (нет ESLint/Prettier — наследуй по образцам)

- Табы для отступов (видно в `build/tests/vitest.config.ts`).
- Одинарные кавычки в TS/JS.
- Точки с запятой — есть (унаследовано из существующего кода).
- Строки — до 120 символов.

---

## Чек-лист готовности компонента

- [ ] Папка `src/components/BaseX/` создана
- [ ] 8 файлов: `.vue`, `.types.ts`, `.style.scss`, `.stories.ts`, `.spec.ts`, `.integration.spec.ts`, `.visual.spec.ts`, `index.ts`
- [ ] Для heavy — ещё `BaseX.e2e.spec.ts` + регистрация в `HEAVY_APP_CHUNKS`
- [ ] `.vue` использует только `<script setup lang="ts">`, без `<style>`
- [ ] Стили импортированы внутри `<script setup>` через `import './BaseX.style.scss'`
- [ ] Типы только в `.types.ts`, импорт в `.vue` как `import type`
- [ ] Варианты — `as const` tuple + union, не enum
- [ ] Стили используют только CSS-переменные из `:root`
- [ ] БЭМ-нейминг: `base-x__element--modifier`
- [ ] Глобальные SCSS-utility НЕ импортируются вручную (автоинжект)
- [ ] Компонент зарегистрирован в `src/components/index.ts` (barrel)
- [ ] Компонент зарегистрирован в `src/plugin.ts` (UI_COMPONENTS)
- [ ] Если экспортируется для библиотеки — добавлен в `src/index.ts`
- [ ] Минимум 3 story c `play()` функцией
- [ ] Все 4 типа тестов написаны и проходят
- [ ] A11y покрыто: role, aria-атрибуты, keyboard navigation
- [ ] Лимиты соблюдены: `<template>` ≤ 50, `<script setup>` ≤ 100, props ≤ 8
- [ ] Coverage для нового компонента — 100% per-file (`test:components:coverage`)
- [ ] `vue-tsc --noEmit` (npm run build) проходит без ошибок
