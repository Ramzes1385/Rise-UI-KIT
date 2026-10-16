# Rise UI KIT

[![npm](https://img.shields.io/npm/v/@ramzes1385/rise-ui-kit?color=42b883)](https://www.npmjs.com/package/@ramzes1385/rise-ui-kit)
[![CI](https://github.com/Ramzes1385/Rise-UI-KIT/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Ramzes1385/Rise-UI-KIT/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/Storybook-ff4785?logo=storybook&logoColor=white)](https://ramzes1385.github.io/Rise-UI-KIT/)
[![Vue 3.5+](https://img.shields.io/badge/Vue-3.5%2B-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

`@ramzes1385/rise-ui-kit` — библиотека компонентов для Vue 3: 114 компонентов, composables, utils, иконки и дизайн-токены со светлой и тёмной темой.

**[Открыть Storybook](https://ramzes1385.github.io/Rise-UI-KIT/)** — все компоненты вживую: варианты, состояния, клавиатура, обе темы, таблицы props и событий, а в разделе Blocks — готовые экраны из компонентов кита.

---

## Возможности

- компоненты: поля и формы (в том числе телефон, сумма, реквизиты и адрес), окна, меню и подсказки, таблица, дерево и списки на тысячи строк, каркас страницы и навигация, чат и блоки ИИ-чата, редактор, канбан, графики, просмотр JSON и сравнение текстов, видео- и аудиоплеер, электронная подпись через КриптоПро;
- дизайн-токены `--rise-*`: светлая, тёмная и системная тема, перекраска бренда, скругления и плотность без правок стилей;
- доступность: роли и клавиатура по образцам WAI-ARIA APG; каждая история Storybook проверяется axe в светлой и тёмной теме;
- строки интерфейса на русском и английском, свой язык — `registerLocale`, свои строки поверх готового языка — `defineLocale`; форматы дат, чисел и первый день недели следуют за языком;

- строки интерфейса на русском, английском, казахском (кириллица) и узбекском (латиница), свой язык — `defineLocale`;

- строки интерфейса на русском, английском, китайском (упрощённом) и японском, свой язык — `defineLocale`;
- типы TypeScript для props, событий, слотов и методов;
- в зависимостях только Vue и шрифты Inter и JetBrains Mono; потоки HLS — через hls.js, который подключает приложение;
- видеоплеер — отдельным входом `@ramzes1385/rise-ui-kit/media` и отдельными стилями `media.css`: приложения без плеера не загружают ни его код, ни его стили;
- электронная подпись `BaseCryptoProSign` и `useCryptoPro`: пользователю нужны КриптоПро CSP, ЭЦП Browser plug-in с расширением для браузера и сертификат с закрытым ключом; приложение раздаёт скрипт `cadesplugin_api.js` с сайта КриптоПро и подключает его на странице или передаёт адрес в `script-url` — подробности и ограничения в docs/reference/COMPONENTS.md, раздел BaseCryptoProSign;
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

### Поддержка браузеров

| Браузер | Минимальная версия |
|---|---|
| Chrome, Edge | 111 |
| Firefox | 113 |
| Safari, Safari на iOS | 16.2 |

Минимум задаёт CSS: токены цветов (`--rise-primary-soft`, `--rise-overlay` и другие) строятся через `color-mix()`, и в браузере старше указанного у компонентов пропадают фоны и рамки. JS собран под ES2020, полифилов в пакете нет; из более новых API используется только `Array.prototype.at` (Chrome 92, Firefox 90, Safari 15.4).

Что работает не везде (компоненты остаются рабочими):

- **Firefox 113–120** — нет `:has()`: у BaseRadio с рамкой не подсвечивается выбранный вариант и кольцо фокуса, у BaseSegmented и кнопки файла в BaseEditor нет кольца фокуса с клавиатуры, в BaseCalendar не закрашивается выбранный диапазон, в BaseMediaPlayer нижний баннер может перекрыть субтитры и подсказки над панелью.
- **Улучшения, без которых вид проще:** `field-sizing: content` (поле растёт по тексту), `interpolate-size` (плавное раскрытие до `auto`), `text-wrap: balance`, анимация через `@property` (вращение кольца BaseAvatar).

---

## Подключение стилей

Стили библиотеки нужно подключить один раз в точке входа приложения.

Например, в `main.ts`:

```ts
import '@ramzes1385/rise-ui-kit/styles'
```

Тот же файл доступен как `@ramzes1385/rise-ui-kit/styles.css`.

Чтобы стили приложения всегда побеждали стили кита — без `!important` и без борьбы за специфичность и порядок импорта, — подключите вариант в каскадном слое `rise` и задайте порядок слоёв:

```css
/* main.css приложения */
@layer reset, rise, app;
@import '@ramzes1385/rise-ui-kit/styles.layer.css';
```

`styles.layer.css` — одна строка `@import url('./styles.css') layer(rise);`. Стили вне слоёв сильнее любого слоя, поэтому `@layer app` можно и не объявлять. С Tailwind CSS v4: `@layer theme, base, rise, components, utilities;`. По умолчанию `styles.css` без слоя: глобальные сбросы приложения (`button { padding: 0 }`) иначе перебили бы кит.

### Стили видеоплеера

Стили `BaseMediaPlayer` и `BasePresentationPlayer` не входят в `styles.css` — они в `media.css`. Приложение с плеером подключает оба файла, `media.css` — после `styles`; токены лежат только в `styles.css`, `media.css` их не повторяет:

```ts
import '@ramzes1385/rise-ui-kit/styles'
import '@ramzes1385/rise-ui-kit/media.css'
```

Со слоями — рядом с `styles.layer.css` (оба кладут стили в слой `rise`):

```css
@layer reset, rise, app;
@import '@ramzes1385/rise-ui-kit/styles.layer.css';
@import '@ramzes1385/rise-ui-kit/media.layer.css';
```

### Точечная установка

Компонент можно подключить с его подпути: в сборку приложения попадут JS и CSS только этого компонента и тех, что он использует внутри (BaseSelect тянет BaseDropdown, BaseInput, BaseIcon…). Токены, тема и база шрифта — отдельным файлом `tokens.css`, один раз:

```ts
// main.ts
import '@ramzes1385/rise-ui-kit/tokens.css'
```

```vue
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit/BaseButton'
import { BaseSelect, type BaseSelectOption } from '@ramzes1385/rise-ui-kit/BaseSelect'
</script>
```

- Подпуть есть у каждого компонента из `@ramzes1385/rise-ui-kit/components` (`/BaseButton`, `/BaseTable`, …) и отдаёт то же, что его раздел там: компонент, его константы и типы. Плеер и 3D-карта — по-прежнему `/media` и `/map3d`.
- CSS компонента JS подпути подключает сам — `styles.css` не нужен. Приложение на Vite 8: CSS всех компонентов `tokens.css` + BaseButton — 4,8 КБ gzip против 96,9 КБ у `styles.css`, с BaseSelect — 8,5 КБ.
- Подпути, корень и `/components` делят один код: компонент из подпути и из корня — один и тот же, настройки `createUiKitPlugin` (`defaults`, тема, язык) действуют на оба. Но плагин регистрирует все компоненты глобально, и их JS попадает в сборку; при точечной установке язык задаёт `setLocale` из корня, тему — `applyTheme`.
- Подключили `styles.css` — `tokens.css` уже не нужен (токены в нём есть). Стили компонентов с подпутей — без каскадного слоя; `tokens.layer.css` кладёт в слой `rise` только токены. Весь кит в слое — `styles.layer.css` и импорт из корня.
- Импорт `.css` из JS пакета обрабатывает сборщик (Vite, webpack). При SSR пакет нужно пропустить через сборку, а не отдавать Node как внешний модуль — иначе Node не знает расширения `.css`.

**Vite + SSR** (`vite.config.ts`):

```ts
export default defineConfig({
	ssr: { noExternal: ['@ramzes1385/rise-ui-kit'] },
})
```

**Nuxt** (`nuxt.config.ts`) — как у других китов, у которых JS компонента импортирует свой CSS:

```ts
export default defineNuxtConfig({
	css: ['@ramzes1385/rise-ui-kit/tokens.css'],
	build: { transpile: ['@ramzes1385/rise-ui-kit'] },
})
```

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit/BaseButton'
</script>
```

### Шрифты

Дизайн-токены `--rise-font-sans` и `--rise-font-mono` ссылаются на `Inter Variable` и `JetBrains Mono Variable`, но `dist/styles.css` не содержит `@font-face` — файлы шрифтов подключает приложение. Пакеты `@fontsource-variable/inter` и `@fontsource-variable/jetbrains-mono` устанавливаются вместе с библиотекой (они в `dependencies`):

```ts
// main.ts
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
```

Это те же файлы, что и при `import '@fontsource-variable/inter'`; явный путь к `.css` нужен TypeScript 6, где `noUncheckedSideEffectImports` включён по умолчанию: импорт без расширения даёт ошибку TS2882, а `*.css` покрывается объявлениями `vite/client`.

Без этих импортов браузер берёт запасные шрифты из токенов (`system-ui`, `Segoe UI`, `Roboto`, `Arial`; для моноширинного — `ui-monospace`, `Menlo`, `Consolas` и т. п.), то есть системный шрифт. После них в токенах стоят системные шрифты для китайского и японского (`PingFang SC`, `Microsoft YaHei`, `Noto Sans CJK SC`; в элементах с `lang="ja"` — `Hiragino Sans`, `Yu Gothic`, `Meiryo`, `Noto Sans CJK JP`): они берутся только для иероглифов, которых нет в Inter, и файлов шрифтов не требуют. Задайте `lang` на `<html>`, иначе у общих иероглифов будут китайские начертания.

`styles.css` задаёт шрифт только элементам кита (классы `base-*`, селектор `:where` с нулевой специфичностью — стили приложения его перекрывают): `--rise-font-sans`, внутри `code`, `kbd`, `samp`, `pre` — `--rise-font-mono`. Шрифт `body`, `button` и полей ввода приложения кит не меняет; чтобы весь интерфейс использовал шрифт библиотеки, добавьте в стили приложения `body, button, input, textarea, select { font-family: var(--rise-font-sans); }`. Алиасы 1.x (`--font-family-base` и др.) оставлены для совместимости, в новом коде — `--rise-font-sans` и `--rise-font-mono`.

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
  --rise-density: 0.75;          /* плотность отступов контролов и поверхностей: 0.75 — компактно, 1.25 — просторно */
  --rise-shadow-strength: 0.6;   /* сила теней: 0 — без теней, 1.8 — выразительные */
  --rise-font-heading: 'Nunito', system-ui, sans-serif; /* шрифт заголовков */

  /* Токены компонента (--rise-<компонент>-…): кит их только читает — список в docs/design/COMPONENT_TOKENS.md */
  --rise-button-radius: 9999px;
  --rise-card-shadow: var(--rise-shadow-sm);
}
```

- **Тема на области страницы** — сиды на элементе с `data-rise-theme` и `data-theme` на нём же (`<section data-rise-theme="brand" data-theme="light">`): без `data-theme` на том же элементе семантические токены не пересчитаются. Выпадающие панели и подсказки из области берут оба атрибута.
- **Классы частей** — проп `ui` (`<BaseButton :ui="{ root: 'rounded-full', label: 'tracking-wide' }">`) добавляет классы к БЭМ-элементам компонента; глобально — `defaults.BaseButton.ui` плагина. БЭМ-классы (`.base-card__header`) — публичный API.

- **Тема «как в системе»** — `data-theme="system"`: тёмная при `prefers-color-scheme: dark`. Переключать тему из кода — `useColorMode()` (`mode`: `light`, `dark`, `system`; выбор сохраняется в localStorage), кнопка для шапки — `BaseColorModeButton`. Чтобы тема из localStorage применялась до загрузки скриптов, добавьте в `<head>`: `<script>document.documentElement.dataset.theme = localStorage.getItem('rise-color-mode') || 'system'</script>`.
- **Размер компонента** — проп `sizeScale` (проценты): 75 / 87.5 / 100 / 112.5 / 125 ≈ xs / sm / md / lg / xl, контролы 24–40px. Кнопка, поле, селект и переключатели одного `sizeScale` одной высоты.
- **Цвет одного компонента** — проп `color` (`{ bg: { base, hover, active, focus }, text: { … } }`). Вложенные в него компоненты этот цвет не наследуют.
- **Слои** — токены `--rise-z-overlay` (1000: окна, боковые панели, тур, поиск на весь экран, выпадающие панели, календарь, контекстные меню — сверх токена добавляется место слоя в порядке открытия), `--rise-z-toast` (2000: уведомления), `--rise-z-tooltip` (3000: подсказки), `--rise-z-max` (9999: просмотр изображения). Если у приложения свои слои (липкая шапка с `z-index: 1000` и т. п.), переопределите токены в `:root` (см. «Слои»).
- **Контраст.** Пары «текст/фон» токенов проходят WCAG 2.2 AA в обеих темах — `npm run test:contrast`, отчёт [docs/design/contrast.md](docs/design/contrast.md).
- **Переменные 1.x** (`--color-accent`, `--color-text-muted`, `--border-radius-base`…) оставлены алиасами новых токенов для CSS приложения, но компоненты их больше не читают: перекрашивайте через `--rise-*`. В 2.0 алиасы остаются, удалены они будут в следующей мажорной версии.

### Темы за 5 минут

Свой облик — из цвета бренда и нескольких входов. `createTheme()` строит палитру 50…950 в OKLCH и гарантирует контраст WCAG 2.2 AA в светлой и тёмной теме (светлый бренд для кнопок затемняется — `theme.adjusted`).

```ts
import { createApp } from 'vue'
import { createTheme, createUiKitPlugin } from '@ramzes1385/rise-ui-kit'

const brand = createTheme({
  name: 'brand',             // → <html data-rise-theme="brand">
  primary: '#0f766e',        // единственный обязательный цвет
  neutral: 'tinted',         // 'tinted' (серый с тоном бренда) | 'gray' | HEX: '#64748b'
  radius: 'lg',              // 'none' | 'sm' | 'md' | 'lg' | 'full' | число px
  density: 'compact',        // 'compact' | 'default' | 'comfortable' | множитель
  font: { sans: '"Golos Text", system-ui, sans-serif' },
  shadows: 'soft',           // 'none' | 'soft' | 'default' | 'strong' | множитель
  motion: 'subtle',          // 'none' | 'subtle' | 'default' | 'expressive'
})

createApp(App).use(createUiKitPlugin({ theme: brand })) // или theme: 'corporate' — готовый пресет
```

- **Пресеты** `THEME_PRESETS`: `rise` (вид кита), `corporate` (админки и таблицы), `playful` (потребительские приложения), `minimal` (инструменты и документация). Переключение в рантайме — `useTheme().setTheme('playful')` или `setTheme(createTheme({…}))`; список — `useTheme().themes`.
- **Без JS** — `brand.css` можно положить в CSS приложения как есть: это только CSS-переменные на `[data-rise-theme="brand"]`. **SSR** — `useTheme().css` (строка для `<style>` в `<head>`); на сервере `applyTheme` ничего не делает. **CSP** — `createUiKitPlugin({ themeNonce })` или `applyTheme(theme, { nonce })`.
- **Тема на области** — `applyTheme(theme, { target: element })`: ставит `data-rise-theme` и, если его нет, `data-theme` (режим ближайшего предка). Правило: `data-rise-theme` и `data-theme` — на одном элементе.
- Не заданный вход тема не трогает: значение остаётся от кита или от `:root` приложения. Что угодно ещё — вход `tokens` (`{ '--rise-button-radius': '999px' }`); чёрному бренду в тёмной теме — `primaryDark: '#fafafa'`.
- Проверка своей темы — `createTheme(…).contrast` (все пары `npm run test:contrast`, у каждой `ok`). Подробно — [DESIGN_SYSTEM, «Темы бренда»](docs/design/DESIGN_SYSTEM.md).

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

Строки интерфейса кита (подписи кнопок, доступные имена, «Нет данных»), формат дат, чисел и валют, множественное число, первый день недели, сортировка и поиск без учёта регистра зависят от языка. Свой язык и свои строки добавляются без форка. Язык один на страницу, и меняется он на лету — компоненты перерисовываются сразу. Готовые языки:

| Код | Язык | Языковой тег Intl | Первый день недели |
|---|---|---|---|
| `ru` | русский (по умолчанию) | `ru-RU` | понедельник |
| `en` | английский | `en-US` | воскресенье |
| `kk` | казахский, кириллица | `kk-KZ` | понедельник |
| `uz` | узбекский, латиница | `uz-Latn-UZ` | понедельник |
| `zh` | китайский упрощённый | `zh-CN` | понедельник |
| `ja` | японский | `ja-JP` | воскресенье |

Словари экспортируются из пакета по имени (`import { kk, uz, zh, ja } from '@ramzes1385/rise-ui-kit'`). Переводы `kk`, `uz`, `zh`, `ja` сделаны без носителя языка — до выпуска их стоит показать носителям; замечания по формулировкам удобно вносить через `defineLocale(kk, { text: { … } })`.

**Задать язык** — любым из трёх способов:

```ts
app.use(createUiKitPlugin({ locale: 'en' })) // 1. при создании приложения
// <BaseApp :locale="lang"> … </BaseApp>       // 2. проп, следует за значением
setLocale('en')                                // 3. из любого места
```

**Переопределить строки** — `defineLocale(base, overrides)` заменяет только переданные ключи, остальные берутся из `base`. Результат принимают плагин, `<BaseApp locale>` и `setLocale()`:

```ts
import { createUiKitPlugin, defineLocale, en, ru } from '@ramzes1385/rise-ui-kit'

app.use(createUiKitPlugin({ locale: defineLocale(ru, { text: { EMPTY: 'Пока ничего нет' } }) }))
const enGB = defineLocale(en, { code: 'en-GB', intl: 'en-GB', firstDayOfWeek: 1 })
```

**Добавить свой язык** — словарь типа `UiKitLocale` (TypeScript подскажет все ключи; проще всего `defineLocale(en, { … })` поверх готового) и `registerLocale()`. Регистрация идёт по `locale.code`; после неё код принимают `setLocale('de')`, `<BaseApp locale="de">` и `createUiKitPlugin({ locale: 'de' })`, а `useLocale().locales` отдаёт список кодов для переключателя языка:

```ts
import { defineLocale, en, registerLocale, setLocale, useLocale } from '@ramzes1385/rise-ui-kit'

registerLocale(
	defineLocale(en, {
		code: 'de',
		intl: 'de-DE', // тег для Intl: даты, числа, множественное число, сортировка
		firstDayOfWeek: 1, // 0 — воскресенье, 1 — понедельник
		text: { EMPTY: 'Keine Daten', CANCEL: 'Abbrechen' },
		aria: { CLOSE: 'Schließen' },
	}),
)
setLocale('de')

const { locale, locales, formatNumber, formatDate, plural } = useLocale()
plural({ one: '{n} file', other: '{n} files' }, 3) // '3 files'
```

Повторная регистрация того же кода заменяет словарь (в том числе у встроенных `ru` и `en`); включённый язык обновляется сразу. Неизвестный код `setLocale` не принимает: язык остаётся прежним, в консоль идёт предупреждение со списком доступных кодов.

**Форматы.** Календарь, выбор даты, график, канбан, диаграмма активности, расписание и другие компоненты берут формат дат и чисел (`locale.intl`) и первый день недели (`locale.firstDayOfWeek`) из языка кита, если не заданы пропсы `locale` и `firstDayOfWeek` — явный проп главнее. Поиск и сравнение текста идут по языку кита: без учёта регистра, «е» равна «ё», письмо без регистра (китайский, японский, корейский) сравнивается как есть. Внутренние вычисления (часовой пояс в расписании и `.ics`, ISO-даты) от языка не зависят. Строки из props (`placeholder`, `label`) приложение переводит само.

Подробнее, с живыми примерами и кодом — страница Storybook «Foundations / Localization».

Китайский и японский: в словарях `zh` (неделя с понедельника) и `ja` (с воскресенья) у существительных одна форма множественного числа со счётным словом внутри строки, между числом и иероглифами стоит пробел. Тексты написаны без носителя языка — перед выпуском в продукт их стоит показать переводчику. Названия эмодзи в `BaseEmojiPicker` на китайский и японский не переведены (берутся английские), своё имя задают пропом `emojis`. Ввод через IME (пиньинь, кана) не принимает Enter, подтверждающий выбор иероглифа, за действие поля; цифры полной ширины в числовых, телефонных и платёжных полях приводятся к обычным. Подробности — docs/design/CHANGES_FOR_APPS.md.

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

**Полоса загрузки при переходах** — `useLoadingBar()`: `start`, `finish`, `error`; полосу показывает `BaseApp`. Хранилище одно на страницу, поэтому вызывать можно и до монтирования приложения — например, в охранниках роутера (кит vue-router не импортирует):

```ts
import { useLoadingBar } from '@ramzes1385/rise-ui-kit'

const loadingBar = useLoadingBar()
router.beforeEach(() => loadingBar.start())
router.afterEach(() => loadingBar.finish())
router.onError(() => loadingBar.error())
```

- Полоса растёт до 90 % и ждёт `finish`; повторный `start` во время загрузки ничего не меняет, `finish` и `error` без `start` — тоже. Счётчика вложенных загрузок нет: одна полоса на одну загрузку страницы.
- Для скринридера — `role="progressbar"` без значения (ход оценочный) и с именем «Загрузка страницы»; шаги роста не объявляются. `isLoading` удобно поставить в `aria-busy` основной области: `<main :aria-busy="loadingBar.isLoading.value">`.
- При `prefers-reduced-motion: reduce` полоса не движется: видна во всю ширину, пока идёт загрузка. Проп `loadingBar` у `BaseApp` — толщина `height` (3 px) и имя `label`.
- Полоса одна на страницу, поэтому и `BaseApp` на странице должен быть один: второй `BaseApp` нарисует ту же полосу ещё раз.

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

Исключение — сервисы всего приложения: `useToast`, `useOverlay`, `useConfirm`, `useLoadingBar`, `useColorMode`, `useLocale`, а также `setLocale`, `defineLocale`, `registerLocale` и словари `ru`, `en` импортируются из корня пакета по имени, как компоненты.

Исключение — сервисы всего приложения: `useToast`, `useOverlay`, `useConfirm`, `useLoadingBar`, `useColorMode`, `useLocale`, а также `setLocale`, `defineLocale` и словари `ru`, `en`, `zh`, `ja` импортируются из корня пакета по имени, как компоненты.

Видеоплеер `BaseMediaPlayer` и его типы — только из подпути `@ramzes1385/rise-ui-kit/media`: в корень пакета и в плагин он не входит, поэтому приложения без плеера его код не загружают. Стили плеера — отдельным файлом `@ramzes1385/rise-ui-kit/media.css` (см. «Подключение стилей»).

Подпути из `package.json#exports`: `/components`, `/composables`, `/utils`, `/icons` (константы спрайта и `createIconPlugin`), `/media` (видеоплеер), `/map3d` (3D-карта этажей), `/styles` (`/styles.css`), `/media.css` (стили плеера), `/icons.svg`, а также подпуть на каждый компонент (`/BaseButton`, `/BaseSelect`, …) и `/tokens.css` для них (см. «Точечная установка»).

### 3D-карта этажей

3D-карта `BaseImageMap3D` (этажи стопкой, модели GLB, камера, выбор, каталог и маршруты на three.js) — только из подпути `@ramzes1385/rise-ui-kit/map3d`, как плеер из `/media`. Ей нужен `three` — необязательная peer-зависимость, которую ставит только приложение с 3D-картой:

```bash
npm i three
npm i -D @types/three
```

```ts
import { BaseImageMap3D } from '@ramzes1385/rise-ui-kit/map3d'
```

Без `three` основной вход работает как прежде, а импорт `/map3d` не соберётся. Данные — тот же JSON, что у `BaseImageMap` и `BaseImageMapEditor`, плюс необязательные 3D-поля; без WebGL карта сама показывает 2D-план. Подробно — [docs/reference/MAP3D.md](docs/reference/MAP3D.md).

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

### Отдельные пакеты

Крупные компоненты можно ставить отдельными пакетами — по образцу плеера, со своим релизом и стилями. Пакеты строятся из публичных входов кита: он и Vue — их peerDependencies, язык (`setLocale()`, `defineLocale()`), настройки плагина и иконки приходят из кита.

| Пакет | Что внутри | Стили |
|---|---|---|
| `@ramzes1385/rise-media-player` | `BaseMediaPlayer`, `BasePresentationPlayer` | `@ramzes1385/rise-media-player/styles.css` |
| `@ramzes1385/rise-maps` | `BaseMap`, `BaseImageMap`, `BaseImageMapEditor`; `BaseImageMap3D` — вход `/map3d`, `three` необязателен | `@ramzes1385/rise-maps/styles.css` |
| `@ramzes1385/rise-editor` | `BaseEditor` | `@ramzes1385/rise-editor/styles.css` |

Пока пакеты не опубликованы, их содержимое готовит скрипт кита: `node build/packages/extract.mjs <media|maps|editor> <пустая папка>`, затем в папке `npm install` и `npm run build`. Что внутри, как переносить и что решить владельцу до публикации (репозитории, тесты и stories в пакетах, словарь, версия кита) — в [build/packages/README.md](build/packages/README.md). Компоненты остаются и в ките — приложения, которым не нужна точечная установка, ничего не меняют.

## Документация

| Документ | Что внутри |
|---|---|
| [Storybook](https://ramzes1385.github.io/Rise-UI-KIT/) | Все компоненты вживую: варианты, состояния, клавиатура, обе темы, таблицы props и событий |
| [Компоненты](docs/reference/COMPONENTS.md) | Справочник: назначение, основные props и события, примеры |
| [Composables](docs/reference/COMPOSABLES.md) | `useDebounce`, `useClickOutside`, `useEscapeKey`, `useFocusTrap`, `useHotkeys` и другие |
| [Utils](docs/reference/UTILS.md) | Даты, файлы, цвета, субтитры, медиа, проверка ссылок, координаты `position: fixed` |
| [3D-карта этажей](docs/reference/MAP3D.md) | Вход `/map3d`: установка `three`, 3D-поля данных, модели GLB, камера, клавиатура, фолбэк на 2D |
| [SEO-разметка](docs/reference/SEO.md) | Проп `seo`: JSON-LD schema.org у компонентов и проверка в Google Rich Results и Яндекс Вебмастере |
| [Переход на 2.0](docs/v2/MIGRATION.md) | Что изменилось для приложения и что сделать при обновлении с 1.x |
| [Что заметит приложение после редизайна](docs/design/CHANGES_FOR_APPS.md) | Значения по умолчанию, DOM, доступность, токены |
| [Дизайн-система](docs/design/DESIGN_SYSTEM.md) | Токены `--rise-*`, темы, размеры, правила стилей |
| [Разработка](docs/reference/DEVELOPMENT.md) | Стек, структура репозитория, Storybook, тесты, сборка, CI |
| [Ведение репозитория](docs/CONTRIBUTING.md) | Ветки, коммиты, pull request, релизы, новый компонент |

---

## Лицензия

MIT (поле `license` в `package.json`). Сторонние материалы в пакете — значки видеоплеера (Font Awesome Free) и данные эмодзи (emojibase-data, Unicode CLDR) — под своими лицензиями.
