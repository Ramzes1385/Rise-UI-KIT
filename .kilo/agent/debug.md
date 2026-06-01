---
description: Режим отладки — диагностика и исправление ошибок, разбор падений тестов, неработающих стилей/типов/сборки. Используй при поиске багов, написании теста воспроизводящего баг, регрессионных правках.
mode: primary
---

# Debug Mode

Режим отладки. При поиске и исправлении ошибок:

## Базовый процесс отладки (Myers)
1. **Воспроизведи ошибку** — найди минимальный сценарий.
2. **Напиши падающий тест**, фиксирующий баг (см. `testing-standards`). Это «регрессионная защёлка» — после фикса тест останется навсегда.
3. **Локализуй причину**: бинарный поиск по git history, `console.log` в подозрительные места, отладчик.
4. **Сформулируй причину словами** перед правкой («Component не размонтирует listener → утечка → второй click дублируется»).
5. **Поправь** — минимально, в одном месте.
6. **Прогон полного набора тестов** — нет регрессий.
7. **Усиль тесты вокруг этого места** (Myers: вероятность ещё одной ошибки в багги-модуле пропорциональна найденным).

## Какой skill грузить когда
| Симптом | Skill |
|---|---|
| Тест падает: ошибка ассерта, неправильное ожидание | `testing-standards` |
| Тест flaky (visual, e2e, race condition) | `testing-ui-kit` (правила стабильности screenshot, ожидания) |
| Сборка падает, алиас не резолвится, bundle разросся, медленный билд | `vite-bundle-config` |
| Ревью предложенной правки `build/*` — допустима ли | `vite-bundle-customization-guide` |
| Запах кода, дублирование, длинная функция | `clean-code` |
| Компонент в `src/components/Base*/` ведёт себя странно | `component-vue` + `ui-kit-component` + `testing-standards` |
| Vue-компонент: неверная типизация props/emits, нарушение SRP, дублирование | `component-vue` |
| Composable не очищает listeners / утечка | `ui-kit-component` (раздел Composables) |
| Сборка/типы падают | См. ниже секцию «Типичные источники ошибок» |
| Нарушение FSD-слоёв, неправильные импорты, циркулярные зависимости между слайсами | `fsd` |
| FSD-приложение TM2: нарушение слоёв, broken store, mocks не работают | `fsd` + `project-standards` |

## Этот репозиторий
**`metal-art-site` — UI Kit-библиотека**. Нет FSD, нет Pinia, нет vue-router/i18n. Если задача про «store/route/локаль/mock.config» — это **не сюда**, уточни.

---

## Типичные источники ошибок в `metal-art-site`

### Тесты
- **Flaky visual** — анимация не дождалась `transitionend`. Добавь `await page.waitForTimeout(N)` или `await page.locator('.x').waitFor({ state: 'visible' })`.
- **Утечка состояния между тестами** — забыли `cleanup()`. Проверь `setup-vitest.ts` подключён в `setupFiles`.
- **`ResizeObserver is not defined`** — теста запускается вне jsdom без setup. Подключи `setup-vitest.ts`.
- **Snapshot drift** — изменилась тема/глобальный токен. Прогон `npm run test:visual:update`, обнови baseline осознанно.

### Стили
- **Стиль не применяется** — забыли импорт `import './BaseX.style.scss'` внутри `<script setup>`.
- **Дублирование `@use 'variables'`** — глобальный SCSS уже автоинжектится через `additionalData` (`build/config/css.ts`). Удали ручной `@use`.
- **Цвет не меняется в тёмной теме** — используется хардкод (`#000`), не переменная (`var(--color-text)`).

### TypeScript / сборка
- **`vue-tsc --noEmit` падает на сборке** — `strict: true + noUnusedLocals + noUnusedParameters`. Удали неиспользуемые импорты, параметры.
- **`as` пометка отклонена** — почти всегда хочется narrowing через `if (typeof x === 'string')` вместо `as`.
- **Алиас не резолвится** — синхронизируй в **5 местах**: `tsconfig.json`, `tsconfig.app.json`, `build/config/alias.ts`, `build/tests/vitest.config.ts`, `build/storybook/main.ts`. См. skill `vite-bundle-config`.
- **SCSS «Undefined variable $...»** — `additionalData` не синхронизирован между `build/config/css.ts`, `build/storybook/main.ts`, `build/tests/vitest.config.ts`. См. skill `vite-bundle-config`.
- **Bundle разросся** — `npm run build:analyze`, открой `stats.html`, найди тяжёлые модули. Раздели в `manualChunks`. См. skill `vite-bundle-config`.
- **Heavy-компонент попал в основной чанк** — забыли `defineAsyncComponent` в `src/plugin.ts` или запись в `HEAVY_APP_CHUNKS` в `build/config/build.ts`.

### Storybook
- **Story не появляется** — проверь имя экспорта (должен быть named export типа `StoryObj`), путь в `meta.title`.
- **A11y тест падает в CI** — отсутствует `play()`, или нарушены ARIA-роли. См. `ui-kit-component` раздел Stories.

### Heavy components
- **Bundle вырос** — забыли `defineAsyncComponent` в `plugin.ts` или запись в `HEAVY_APP_CHUNKS` (`build/config/build.ts`).

---

## Раздел ниже — для FSD-проектов команды (не для этого репо)

---

## Стек проекта
- **Framework**: Vue 3 (`<script setup lang="ts">`)
- **Архитектура**: FSD (Feature-Sliced Design)
- **State Management**: Pinia — Option API (`state` / `getters` / `actions`)
- **UI**: Quasar Framework — только через `Base`-компоненты из `@/shared/ui`
- **Валидация**: Yup + Vee-Validate
- **Стили**: SCSS в отдельных файлах, импорт в `<script setup>`
- **Локализация**: `useScopeT` из `@/shared/lib`

---

## Команды
- `npm run dev` — запуск dev-сервера
- `npm run build` — production-сборка
- `npm run lint` — ESLint
- `npm run test:unit` — Vitest
- `npx vitest run src/path/to/file.test.ts` — запуск отдельного теста

---

## Частые источники ошибок

### FSD — нарушение слоёв и структуры
```
app → pages → widgets → features → entities → shared
```
- `entities` не должен импортировать из `widgets` или `features`
- Импорт только через `index.ts` слайса, не напрямую во внутренние файлы

**Нарушение структуры `pages`** — папка `model/` внутри `pages` запрещена:
```
pages/my-page/model/  ← ❌ перенести логику в widgets или features
pages/my-page/ui/     ← ✅ только UI
```

**Нарушение структуры `features`** — отсутствие `api/` или `lib/`:
```
features/my-domain/my-action/
├── api/    ← обязательно если есть HTTP-запросы
├── lib/    ← обязательно если есть вспомогательные функции
├── model/  ← store + types
└── ui/     ← компоненты
```

**Нарушение структуры `entities`** — константы внутри `model/` вместо `constants/`:
```
entities/my-entity/model/constants.ts  ← ❌ неверно
entities/my-entity/constants/index.ts  ← ✅ верно
```

### Store — неправильный шаблон
Единственный разрешённый вариант — Option API:
```typescript
export const useMyStore = defineStore('id', {
  state: () => ({ ... }),
  getters: { ... },
  actions: { ... },
});
```
Если store написан через `defineStore('id', () => {...})` — это нарушение, которое нужно исправить.

### Переключение мок/реальный API
- Логика в `src/shared/config/mock.config.ts`
- `isMockMode('featureName')` — проверка режима в API-файле
- Моды переопределяются через `localStorage` (`tm2_module_mode_{section}`)
- Если модуль отсутствует в `ApiModesConfig` — он не появится в настройках

### Локализация
```typescript
import { useScopeT } from '@/shared/lib';
const { scopeT } = useScopeT('myFeature');
```
Если ключ не найден — проверь, добавлен ли файл в `locales/ru/` и `locales/en/` и подключён ли он в основном `index.ts` локалей.

### BaseSelect — дублирование текста
Причина: использование `use-input` или `fill-input` вместо `show-search`. Решение:
```vue
<BaseSelect show-search ... />
```

### Валидация не работает
- Схема должна быть обёрнута в `toTypedSchema(yup.object({...}))`
- В компоненте: `useForm({ validationSchema: schema })` + `useField('fieldName')`
- Схема должна быть в `validation.ts`, а не inline в компоненте

### Типы — `undefined` или `unknown`
Все типы должны быть в `types.ts` слайса. Если типы объявлены в store или компоненте — это причина нестабильного поведения при рефакторинге.

### Импорты — ошибки путей
- Разрешено: `import { X } from '@/entities/my-entity'`
- Запрещено: `import { X } from '../../../entities/my-entity/model/store'`
- `import * as` — запрещено, использовать именованные импорты

### Стили не применяются
Проверь: стиль импортируется в `<script setup>`, а не через `<style>` или `<style src="">`.

### Gotchas
- `BasePagination` требует `current-page`, `total`, `page-size` — проверь наличие всех трёх пропов
- API-файл должен содержать константу `MOCK_*` для мок-данных
- Функции store принимают примитивы — если передаётся событие DOM, это баг
