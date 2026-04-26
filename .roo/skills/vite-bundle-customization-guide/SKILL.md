---
name: vite-bundle-customization-guide
description: >-
  Руководство по кастомизации Vite-сборки для Vue 3 — что можно менять свободно,
  что менять осторожно, что трогать запрещено. Привязан к скиллу
  vite-bundle-config. Каждое ограничение имеет техническое обоснование.
modeSlugs:
  - code
  - architect
  - debug
---

# Руководство по кастомизации Vite Bundle Config (Vue 3)

## Общий принцип маркировки

- 🟢 **Зелёное** — меняй свободно, адаптируй под свой проект
- 🟡 **Жёлтое** — меняй осторожно, понимая последствия и допустимые диапазоны
- 🔴 **Красное** — не трогай без веской причины, это выверенные best practices

---

## 1. Структура папки `build/`

### 🔴 НЕ МЕНЯЙ: Концепцию модульного разделения

build/
├── constants.ts ← Отдельный файл констант — ОБЯЗАТЕЛЬНО
├── plugins/
│ ├── index.ts ← Агрегатор плагинов — ОБЯЗАТЕЛЬНО
│ ├── vue.ts ← Один плагин = один файл — ОБЯЗАТЕЛЬНО
│ ├── svg.ts
│ ├── images.ts
│ ├── legacy.ts
│ ├── compression.ts
│ └── obfuscation.ts
├── config/
│ ├── alias.ts ← Отдельные конфиги — ОБЯЗАТЕЛЬНО
│ ├── server.ts
│ ├── css.ts
│ ├── build.ts
│ └── resolve.ts
└── utils/
└── helpers.ts ← Утилиты отдельно — ОБЯЗАТЕЛЬНО

**Почему нельзя трогать:**
Единственная ответственность (SRP — Чистый код, гл.10). Монолитный `vite.config.ts` на 500+ строк невозможно поддерживать, ревьюить, искать баги. Каждый файл отвечает за одну область — при изменении SCSS ты открываешь только `css.ts`, при добавлении плагина — только `plugins/`.

### 🟢 МОЖНО МЕНЯТЬ: Названия папок и добавление новых файлов

Переименование — если в команде другие соглашения

build/ → .vite/
build/ → config/
build/ → \_build/

Добавление новых файлов — под потребности Vue-проекта

build/plugins/pwa.ts # PWA-плагин
build/plugins/i18n.ts # vue-i18n интернационализация
build/plugins/auto-import.ts # Авто-импорт Vue API (ref, computed, watch)
build/plugins/components.ts # Авто-регистрация Vue-компонентов
build/plugins/layouts.ts # Авто-подключение layout-компонентов
build/plugins/pages.ts # Файловый роутинг (vite-plugin-pages)
build/config/optimization.ts # Дополнительные оптимизации
build/utils/logger.ts # Логирование сборки
build/utils/env.ts # Работа с переменными окружения

---

## 2. Файл `constants.ts`

### 🟢 СВОБОДНО МЕНЯЙ

| Константа              | По умолчанию | Что можно менять             | Пример                            |
| ---------------------- | ------------ | ---------------------------- | --------------------------------- |
| `DEV_SERVER_PORT`      | `3000`       | Любой свободный порт         | `5173`, `8080`                    |
| `DEV_SERVER_HOST`      | `'0.0.0.0'`  | Хост сервера                 | `'localhost'` если не нужен LAN   |
| `PREVIEW_PORT`         | `4173`       | Любой свободный порт         | `4000`, `9090`                    |
| `SOURCE_DIR`           | `'src'`      | Название папки с исходниками | `'app'`, `'source'`               |
| `OUTPUT_DIR`           | `'dist'`     | Название выходной папки      | `'build'`, `'output'`, `'public'` |
| `ASSETS_DIR`           | `'assets'`   | Название папки ассетов       | `'static'`, `'resources'`         |
| `ASSET_SUBDIRS.js`     | `'js'`       | Поддиректория JS             | `'scripts'`                       |
| `ASSET_SUBDIRS.css`    | `'css'`      | Поддиректория CSS            | `'styles'`                        |
| `ASSET_SUBDIRS.images` | `'images'`   | Поддиректория картинок       | `'img'`, `'pictures'`             |
| `ASSET_SUBDIRS.fonts`  | `'fonts'`    | Поддиректория шрифтов        | `'webfonts'`                      |
| `ASSET_SUBDIRS.media`  | `'media'`    | Поддиректория медиа          | `'video'`, `'audio'`              |

### 🟡 МЕНЯЙ ОСТОРОЖНО

| Константа                      | По умолчанию | Допустимый диапазон | Что будет при выходе за диапазон                                       |
| ------------------------------ | ------------ | ------------------- | ---------------------------------------------------------------------- |
| `IMAGE_QUALITY.mozjpeg`        | `75`         | `60–85`             | Ниже 60 — видны артефакты сжатия, выше 85 — экономия размера < 5%      |
| `IMAGE_QUALITY.webp`           | `80`         | `65–90`             | Ниже 65 — мыльные фото, выше 90 — файл почти как оригинал              |
| `IMAGE_QUALITY.avif`           | `60`         | `40–75`             | Ниже 40 — заметная деградация, выше 75 — теряется преимущество формата |
| `IMAGE_QUALITY.pngQuality.min` | `65`         | `50–70`             | Ниже 50 — полосы на градиентах                                         |
| `IMAGE_QUALITY.pngQuality.max` | `80`         | `75–90`             | Выше 90 — минимальная экономия                                         |
| `IMAGE_QUALITY.gif`            | `70`         | `50–128`            | Ниже 50 — потеря цветов в анимации                                     |
| `COMPRESSION_THRESHOLD_BYTES`  | `1024` (1KB) | `512–2048`          | Ниже 512 — сжатие может увеличить файл (overhead заголовков)           |

### 🔴 НЕ МЕНЯЙ БЕЗ ГЛУБОКОГО ПОНИМАНИЯ

| Константа                   | Значение                   | Почему нельзя трогать                                                                                                                                                                                                                                     |
| --------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MIN_CHUNK_SIZE_BYTES`      | `20 * 1024` (20KB)         | Меньше — HTTP-overhead убьёт производительность. Каждый чанк = отдельный HTTP-запрос. Браузер ограничен 6 параллельными соединениями на домен (HTTP/1.1). Даже с HTTP/2 есть overhead на заголовки, TLS, парсинг. Google рекомендует минимум 20KB на чанк |
| `MAX_CHUNK_WARNING_SIZE_KB` | `250`                      | Больше — Long Tasks на слабых устройствах. Парсинг 250KB JS занимает ~100ms на мобильном Moto G4. Google рекомендует < 300KB на чанк. Lighthouse штрафует за Total Blocking Time                                                                          |
| `MAX_ASSET_WARNING_SIZE_KB` | `150`                      | Больше — блокировка рендеринга. LCP (Largest Contentful Paint) напрямую страдает от тяжёлых ассетов                                                                                                                                                       |
| `BROTLI_COMPRESSION_LEVEL`  | `11`                       | Это максимум алгоритма. Production-сборка не спешит — пусть жмёт по полной. Разница между 10 и 11 — ~2% размера при +30% времени сборки, но сборка происходит один раз                                                                                    |
| `GZIP_COMPRESSION_LEVEL`    | `9`                        | Аналогично — максимальное сжатие для production. Gzip 9 vs 6: файл меньше на 3–5%, сборка дольше на 50%, но это одноразовая операция                                                                                                                      |
| `TERSER_COMPRESS_PASSES`    | `2`                        | 1 проход — недожмёт, упустит 3–5% оптимизаций. 3+ прохода — прирост < 1%, но сборка в 2 раза дольше. 2 — математически оптимальный баланс                                                                                                                 |
| `PRODUCTION_DROP_CONSOLE`   | `[log, info, debug, warn]` | `console.log` в production — утечка внутренней информации (пути, данные, состояние). Замедление рендеринга — каждый console.log сериализует объекты. Lighthouse считает это bad practice                                                                  |

---

## 3. Файл `alias.ts`

### 🟢 СВОБОДНО МЕНЯЙ

````typescript
// ДОБАВЛЯЙ алиасы под структуру своего Vue-проекта
'@widgets': resolveFromRoot(SOURCE_DIR, 'widgets'),
'@features': resolveFromRoot(SOURCE_DIR, 'features'),
'@entities': resolveFromRoot(SOURCE_DIR, 'entities'),
'@shared': resolveFromRoot(SOURCE_DIR, 'shared'),
'@pages': resolveFromRoot(SOURCE_DIR, 'pages'),
'@modules': resolveFromRoot(SOURCE_DIR, 'modules'),

// УДАЛЯЙ ненужные
// Нет папки directives? Удали '@directives'
// Нет папки layouts? Удали '@layouts'

// ПЕРЕИМЕНОВЫВАЙ — если в команде свои соглашения
'@hooks': resolveFromRoot(SOURCE_DIR, 'composables'),     // Альтернативное название
'@services': resolveFromRoot(SOURCE_DIR, 'api'),          // Если привычнее
'@store': resolveFromRoot(SOURCE_DIR, 'stores'),           // Единственное число


// Корневой alias '@' → src/
'@': srcPath

**Почему:** Это стандарт Vue-экосистемы. Его ожидают:
- VS Code + Volar — автокомплит, Go to Definition, рефакторинг
- ESLint + eslint-import-resolver — проверка импортов
- Vitest — резолвинг модулей в тестах
- Storybook — загрузка Vue-компонентов
- Vue DevTools — отображение дерева компонентов
- Nuxt — если мигрируешь на SSR

Переименование `@` сломает все инструменты Vue-экосистемы одновременно.

### 🔴 ОБЯЗАТЕЛЬНОЕ ПРАВИЛО

При ЛЮБОМ изменении alias — синхронизируй `tsconfig.json`:

```jsonc
// tsconfig.json → compilerOptions.paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
````

Что сломается без синхронизации:

TypeScript покажет ошибки
Cannot find module '@components/...'
Volar потеряет автокомплит пропсов, эмитов, слотов Vue-компонентов
vue-tsc --noEmit
упадёт при сборке
Vitest не найдёт модули при запуске тестов
Навигация по
Ctrl+Click
перестанет работать

## 4. Файл `css.ts`

### 🟢 СВОБОДНО МЕНЯЙ

```ts
// Глобальные SCSS импорты — под свой Vue-проект
const GLOBAL_SCSS_IMPORTS = [
	'@use "@styles/variables" as *;',
	'@use "@styles/mixins" as *;',
	'@use "@styles/functions" as *;',
	'@use "@styles/breakpoints" as *;',
	'@use "@styles/animations" as *;',
	'@use "@styles/typography" as *;',
	'@use "@styles/transitions" as *;',
].join('\n')
```

```ts
// Формат имён CSS-модулей в development
generateScopedName: '[name]__[local]--[hash:base64:5]'

// Альтернативы:
generateScopedName: '[folder]__[local]__[hash:base64:4]'
generateScopedName: '[local]--[hash:base64:6]'
```

### 🟡 МЕНЯЙ ОСТОРОЖНО

| Длина hash | Уникальных комбинаций | Риск коллизий                    |
| ---------- | --------------------- | -------------------------------- |
| 5          | ~1 миллиард           | Опасно при > 500 Vue-компонентов |
| 6          | ~68 миллиардов        | Безопасно для средних проектов   |
| 8          | ~281 триллион         | Безопасно для любых проектов ✅  |
| 10         | ~10^18                | Избыточно, увеличивает CSS       |

Рекомендация: Не опускай ниже 6 для production.

### 🔴 НЕ МЕНЯЙ

| Параметр           | Значение            | Почему                                                                                                           |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `api`              | `'modern-compiler'` | `'legacy'` будет удалён в sass 3.0. Modern быстрее в 2–3 раза                                                    |
| `localsConvention` | `'camelCaseOnly'`   | В `<script setup>` нельзя использовать `styles['my-class']`. `'camelCase'` без `Only` создаёт дубли — лишний вес |
| `devSourcemap`     | `!isProduction`     | В dev — отладка стилей Vue-компонентов. В production — утечка исходного кода                                     |
| `charset`          | `false`             | Vite выставляет charset через HTML meta. Дублирование в `<style>` блоках — лишние байты                          |

## 5. Файл `server.ts`

### 🟢 СВОБОДНО МЕНЯЙ

```ts
// Proxy — целиком под твой бэкенд
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
  '/auth': {
    target: 'http://localhost:9090',
    changeOrigin: true,
  },
  '/ws': {
    target: 'ws://localhost:8080',
    ws: true,
  },
  '/uploads': {
    target: 'http://cdn.local:3001',
    changeOrigin: true,
  },
}
```

```ts
// Автоматическое открытие браузера
open: true // Выключи: false
open: '/dashboard' // Конкретная Vue-страница
open: '/login' // Страница логина
```

```ts
// Строгий порт
strictPort: false // true — упадёт если порт занят
```

### 🟡 МЕНЯЙ ОСТОРОЖНО

```ts
// Polling файловой системы
watch: {
  usePolling: false,
}
```

| Значение | Когда использовать                  | Последствия             |
| -------- | ----------------------------------- | ----------------------- |
| `false`  | Нативная ОС (macOS, Linux, Windows) | Быстро, 0% CPU ✅       |
| `true`   | Docker, WSL 1, NFS, VirtualBox      | CPU +5–15% постоянно ⚠️ |

Правило: Ставь `true` ТОЛЬКО если HMR Vue-компонентов не срабатывает.

### 🔴 НЕ МЕНЯЙ

| Параметр      | Значение                                             | Почему                                                                            |
| ------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `cors`        | `true`                                               | Без CORS `fetch` из Vue-приложения к бэкенду на другом порту заблокирован         |
| `hmr.overlay` | `true`                                               | Показывает ошибки компиляции Vue SFC прямо в браузере. Без него — только терминал |
| `ignored`     | `['**/node_modules/**', '**/dist/**', '**/.git/**']` | Без этого Vite следит за 50K+ файлами, HMR замедляется в 10–50 раз                |

## 6. Файл `build.ts` — Сборка и чанки

### 🟢 СВОБОДНО МЕНЯЙ: Состав групп пакетов

```ts
// Vue экосистема — добавляй пакеты Vue
const VUE_ECOSYSTEM_PACKAGES = [
	'vue',
	'@vue',
	'vue-router',
	'pinia',
	'vue-i18n',
	'@vueuse/core',
	'@vueuse/head',
	'@vueuse/integrations',
	'vue-toastification',
	'@pinia/colada',
]

// UI-фреймворк — замени на свой
const UI_FRAMEWORK_PACKAGES = ['element-plus', '@element-plus']

// Альтернативы для Vue:
// ['vuetify']
// ['naive-ui']
// ['primevue', '@primevue']
// ['ant-design-vue', '@ant-design']
// ['quasar']
// ['vant']
// ['varlet', '@varlet']

// Утилитарные библиотеки — добавляй свои
const UTILITY_PACKAGES = [
	'lodash',
	'lodash-es',
	'axios',
	'dayjs',
	'date-fns',
	'zod',
	'uuid',
	'nanoid',
	'qs',
	'defu',
	'deepmerge',
	'colord',
]

// Тяжёлые библиотеки — выделяй в отдельные чанки
if (id.includes('echarts')) return 'vendor-charts'
if (id.includes('monaco-editor')) return 'vendor-editor'
if (id.includes('three')) return 'vendor-3d'
if (id.includes('pdf')) return 'vendor-pdf'
if (id.includes('xlsx') || id.includes('exceljs')) return 'vendor-excel'
if (id.includes('tinymce') || id.includes('tiptap')) return 'vendor-editor'
if (id.includes('mapbox') || id.includes('leaflet')) return 'vendor-map'
```

### 🟢 МОЖНО МЕНЯТЬ: Выходная директория

```ts
outDir: 'dist' // По умолчанию
outDir: 'build' // Если привычнее
outDir: 'output' // Если так принято в команде
```

### 🟡 МЕНЯЙ ОСТОРОЖНО

| Параметр            | По умолчанию | Допустимо               | Последствия                                                                                     |
| ------------------- | ------------ | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `target`            | `'es2020'`   | `'es2015'` – `'esnext'` | `es2015` — бандл +15–20%; `es2022` — отвалится Safari < 16.4; `esnext` — только свежие браузеры |
| `sourcemap`         | `false`      | `false`, `'hidden'`     | `'hidden'` — для Sentry, удали .map из деплоя. НИКОГДА `true` — утечка Vue-компонентов          |
| `cssCodeSplit`      | `true`       | `true`, `false`         | `false` — один CSS, но грузит `<style scoped>` ВСЕХ компонентов сразу                           |
| `assetsInlineLimit` | `4096`       | `0` – `10240`           | Файлы < лимита → base64 в JS. Для SVG-иконок 2–4KB — хорошо. Для фото > 8KB — плохо             |

### 🔴 НЕ МЕНЯЙ: Выбор минификатора

```ts
minify: 'terser'
```

| Критерий              | esbuild          | terser         |
| --------------------- | ---------------- | -------------- |
| Скорость              | В 10–20x быстрее | Медленнее      |
| Размер бандла         | Больше на 5–15%  | Меньше ✅      |
| Multi-pass сжатие     | Нет              | Да ✅          |
| Удаление console.\*   | Нет              | Да ✅          |
| Dead code elimination | Базовый          | Продвинутый ✅ |

Production — критичен размер, не скорость сборки.

### 🔴 НЕ МЕНЯЙ: Параметры Terser

```ts
terserOptions: {
  compress: {
    drop_debugger: true,
    // debugger в production = браузер пользователя остановится

    pure_funcs: [...PRODUCTION_DROP_CONSOLE],
    // Удаление console.* — безопасность + производительность

    passes: TERSER_COMPRESS_PASSES, // 2
    // 1 — недожмёт; 3+ — прирост < 1%, сборка 2x дольше

    dead_code: true,
    // Удаление недостижимого кода

    collapse_vars: true,
    // let a = 1; f(a) → f(1)

    reduce_vars: true,
    // Упрощение переменных используемых один раз

    hoist_funs: true,
    // Поднятие функций — уменьшает размер скоупов

    hoist_vars: false,
    // НИКОГДА true — ломает let/const в Safari 10–11

    ecma: 2020,
    module: true,
    toplevel: true,
    unsafe_math: false,
    unsafe_proto: false,
  },
  mangle: {
    safari10: true,
    // Фикс бага Safari 10–11 с деструктуризацией в catch

    toplevel: true,
    // Переименование переменных верхнего уровня
  },
  format: {
    comments: false,
    // Комментарии в production — мёртвый вес

    ascii_only: true,
    // Экранирование non-ASCII — безопасность кодировки

    ecma: 2020,
  },
}
```

### 🔴 НЕ МЕНЯЙ: Rollup tree-shake

```ts
rollupOptions: {
  output: {
    experimentalMinChunkSize: MIN_CHUNK_SIZE_BYTES, // 20KB
    compact: true,
  },
  treeshake: {
    moduleSideEffects: 'no-external',
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
}
```

### 🔴 НЕ МЕНЯЙ: Порядок проверок в manualChunks

```ts
function createManualChunks(moduleId: string): string | undefined {
	// ПЕРВАЯ ПРОВЕРКА — без неё ВСЕ файлы Vue-проекта попадут в чанки
	if (!moduleId.includes('node_modules')) return undefined

	// ПОРЯДОК: от частного к общему
	if (isFromPackages(moduleId, VUE_ECOSYSTEM_PACKAGES)) return 'vendor-vue'
	if (isFromPackages(moduleId, UI_FRAMEWORK_PACKAGES)) return 'vendor-ui'
	if (isFromPackages(moduleId, UTILITY_PACKAGES)) return 'vendor-utils'

	return 'vendor-libs' // Остальные — в конце
}
```

Почему Vue отдельно: Vue-ядро загружается на КАЖДОЙ странице. Отдельный чанк кэшируется один раз. Если смешать с другими vendor — при обновлении axios инвалидируется кэш Vue.

### 🔴 НЕ МЕНЯЙ: modulePreload

```ts
modulePreload: {
	polyfill: true
}
```

Safari < 17 не поддерживает `<link rel="modulepreload">`. Без полифилла модули грузятся водопадом. Polyfill весит ~1KB gzip.

## 7. Плагины — `build/plugins/`

### 🟢 СВОБОДНО ДОБАВЛЯЙ новые Vue-плагины

```ts
// Авто-импорт Vue API (ref, computed, watch без импорта)
// build/plugins/auto-import.ts → unplugin-auto-import

// Авто-регистрация Vue-компонентов
// build/plugins/components.ts → unplugin-vue-components

// Файловый роутинг (как в Nuxt)
// build/plugins/pages.ts → vite-plugin-pages

// Авто-подключение Vue layout-компонентов
// build/plugins/layouts.ts → vite-plugin-vue-layouts

// Иконки как Vue-компоненты
// build/plugins/icons.ts → unplugin-icons

// Vue Macros (расширенные макросы для <script setup>)
// build/plugins/macros.ts → vue-macros

// PWA
// build/plugins/pwa.ts → vite-plugin-pwa

// Vue DevTools в production для отладки
// build/plugins/devtools.ts → vite-plugin-vue-devtools
```

### 🟢 СВОБОДНО УБИРАЙ ненужные

```ts
// Нет legacy-требований? Убери legacy.ts
// Полифиллы добавляют 30–80KB

// Не нужна обфускация? Убери obfuscation.ts
// Замедляет сборку в 3–5 раз
```

### 🟡 ОСТОРОЖНО

```ts
// vite-plugin-imagemin — может не собраться на CI
// Причина: native-зависимости (libpng, mozjpeg, gifsicle)
// Решения:
// 1. apt-get install -y libpng-dev libjpeg-dev на CI
// 2. Заменить на vite-plugin-image-optimizer (sharp)
// 3. Оптимизировать изображения ДО сборки (squoosh, tinypng)

// rollup-plugin-obfuscator — замедляет сборку в 3–5x
// Нужен ТОЛЬКО если скрываешь бизнес-логику
// Для Vue SPA, публичного сайта — НЕ НУЖНО
// Для SDK с платной лицензией — возможно нужно
```

### 🔴 НЕ УБИРАЙ

| Плагин                        | Почему обязателен                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@vitejs/plugin-vue`          | Без него Vue SFC не компилируются. Vite не понимает `<template>`, `<script setup>`, `<style scoped>` |
| `compression` (Brotli + Gzip) | Бесплатная оптимизация: bundle 300KB → 75KB (.br). Ничего не ломает                                  |

## 8. Файл `svg.ts`

### 🟢 СВОБОДНО МЕНЯЙ

```ts
// Режим загрузки SVG по умолчанию
defaultImport: 'component' // Vue-компонент: <IconArrow />
defaultImport: 'url' // Путь: <img :src="iconUrl" />
defaultImport: 'raw' // Строка: v-html="svgRaw"
```

Как выбрать для Vue:

- `'component'` — иконки с динамическим цветом через CSS, hover-анимации, `v-bind` на атрибуты
- `'url'` — декоративные SVG в `<img>`, фоны через `:style`
- `'raw'` — вставка в Canvas, генерация PDF

### 🟢 МОЖНО ДОБАВЛЯТЬ плагины SVGO

```ts
{ name: 'removeStyleElement' },
{ name: 'removeScriptElement' },
{ name: 'addClassesToSVGElement',
  params: { className: 'svg-icon' } },
```

### 🔴 НЕ МЕНЯЙ

| Параметр        | Значение | Почему                                                                                                            |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `removeViewBox` | `false`  | `true` сломает масштабирование SVG. Без viewBox не работают CSS `width`/`height`, `object-fit`, responsive-дизайн |
| `removeTitle`   | `false`  | `<title>` — tooltip + текст для screen readers. Удаление ломает Accessibility. Lighthouse штрафует                |
| `multipass`     | `true`   | Многопроходная оптимизация даёт на 5–15% меньше SVG                                                               |

## 9. Файл `compression.ts`

### 🟢 СВОБОДНО МЕНЯЙ

```ts
// Форматы сжатия
algorithms: ['gzip', 'brotliCompress'],
```

```ts
// Какие файлы сжимать
include: [/\.js$/, /\.css$/, /\.html$/, /\.svg$/],
```

### 🔴 НЕ МЕНЯЙ

```ts
deleteOriginalAssets: false
```

Почему: `true` удалит `.js`, оставит только `.js.br` и `.js.gz`. Если сервер не настроен на Content-Encoding — сайт НЕ загрузится, белый экран. Откатить невозможно без пересборки.

### 🔴 НЕ СЖИМАЙ уже сжатые форматы

НЕ добавляй в include:
.woff2 — уже сжат (WOFF2 = Brotli внутри)
.png — уже сжат (deflate)
.jpg — уже сжат (DCT)
.webp — уже сжат
.avif — уже сжат
.gif — уже сжат (LZW)
.mp4 — уже сжат (H.264/H.265)
.zip — уже сжат

Повторное сжатие может УВЕЛИЧИТЬ файл.

## 10. Файл `legacy.ts`

### 🟢 СВОБОДНО МЕНЯЙ: Целевые браузеры

```ts
// Широкая аудитория (интернет-магазин)
targets: ['defaults', 'not IE 11']

// Только свежие (SaaS для разработчиков)
targets: ['chrome >= 90', 'firefox >= 90', 'safari >= 15']

// По статистике использования
targets: ['> 0.5%', 'not dead']

// Корпоративная среда
targets: ['> 0.2%', 'not dead', 'not op_mini all']
```

### 🟡 ОСТОРОЖНО: Решение убрать legacy целиком

Полифиллы добавляют 30–80KB.

Убирай если:

- Аудитория — разработчики (SaaS dev tools)
- Внутренний инструмент с контролируемыми браузерами
- Мобильное приложение через WebView
- Google Analytics показывает 0% на старых браузерах

Оставляй если:

- Публичный сайт с широкой аудиторией
- Интернет-магазин (каждый пользователь = деньги)
- Государственный сайт (обязательная доступность)

### 🔴 НЕ МЕНЯЙ

```ts
renderLegacyChunks: true,
modernPolyfills: true
```

11. Файл
    obfuscation.ts

🟢 МОЖНО: Убрать целиком

Для 95% Vue-проектов обфускация НЕ НУЖНА. Terser
mangle: { toplevel: true }
уже переименовывает переменные.

Обфускация сверх этого:

Замедляет сборку в 3–5 раз
Увеличивает бандл на 10–30%
Замедляет runtime на 5–15%
НЕ защищает от реверс-инжиниринга (только затрудняет)

🟡 ЕСЛИ ОСТАВЛЯЕШЬ

```ts
// Безопасные для изменения:
stringArrayThreshold: 0.75 // 0.0–1.0
identifierNamesGenerator: 'hexadecimal' // или 'mangled'
```

```ts
// ОПАСНЫЕ — сильно увеличивают бандл:
controlFlowFlattening: false // true → +50% размер, +30% runtime
deadCodeInjection: false // true → +20% размер
selfDefending: false // true → ломает pretty-print
debugProtection: false // true → ломает Vue DevTools
```

12. Файл
    helpers.ts

🟢 СВОБОДНО ДОБАВЛЯЙ утилиты

```ts
export function getEnvironmentVariable(key: string): string { ... }
export function createBannerComment(): string { ... }
export function formatFileSize(bytes: number): string { ... }
```

🔴 НЕ МЕНЯЙ логику существующих функций

```ts
// Используется во ВСЕХ конфигах — изменение сломает всю сборку
export function isProductionMode(mode: string): boolean {
	return mode === 'production'
}
```

```ts
// Используется во ВСЕХ alias — изменение сломает все пути
export function resolveFromRoot(...segments: string[]): string {
	return resolve(process.cwd(), ...segments)
}
```

13. Файл
    resolve.ts

🟢 СВОБОДНО МЕНЯЙ

```ts
// Добавляй расширения
extensions: [
	'.ts',
	'.tsx',
	'.js',
	'.jsx',
	'.vue',
	'.json',
	'.scss',
	'.css',
	'.md', // markdown-компоненты
	'.yaml', // YAML-конфиги
]
```

```ts
// Добавляй пакеты �� dedupe
dedupe: ['vue', 'vue-router', 'pinia', 'vue-i18n', '@vueuse/core']
```

🔴 НЕ УБИРАЙ

dedupe: ['vue', 'vue-router', 'pinia']

Почему: Без дедупликации в бандле могут оказаться ДВЕ копии Vue. Результат:

Реактивность сломается —
ref()
из одной копии не работает в другой
provide
/
inject
не видят друг друга
app.use()
регистрирует плагин в одном экземпляре, компоненты используют другой
Pinia store не реактивен в компонентах
Vue Router не обновляет
<router-view>
Бандл в 2 раза больше

14. Файл
    vite.config.ts

🔴 ПРИНЦИП: Тонкий файл-делегатор

```ts
export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	server: createServerConfig(),
	preview: createPreviewConfig(),
	plugins: createPlugins(mode),
	build: createBuildConfig(),
}))
```

Почему: Паттерн Facade. Открываешь
vite.config.ts
— видишь ЧТО настроено. Открываешь конкретный файл — видишь КАК.

🟢 МОЖНО ДОБАВЛЯТЬ секции

```ts
export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	server: createServerConfig(),
	preview: createPreviewConfig(),
	plugins: createPlugins(mode),
	build: createBuildConfig(),

	// Новые секции:
	optimizeDeps: createOptimizeDepsConfig(),
	envPrefix: 'VUE_APP_',
}))
```

| Область                    | 🟢 Меняй свободно                   | 🟡 Осторожно                    | 🔴 Не трогай                                 |
| -------------------------- | ----------------------------------- | ------------------------------- | -------------------------------------------- |
| Структура                  | Имена папок, новые файлы            | —                               | SRP-разделение                               |
| Порты                      | Номера портов, хост                 | —                               | —                                            |
| Пути                       | SOURCE_DIR, OUTPUT_DIR              | —                               | —                                            |
| Alias                      | Добавление, удаление                | —                               | @→src/, синхронизация tsconfig               |
| SCSS                       | Глобальные импорты, dev scoped name | Hash длина prod ≥ 6             | modern-compiler, camelCaseOnly, devSourcemap |
| Proxy                      | URL бэкенда, правила, WebSocket     | —                               | —                                            |
| cors, hmr.overlay, ignored | —                                   | —                               | —                                            |
| Чанки                      | Состав групп, новые группы          | target, sourcemap, cssCodeSplit | Порядок проверок, лимиты, node_modules guard |
| Terser                     | —                                   | —                               | Все параметры compress, mangle, format       |
| Изображения                | Качество (в диапазоне)              | Плагин на CI                    | —                                            |
| SVG                        | defaultImport, доп. SVGO            | —                               | removeViewBox, removeTitle                   |
| Сжатие                     | Форматы, расширения                 | —                               | deleteOriginalAssets, не сжимать бинарные    |
| Legacy                     | targets браузеров                   | Убрать целиком                  | renderLegacyChunks, modernPolyfills          |
| Обфускация                 | Убрать целиком, threshold           | controlFlowFlattening           | —                                            |
| Плагины                    | Добавление Vue-плагинов             | imagemin на CI                  | @vitejs/plugin-vue, compression              |
| Resolve                    | Расширения, доп. dedupe             | —                               | dedupe: ['vue', ...]                         |
| vite.config                | Добавление секций                   | —                               | Тонкий делегатор                             |
| helpers                    | Новые утилиты                       | —                               | isProductionMode, resolveFromRoot            |

### Чек-лист после любых изменений

1. npm run dev — сервер стартует, HMR Vue-компонентов работает
2. npm run build — сборка без ошибок и warnings
3. npm run preview — production-сборка открывается корректно
4. npm run build:analyze — чанки разделены, нет дубликатов Vue
5. В dist/ правильная структура (js/, css/, images/, fonts/)
6. Есть .br и .gz файлы рядом с оригиналами
7. grep -r "console.log" dist/ — пусто
8. vue-tsc --noEmit — проходит без ошибок
9. Каждый alias работает: импорт + Ctrl+Click в IDE
10. Lighthouse на preview: Performance ≥ 95, Best Practices ≥ 95
