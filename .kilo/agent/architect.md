---
description: Режим проектирования — план новых компонентов, модулей, тестов, архитектурных решений. Используй при планировании структуры новой фичи/компонента, дизайне API, продумывании декомпозиции, выборе уровней тестов.
mode: primary
---

# Architect Mode

Режим проектирования. Прежде чем планировать — определи природу репозитория и загрузи нужные skills.

## Этот репозиторий
**`metal-art-site` — UI Kit-библиотека** (Vue 3 + Vite + TypeScript + Storybook + Vitest + Playwright). Нет FSD, нет Pinia, нет vue-router, нет vue-i18n, нет API-слоёв. Структура: `src/components/Base*/`, `src/composables/useX/`, `src/utils/xUtils/`, `src/icons/`, `src/styles/`.

→ Для планирования компонентов **загружай skill `ui-kit-component`**.

## Какой skill грузить когда
| Задача проектирования | Skill |
|---|---|
| Проектирование Vue 3 компонента (универсальные правила) | `component-vue` |
| Новый компонент / рефакторинг компонента в этом репо UI Kit | `component-vue` + `ui-kit-component` |
| Дизайн test-suite, выбор уровней тестов, пирамида | `testing-standards` |
| Настройка тестового стека с нуля, добавление visual/e2e | `testing-ui-kit` |
| Архитектура `build/`, стратегия чанков, performance-бюджет | `vite-bundle-config` |
| Принятие решения «что в build/ можно менять, что нельзя», адаптация под новый проект | `vite-bundle-customization-guide` |
| Принципы декомпозиции, SOLID, code smells | `clean-code` |
| Проектирование FSD-структуры (любой проект): слои, слайсы, размещение кода | `fsd` |
| Проектирование TM2-приложения: FSD + Pinia + Quasar + i18n | `fsd` + `project-standards` + `shared-lib-standards` |
| Pinia store в FSD-проекте | `stories-vue` |

## Общие принципы при проектировании
- **YAGNI + KISS** (см. `clean-code`): не добавляй абстракции «на будущее».
- **SOLID** для любого нетривиального модуля.
- **Test-first**: до того как код написан, спланируй set test cases по equivalence partitioning + boundary analysis (см. `testing-standards`).
- **Один уровень абстракции на функцию/модуль/слой**.

---

## Раздел ниже — для FSD-проектов команды (не для этого репо)

Применяй только когда работаешь в TM2 Frontend / другом FSD-приложении с Pinia/Quasar/i18n.

---

## Стек проекта
- **Framework**: Vue 3 (`<script setup lang="ts">`)
- **Архитектура**: FSD (Feature-Sliced Design) — строгое соблюдение
- **State Management**: Pinia — строго Option API (`state` / `getters` / `actions`)
- **UI**: Quasar Framework — только через `Base`-компоненты из `@/shared/ui`
- **Валидация**: Yup + Vee-Validate → схема в `validation.ts`
- **Стили**: SCSS в отдельных файлах, импорт только в `<script setup>`
- **Локализация**: `useScopeT` из `@/shared/lib`

---

## Команды
- `npm run dev` — запуск dev-сервера
- `npm run build` — production-сборка
- `npm run lint` — ESLint
- `npm run test:unit` — Vitest

---

## Правила проектирования

### FSD-слои (строго сверху вниз)
```
app → pages → widgets → features → entities → shared
```
- `pages` — только роутинг и компоновка виджетов, **без `model/`**
- `widgets` — самодостаточный UI-блок со своим store
- `features` — переиспользуемые действия (модальные окна, формы)
- `entities` — бизнес-сущности, только `shared` в зависимостях
- `shared` — утилиты, UI-kit, конфиги, без зависимостей от проекта

### Обязательная структура по слоям

**`pages`** — только `ui/`, никогда `model/`:
```
pages/my-page/
├── index.ts
└── ui/
    ├── MyPage.vue
    └── MyPage.scss
```

**`features`** — `api/` + `lib/` + `model/` + `ui/`:
```
features/my-domain/my-action/
├── index.ts
├── api/          ← HTTP-вызовы действия
├── lib/          ← вспомогательные функции
├── model/        ← store + types
└── ui/           ← Vue-компоненты
```

**`entities`** — `api/` + `constants/` + `model/` + `testing/`:
```
entities/my-entity/
├── index.ts
├── api/          ← HTTP-вызовы + MOCK_*
├── constants/    ← маппинги статусов, дефолты (НЕ внутри model/)
├── model/        ← store + types
└── testing/      ← моки только для тестов
```

### Структура нового модуля
При проектировании любого нового модуля планируй:
1. `types.ts` — все типы данных
2. `store.ts` — Option API store с `state / getters / actions`
3. `api.ts` — реальные вызовы + `MOCK_*` константы
4. `columns.ts` — если есть таблица
5. `validation.ts` — если есть форма (Yup + toTypedSchema)
6. Подкомпоненты: `Widget`, `Toolbar`, `Table`, `Dialog` — каждый в своей папке

### Каждый новый модуль требует
- Ключ в `src/shared/config/mock.config.ts` → `ApiModesConfig` + `API_MODES`
- Перевод в `locales/ru/settings.ts` и `locales/en/settings.ts` → `modules.myFeature`
- Переводы в `locales/ru/myFeature.ts` и `locales/en/myFeature.ts`

### Публичный API слайса
Каждый слайс экспортирует только через `index.ts`. Прямой импорт из внутренних файлов запрещён.

```typescript
// widgets/my-feature/index.ts
export { default as MyFeatureWidget } from './ui/MyFeatureWidget.vue';
export { useMyFeatureStore } from './model/store';
export type { MyItem } from './model/types';
```

### Именование
- Store: `use{Name}Store`
- Actions: `init`, `fetch`, `setPage`, `setQuery`, `open`, `close`, `submit`
- Getters: `rows`, `total`, `loading`, `hasItems`, `pagination`
- Компоненты: `{FeatureName}{Role}` — `MyFeatureToolbar`, `MyFeatureTable`

### Импорты — только абсолютные
Алиас `@/` обязателен. Относительные пути `../` и `import * as` запрещены.

### Gotchas
- `BaseSelect` с поиском — проп `show-search`. Не использовать `use-input` / `fill-input`
- Моды API переопределяются через `localStorage` (`tm2_module_mode_{section}`)
- Store использует `isMockMode('featureName')` из `@/shared/config/mock.config`
- Все типы слайса — только в `types.ts`, нигде больше
