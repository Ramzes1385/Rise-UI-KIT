---
name: testing-ui-kit
description: >-
  Полная стратегия и реализация тестирования UI Kit на Vue 3:
  unit, integration, e2e и screenshot (visual regression) тесты.
  Стек: TypeScript, Vite, Vitest, Playwright, Storybook.
  Основано на официальных best practices и принципах Clean Code.
modeSlugs:
  - code
  - architect
  - debug
---

# Test Vue — Полное тестирование UI Kit

## Instructions

Ты настраиваешь и пишешь тесты для UI Kit на Vue 3.  
Язык общения — русский. Комментарии в коде — на русском.  
Все тесты должны быть детерминированными, быстрыми и пригодными для CI.

---

## Теоретическая база тестирования (адаптировано для UI-библиотеки)

### Зачем тестировать UI Kit

Цель тестов — не просто “проверить руками”, что сейчас работает, а:

- зафиксировать ожидаемое поведение компонентов;
- быстро находить регрессии после изменений;
- безопасно рефакторить стили, API пропсов, события и слоты;
- ускорять релизы за счёт автоматической проверки.

Тесты — это контракт поведения компонента.

### Пирамида тестирования для UI-библиотеки

Рекомендуемая пропорция:

- **Unit: 40–50%**
- **Integration: 20–30%**
- **Screenshot (visual): 20–30%**
- **E2E: 5–10%**

> E2E-тесты самые дорогие в поддержке, поэтому их меньше.  
> Visual-тестов больше, чем в backend-heavy проектах, потому что UI Kit критичен к визуальной стабильности.

### Виды тестов и зона ответственности

1. **Unit**  
   Проверяют изолированную логику:
   - утилиты, форматтеры;
   - пропсы, вычисления;
   - простые emits и рендер-ветки.

2. **Integration**  
   Проверяют связки:
   - `v-model` + `update:modelValue`;
   - работа слотов;
   - интеграция компонента с composable/store/router (если используется).

3. **E2E**  
   Проверяют ключевые пользовательские сценарии:
   - формы, валидация;
   - popup-потоки;
   - критичные пути в playground/документации.

4. **Screenshot (Visual Regression)**  
   Проверяют отсутствие визуальных регрессий:
   - `default/hover/focus/disabled/loading/error`;
   - light/dark theme;
   - ключевые размеры/варианты.

### Подбор тестовых данных (граничные значения)

Для каждого правила минимум 3 группы кейсов:

1. Позитивный кейс (валидное значение).
2. Границы (min/max, пустое значение и т.д.).
3. Невалидные кейсы (`null/undefined`, неверный тип, выход за диапазон).

### Clean Code для тестов (Robert C. Martin)

Следуй FIRST:

- **Fast**
- **Independent**
- **Repeatable**
- **Self-validating**
- **Timely**

И правилам:

- один тест = одно поведение;
- структура AAA: Arrange / Act / Assert;
- имя теста: `должен ... когда ...`;
- без магических значений и лишней логики в тестах.

---

## Стек и инструменты

- **Vue 3**
- **TypeScript (strict)**
- **Vite**
- **Vitest** (unit/integration)
- **@testing-library/vue** + `user-event`
- **Playwright** (e2e + screenshot)
- **Storybook** (источник стабильных UI-состояний для visual tests)

---

## Установка зависимостей

```bash
# Unit/Integration
npm i -D vitest @vitest/coverage-v8 @vue/test-utils jsdom
npm i -D @testing-library/vue @testing-library/user-event @testing-library/jest-dom

# Storybook + Vitest (browser-проект для play-тестов)
npm i -D @storybook/addon-vitest @vitest/browser-playwright

# E2E + Screenshot
npm i -D @playwright/test playwright

# (опционально) для моков API
npm i -D msw
```

## После установки Playwright-браузеров:

```bash
npx playwright install
```

## Структура файлов

```text
project/
├─ src/
│  ├─ shared/ui/
│  │  └─ BaseButton/
│  │     ├─ BaseButton.vue
│  │     ├─ BaseButton.types.ts
│  │     ├─ BaseButton.stories.ts
│  │     ├─ BaseButton.spec.ts
│  │     └─ BaseButton.integration.spec.ts
├─ tests/
│  ├─ setup-vitest.ts
│  ├─ e2e/
│  │  └─ accordion.smoke.spec.ts
│  └─ visual/
│     ├─ base-accordion.visual.spec.ts
│     └─ __screenshots__/
├─ vitest.config.ts
├─ playwright.config.ts
└─ package.json
```

## Конфигурация Vitest (unit + integration + storybook)

vitest.config.ts

```ts
/**
 * Конфигурация Vitest: unit/integration (jsdom) + Storybook (browser).
 * Storybook-проект использует @storybook/addon-vitest/vitest-plugin
 * и @vitest/browser-playwright для запуска play-тестов в браузере.
 */

/// <reference types="vitest" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

/** Алиасы проекта — дублируют build/config/alias.ts */
const ALIASES: Record<string, string> = {
	'@': path.resolve(__dirname, 'src'),
	'@app': path.resolve(__dirname, 'src/app'),
	'@pages': path.resolve(__dirname, 'src/pages'),
	'@widgets': path.resolve(__dirname, 'src/widgets'),
	'@features': path.resolve(__dirname, 'src/features'),
	'@entities': path.resolve(__dirname, 'src/entities'),
	'@shared': path.resolve(__dirname, 'src/shared'),
	'@assets': path.resolve(__dirname, 'src/shared/assets'),
	'@styles': path.resolve(__dirname, 'src/shared/assets/styles'),
	'@images': path.resolve(__dirname, 'src/shared/assets/images'),
	'@ui': path.resolve(__dirname, 'src/shared/ui'),
	'@lib': path.resolve(__dirname, 'src/shared/lib'),
	'@api': path.resolve(__dirname, 'src/shared/api'),
}

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: ALIASES,
	},
	test: {
		globals: true,
		css: true,
		setupFiles: ['./tests/setup-vitest.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 70,
				statements: 80,
			},
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit-integration',
					environment: 'jsdom',
					include: ['src/**/*.spec.ts', 'src/**/*.integration.spec.ts'],
				},
			},
			{
				extends: true,
				plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }],
					},
					setupFiles: [],
				},
			},
		],
	},
})
```

tests/setup-vitest.ts

```ts
/**
 * Глобальная настройка Vitest.
 * Подключает матчеры jest-dom, очистку и восстановление моков.
 */

import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'

// Автоматическое расширение expect матчерами jest-dom (v6)
import '@testing-library/jest-dom/vitest'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.clearAllMocks()
})
```

### Unit-тесты (пример)

src/components/BaseButton/BaseButton.spec.ts

```ts
import { render, screen } from '@testing-library/vue'
import BaseButton from './BaseButton.vue'

describe('BaseButton unit', () => {
	it('должен рендерить текст слота', () => {
		render(BaseButton, {
			slots: { default: 'Сохранить' },
		})

		expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument()
	})

	it('должен быть disabled, когда isDisabled=true', () => {
		render(BaseButton, {
			props: { isDisabled: true },
			slots: { default: 'Отправить' },
		})

		expect(screen.getByRole('button')).toBeDisabled()
	})

	it('должен рендерить слот left', () => {
		const { container } = render(BaseButton, {
			slots: { default: 'Текст', left: '💾' },
		})

		expect(container.querySelector('.base-button__slot-left')).toBeInTheDocument()
		expect(screen.getByText('💾')).toBeInTheDocument()
	})

	it('не должен рендерить __slot-left без слота left', () => {
		const { container } = render(BaseButton, {
			slots: { default: 'Текст' },
		})

		expect(container.querySelector('.base-button__slot-left')).not.toBeInTheDocument()
	})
})
```

### Integration-тесты (пример)

src/components/BaseInput/BaseInput.integration.spec.ts

```ts
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import BaseInput from './BaseInput.vue'

describe('BaseInput integration', () => {
	it('должен эмитить update:modelValue при вводе', async () => {
		const user = userEvent.setup()

		const { emitted } = render(BaseInput, {
			props: { modelValue: '' },
		})

		const input = screen.getByRole('textbox')
		await user.type(input, 'hello')

		const events = emitted()['update:modelValue']
		expect(events).toBeTruthy()
		expect(events?.at(-1)?.[0]).toBe('hello')
	})
})
```

### playwright.config.ts

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './tests',
	timeout: 30_000,
	expect: {
		timeout: 5_000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01,
		},
	},
	use: {
		trace: 'on-first-retry',
		video: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'e2e-chromium',
			testMatch: /e2e\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:4173',
			},
		},
		{
			name: 'visual-chromium',
			testMatch: /visual\/.*\.spec\.ts/,
			use: {
				...devices['Desktop Chrome'],
				baseURL: 'http://localhost:6006',
			},
		},
	],
	webServer: [
		{
			command: 'npm run preview -- --port 4173',
			port: 4173,
			reuseExistingServer: !process.env.CI,
		},
		{
			command: 'npm run storybook -- --ci --port 6006',
			port: 6006,
			reuseExistingServer: !process.env.CI,
		},
	],
})
```

### E2E-тесты (пример)

tests/e2e/accordion.smoke.spec.ts

```ts
/**
 * E2E smoke-тест для BaseAccordion.
 * Проверяет ключевой пользовательский сценарий: открытие/закрытие элементов.
 */

import { expect, test } from '@playwright/test'

test('аккордеон: открывает и закрывает элемент по клику', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--default')
	await page.setViewportSize({ width: 800, height: 400 })

	// Кликаем на первый заголовок
	const firstHeader = page.locator('.base-accordion__header').first()
	await firstHeader.click()

	// Проверяем, что первый элемент открылся
	const firstItem = page.locator('.base-accordion__item').first()
	await expect(firstItem).toHaveClass(/--open/)

	// Кликаем повторно — элемент закрывается
	await firstHeader.click()
	await expect(firstItem).not.toHaveClass(/--open/)
})

test('аккордеон: отключённый элемент не открывается', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--with-disabled-item')
	await page.setViewportSize({ width: 800, height: 400 })

	// Находим отключённый элемент
	const disabledItem = page.locator('.base-accordion__item--disabled')
	await expect(disabledItem).toBeVisible()

	// Клик по отключённому заголовку не открывает элемент
	const disabledHeader = disabledItem.locator('.base-accordion__header')
	await disabledHeader.click({ force: true })
	await expect(disabledItem).not.toHaveClass(/--open/)
})

test('аккордеон: режим multiple позволяет открыть несколько элементов', async ({ page }) => {
	await page.goto('/iframe.html?id=ui-baseaccordion--multiple')
	await page.setViewportSize({ width: 800, height: 500 })

	const headers = page.locator('.base-accordion__header')

	// Открываем первые два элемента
	await headers.nth(0).click()
	await headers.nth(1).click()

	// Оба должны быть открыты
	const openItems = page.locator('.base-accordion__item--open')
	await expect(openItems).toHaveCount(2)
})
```

### Screenshot-тесты (Visual Regression)

tests/visual/base-accordion.visual.spec.ts

```ts
/**
 * Visual Regression тесты для BaseAccordion.
 * Снимают baseline-скриншоты ключевых состояний через Storybook.
 */

import { test, expect } from '@playwright/test'

/** Базовый путь к stories BaseAccordion в Storybook */
const STORY_PATH = '/iframe.html?id=ui-baseaccordion'

test.describe('BaseAccordion visual regression', () => {
	test('Default: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--default`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-default.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Ghost: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--ghost`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-ghost.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Bordered: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--bordered`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-bordered.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('Multiple: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--multiple`)
		await page.setViewportSize({ width: 800, height: 500 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-multiple.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('WithDisabledItem: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--with-disabled-item`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-disabled.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})

	test('DarkTheme: визуальный baseline', async ({ page }) => {
		await page.goto(`${STORY_PATH}--dark-theme`)
		await page.setViewportSize({ width: 800, height: 400 })

		await expect(page.locator('#storybook-root')).toHaveScreenshot('base-accordion-dark.png', {
			animations: 'disabled',
			caret: 'hide',
			scale: 'css',
		})
	})
})
```

## Правила стабильности screenshot-тестов

Для надёжных visual regression тестов соблюдай следующие правила:

- Используй **фиксированный viewport** (одинаковый локально и в CI).
- Всегда отключай анимации: `animations: 'disabled'`.
- Скрывай каретку ввода: `caret: 'hide'`.
- Не используй динамические данные: `Date.now()`, `Math.random()`, live API без моков.
- Фиксируй окружение (шрифты, ОС/браузер, CI image).
- Перед снимком убеждайся, что компонент полностью отрисован.
- Снимай **целевую область компонента** (`#storybook-root` или контейнер), а не всю страницу.
- Обновляй baseline (`--update-snapshots`) только после ручного ревью изменений.

---

## NPM scripts

```json
{
	"scripts": {
		"test:unit": "vitest run --project unit-integration src/**/*.spec.ts",
		"test:integration": "vitest run --project unit-integration src/**/*.integration.spec.ts",
		"test:storybook": "vitest run --project storybook",
		"test:vitest": "vitest run --coverage",
		"test:e2e": "playwright test --project=e2e-chromium",
		"test:visual": "playwright test --project=visual-chromium",
		"test:visual:update": "playwright test --project=visual-chromium --update-snapshots",
		"test:all": "npm run test:vitest && npm run test:e2e && npm run test:visual"
	}
}
```

## Порядок внедрения

1. Запусти unit + integration для 3–5 базовых компонентов.
2. Добавь e2e smoke для критичных пользовательских путей.
3. Добавь visual baseline для ключевых stories.
4. Подключи прогон в CI.
5. Масштабируй покрытие по категориям UI Kit порциями

## Критерии готовности

1. [ ] Для каждого публичного компонента есть unit-тесты базового поведения.
2. [ ] Для компонентов с `v-model`, `emits`, слотами есть integration-тесты.
3. [ ] Есть e2e smoke-сценарии на ключевые пользовательские пути.
4. [ ] Есть screenshot baseline для критичных состояний (`default`, `disabled`, `focus`, `dark`).
5. [ ] Покрытие соответствует порогам проекта.
6. [ ] Тесты детерминированы и стабильно проходят в CI.

---

## Само-переиспользование компонентов в тестах

Компоненты UI Kit обязаны переиспользовать друг друга вплоть до текста. Это влияет на стратегию тестирования.

### Правило

При тестировании компонента учитывай, что внутренние визуальные элементы реализованы через другие компоненты UI Kit:

| Элемент | Компонент UI Kit |
|---------|-----------------|
| Текст (заголовок, подпись, описание) | `BaseText` |
| Иконка | `BaseIcon` |
| Изображение | `BaseImage` |
| Кнопка | `BaseButton` |
| Разделитель | `BaseSeparator` |
| Загрузка | `BaseLoader` |
| Бейдж | `BaseBadge` |
| Аватар | `BaseAvatar` |
| Анимация | `BaseAnimation` |
| Подсказка | `BaseTooltip` |
| Карточка | `BaseCard` |

### Импорты внутренних компонентов в тестах

Если компонент использует другие компоненты UI Kit внутри себя, их нужно подключить в тесте через `global.components` или `stubs`:

```ts
// ❌ Внутренний компонент не подключён — тест упадёт
import BaseCard from './BaseCard.vue'

render(BaseCard, { props: { title: 'Тест' } })

// ✅ Все внутренние компоненты подключены
import BaseCard from './BaseCard.vue'
import BaseText from '@/shared/ui/BaseText/BaseText.vue'
import BaseButton from '@/shared/ui/BaseButton/BaseButton.vue'
import BaseImage from '@/shared/ui/BaseImage/BaseImage.vue'

render(BaseCard, {
  props: { title: 'Тест' },
  global: {
    components: { BaseText, BaseButton, BaseImage },
  },
})
```

### Когда использовать stubs

Если внутренний компонент не является предметом теста — замени его stub'ом для изоляции:

```ts
render(BaseCard, {
  props: { title: 'Тест' },
  global: {
    stubs: {
      BaseText: { template: '<span><slot /></span>' },
      BaseButton: { template: '<button><slot /></button>' },
    },
  },
})
```

### Что тестировать при само-переиспользовании

1. **Интеграционные тесты** — проверяй, что внутренний компонент получает правильные пропсы:
   ```ts
   // BaseCard передаёт title в BaseText
   it('должен передавать title в BaseText', () => {
     render(BaseCard, {
       props: { title: 'Заголовок' },
       global: { components: { BaseText, BaseButton, BaseImage } },
     })
     expect(screen.getByText('Заголовок')).toBeInTheDocument()
   })
   ```

2. **Unit-тесты** — тестируй логику компонента, а не внутренние компоненты:
   ```ts
   // Тестируем поведение, а не реализацию
   it('должен вызывать close при клике на кнопку', async () => {
     const onClose = vi.fn()
     render(BaseModal, {
       props: { isOpen: true, title: 'Модал' },
       emits: { close: onClose },
       global: { stubs: { BaseText: true, BaseButton: true } },
     })
     // Проверяем через emit, а не через внутренний BaseButton
   })
   ```

3. **Screenshot-тесты** — внутренние компоненты должны рендериться реально (без stubs), чтобы скриншоты были корректными.

---

## Доступные composables

При написании тестов учитывай composables, которые используются внутри компонентов. Некоторые из них требуют мокирования.

### Обязательные (в каждом компоненте UI Kit)

| Composable | Импорт | Нужно мокировать? |
|------------|--------|-------------------|
| `useSizeScale` | `@/shared/composables/useSizeScale` | Нет (чистая логика) |
| `useCustomColor` | `@/shared/composables/useCustomColor` | Нет (чистая логика) |

### Поведение

| Composable | Импорт | Нужно мокировать? |
|------------|--------|-------------------|
| `useAutoScroll` | `@/shared/composables/useAutoScroll` | Да (DOM-зависимости: `scrollTop`, `nextTick`) |
| `useClickOutside` | `@/shared/composables/useClickOutside` | Да (`document.addEventListener`) |
| `useDebounce` / `useDebounceFn` | `@/shared/composables/useDebounce` | Да (`setTimeout`, `vi.useFakeTimers`) |
| `useEscapeKey` | `@/shared/composables/useEscapeKey` | Да (`document.addEventListener`) |
| `useListNavigation` | `@/shared/composables/useListNavigation` | Нет (чистая логика) |
| `usePopup` | `@/shared/composables/usePopup` | Да (комбинирует `useEscapeKey` + `useScrollLock`) |
| `useScrollLock` | `@/shared/composables/useScrollLock` | Да (`document.body.style`) |
| `useSwipe` | `@/shared/composables/useSwipe` | Да (touch/mouse events) |

### Позиционирование

| Composable | Импорт | Нужно мокировать? |
|------------|--------|-------------------|
| `useDropdownPosition` | `@/shared/composables/useDropdownPosition` | Да (`getBoundingClientRect`) |
| `useImageZoom` | `@/shared/composables/useImageZoom` | Да (DOM-зависимости) |

### Ввод данных

| Composable | Импорт | Нужно мокировать? |
|------------|--------|-------------------|
| `useInputMask` | `@/shared/composables/useInputMask` | Нет (чистая логика) |

### Данные

| Composable | Импорт | Нужно мокировать? |
|------------|--------|-------------------|
| `useTableData` | `@/shared/composables/useTableData` | Нет (чистая логика) |
| `useIcon` | `@/shared/composables/useIcon` | Нет (чистая логика) |

### Пример мокирования composables в тестах

```ts
import { vi } from 'vitest'

// Мокирование useClickOutside
vi.mock('@/shared/composables/useClickOutside', () => ({
  useClickOutside: vi.fn(),
}))

// Мокирование useEscapeKey
vi.mock('@/shared/composables/useEscapeKey', () => ({
  useEscapeKey: vi.fn(),
}))

// Мокирование useScrollLock
vi.mock('@/shared/composables/useScrollLock', () => ({
  useScrollLock: () => ({
    lock: vi.fn(),
    unlock: vi.fn(),
  }),
}))

// Мокирование usePopup (комбинирует escape + scroll lock)
vi.mock('@/shared/composables/usePopup', () => ({
  usePopup: () => ({
    handleOverlayClick: vi.fn(),
    close: vi.fn(),
  }),
}))

// Мокирование getBoundingClientRect для useDropdownPosition
function mockGetBoundingClientRect(rect: DOMRectInit) {
  Element.prototype.getBoundingClientRect = () => rect as DOMRect
}
```

---

## Доступные утилиты (utils)

Чистые функции из `@/shared/utils/`. Тестируются изолированно без мокирования.

### dateUtils

```ts
import { isSameDay, toDateOnly, daysInMonth, getWeekday, getWeekNumber, buildDateWithTime, isToday, isDateInRange } from '@/shared/utils/dateUtils'
```

| Функция | Описание | Пример теста |
|---------|----------|-------------|
| `isSameDay(a, b)` | Сравнить даты без времени | `isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 1)) → true` |
| `toDateOnly(d)` | Дата без времени | `toDateOnly(new Date(2024, 0, 1, 15, 30)).getHours() → 0` |
| `daysInMonth(year, month)` | Дней в месяце | `daysInMonth(2024, 1) → 29` (високосный) |
| `getWeekday(date)` | День недели | `getWeekday(new Date(2024, 0, 1)) → 1` (понедельник) |
| `getWeekNumber(date)` | Номер недели ISO | Граничные: 1 января, 31 декабря |
| `buildDateWithTime(options)` | Дата с временем | Проверить часы/минуты/секунды |
| `isToday(date)` | Сегодня? | Мокировать `new Date()` |
| `isDateInRange(date, start, end)` | В диапазоне? | Граничные: на границе, вне, внутри |

### fileUtils

```ts
import { getExtension, formatFileSize, getFileIcon, validateFile, formatAcceptHint, createImagePreview } from '@/shared/utils/fileUtils'
```

| Функция | Описание | Пример теста |
|---------|----------|-------------|
| `getExtension(name)` | Расширение файла | `'photo.jpg' → 'jpg'`, `'archive' → ''` |
| `formatFileSize(bytes)` | Размер файла | `1024 → '1.0 КБ'`, `0 → '0 Б'` |
| `getFileIcon(extension)` | Иконка по расширению | `'pdf' → '📄'`, `'unknown' → '📎'` |
| `validateFile(file, options)` | Валидация | Превышение размера, неверный тип |
| `formatAcceptHint(accept)` | Подсказка форматов | `'.jpg,.png' → 'JPG, PNG'` |
| `createImagePreview(file)` | Превью изображения | Мокировать `FileReader` |

### formatUtils

```ts
import { formatMessageStatus, formatUrl, formatDateLong, formatCellValue } from '@/shared/utils/formatUtils'
```

| Функция | Описание |
|---------|----------|
| `formatMessageStatus(status)` | Иконка статуса доставки |
| `formatUrl(url)` | URL для отображения (hostname) |
| `formatDateLong(date, locale)` | Дата для popover |
| `formatCellValue(value, formatter?)` | Значение ячейки таблицы |

### imageUtils

```ts
import { isExternalImage, replaceExtension, buildOptimizedSrc, buildSrcset } from '@/shared/utils/imageUtils'
```

| Функция | Описание |
|---------|----------|
| `isExternalImage(src)` | Внешний URL? |
| `replaceExtension(src, newExt)` | Заменить расширение |
| `buildOptimizedSrc(src, srcWidth?)` | Оптимизированный src |
| `buildSrcset(src, srcWidth?)` | Srcset для адаптивных |

### navigationUtils

```ts
import { openExternalUrl, resolveNavigation } from '@/shared/utils/navigationUtils'
```

| Функция | Описание |
|---------|----------|
| `openExternalUrl(url, target?)` | Безопасное открытие ссылки |
| `resolveNavigation(options)` | Тип навигации |

### paginationUtils

```ts
import { calcTotalPages, calcVisiblePages, calcPageInfo } from '@/shared/utils/paginationUtils'
```

| Функция | Описание | Пример теста |
|---------|----------|-------------|
| `calcTotalPages(total, pageSize)` | Кол-во страниц | `calcTotalPages(0, 10) → 1`, `calcTotalPages(25, 10) → 3` |
| `calcVisiblePages(options)` | Видимые страницы | Граничные: начало, середина, конец |
| `calcPageInfo(options)` | Строка информации | `'1–10 из 100'` |

### rangeUtils

```ts
import { toPercent, snapToStep, calcFillStyle, calcThumbStyle } from '@/shared/utils/rangeUtils'
```

| Функция | Описание |
|---------|----------|
| `toPercent(options)` | Процент на шкале |
| `snapToStep(options)` | Привязка к шагу |
| `calcFillStyle(first, second?)` | Стиль заливки трека |
| `calcThumbStyle(percent)` | Стиль позиции ползунка |

### schemaUtils

```ts
import { buildBreadcrumbsSchema } from '@/shared/utils/schemaUtils'
```

| Функция | Описание |
|---------|----------|
| `buildBreadcrumbsSchema(items)` | Schema.org JSON-LD |

### tableUtils

```ts
import { calcRowNumber, getColumnStyle, calcTotalColumns, calcColumnWidths } from '@/shared/utils/tableUtils'
```

| Функция | Описание |
|---------|----------|
| `calcRowNumber(options)` | Номер строки с пагинацией |
| `getColumnStyle(options)` | Стиль колонки |
| `calcTotalColumns(...)` | Общее кол-во колонок |
| `calcColumnWidths(columns)` | Ширины колонок |

### tooltipUtils

```ts
import { calcTooltipPosition, getTooltipTransition } from '@/shared/utils/tooltipUtils'
```

| Функция | Описание |
|---------|----------|
| `calcTooltipPosition(options)` | Координаты тултипа |
| `getTooltipTransition(position)` | Имя перехода |

### Пример unit-теста для утилиты

```ts
import { describe, it, expect } from 'vitest'
import { calcTotalPages, calcVisiblePages } from '@/shared/utils/paginationUtils'

describe('paginationUtils', () => {
  describe('calcTotalPages', () => {
    it('должен вернуть 1 при пустом списке', () => {
      expect(calcTotalPages(0, 10)).toBe(1)
    })

    it('должен корректно считать страницы', () => {
      expect(calcTotalPages(25, 10)).toBe(3)
    })

    it('должен вернуть 1 при pageSize = 0', () => {
      expect(calcTotalPages(25, 0)).toBe(1)
    })
  })

  describe('calcVisiblePages', () => {
    it('должен вернуть пустой массив при total = 0', () => {
      expect(calcVisiblePages({ current: 1, total: 0 })).toEqual([])
    })

    it('должен вернуть все страницы если total <= 5', () => {
      expect(calcVisiblePages({ current: 3, total: 5 })).toEqual([1, 2, 3, 4, 5])
    })
  })
})
```

---

## Запрещено

- ❌ Тестировать внутреннюю реализацию вместо наблюдаемого поведения.
- ❌ Использовать хрупкие селекторы (`nth-child`, сложные CSS-цепочки).
- ❌ Оставлять visual-тесты с анимациями и динамическими данными.
- ❌ Обновлять snapshot-baseline без ревью.
- ❌ Маскировать flaky-тесты через `waitForTimeout`.
- ❌ Использовать `any`, если можно задать корректные типы.
- ❌ Забывать подключать внутренние компоненты UI Kit в `global.components` или `global.stubs` при unit/integration тестах.
- ❌ Использовать stubs для внутренних компонентов в screenshot-тестах (нужен реальный рендер).
