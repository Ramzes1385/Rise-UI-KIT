# Metal Art UI Kit

Vue 3 UI-библиотека базовых компонентов с TypeScript, Vite, SCSS, Storybook и тестовой инфраструктурой.

Библиотека не использует FSD-слои приложения. Публичный контракт строится вокруг компонентов, composables, utils, стилей и SVG-иконок.

## Структура библиотеки

```text
src/
├── components/     # публичные UI-компоненты (48 Base*-компонентов)
├── composables/    # публичные composables компонентов
├── utils/          # публичные утилиты
├── styles/         # глобальные SCSS-переменные, миксины, функции и entrypoint стилей
├── icons/          # контракт и исходные SVG-иконки
├── playground/     # локальная demo-песочница
├── index.ts        # корневой публичный API
├── plugin.ts       # Vue-плагин для глобальной регистрации компонентов
├── App.vue         # оболочка playground
└── main.ts         # локальный dev-вход
```

Компонент хранится в собственной папке:

```text
src/components/BaseButton/
├── BaseButton.vue
├── BaseButton.types.ts
├── BaseButton.style.scss
├── BaseButton.stories.ts
├── BaseButton.spec.ts
├── BaseButton.integration.spec.ts
├── BaseButton.visual.spec.ts
├── BaseButton.e2e.spec.ts
└── index.ts
```

## Public API

| Entrypoint                 | Назначение                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `src/index.ts`             | Корневой API: компоненты flat-export, plugin, namespaces для composables/utils/icons |
| `src/plugin.ts`            | `createUiKitPlugin`, `uiKitPlugin`, `UI_COMPONENTS`                                  |
| `src/components/index.ts`  | Публичные компоненты и типы компонентов                                              |
| `src/composables/index.ts` | Публичные composables                                                                |
| `src/utils/index.ts`       | Публичные утилиты                                                                    |
| `src/icons/index.ts`       | Константы SVG-спрайта и директории иконок                                            |
| `src/styles/index.scss`    | Глобальные стили библиотеки                                                          |

Корневой API экспортирует компоненты напрямую, а `composables`, `utils` и `icons` — через namespaces, чтобы избежать конфликтов одноимённых типов.

```ts
import { BaseButton, createUiKitPlugin, composables, icons, utils } from '@/index'

const { useIcon } = composables
const { ICON_SPRITE_PATH } = icons
const { formatFileSize } = utils
```

## Подключение в приложении

Локальный dev-вход подключает стили и Vue-плагин через `src/main.ts`.

```ts
import { createApp } from 'vue'

import App from './App.vue'
import { createUiKitPlugin } from './plugin'
import './styles/index.scss'

const app = createApp(App)

app.use(createUiKitPlugin())
app.mount('#app')
```

Плагин регистрирует все публичные компоненты глобально. Для предотвращения конфликтов имён можно передать префикс.

```ts
app.use(createUiKitPlugin({ prefix: 'Ui' }))
```

После подключения с префиксом компонент `BaseButton` доступен как `UiBaseButton`.

## Локальное использование компонентов

Внутри библиотеки используй публичные entrypoints слоя библиотеки:

```vue
<script setup lang="ts">
import { BaseButton, BaseIcon } from '@components'
import type { BaseButtonProps } from '@components/BaseButton'

function handleClick(): void {
	console.log('click')
}
</script>

<template>
	<BaseButton @click="handleClick">
		<template #left>
			<BaseIcon name="check" />
		</template>
		Сохранить
	</BaseButton>
</template>
```

## Aliases

Разрешённые aliases библиотеки:

| Alias            | Путь                |
| ---------------- | ------------------- |
| `@/*`            | `src/*`             |
| `@components/*`  | `src/components/*`  |
| `@composables/*` | `src/composables/*` |
| `@utils/*`       | `src/utils/*`       |
| `@styles/*`      | `src/styles/*`      |
| `@icons/*`       | `src/icons/*`       |
| `@ui/*`          | `src/components/*`  |

Запрещены старые site/FSD aliases: `@shared`, `@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@assets`, `@lib`, `@api`.

## Стили

Глобальный SCSS-entrypoint:

```scss
@use './variables';
@use './mixins';
@use './functions';
```

`src/styles/index.scss` подключает единый шрифт UI Kit для `body`, форм, кнопок и всех `base-*` компонентов через CSS-переменные `--font-family-base`, `--font-family-heading` и `--font-family-mono`.

Компонентные стили импортируются рядом с компонентом. Глобальные переменные, миксины и функции автоматически инжектятся в каждый SCSS-файл через Vite `additionalData` (см. `build/config/css.ts`), поэтому ручной `@use '@styles/...'` в файлах компонентов не нужен и не допускается.

Правила UI Kit:

- размеры, отступы и шрифты задаются в px;
- классы пишутся по БЭМ в kebab-case;
- цвета берутся из CSS-переменных;
- тёмная тема поддерживается через `[data-theme='dark']`;
- интерактивные состояния оформляются через общие SCSS-миксины.

## Иконки

Исходные SVG лежат в `src/icons/svg`. Vite-плагин генерирует спрайт `public/icons.svg`.

```vue
<BaseIcon name="check" aria-label="Готово" />
```

Для работы со спрайтом используй composable:

```ts
import { useIcon } from '@composables/useIcon'

const { spritePath, getIconUrl } = useIcon()
```

## Storybook

Storybook читает истории только из компонентов:

```text
src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)
```

Команды:

```bash
npm run storybook
npm run build-storybook
```

## Тесты компонентов

Тесты хранятся рядом с компонентом и не экспортируются из `index.ts` компонента.

| Файл                            | Runner     | Назначение                                               |
| ------------------------------- | ---------- | -------------------------------------------------------- |
| `Component.spec.ts`             | Vitest     | Unit-тесты: props, slots, базовый render, ветки template |
| `Component.integration.spec.ts` | Vitest     | Интеграция: `v-model`, emits, пользовательские действия  |
| `Component.visual.spec.ts`      | Playwright | Visual regression через Storybook iframe                 |
| `Component.e2e.spec.ts`         | Playwright | Smoke-сценарии пользовательского поведения               |
| `Component.stories.ts`          | Storybook  | Стабильные состояния компонента                          |

Команды:

```bash
npm run test:unit
npm run test:vitest
npm run test:storybook
npm run test:e2e
npm run test:visual
npm run test:visual:update
npm run test:all
```

Screenshot snapshots лежат вне `src` в `tests/visual-snapshots` и обновляются только после ручного ревью визуальных изменений.

## Сборка и разработка

```bash
npm run dev
npm run build
npm run preview
```

`npm run dev` запускает playground из `src/playground`. Публичный код библиотеки не должен импортировать playground или demo-код.

## Правила импортов

- Публичные компоненты импортируются из `@components` или конкретной папки компонента.
- Composables импортируются из `@composables` или конкретной папки composable.
- Utils импортируются из `@utils` или конкретного модуля утилит.
- Стили компонентов не экспортируются из TypeScript entrypoints.
- `src/playground` не импортируется публичным API и компонентами.
- Старые FSD/site aliases запрещены.

## Пример использования

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseCard, BaseIcon, BaseText } from '@components'

const count = ref(0)

function handleClick(): void {
	count.value += 1
}
</script>

<template>
	<BaseCard title="UI Kit">
		<BaseText>Кликов: {{ count }}</BaseText>

		<BaseButton variant="soft" @click="handleClick">
			<template #left>
				<BaseIcon name="plus" />
			</template>
			Добавить
		</BaseButton>
	</BaseCard>
</template>
```
