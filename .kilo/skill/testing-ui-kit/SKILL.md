---
name: testing-ui-kit
description: Практическая настройка тестового стека Vue 3 UI Kit с нуля — Vitest (unit/integration) + Storybook test runner + Playwright (e2e + visual regression). Включает конфиги, шаблоны тестов, правила стабильности screenshot, scripts package.json, порядок внедрения. Загружай при создании test-инфраструктуры, добавлении нового типа теста, отладке flaky visual-тестов, настройке CI для UI Kit.
---

# Testing UI Kit — практическая настройка стека

## Когда применять
- Поднимаешь тестовый стек в новом UI Kit проекте.
- Добавляешь новый уровень тестов (e2e или visual) в существующий проект.
- Отлаживаешь flaky screenshot/e2e тесты.
- Настраиваешь CI для UI-библиотеки.

Связанные skills:
- `testing-standards` — теория Myers + принципы дизайна test cases (загружай **до** этого skill).
- `clean-code` — F.I.R.S.T. для тестов (загружай для качества кода тестов).
- `ui-kit-component` — реальная структура `metal-art-site`, в которой эти тесты живут.

---

## Теория для UI Kit (краткая)

### Зачем тестировать UI Kit
- Зафиксировать ожидаемое поведение компонента (тест как контракт).
- Ловить регрессии при изменении стилей/пропсов/событий/слотов.
- Безопасно рефакторить публичный API библиотеки.
- Ускорять релизы за счёт автоматической проверки.

### Пирамида для UI-библиотеки
Рекомендуемые пропорции (отличаются от backend-приложения):

| Уровень | Доля | Почему |
|---|---|---|
| **Unit** | 40–50% | Дёшево, быстро, покрывает логику пропсов и эмитов |
| **Integration** | 20–30% | Связки: `v-model`, слоты, композиция компонентов |
| **Visual (screenshot)** | 20–30% | UI Kit критичен к визуальной стабильности — больше чем в backend-проектах |
| **E2E** | 5–10% | Самые дорогие в поддержке, только ключевые пользовательские пути |

### Зона ответственности по уровням

**Unit** — изолированная логика:
- Утилиты, форматтеры (`@utils/*`)
- Рендер на основе пропов
- Простые ветки в `<template>`
- Эмиссия событий при действиях

**Integration** — связки модулей:
- `v-model` + `update:modelValue`
- Слоты (default + named + scoped)
- Композиция компонентов (`BaseForm` + `BaseInput` + `BaseFormField`)
- Интеграция с composable

**E2E** — пользовательские сценарии:
- Формы и валидация end-to-end
- Поток модальное окно/диалог
- Критичные пути из playground/docs

**Visual** — отсутствие визуальных регрессий:
- Состояния: `default / hover / focus / active / disabled / loading / error`
- Темы: light / dark
- Размеры/варианты компонента

### Подбор тестовых данных
Для каждого правила/параметра минимум 3 группы (см. `testing-standards`):
1. Позитивный кейс — валидное значение
2. Границы — min/max, пустое значение, edge cases
3. Невалидные — `null`/`undefined`, неверный тип, выход за диапазон

---

## Стек инструментов

| Слой | Инструмент |
|---|---|
| Vue | Vue 3 + TypeScript (strict) |
| Bundler | Vite |
| Unit/Integration runner | Vitest 4 |
| DOM env | jsdom |
| Testing API | `@testing-library/vue` + `user-event` + `@testing-library/jest-dom` |
| Storybook tests | `@storybook/addon-vitest` + `@vitest/browser-playwright` |
| E2E + Visual | Playwright 1.59 |
| Storybook | Storybook 10 (источник стабильных UI-состояний для visual) |
| Coverage | `@vitest/coverage-istanbul` или `v8` |

---

## Установка зависимостей (для нового проекта)

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

После установки Playwright — загрузить браузеры:
```bash
npx playwright install
```

> В проекте `metal-art-site` всё это уже установлено. Пропускай этот шаг, переходи к конфигам.

---

## Структура файлов

Реальная структура `metal-art-site` (используй её, не «классическую с `tests/`»):

```text
project/
├─ src/
│  └─ components/
│     └─ BaseButton/
│        ├─ BaseButton.vue
│        ├─ BaseButton.types.ts
│        ├─ BaseButton.style.scss
│        ├─ BaseButton.stories.ts
│        ├─ BaseButton.spec.ts                 ← unit, рядом с компонентом
│        ├─ BaseButton.integration.spec.ts     ← integration, рядом
│        ├─ BaseButton.visual.spec.ts          ← Playwright VRT, рядом
│        ├─ BaseButton.e2e.spec.ts             ← (только для heavy)
│        └─ index.ts
├─ build/
│  └─ tests/
│     ├─ vitest.config.ts                      ← корневой конфиг Vitest
│     ├─ playwright.config.ts                  ← корневой конфиг Playwright
│     ├─ setup-vitest.ts                       ← cleanup, jest-dom, моки
│     ├─ setup-storybook.ts                    ← очистка teleport-узлов
│     └─ vitest.shims.d.ts
└─ tests/                                      ← опционально для e2e/visual
   └─ visual-snapshots/                         ← baseline PNG
```

**Конфиги тестов живут в `build/tests/`**, не в корне и не в `./tests/`. Это правило синхронизировано с `vite-bundle-config` и `ui-kit-component`.

---

## Конфигурация Vitest

Конфиг лежит в `build/tests/vitest.config.ts`. Корневой `vitest.config.ts` — тонкий реэкспорт.

Два проекта: `unit-integration` (jsdom) и `storybook` (browser).

> **Алиасы**: используй полный список из `vite-bundle-config` (там `@ui` тоже есть). Дублирование показано здесь для иллюстрации, но в продакшене лучше импортировать через `createAliasConfig()` из `build/config/alias.ts`.

```ts
/// <reference types="vitest" />
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import vue from '@vitejs/plugin-vue';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Полный набор алиасов. ОБЯЗАН быть синхронизирован с:
 * - build/config/alias.ts
 * - tsconfig.json
 * - tsconfig.app.json
 * - build/storybook/main.ts
 *
 * Лучше импортировать общий `createAliasConfig()` из build/config/alias.ts
 * вместо дублирования здесь.
 */
const ALIASES: Record<string, string> = {
  '@': path.resolve(__dirname, '../../src'),
  '@components': path.resolve(__dirname, '../../src/components'),
  '@composables': path.resolve(__dirname, '../../src/composables'),
  '@utils': path.resolve(__dirname, '../../src/utils'),
  '@styles': path.resolve(__dirname, '../../src/styles'),
  '@icons': path.resolve(__dirname, '../../src/icons'),
  '@ui': path.resolve(__dirname, '../../src/components'),
};

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: ALIASES },
  test: {
    globals: true,
    css: true,
    setupFiles: [path.resolve(dirname, 'setup-vitest.ts')],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      // Пороги для CI — синхронизированы с testing-standards (источник правды)
      thresholds: {
        lines: 75,
        functions: 70,
        branches: 65,
        statements: 75,
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
        plugins: [storybookTest({ configDir: path.join(dirname, '../storybook') })],
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
});
```

> Алиасы синхронизируй с `tsconfig.json`, `tsconfig.app.json`, `build/config/alias.ts`, `build/storybook/main.ts`. Рассинхрон — самая частая причина «alias not found».

### Setup-файл

`build/tests/setup-vitest.ts`:

```ts
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/vue';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
```

Для UI Kit добавь моки браузерных API, которых нет в jsdom (см. `build/tests/setup-vitest.ts` в `metal-art-site`):

```ts
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
globalThis.window.open = vi.fn();
globalThis.window.prompt = vi.fn(() => null);
globalThis.window.confirm = vi.fn(() => true);
```

---

## Unit-тест: шаблон

`src/components/BaseButton/BaseButton.spec.ts`:

```ts
import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import BaseButton from './BaseButton.vue';

describe('BaseButton — unit', () => {
  it('должен рендерить текст слота', () => {
    render(BaseButton, { slots: { default: 'Сохранить' } });
    expect(
      screen.getByRole('button', { name: 'Сохранить' })
    ).toBeInTheDocument();
  });

  it('должен быть disabled, когда isDisabled=true', () => {
    render(BaseButton, {
      props: { isDisabled: true },
      slots: { default: 'Отправить' },
    });
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Правила имени теста (Clean Code + Myers)
- Формат: «должен **что делает** когда **при каком условии**».
- Русский язык допустим и приветствуется в этом проекте.
- Без «test1», «works», «should work fine».

---

## Integration-тест: шаблон

`src/components/BaseInput/BaseInput.integration.spec.ts`:

```ts
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import BaseInput from './BaseInput.vue';

describe('BaseInput — integration', () => {
  it('должен эмитить update:modelValue при вводе', async () => {
    const user = userEvent.setup();
    const { emitted } = render(BaseInput, {
      props: { modelValue: '' },
    });

    await user.type(screen.getByRole('textbox'), 'hello');

    const events = emitted()['update:modelValue'];
    expect(events).toBeTruthy();
    expect(events?.at(-1)?.[0]).toBe('hello');
  });
});
```

### Когда выбирать integration вместо unit
- Тест требует **родительского компонента** для проверки потока (v-model, scoped slot).
- Тест проверяет **композицию** двух и более компонентов вместе.
- Иначе — unit.

---

## Конфигурация Playwright

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // playwright.config.ts лежит в build/tests/, testDir указывает на корень проекта,
  // потому что *.visual.spec.ts и *.e2e.spec.ts лежат рядом с компонентами в src/components/
  testDir: '../..',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
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
});
```

### Ключевые параметры
- `maxDiffPixelRatio: 0.01` — допуск 1% пикселей. Меньше — flaky. Больше — пропускает реальные регрессии.
- `trace: 'on-first-retry'` — трейс пишется только при повторе упавшего теста (экономит диск).
- `video: 'retain-on-failure'` — видео только для упавших тестов.
- `reuseExistingServer: !CI` — локально переиспользуем уже запущенный Storybook, в CI поднимаем свой.

---

## E2E-тест: шаблон

`src/components/BaseAccordion/BaseAccordion.e2e.spec.ts` (e2e-файлы лежат рядом с компонентом):

```ts
import { expect, test } from '@playwright/test';

test('аккордеон: открывает и закрывает элемент по клику', async ({ page }) => {
  await page.goto('/iframe.html?id=ui-baseaccordion--default');
  await page.setViewportSize({ width: 800, height: 400 });

  const firstHeader = page.locator('.base-accordion__header').first();
  await firstHeader.click();

  const firstItem = page.locator('.base-accordion__item').first();
  await expect(firstItem).toHaveClass(/--open/);

  await firstHeader.click();
  await expect(firstItem).not.toHaveClass(/--open/);
});

test('аккордеон: режим multiple позволяет открыть несколько элементов', async ({ page }) => {
  await page.goto('/iframe.html?id=ui-baseaccordion--multiple');
  await page.setViewportSize({ width: 800, height: 500 });

  const headers = page.locator('.base-accordion__header');
  await headers.nth(0).click();
  await headers.nth(1).click();

  await expect(page.locator('.base-accordion__item--open')).toHaveCount(2);
});

test('аккордеон: отключённый элемент не открывается', async ({ page }) => {
  await page.goto('/iframe.html?id=ui-baseaccordion--with-disabled-item');
  await page.setViewportSize({ width: 800, height: 400 });

  const disabledItem = page.locator('.base-accordion__item--disabled');
  await expect(disabledItem).toBeVisible();

  await disabledItem.locator('.base-accordion__header').click({ force: true });
  await expect(disabledItem).not.toHaveClass(/--open/);
});
```

### Правила селекторов в e2e (по приоритету)
1. **Роль**: `getByRole('button', { name: 'Сохранить' })` — лучший вариант.
2. **Label**: `getByLabelText('Email')`.
3. **Текст**: `getByText('Сохранить')`.
4. **`data-testid`**: `getByTestId('submit')` — только когда первые три не подходят.
5. **CSS-класс** (последний выбор): `.base-accordion__header` — только для UI Kit, где имя класса является публичным контрактом.

**Запрещены**: `nth-child`, сложные CSS-цепочки, селекторы по содержимому стилей.

---

## Visual Regression-тест: шаблон

`src/components/BaseAccordion/BaseAccordion.visual.spec.ts` (visual-файлы лежат рядом с компонентом, baseline-снапшоты в `tests/visual-snapshots/`):

```ts
import { test, expect } from '@playwright/test';

const STORY_PATH = '/iframe.html?id=ui-baseaccordion';

test.describe('BaseAccordion — visual regression', () => {
  test('Default: визуальный baseline', async ({ page }) => {
    await page.goto(`${STORY_PATH}--default`);
    await page.setViewportSize({ width: 800, height: 400 });

    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'base-accordion-default.png',
      { animations: 'disabled', caret: 'hide', scale: 'css' }
    );
  });

  test('Ghost', async ({ page }) => {
    await page.goto(`${STORY_PATH}--ghost`);
    await page.setViewportSize({ width: 800, height: 400 });
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'base-accordion-ghost.png',
      { animations: 'disabled', caret: 'hide', scale: 'css' }
    );
  });

  test('DarkTheme', async ({ page }) => {
    await page.goto(`${STORY_PATH}--dark-theme`);
    await page.setViewportSize({ width: 800, height: 400 });
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      'base-accordion-dark.png',
      { animations: 'disabled', caret: 'hide', scale: 'css' }
    );
  });
});
```

---

## Правила стабильности screenshot-тестов

### Обязательные параметры `toHaveScreenshot`
```ts
{
  animations: 'disabled',  // отключает CSS-анимации
  caret: 'hide',           // скрывает курсор ввода
  scale: 'css',            // фиксирует масштабирование
}
```

### Фиксированный viewport
**Всегда** ставь `page.setViewportSize({ width, height })` в начале теста. CI и dev должны быть одинаковы.

### Никаких динамических данных
- `Date.now()`, `new Date()`, `Math.random()` — заменяй на фиксированные через моки или `--frozen-clock`.
- API-ответы — мокай через MSW или фикстуры.
- Анимации/transition — отключай через `prefers-reduced-motion` или CSS-инъекцию.

### Снимай **целевую область**
- `page.locator('#storybook-root')` — только сторибуковский контейнер.
- `page.locator('.base-x')` — только сам компонент.
- **Не** `page.screenshot()` всей страницы — это шумный baseline.

### Ожидание полной отрисовки
```ts
await page.waitForLoadState('networkidle');
await page.locator('.base-x').waitFor({ state: 'visible' });
```

Не используй `await page.waitForTimeout(N)` для маскировки flaky — это антипаттерн. Если используется — только с комментарием почему.

### Окружение
- Фиксированный шрифт (Storybook загружает Inter из `_variables.scss`).
- Один CI image (`mcr.microsoft.com/playwright:vX.Y.Z-jammy`).
- Одни и те же ОС/браузер локально и в CI (через Docker).

### Обновление baseline
```bash
npm run test:visual:update
```
**Только осознанно**: ревью каждого нового PNG в PR, объяснение в описании, что изменилось визуально и почему.

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

### Скрипты в `metal-art-site` (уже есть)
Реальный набор отличается — см. `package.json`:
- `test:unit`, `test:integration`
- `test:storybook`, `test:storybook:coverage`
- `test:a11y`, `test:a11y:coverage`, `test:a11y:ci`
- `test:stories-coverage`, `test:components:coverage`
- `test:coverage`, `test:vitest`
- `test:e2e`, `test:visual`, `test:visual:update`
- `test:all`

---

## Порядок внедрения (новый проект)

1. **Установить зависимости** (см. секцию выше).
2. **Конфиги**: `build/tests/vitest.config.ts`, `build/tests/playwright.config.ts`, `build/tests/setup-vitest.ts`. Корневой `vitest.config.ts` — тонкий реэкспорт.
3. **Unit + integration** для 3–5 базовых компонентов (`BaseButton`, `BaseInput`, `BaseCheckbox`).
4. **E2E smoke** для 1–2 критичных сценариев (форма, модалка).
5. **Visual baseline** для ключевых stories (`Default`, `Disabled`, `Focus`, `Dark`).
6. **CI**: подключить `test:all` в pipeline.
7. **Масштабирование**: добавлять покрытие порциями по категориям UI Kit.

---

## Критерии готовности (для нового компонента)

- [ ] Unit-тесты на базовое поведение, пропы, эмиты
- [ ] Integration-тесты на `v-model`, слоты, композицию (если применимо)
- [ ] E2E smoke на критичные пути (если компонент heavy)
- [ ] Visual baseline для состояний: `default`, `hover`, `focus`, `disabled`, `loading`, `dark theme`
- [ ] Покрытие соответствует порогам (`lines/functions/branches/statements` ≥ конфига; 100% per-file для `src/components/**/*.vue`)
- [ ] Все тесты детерминированы — нет «иногда зелёный»
- [ ] Тесты соответствуют F.I.R.S.T. (см. `clean-code` + `testing-standards`)
- [ ] Имена тестов в формате «должен ... когда ...»

---

## Запрещённые практики

| ❌ Запрет | Почему | ✅ Альтернатива |
|---|---|---|
| Тестировать внутреннюю реализацию (`.vm.privateMethod()`) | Хрупко при рефакторинге | Тестировать наблюдаемое поведение через публичный API |
| Хрупкие селекторы (`nth-child`, длинные CSS-цепочки) | Падают при любом изменении DOM | Роли → labels → тексты → `data-testid` |
| Visual-тесты с анимациями | Flaky, разный результат каждый запуск | `animations: 'disabled'` обязательно |
| Динамические данные в visual (`Date.now()`) | Каждый прогон даёт новый baseline | Замораживать время / мокать |
| Обновлять snapshot без ревью | Маскирует регрессии | Ручное ревью каждого изменения PNG в PR |
| `waitForTimeout(N)` для маскировки flaky | Скрывает баг, не лечит | `waitFor()`, `waitForLoadState`, ожидание селектора |
| `any` в тестах | Прячет ошибки типизации | Корректные типы, `unknown` + narrowing |
| Один большой тест на 50 ассертов | Сложно понять что упало | Один концепт на тест (AAA) |
| Зависимости между тестами (порядок запуска) | Нарушение F.I.R.S.T. (Independent) | `cleanup` + `restoreAllMocks` в afterEach |
| Console.log вместо expect | Не валидируется автоматически | `expect()` всегда |

---

## Чек-лист настройки тестового стека

- [ ] `vitest.config.ts` создан, два проекта (`unit-integration`, `storybook`)
- [ ] Алиасы синхронизированы в 5 местах (tsconfig × 2, vite, vitest, storybook)
- [ ] `build/tests/setup-vitest.ts` подключён в `setupFiles`
- [ ] Моки браузерных API в setup: `ResizeObserver`, `window.open/prompt/confirm`
- [ ] `playwright.config.ts` создан, два проекта (`e2e-chromium`, `visual-chromium`)
- [ ] `webServer` запускает preview и Storybook
- [ ] `maxDiffPixelRatio: 0.01` для visual
- [ ] Coverage thresholds выставлены (real CI bar в `metal-art-site`: lines 75 / functions 70 / branches 65 / statements 75 — синхронизируй с `testing-standards`)
- [ ] NPM scripts добавлены в `package.json`
- [ ] CI прогоняет `test:all` или эквивалент
- [ ] Storybook stories обязательно имеют `play()` для a11y проверок
- [ ] Все screenshot-тесты используют `animations: 'disabled'` + `caret: 'hide'` + `scale: 'css'`
- [ ] Все screenshot-тесты фиксируют viewport через `setViewportSize`
- [ ] Никаких `waitForTimeout` для маскировки flaky
