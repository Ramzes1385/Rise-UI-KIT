---
name: vite-bundle-config
description: Настройка и оптимизация Vite-сборки Vue 3 — модульная архитектура build/ (constants, config, plugins, utils), alias, SCSS-автоинжект, manualChunks, изображения, SVG+спрайт, Brotli+Gzip, terser, legacy, обфускация, visualizer. Загружай при работе с vite.config.ts, build/*, добавлении/настройке Vite-плагина, оптимизации bundle-размера, проблемах с алиасами, синхронизации tsconfig/vitest/storybook, аналитике PageSpeed/Lighthouse.
---

# Vite Bundle Config — оптимизированная сборка Vue 3

## Когда применять
- Любая работа с `vite.config.ts` или содержимым `build/`.
- Добавление/настройка Vite-плагина.
- Оптимизация размера bundle, ручная стратегия чанков.
- Проблемы с alias (не резолвится в коде, тестах, Storybook).
- Регрессия PageSpeed/Lighthouse, метрики Performance.

Связанные skills:
- `clean-code` — принципы Чистого Кода (SRP, маленькие функции, никаких магических чисел) применяются к конфигам так же строго, как к продакшн-коду.
- `ui-kit-component` — раздел про регистрацию heavy-компонентов через `HEAVY_APP_CHUNKS` в `build/config/build.ts`.

---

## Принципы (Р. Мартин для конфигов сборки)

1. **SRP** — один файл = одна задача (`alias.ts` только пути, `css.ts` только стили).
2. **Говорящие имена** — `createImageOptimizationPlugin`, не `imgPlg`; `DEV_SERVER_PORT`, не `port`.
3. **Малые функции** — ≤ 20 строк, одна задача.
4. **Никаких магических чисел** — всё в `build/constants.ts`.
5. **DRY** — общая логика в `build/utils/helpers.ts`.
6. **Комментарии о «почему», не «что»** — самодокументируемый код.
7. **Композиция вместо наследования** — главный `vite.config.ts` тонкий, делегирует.
8. **Чистые границы** — сторонние плагины обёрнуты в свои `createXPlugin()`.
9. **Обработка ошибок** — не глотать.
10. **Детерминированность** — функции-фабрики возвращают конфиг по входным параметрам, без скрытого состояния.

---

## Структура `build/` (реальная в `metal-art-site`)

```
project-root/
├── build/
│   ├── constants.ts                  ← все константы сборки
│   ├── utils/
│   │   └── helpers.ts                ← вспомогательные чистые функции
│   ├── config/
│   │   ├── alias.ts                  ← алиасы путей (@/, @components/, …)
│   │   ├── resolve.ts                ← резолв модулей + extensions + dedupe
│   │   ├── css.ts                    ← SCSS, additionalData, modules
│   │   ├── server.ts                 ← dev-сервер + preview + proxy
│   │   └── build.ts                  ← rollupOptions, terser, manualChunks
│   ├── plugins/
│   │   ├── index.ts                  ← агрегатор плагинов
│   │   ├── vue.ts                    ← @vitejs/plugin-vue
│   │   ├── svg.ts                    ← vite-svg-loader + SVGO
│   │   ├── sprite.ts                 ← SVG-спрайт из src/icons/svg/
│   │   ├── images.ts                 ← vite-plugin-image-optimizer
│   │   └── compression.ts            ← Brotli + Gzip (vite-plugin-compression2)
│   │   # legacy.ts и obfuscation.ts ОТСУТСТВУЮТ — добавляй по шаблонам ниже при необходимости
│   └── tests/                        ← конфиги тестов (см. testing-ui-kit)
│       ├── vitest.config.ts
│       ├── playwright.config.ts
│       ├── setup-vitest.ts
│       ├── setup-storybook.ts
│       └── vitest.shims.d.ts
├── vite.config.ts                    ← тонкий делегатор
├── tsconfig.json / tsconfig.app.json
└── package.json
```

> Главный `vite.config.ts` — тонкий, только композиция (≤ 30 строк). Вся логика — в `build/`.

---

## Шаг 1 — зависимости

В `metal-art-site` всё уже установлено. Для нового проекта:

```bash
npm install -D \
  @vitejs/plugin-vue @vitejs/plugin-legacy \
  vite-plugin-compression2 vite-plugin-image-optimizer \
  vite-svg-loader vite-plugin-svgo \
  rollup-plugin-obfuscator javascript-obfuscator \
  rollup-plugin-visualizer \
  sass-embedded terser sharp svgo
```

### `package.json` дополнительно

```json
{
  "sideEffects": [
    "**/*.css",
    "**/*.scss",
    "**/*.vue"
  ],
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ],
  "scripts": {
    "dev": "vite --mode development",
    "build": "vue-tsc --noEmit && vite build --mode production",
    "build:analyze": "vite build --mode production -- --analyze",
    "preview": "vite preview"
  }
}
```

> `sideEffects` критичен для tree-shaking. CSS/SCSS/Vue файлы помечены как имеющие side-effects, чтобы Rollup не удалил их.

---

## Шаг 2 — `build/constants.ts`

Все числовые/строковые значения сборки. **Никаких магических чисел в плагинах и конфигах.**

```ts
// ──────────────────────────────────────────────
// Dev-сервер
// ──────────────────────────────────────────────

export const DEV_SERVER_PORT = 3000;
export const DEV_SERVER_HOST = '0.0.0.0';   // 0.0.0.0 для доступа из LAN
export const PREVIEW_PORT = 4173;

// ──────────────────────────────────────────────
// Оптимизация чанков
// ──────────────────────────────────────────────

export const MIN_CHUNK_SIZE_BYTES = 20 * 1024;       // 20KB — меньше = overhead HTTP
export const MAX_CHUNK_WARNING_SIZE_KB = 250;         // > 250KB замедляет загрузку
export const MAX_ASSET_WARNING_SIZE_KB = 150;

// ──────────────────────────────────────────────
// Изображения
// ──────────────────────────────────────────────

export const IMAGE_QUALITY = {
  mozjpeg: 75,
  webp: 80,
  avif: 60,
  pngQuality: { min: 65, max: 80 },
  gif: 70,
} as const;

// ──────────────────────────────────────────────
// Compression
// ──────────────────────────────────────────────

/**
 * Уровень Brotli. Рекомендация: 6 (баланс). 11 — это max-quality, который
 * в 20–100× медленнее уровня 6 ради ~1–3% экономии. Используй 11 только
 * если pre-compression выполняется в отдельной CI-стадии и время сборки не критично.
 */
export const BROTLI_COMPRESSION_LEVEL = 6;            // 0–11; 11 = max-quality (медленно)

/** Уровень Gzip. 6 — стандартный баланс. 9 — диминишинг по размеру, дорогой по CPU. */
export const GZIP_COMPRESSION_LEVEL = 6;              // 0–9; 9 = max

export const COMPRESSION_THRESHOLD_BYTES = 1024;      // < 1KB сжимать бессмысленно

// ──────────────────────────────────────────────
// Terser
// ──────────────────────────────────────────────

/**
 * Консольные вызовы, которые terser удаляет в production.
 * НЕ добавляй сюда `console.warn` и `console.error` — это убирает Vue/Pinia/router
 * deprecation-warnings, ошибки key/prop-type и сообщения от 3rd-party библиотек,
 * лишая команду основного канала диагностики misconfiguration в проде.
 * `warn`/`error` должны доезжать до Sentry/error tracking.
 */
export const PRODUCTION_DROP_CONSOLE = [
  'console.log',
  'console.info',
  'console.debug',
] as const;

export const TERSER_COMPRESS_PASSES = 2;              // 2 = баланс скорость/размер

// ──────────────────────────────────────────────
// Legacy
// ──────────────────────────────────────────────

export const LEGACY_TARGETS = ['defaults', 'not IE 11'] as const;

// ──────────────────────────────────────────────
// Пути проекта
// ──────────────────────────────────────────────

export const SOURCE_DIR = 'src';
export const OUTPUT_DIR = 'dist';
export const ASSETS_DIR = 'assets';

export const ASSET_SUBDIRS = {
  js: 'js',
  css: 'css',
  images: 'images',
  fonts: 'fonts',
  media: 'media',
} as const;
```

---

## Шаг 3 — `build/utils/helpers.ts`

Чистые детерминированные функции. Никакого скрытого состояния.

```ts
import { resolve } from 'node:path';

/** Текущий режим — production? */
export function isProductionMode(mode: string): boolean {
  return mode === 'production';
}

/** Текущий режим — development? */
export function isDevelopmentMode(mode: string): boolean {
  return mode === 'development';
}

/** Абсолютный путь от корня проекта */
export function resolveFromRoot(...segments: string[]): string {
  return resolve(process.cwd(), ...segments);
}

/** Поддиректория ассета по расширению (для output.assetFileNames) */
export function getAssetSubdirByExtension(extname: string): string {
  const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tiff']);
  const fontExtensions = new Set(['.woff', '.woff2', '.eot', '.ttf', '.otf']);
  const mediaExtensions = new Set(['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac']);

  if (imageExtensions.has(extname)) return 'images';
  if (fontExtensions.has(extname)) return 'fonts';
  if (mediaExtensions.has(extname)) return 'media';
  return 'css';
}

/** Шаблон имени файла ассета */
export function createAssetFileName(extname: string): string {
  const subdir = getAssetSubdirByExtension(extname);
  return `assets/${subdir}/[name]-[hash][extname]`;
}
```

---

## Шаг 4 — `build/config/alias.ts` + синхронизация в 5 местах

```ts
import type { AliasOptions } from 'vite';
import { resolveFromRoot } from '../utils/helpers';
import { SOURCE_DIR } from '../constants';

export function createAliasConfig(): AliasOptions {
  return {
    '@': resolveFromRoot(SOURCE_DIR),
    '@components': resolveFromRoot(SOURCE_DIR, 'components'),
    '@composables': resolveFromRoot(SOURCE_DIR, 'composables'),
    '@utils': resolveFromRoot(SOURCE_DIR, 'utils'),
    '@styles': resolveFromRoot(SOURCE_DIR, 'styles'),
    '@icons': resolveFromRoot(SOURCE_DIR, 'icons'),
    '@ui': resolveFromRoot(SOURCE_DIR, 'components'),
  };
}
```

### **КРИТИЧНО:** алиасы должны быть синхронизированы в **5 местах**

| # | Файл | Зачем |
|---|---|---|
| 1 | `build/config/alias.ts` | Vite runtime |
| 2 | `tsconfig.json` → `paths` | TypeScript type-checking |
| 3 | `tsconfig.app.json` → `paths` | TS для приложения |
| 4 | `build/tests/vitest.config.ts` → `resolve.alias` | Тесты |
| 5 | `build/storybook/main.ts` → `viteFinal` resolve.alias | Storybook |

Рассинхрон — самая частая причина «alias not found» и «module not resolved».

### Шаблон `tsconfig.json` paths

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components": ["src/components/index.ts"],
      "@components/*": ["src/components/*"],
      "@composables": ["src/composables/index.ts"],
      "@composables/*": ["src/composables/*"],
      "@utils": ["src/utils/index.ts"],
      "@utils/*": ["src/utils/*"],
      "@styles": ["src/styles/index.scss"],
      "@styles/*": ["src/styles/*"],
      "@icons": ["src/icons/index.ts"],
      "@icons/*": ["src/icons/*"],
      "@ui": ["src/components/index.ts"],
      "@ui/*": ["src/components/*"]
    }
  }
}
```

---

## Шаг 5 — `build/config/resolve.ts`

```ts
import type { ResolveOptions } from 'vite';
import { createAliasConfig } from './alias';

const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.scss', '.css'] as const;

export function createResolveConfig(): ResolveOptions {
  return {
    alias: createAliasConfig(),
    extensions: [...RESOLVE_EXTENSIONS],
    dedupe: ['vue', 'vue-router', 'pinia'],
  };
}
```

`dedupe` — критично для библиотек с глобальным состоянием. Если Vue резолвится из двух мест — будет два экземпляра Pinia/Router, состояние развалится.

---

## Шаг 6 — `build/config/css.ts`

```ts
import type { CSSOptions } from 'vite';
import { isProductionMode } from '../utils/helpers';

/** Глобальные SCSS-файлы — доступны во всех компонентах без явного импорта */
const GLOBAL_SCSS_IMPORTS = [
  '@use "@styles/variables" as *;',
  '@use "@styles/mixins" as *;',
  '@use "@styles/functions" as *;',
].join('\n');

export function createCssConfig(mode: string): CSSOptions {
  const isProduction = isProductionMode(mode);

  return {
    preprocessorOptions: {
      scss: {
        additionalData: `${GLOBAL_SCSS_IMPORTS}\n`,
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
        charset: false,
      },
    },

    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: isProduction
        ? '[hash:base64:8]'
        : '[name]__[local]--[hash:base64:5]',
    },

    devSourcemap: !isProduction,
  };
}
```

### Правило `additionalData`
Глобальный SCSS автоинжектится **во все** `.scss` файлы. **Не пиши** `@use "@styles/variables"` вручную в компонентах — будет ошибка дублирования. Это применимо к `metal-art-site`: см. `BaseX.style.scss` — там сразу используется `var(--color-primary)` или SCSS-функция, без явных `@use`.

Дублируй блок `additionalData` в:
- `build/storybook/main.ts`
- `build/tests/vitest.config.ts`

Иначе Storybook stories и тесты упадут с «Undefined variable».

---

## Шаг 7 — `build/config/server.ts`

```ts
import type { ServerOptions, PreviewOptions } from 'vite';
import { DEV_SERVER_HOST, DEV_SERVER_PORT, PREVIEW_PORT } from '../constants';

export function createServerConfig(): ServerOptions {
  return {
    host: DEV_SERVER_HOST,
    port: DEV_SERVER_PORT,
    strictPort: false,
    open: true,
    hmr: { overlay: true },
    cors: true,

    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },

    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    },
  };
}

export function createPreviewConfig(): PreviewOptions {
  return {
    host: DEV_SERVER_HOST,
    port: PREVIEW_PORT,
    strictPort: false,
    open: true,
    cors: true,
  };
}
```

> В `metal-art-site` UI Kit `proxy` секция не нужна (API нет). Убери её для UI Kit-проектов.

---

## Шаг 8 — `build/config/build.ts`

### Стратегия чанков
| Чанк | Что внутри |
|---|---|
| `vendor-vue` | `vue`, `@vue/*`, `vue-router`, `pinia` |
| `vendor-ui` | UI-фреймворк проекта (если есть) |
| `vendor-utils` | `lodash`, `axios`, `dayjs`, `date-fns` |
| `vendor-libs` | всё остальное из `node_modules` |
| `app` | код приложения, авторазбиение по роутам |
| **Heavy** (для UI Kit) | каждый heavy-компонент в свой чанк через `HEAVY_APP_CHUNKS` |

### Реализация

```ts
import type { BuildOptions } from 'vite';
import { extname } from 'node:path';
import {
  MIN_CHUNK_SIZE_BYTES,
  MAX_CHUNK_WARNING_SIZE_KB,
  PRODUCTION_DROP_CONSOLE,
  TERSER_COMPRESS_PASSES,
  OUTPUT_DIR,
  ASSET_SUBDIRS,
} from '../constants';
import { createAssetFileName } from '../utils/helpers';

const VUE_ECOSYSTEM_PACKAGES = ['vue', '@vue', 'vue-router', 'pinia'];
const UI_FRAMEWORK_PACKAGES = ['element-plus', '@element-plus']; // замени на свой
const UTILITY_PACKAGES = ['lodash', 'lodash-es', 'axios', 'dayjs', 'date-fns'];

/** Heavy-компоненты UI Kit — отдельный чанк каждому */
const HEAVY_APP_CHUNKS = [
  'BaseChat',
  'BaseEditor',
  'BaseDatePicker',
  'BaseCalendar',
  'BaseTable',
  'BaseFileUpload',
];

function isFromPackages(moduleId: string, packages: string[]): boolean {
  return packages.some((pkg) => moduleId.includes(`node_modules/${pkg}`));
}

function isHeavyAppChunk(moduleId: string): string | undefined {
  return HEAVY_APP_CHUNKS.find((name) => moduleId.includes(`/components/${name}/`));
}

/** Стратегия чанков. Порядок проверок: от частного к общему. */
function createManualChunks(moduleId: string): string | undefined {
  // 1. Heavy-компоненты приложения — каждый в свой чанк
  const heavy = isHeavyAppChunk(moduleId);
  if (heavy) return `app-${heavy.toLowerCase()}`;

  if (!moduleId.includes('node_modules')) return undefined;

  if (isFromPackages(moduleId, VUE_ECOSYSTEM_PACKAGES)) return 'vendor-vue';
  if (isFromPackages(moduleId, UI_FRAMEWORK_PACKAGES)) return 'vendor-ui';
  if (isFromPackages(moduleId, UTILITY_PACKAGES)) return 'vendor-utils';

  return 'vendor-libs';
}

export function createBuildConfig(): BuildOptions {
  return {
    outDir: OUTPUT_DIR,
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2020',

    modulePreload: { polyfill: true },
    chunkSizeWarningLimit: MAX_CHUNK_WARNING_SIZE_KB,

    // Terser обычно на 1–3% компактнее esbuild при ~2–3× более медленной сборке
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_debugger: true,
        pure_funcs: [...PRODUCTION_DROP_CONSOLE],
        passes: TERSER_COMPRESS_PASSES,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        hoist_funs: true,
        hoist_vars: false,                // НЕ включай: ломает let/const в Safari
        booleans_as_integers: false,
        ecma: 2020,
        module: true,
        toplevel: true,
        unsafe_math: false,
        unsafe_proto: false,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
        ascii_only: true,
        ecma: 2020,
      },
    },

    rollupOptions: {
      output: {
        manualChunks: createManualChunks,
        chunkFileNames: `${ASSET_SUBDIRS.js}/[name]-[hash].js`,
        entryFileNames: `${ASSET_SUBDIRS.js}/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          return createAssetFileName(extname(name));
        },
        // experimentalMinChunkSize СПОРНО при fine-grained manualChunks.
        // Если используешь HEAVY_APP_CHUNKS (отдельный чанк на компонент) —
        // НЕ ставь сюда 20KB: мелкие per-component чанки будут слиты обратно
        // и lazy-loading сломается. Оставь дефолт Rollup или поставь ≤4096.
        // experimentalMinChunkSize: MIN_CHUNK_SIZE_BYTES,
        compact: true,
      },

      // treeshake: уважаем package.json `sideEffects` каждого пакета (default Rollup).
      // НЕ ставь `moduleSideEffects: 'no-external'` — это молча удаляет side-effect
      // импорты из node_modules (полифиллы, CSS-only пакеты, регистрации локалей,
      // reflect-metadata, intersection-observer и т.п.). Билд проходит, прод ломается.
      treeshake: {
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    reportCompressedSize: true,
    // Файлы < 4KB инлайнятся как base64 — экономия HTTP-запроса
    assetsInlineLimit: 4096,
  };
}
```

### Грабли terser
- `hoist_vars: false` — обязательно. Иначе Safari < 14 ломается на let/const после хостинга.
- `safari10: true` в mangle — обязательно. Иначе Safari 10 не запустит код.
- `unsafe_math` / `unsafe_proto` — никогда не `true`. Дают ~1% выигрыша и кучу багов.

---

## Шаг 9 — Плагины

### `build/plugins/vue.ts`

```ts
import vue from '@vitejs/plugin-vue';
import type { PluginOption } from 'vite';
import { isProductionMode } from '../utils/helpers';

export function createVuePlugin(mode: string): PluginOption {
  const isProduction = isProductionMode(mode);
  return vue({
    script: {
      defineModel: true,
      propsDestructure: true,
    },
    template: {
      compilerOptions: {
        comments: !isProduction,    // в prod удаляем HTML-комментарии
      },
    },
  });
}
```

### `build/plugins/svg.ts`

```ts
import svgLoader from 'vite-svg-loader';
import type { PluginOption } from 'vite';

/** SVGO — удаляет мусор, сохраняет viewBox и title */
const SVGO_CONFIG = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,    // КРИТИЧНО: нужен для масштабирования
          removeTitle: false,      // a11y
        },
      },
    },
    { name: 'removeDimensions' },
    { name: 'removeXMLProcInst' },
    { name: 'removeComments' },
    { name: 'removeEmptyAttrs' },
    { name: 'sortAttrs' },
  ],
};

export function createSvgPlugin(): PluginOption {
  return svgLoader({
    defaultImport: 'component',
    svgoConfig: SVGO_CONFIG,
  });
}
```

### `build/plugins/sprite.ts` (специфика `metal-art-site`)

Собирает SVG-спрайт из `src/icons/svg/` в `/icons.svg`. Используй существующий `build/plugins/sprite.ts` как образец.

Принципы:
- Один спрайт на весь проект — экономит HTTP-запросы.
- Имена иконок = имена файлов без расширения.
- Спрайт инжектится в `index.html` либо подгружается через `<use href="/icons.svg#icon-name" />`.

### `build/plugins/images.ts`

В `metal-art-site` используется `vite-plugin-image-optimizer` (а не `vite-plugin-imagemin`, который имеет native-зависимости и часто ломается на CI).

```ts
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import type { PluginOption } from 'vite';
import { IMAGE_QUALITY } from '../constants';

export function createImagePlugin(): PluginOption {
  return ViteImageOptimizer({
    jpg: { quality: IMAGE_QUALITY.mozjpeg },
    jpeg: { quality: IMAGE_QUALITY.mozjpeg },
    png: { quality: IMAGE_QUALITY.pngQuality.max },
    webp: { quality: IMAGE_QUALITY.webp },
    avif: { quality: IMAGE_QUALITY.avif },
    gif: {},
    // SVG обрабатывается отдельным плагином (svg.ts)
    svg: false,
  });
}
```

> Если используешь `vite-plugin-imagemin` — там сложности с `cwebp`/`mozjpeg` на разных CI. Лучше `vite-plugin-image-optimizer` (использует `sharp` — нативный модуль с pre-built бинарниками).

### `build/plugins/compression.ts`

```ts
import { compression } from 'vite-plugin-compression2';
import type { PluginOption } from 'vite';
import {
  BROTLI_COMPRESSION_LEVEL,
  GZIP_COMPRESSION_LEVEL,
  COMPRESSION_THRESHOLD_BYTES,
} from '../constants';

const COMPRESSIBLE_EXTENSIONS = /\.(js|css|html|json|svg|xml|txt|wasm)$/;

function createBrotliPlugin(): PluginOption {
  return compression({
    algorithm: 'brotliCompress',
    include: COMPRESSIBLE_EXTENSIONS,
    threshold: COMPRESSION_THRESHOLD_BYTES,
    deleteOriginalAssets: false,
    compressionOptions: { level: BROTLI_COMPRESSION_LEVEL },
  });
}

function createGzipPlugin(): PluginOption {
  return compression({
    algorithm: 'gzip',
    include: COMPRESSIBLE_EXTENSIONS,
    threshold: COMPRESSION_THRESHOLD_BYTES,
    deleteOriginalAssets: false,
    compressionOptions: { level: GZIP_COMPRESSION_LEVEL },
  });
}

export function createCompressionPlugins(): PluginOption[] {
  return [createBrotliPlugin(), createGzipPlugin()];
}
```

> Brotli сжимает на 15–25% лучше Gzip. Сервер выбирает формат по `Accept-Encoding` клиента. Не удаляй оригиналы — клиенты без поддержки brotli/gzip получат сырой файл.

### `build/plugins/legacy.ts` (опционально)

В `metal-art-site` отсутствует. Добавляй только если есть реальные пользователи на старых браузерах. Добавит ~30–80KB полифиллов.

```ts
import legacy from '@vitejs/plugin-legacy';
import type { PluginOption } from 'vite';
import { LEGACY_TARGETS } from '../constants';

export function createLegacyPlugin(): PluginOption {
  return legacy({
    targets: [...LEGACY_TARGETS],
    renderLegacyChunks: true,
    modernPolyfills: true,
    additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
  });
}
```

### `build/plugins/obfuscation.ts` (опционально)

В `metal-art-site` отсутствует, хотя `javascript-obfuscator` и `rollup-plugin-obfuscator` есть в `package.json` (висячие зависимости — кандидаты на удаление через `npm uninstall`, либо реальная активация).

**Замедляет сборку в 3–5 раз.** Используй только если действительно нужно скрыть бизнес-логику (платные SaaS, защита формул). Для UI Kit / open source — не нужно. Для приложений с UI на клиенте — Terser mangling даёт 95% эффекта без замедления.

```ts
import obfuscator from 'rollup-plugin-obfuscator';
import type { PluginOption } from 'vite';

export function createObfuscationPlugin(): PluginOption {
  return obfuscator({
    options: {
      compact: true,
      controlFlowFlattening: false,            // true замедляет runtime
      deadCodeInjection: false,
      debugProtection: false,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: false,
      selfDefending: false,
      simplify: true,
      splitStrings: false,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 1,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 2,
      stringArrayWrappersType: 'variable',
      stringArrayThreshold: 0.75,
      transformObjectKeys: false,
      unicodeEscapeSequence: false,
    },
  }) as PluginOption;
}
```

---

## Шаг 10 — Агрегатор `build/plugins/index.ts`

Реальный код в `metal-art-site`:

```ts
import { visualizer } from 'rollup-plugin-visualizer';
import type { PluginOption } from 'vite';
import { isProductionMode } from '../utils/helpers';
import { createCompressionPlugins } from './compression';
import { createImagePlugin } from './images';
import { createSpritePlugin } from './sprite';
import { createSvgPlugin } from './svg';
import { createVuePlugin } from './vue';

export function createPlugins(mode: string): PluginOption[] {
  const isProduction = isProductionMode(mode);

  const plugins: PluginOption[] = [
    createVuePlugin(mode),
    createSvgPlugin(),
    createSpritePlugin(),
  ];

  if (isProduction) {
    plugins.push(createImagePlugin(), ...createCompressionPlugins());
  }

  // npm run build -- --analyze → создаёт stats.html
  const isAnalyze = process.argv.includes('--analyze');
  if (isAnalyze) {
    plugins.push(
      visualizer({
        filename: 'stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }) as PluginOption,
    );
  }

  return plugins;
}
```

### Правила порядка плагинов
1. **`vue` — всегда первый**. Все остальные плагины зависят от того, что `.vue` уже преобразован.
2. **`svg` и `sprite` — до production-плагинов**. SVG должен быть обработан до сжатия и оптимизации картинок.
3. **`image-optimizer` — только в production**. Замедляет dev-сборку без пользы.
4. **`compression` — после image-optimizer**. Сначала уменьшаем размер картинок, потом сжимаем.
5. **`legacy` (если добавлен) — после `vue`, до `compression`**.
6. **`obfuscation` (если добавлен) — почти последним**, перед `visualizer`.
7. **`visualizer` — самым последним**. Видит финальное состояние bundle.

---

## Шаг 11 — Главный `vite.config.ts`

**Тонкий делегатор**. Никакой логики, только композиция.

```ts
import { defineConfig } from 'vite';
import { createBuildConfig } from './build/config/build';
import { createCssConfig } from './build/config/css';
import { createPreviewConfig, createServerConfig } from './build/config/server';
import { createResolveConfig } from './build/config/resolve';
import { createPlugins } from './build/plugins';

export default defineConfig(({ mode }) => ({
  resolve: createResolveConfig(),
  css: createCssConfig(mode),
  server: createServerConfig(),
  preview: createPreviewConfig(),
  plugins: createPlugins(mode),
  build: createBuildConfig(),
}));
```

Тонкий делегатор, только композиция. Всё остальное — в `build/`.

---

## Анализ bundle

```bash
npm run build:analyze         # создаёт stats.html в корне
```

В `stats.html` смотри:
- **`gzipSize` / `brotliSize`** — реальный размер, который улетит к клиенту. На него ориентируйся.
- **`raw size`** — без сжатия. Для дебага tree-shaking.
- **Big modules** (>50KB raw) — кандидаты на async import или замену библиотеки.

### Типичные проблемы и решения

| Проблема | Решение |
|---|---|
| Vendor-чанк > 250KB | Раздели на `vendor-vue` / `vendor-ui` / `vendor-utils` через `manualChunks` |
| Один компонент тащит за собой всю lodash | Используй `lodash-es` + named imports. Или замени на native ES |
| Картинки > 200KB | Конвертируй в WebP/AVIF, проверь `vite-plugin-image-optimizer` сработал |
| Большой первый paint | Включи `defineAsyncComponent` для heavy-компонентов |
| Long task warning от PageSpeed | Не chunk-size knob! Используй `defineAsyncComponent` / dynamic `import()` для отложенной загрузки, дроби большие синхронные циклы (`requestIdleCallback`, `scheduler.yield()`), CPU-работу выноси в Web Worker |
| CSS > 100KB | Включи `cssCodeSplit: true`, выноси редкие стили в lazy-чанки |

---

## Метрики целей

| Метрика | Цель | Где смотреть |
|---|---|---|
| PageSpeed Performance | ≥ 95 | pagespeed.web.dev |
| PageSpeed Best Practices | ≥ 95 | — |
| PageSpeed Accessibility | ≥ 90 | — |
| Lighthouse Performance | ≥ 95 | Chrome DevTools |
| LCP | ≤ 2.5s | — |
| INP | ≤ 200ms | — |
| CLS | ≤ 0.1 | — |
| First Bundle (gzip) | ≤ 100KB | stats.html |
| Total Bundle (gzip) | ≤ 500KB | stats.html |

---

## Чек-лист готовности конфигурации сборки

- [ ] Создана структура `build/` с разделением `constants` / `utils` / `config` / `plugins`
- [ ] `vite.config.ts` — ≤ 30 строк, только композиция
- [ ] Все числовые/строковые значения в `build/constants.ts`, нет магических чисел в плагинах
- [ ] Все функции в `build/` ≤ 20 строк, одна задача каждая
- [ ] Алиасы синхронизированы в 5 местах (alias.ts, tsconfig × 2, vitest, storybook)
- [ ] `additionalData` SCSS синхронизирован в 3 местах (css.ts, storybook, vitest)
- [ ] `package.json` имеет `sideEffects`, `browserslist`, `scripts`
- [ ] Стратегия чанков: vendor разделён, heavy-компоненты в отдельных чанках
- [ ] Terser: `hoist_vars: false`, `safari10: true`, `unsafe_*: false`
- [ ] `compression` создаёт И Brotli, И Gzip (не удаляет оригиналы)
- [ ] `image-optimizer` подключён только в production
- [ ] `visualizer` запускается по флагу `--analyze`, не всегда
- [ ] Bundle (gzip) < 500KB total, vendor < 250KB
- [ ] `npm run build:analyze` отрабатывает, `stats.html` создаётся
- [ ] PageSpeed Performance ≥ 95 на production
- [ ] Лишних зависимостей в `package.json` нет (`obfuscator`/`legacy` подключены — или удалены из deps)

---

## Антипаттерны

| ❌ Запрет | Почему | ✅ Альтернатива |
|---|---|---|
| Магические числа в плагинах (`level: 11`, `port: 3000`) | Не самодокументируется, дублируется | Константа в `build/constants.ts` |
| Логика в `vite.config.ts` | Файл разрастается, теряется композиция | Делегирование в `build/config/*` |
| Один большой `createPlugins` с inline-настройками | Невозможно тестировать, понимать | Каждый плагин — отдельный файл с `createXPlugin()` |
| Алиасы только в одном месте | Тесты/Storybook упадут | Синхронизация в 5 местах |
| `vite-plugin-imagemin` на CI | Native-зависимости часто ломаются | `vite-plugin-image-optimizer` (sharp) |
| `terser: hoist_vars: true` | Ломает Safari < 14 | `false` |
| `controlFlowFlattening: true` в obfuscator | Замедляет runtime в 2–3 раза | `false` |
| Обфускация ради «безопасности» | Не защищает от reverse engineering | Защищай данные на сервере, не код |
| Не сжимать html | HTML тоже жмётся | Включить в `COMPRESSIBLE_EXTENSIONS` |
| `deleteOriginalAssets: true` | Старые клиенты получат пустоту | `false`, оригиналы остаются |
| Один vendor-чанк > 500KB | Долгий первый paint | Раздели на vendor-vue/ui/utils |
| Использовать `lodash` (не `lodash-es`) | Не tree-shake-ится | `lodash-es` + named imports |
| Не вынести heavy-компоненты в отдельные чанки | Грузится с первой страницей | `defineAsyncComponent` + запись в `HEAVY_APP_CHUNKS` |
