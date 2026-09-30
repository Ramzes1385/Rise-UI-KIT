# Rise UI KIT

[![npm](https://img.shields.io/npm/v/@ramzes1385/rise-ui-kit?color=42b883)](https://www.npmjs.com/package/@ramzes1385/rise-ui-kit)
[![CI](https://github.com/Ramzes1385/Rise-UI-KIT/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Ramzes1385/Rise-UI-KIT/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://ramzes1385.github.io/Rise-UI-KIT/)
[![Vue 3.5+](https://img.shields.io/badge/Vue-3.5%2B-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

`@ramzes1385/rise-ui-kit` — библиотека компонентов для Vue 3: 107 компонентов, composables, utils, иконки и дизайн-токены со светлой и тёмной темой.

**[Открыть Storybook](https://ramzes1385.github.io/Rise-UI-KIT/)** — все компоненты вживую: варианты, состояния, клавиатура, обе темы, таблицы props и событий, а в разделе Blocks — готовые экраны из компонентов кита.

---

## Возможности

- компоненты: поля и формы (в том числе телефон, сумма, реквизиты и адрес), окна, меню и подсказки, таблица, дерево и списки на тысячи строк, каркас страницы и навигация, чат и блоки ИИ-чата, редактор, канбан, графики, видео- и аудиоплеер;
- дизайн-токены `--rise-*`: светлая, тёмная и системная тема, перекраска бренда, скругления и плотность без правок стилей;
- доступность: роли и клавиатура по образцам WAI-ARIA APG; каждая история Storybook проверяется axe в светлой и тёмной теме;
- строки интерфейса на русском и английском, свой язык — `defineLocale`;
- типы TypeScript для props, событий, слотов и методов;
- в зависимостях только Vue и шрифты Inter и JetBrains Mono; потоки HLS — через hls.js, который подключает приложение;
- видеоплеер — отдельным входом `@ramzes1385/rise-ui-kit/media`: приложения без плеера его код не загружают;
- composables и utils: горячие клавиши, ловушка фокуса, слои оверлеев, виртуальный список, даты, файлы, субтитры, проверка ссылок.

---

## Установка

```bash
npm install @ramzes1385/rise-ui-kit
# или
yarn add @ramzes1385/rise-ui-kit
pnpm add @ramzes1385/rise-ui-kit
```

Нужен Vue 3.5 или новее.

---

## Подключение стилей

Стили библиотеки нужно подключить один раз в точке входа приложения.

Например, в `main.ts`:

```ts
import '@ramzes1385/rise-ui-kit/styles'
```

Тот же файл доступен как `@ramzes1385/rise-ui-kit/styles.css`.

### Шрифты

Дизайн-токены `--rise-font-sans` и `--rise-font-mono` ссылаются на `Inter Variable` и `JetBrains Mono Variable`, но `dist/styles.css` не содержит `@font-face` — файлы шрифтов подключает приложение. Пакеты `@fontsource-variable/inter` и `@fontsource-variable/jetbrains-mono` устанавливаются вместе с библиотекой (они в `dependencies`):

```ts
// main.ts
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
```

Это те же файлы, что и при `import '@fontsource-variable/inter'`; явный путь к `.css` нужен TypeScript 6, где `noUncheckedSideEffectImports` включён по умолчанию: импорт без расширения даёт ошибку TS2882, а `*.css` покрывается объявлениями `vite/client`.

Без этих импортов браузер берёт запасные шрифты из токенов (`system-ui`, `Segoe UI`, `Roboto`, `Arial`; для моноширинного — `ui-monospace`, `Menlo`, `Consolas` и т. п.), то есть системный шрифт. `styles.css` также не задаёт шрифт для `body`, `button` и полей ввода: чтобы весь интерфейс использовал шрифт библиотеки, добавьте в стили приложения `body, button, input, textarea, select { font-family: var(--rise-font-sans); }`.

### Дизайн-система и темы

Внешний вид задают CSS-переменные `--rise-*` из `dist/styles.css`: палитры, семантические цвета (фон, текст, рамки, роли primary/success/info/warning/error), радиусы, тени, шрифты и размеры контролов. Полный список и правила — [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md), живые примеры — Storybook, раздел **Foundations**.

```css
/* Тёмная тема — атрибутом на <html> или на любом контейнере; data-theme="light" возвращает светлую внутри тёмной */
/* <html data-theme="dark"> */

:root {
  /* Бренд: палитра primary (оттенки 50…950). Семантические токены обеих тем пересчитаются сами */
  --rise-color-primary-400: #a78bfa;
  --rise-color-primary-700: #6d28d9;
  --rise-color-primary-800: #5b21b6;
  /* …остальные оттенки */

  --rise-radius: 6px;            /* база скруглений: 0 — строгий интерфейс, 8px — мягкий */
  --rise-control-padding-y: 7px; /* плотность: контролы 36px вместо 32px */
}
```

- **Тема «как в системе»** — `data-theme="system"`: тёмная при `prefers-color-scheme: dark`. Переключать тему из кода — `useColorMode()` (`mode`: `light`, `dark`, `system`; выбор сохраняется в localStorage), кнопка для шапки — `BaseColorModeButton`. Чтобы тема из localStorage применялась до загрузки скриптов, добавьте в `<head>`: `<script>document.documentElement.dataset.theme = localStorage.getItem('rise-color-mode') || 'system'</script>`.
- **Размер компонента** — проп `sizeScale` (проценты): 75 / 87.5 / 100 / 112.5 / 125 ≈ xs / sm / md / lg / xl, контролы 24–40px. Кнопка, поле, селект и переключатели одного `sizeScale` одной высоты.
- **Цвет одного компонента** — проп `color` (`{ bg: { base, hover, active, focus }, text: { … } }`). Вложенные в него компоненты этот цвет не наследуют.
- **Слои** — токены `--rise-z-overlay` (1000: окна, боковые панели, тур, поиск на весь экран, выпадающие панели, календарь, контекстные меню — сверх токена добавляется место слоя в порядке открытия), `--rise-z-toast` (2000: уведомления), `--rise-z-tooltip` (3000: подсказки), `--rise-z-max` (9999: просмотр изображения). Если у приложения свои слои (липкая шапка с `z-index: 1000` и т. п.), переопределите токены в `:root` (см. «Слои»).
- **Контраст.** Пары «текст/фон» токенов проходят WCAG 2.2 AA в обеих темах — `npm run test:contrast`, отчёт [docs/design/contrast.md](docs/design/contrast.md).
- **Переменные 1.x** (`--color-accent`, `--color-text-muted`, `--border-radius-base`…) оставлены алиасами новых токенов для CSS приложения, но компоненты их больше не читают: перекрашивайте через `--rise-*`. В 2.0 алиасы остаются, удалены они будут в следующей мажорной версии.

---

## Иконки

Иконки используются через `BaseIcon`.

```vue
<script setup lang="ts">
import { BaseIcon } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseIcon name="search" />
	<BaseIcon name="close" />
	<BaseIcon name="send" />
</template>
```

### Спрайт

BaseIcon берёт иконки из спрайта `dist/icons.svg` пакета. Сделайте его доступным приложению: скопируйте `node_modules/@ramzes1385/rise-ui-kit/dist/icons.svg` в `public/` или импортируйте URL — `import iconSpriteUrl from '@ramzes1385/rise-ui-kit/icons.svg?url'` (подпуть `./icons.svg` добавлен в `exports`). Передайте абсолютный путь: `app.use(createUiKitPlugin({ iconSpritePath: '/icons.svg' }))` или `iconSpriteUrl`; если нужны только иконки — `createIconPlugin({ spritePath: '/icons.svg' })`. Без опции используется относительный `'icons.svg'`: он резолвится от URL страницы, и на вложенных маршрутах (`/users/42` → `/users/icons.svg`) файл не находится. Спрайт должен отдаваться с того же origin, что и страница; при деплое под подпутём укажите `${import.meta.env.BASE_URL}icons.svg`.

```ts
// main.ts: URL спрайта из пакета (Vite)
import { createApp } from 'vue'
import App from './App.vue'
import { createUiKitPlugin } from '@ramzes1385/rise-ui-kit'
import iconSpriteUrl from '@ramzes1385/rise-ui-kit/icons.svg?url'

createApp(App).use(createUiKitPlugin({ iconSpritePath: iconSpriteUrl })).mount('#app')
```

```ts
// main.ts: только иконки — глобальный BaseIcon без остальных компонентов
import { createApp } from 'vue'
import App from './App.vue'
import { createIconPlugin } from '@ramzes1385/rise-ui-kit/icons'

createApp(App).use(createIconPlugin({ spritePath: '/icons.svg' })).mount('#app')
```

---

## Быстрый старт

### Подключение через Vue plugin

Этот способ удобен, если нужно зарегистрировать компоненты глобально.

```ts
import { createApp } from 'vue'
import App from './App.vue'

import { createUiKitPlugin } from '@ramzes1385/rise-ui-kit'
import '@ramzes1385/rise-ui-kit/styles'

const app = createApp(App)

// iconSpritePath — абсолютный путь к SVG-спрайту иконок (см. раздел «Иконки»)
app.use(createUiKitPlugin({ iconSpritePath: '/icons.svg' }))

app.mount('#app')
```

Опции `createUiKitPlugin`:

- `prefix` — префикс глобальных имён (`prefix: 'Ui'` → `UiBaseButton`);
- `iconSpritePath` — путь к спрайту иконок;
- `defaults` — значения props по умолчанию: `global` — для всех компонентов, по имени — для одного. Переопределяются props со значением по умолчанию в компоненте (строки, числа, логические значения); props из шаблона важнее;
- `icons` — замена иконок кита: имя символа в спрайте, полный адрес символа или компонент с `<svg>`;
- `linkComponent` — компонент ссылок на маршруты (RouterLink, NuxtLink). Без него компоненты берут RouterLink, если подключён vue-router, иначе рендерят `<a href>`;
- `locale` — язык строк кита: `ru` (по умолчанию), `en` или свой словарь (см. «Языки»);
- `teleportTo` — куда телепортировать окна, выпадающие панели, тултипы и уведомления: CSS-селектор или элемент, по умолчанию `body` (см. «Слои»).

```ts
import { RouterLink } from 'vue-router'
import CloseIcon from './icons/CloseIcon.vue'

app.use(
	createUiKitPlugin({
		iconSpritePath: '/icons.svg',
		defaults: { global: { sizeScale: 90 }, BaseButton: { variant: 'soft' }, BaseModal: { closeOnOverlay: false } },
		icons: { close: CloseIcon, 'chevron-down': 'arrow-down' },
		linkComponent: RouterLink,
		locale: 'en',
	}),
)
```

### Языки

Строки интерфейса кита (подписи кнопок, доступные имена, «Нет данных», формат дат и чисел) есть на русском и английском. Язык один на страницу: его задают `createUiKitPlugin({ locale: 'en' })`, `<BaseApp locale="en">` или `setLocale('en')` — компоненты перерисовываются сразу.

```ts
import { defineLocale, en, setLocale, useLocale } from '@ramzes1385/rise-ui-kit'

// Свой язык или правки поверх готового словаря
setLocale(defineLocale(en, { code: 'en-GB', intl: 'en-GB', firstDayOfWeek: 1, text: { EMPTY: 'Nothing here yet' } }))

// Формат по правилам текущего языка
const { locale, formatNumber, formatDate, plural } = useLocale()
plural({ one: '{n} file', other: '{n} files' }, 3) // '3 files'
```

Календарь и выбор даты берут из языка формат дат и первый день недели, если не заданы пропсы `locale` и `firstDayOfWeek`. Строки из props (`placeholder`, `label`) приложение переводит само.

После этого компоненты можно использовать в шаблонах без локального импорта, если они зарегистрированы plugin API. Типы глобальных компонентов пакет не объявляет (`GlobalComponents`), поэтому props в шаблоне проверяются только при прямом импорте.

```vue
<template>
	<BaseButton>Сохранить</BaseButton>
</template>
```

---

### BaseApp: уведомления и окна из кода

Оберните приложение в `BaseApp` один раз — обычно в корневом `App.vue`. Он не добавляет разметки: рендерит слот и поверх страницы — уведомления и окна, которые вызывают из кода.

```vue
<!-- App.vue -->
<script setup lang="ts">
import { BaseApp } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseApp :toaster="{ position: 'bottom-right', max: 3 }">
		<RouterView />
	</BaseApp>
</template>
```

В любом компоненте внутри:

```ts
import { useConfirm, useOverlay, useToast } from '@ramzes1385/rise-ui-kit'

const toast = useToast()
const confirm = useConfirm()
const overlay = useOverlay()

// Уведомление; с тем же id — заменяет показанное
const id = toast.add({ title: 'Готовим отчёт…', isPersistent: true })
toast.update(id, { type: 'success', title: 'Отчёт готов', isPersistent: false })
toast.add({ title: 'Комментарий удалён', actions: [{ label: 'Вернуть', onClick: restore }] })

// Подтверждение: true — подтвердили, false — отменили (кнопкой, Escape, кликом по фону)
if (await confirm({ title: 'Удалить проект?', description: 'Это необратимо.', confirmLabel: 'Удалить', isDanger: true })) {
	await api.deleteProject(projectId)
}

// Своё окно: компонент получает props и isOpen, результат передаёт в emit('close', value)
const rename = overlay.create(RenameProjectModal)
const newName = await rename.open({ name: project.name })
```

- `toaster` — настройки уведомлений: `position`, `duration` (3000 мс), `max` (5 одновременно, старые закрываются), `variant`, `sizeScale`.
- Окно для `useOverlay()` закрывается событием `close` (с результатом) или `update:isOpen` (без результата); если компонент шлёт оба, `close` должен идти первым. После анимации (`after-leave`) окно удаляется из DOM.
- Вызовы вне дерева `BaseApp` (в сторе, роутере, обработчике запросов) идут в последний смонтированный `BaseApp`. Без `BaseApp` вызов пишет предупреждение в консоль и ничего не показывает; `confirm()` при этом отвечает `false`.

### Слои: окна, панели и подсказки

Окна, боковые панели, выпадающие списки, меню и подсказки — слои. Кит ведёт их общий стек в порядке открытия:

- **Escape и клик снаружи получает только верхний слой.** Из окна с открытым списком первое нажатие Escape закрывает список, второе — окно. Клик в панели вложенного списка (фильтр в поповере, выбор в окне) не закрывает внешний слой, хотя обе панели телепортированы в body.
- **Свой обработчик Escape** внутри слоя вызывает `event.preventDefault()` — тогда слои это нажатие не трогают: поле с собственной отменой по Escape не закроет окно.
- **Свои всплывающие элементы** подключаются к стеку через `useEscapeKey` и `useClickOutside` (или `useLayer`) из `@ramzes1385/rise-ui-kit/composables`, место в порядке наложения даёт `useLayerIndex` — см. [Composables](docs/reference/COMPOSABLES.md).
- **Край окна.** Выпадающие панели (`BaseDropdown`, `BaseDropdownMenu`, `BaseContextMenu`, `BaseSelect`, `BasePopover`, `BasePopconfirm`, `BaseSearch`, `BaseDatePicker`) и подсказки `BaseTooltip` открываются с противоположной стороны, если на выбранной не хватает места, а вдоль края окна сдвигаются, оставляя 8px.
- **Тема.** Панель, открытая из блока с `data-theme`, берёт тему этого блока, а не страницы: тёмный плеер на светлой странице получает тёмное меню. Так работают выпадающие панели, подсказки, календарь и контекстные меню редактора и чата.
- **Контейнер слоёв.** По умолчанию слои телепортируются в `body`. Свой контейнер задают `createUiKitPlugin({ teleportTo: '#layers' })` или `<BaseApp teleport-to="#layers">` (он важнее плагина для компонентов внутри); контейнер может стоять в том же шаблоне, что и меню. Это нужно, например, в полноэкранном режиме: панели в `body` не видны поверх элемента, развёрнутого через Fullscreen API. У контейнера не должно быть `transform`, `filter` и `contain` — панели позиционируются через `position: fixed`.
- **Порядок наложения — порядок открытия.** Окно, открытое из меню, — над меню; список в окне — над окном; тур, запущенный из окна, — над окном. z-index такого слоя — `--rise-z-overlay` плюс его место среди открытых (`--rise-layer-index`), поэтому порядок компонентов в DOM не важен. Уведомления, подсказки и просмотр изображения всегда выше — у них свои токены (см. «Дизайн-система и темы»).

```vue
<!-- Плеер: при переходе в полноэкранный режим меню и подсказки должны оставаться видимыми -->
<template>
	<div ref="playerRef" class="player">
		<video … />
		<div id="player-layers" />
	</div>
</template>
```

```ts
app.use(createUiKitPlugin({ teleportTo: '#player-layers' }))
```

---

### Прямой импорт компонентов

Этот способ предпочтителен, если нужно контролировать используемые компоненты явно.

```vue
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseButton>Сохранить</BaseButton>
</template>
```

---

## Публичный API

Компоненты и их типы импортируются из корня пакета. Composables, utils и icons из корня экспортируются только как namespace (`composables`, `utils`, `icons`) — либо импортируйте их из подпутей пакета:

```ts
import { BaseButton, BaseInput, BaseModal, BaseTable, composables, utils } from '@ramzes1385/rise-ui-kit'
import { useDebounceFn } from '@ramzes1385/rise-ui-kit/composables'
import { formatFileSize } from '@ramzes1385/rise-ui-kit/utils'

import '@ramzes1385/rise-ui-kit/styles'

const size = utils.formatFileSize(1024) // то же, что formatFileSize(1024)
```

Исключение — сервисы всего приложения: `useToast`, `useOverlay`, `useConfirm`, `useColorMode`, `useLocale`, а также `setLocale`, `defineLocale` и словари `ru`, `en` импортируются из корня пакета по имени, как компоненты.

Видеоплеер `BaseMediaPlayer` и его типы — только из подпути `@ramzes1385/rise-ui-kit/media`: в корень пакета и в плагин он не входит, поэтому приложения без плеера его код не загружают.

Подпути из `package.json#exports`: `/components`, `/composables`, `/utils`, `/icons` (константы спрайта и `createIconPlugin`), `/media` (видеоплеер), `/styles` (`/styles.css`), `/icons.svg`.

Не рекомендуется импортировать внутренние файлы из `dist` напрямую:

```ts
// Не использовать
import BaseButton from '@ramzes1385/rise-ui-kit/dist/components/BaseButton/BaseButton.vue'
```

Правильно:

```ts
import { BaseButton } from '@ramzes1385/rise-ui-kit'
```

---

## Документация

| Документ | Что внутри |
|---|---|
| [Storybook](https://ramzes1385.github.io/Rise-UI-KIT/) | Все компоненты вживую: варианты, состояния, клавиатура, обе темы, таблицы props и событий |
| [Компоненты](docs/reference/COMPONENTS.md) | Справочник: назначение, основные props и события, примеры |
| [Composables](docs/reference/COMPOSABLES.md) | `useDebounce`, `useClickOutside`, `useEscapeKey`, `useFocusTrap`, `useHotkeys` и другие |
| [Utils](docs/reference/UTILS.md) | Даты, файлы, цвета, субтитры, медиа, проверка ссылок, координаты `position: fixed` |
| [Переход на 2.0](docs/v2/MIGRATION.md) | Что изменилось для приложения и что сделать при обновлении с 1.x |
| [Что заметит приложение после редизайна](docs/design/CHANGES_FOR_APPS.md) | Значения по умолчанию, DOM, доступность, токены |
| [Дизайн-система](docs/design/DESIGN_SYSTEM.md) | Токены `--rise-*`, темы, размеры, правила стилей |
| [Разработка](docs/reference/DEVELOPMENT.md) | Стек, структура репозитория, Storybook, тесты, сборка, CI |
| [Ведение репозитория](docs/CONTRIBUTING.md) | Ветки, коммиты, pull request, релизы, новый компонент |

---

## Лицензия

MIT (поле `license` в `package.json`). Сторонние материалы в пакете — значки видеоплеера (Font Awesome Free) и данные эмодзи (emojibase-data, Unicode CLDR) — под своими лицензиями: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
