---
name: vite-bundle-config
description: >-
  Настройка и оптимизация Vite сборки для Vue 3 проекта. Модульная конфигурация
  — alias, SCSS, чанки, изображения, SVG, legacy, обфускация, сжатие,
  dev-сервер, плагины. Метрики PageSpeed/Lighthouse ≥ 95. Принципы Чистого кода
  Р. Мартина.
modeSlugs:
  - architect
  - code
---

# Vite Bundle Config — Оптимизированная сборка Vue 3

## Роль

Ты — senior фронтенд-инженер, специализирующийся на оптимизации сборки Vue 3 проектов с Vite. Ты строго следуешь принципам книги «Чистый код» Роберта Мартина. Твоя цель — максимальные баллы PageSpeed Insights и Lighthouse (Performance ≥ 95, Best Practices ≥ 95, Accessibility ≥ 90). Весь код на TypeScript, комментарии на русском.

---

## Принципы Чистого кода (Р. Мартин)

1. **Единственная ответственность (SRP)** — один файл = одна задача, один модуль = одна область конфигурации
2. **Говорящие имена** — `createImageOptimizationPlugin`, не `imgPlg`; `DEV_SERVER_PORT`, не `port`
3. **Маленькие функции** — не более 20 строк, делает ровно одну вещь
4. **Нет магических чисел** — все числовые значения в именованных константах `build/constants.ts`
5. **DRY** — общая логика в `build/utils/helpers.ts`
6. **Комментарии** — только «почему», не «что»; код самодокументирующийся
7. **Форматирование** — вертикальная и горизонтальная плотность, логическая группировка
8. **Абстракция** — детали реализации скрыты за понятными интерфейсами функций
9. **Обработка ошибок** — не игнорируй, пробрасывай с понятным сообщением
10. **Чистые границы** — сторонние зависимости изолированы обёртками

---

## Структура папки сборки

Создай в корне проекта. Папка `build/` — общепринятое соглашение экосистемы Vite/Vue.

project-root/
├── build/
│ ├── constants.ts # Все константы сборки (без магических чисел)
│ ├── plugins/
│ │ ├── index.ts # Агрегатор: собирает все плагины в массив
│ │ ├── vue.ts # Плагин Vue + JSX
│ │ ├── svg.ts # SVG: инлайн, спрайты, оптимизация SVGO
│ │ ├── images.ts # Оптимизация растровых изображений
│ │ ├── legacy.ts # Поддержка старых браузеров
│ │ ├── compression.ts # Brotli + Gzip сжатие
│ │ └── obfuscation.ts # Обфускация JS-кода
│ ├── config/
│ │ ├── alias.ts # Псевдонимы путей (@/, @components/ и т.д.)
│ │ ├── server.ts # Настройки dev-сервера и proxy
│ │ ├── css.ts # SCSS, препроцессоры, PostCSS
│ │ ├── build.ts # Rollup options, чанки, terser, output
│ │ └── resolve.ts # Разрешение модулей и расширений
│ └── utils/
│ └── helpers.ts # Вспомогательные чистые функции
├── vite.config.ts # Главный конфиг — тонкий, делегирует в build/
├── tsconfig.json
└── package.json

## Шаг 1 — Установи зависимости

Выполни команду:

```bash
npm install -D @vitejs/plugin-vue @vitejs/plugin-legacy vite-plugin-compression2 vite-plugin-imagemin vite-svg-loader rollup-plugin-obfuscator javascript-obfuscator rollup-plugin-visualizer sass-embedded terser vite-plugin-svgo
```

Добавь в `package.json` поле `sideEffects` для корректного tree-shaking:

````json
// package.json
{
  "sideEffects": [
    "**/*.css",
    "**/*.scss",
    "**/*.vue"
  ]
}

Добавь скрипты:
```json
// package.json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vue-tsc --noEmit && vite build --mode production",
    "build:analyze": "vite build --mode production -- --analyze",
    "preview": "vite preview"
  }
}
````

Добавь browserslist

```json
// package.json
{
	"browserslist": ["> 1%", "last 2 versions", "not dead", "not ie 11"]
}
```

## Шаг 2: Создай файл констант

build/constants.ts

```ts
/**
 * Константы конфигурации сборки.
 * Вынесены для устранения магических чисел (Чистый код, гл.17).
 * Каждая константа имеет говорящее имя, объясняющее назначение.
 */

// ──────────────────────────────────────────────
// Dev-сервер
// ──────────────────────────────────────────────

/** Порт dev-сервера по умолчанию */
export const DEV_SERVER_PORT = 3000

/** Хост dev-сервера — 0.0.0.0 для доступа из локальной сети */
export const DEV_SERVER_HOST = '0.0.0.0'

/** Порт для preview production-сборки */
export const PREVIEW_PORT = 4173

// ──────────────────────────────────────────────
// Оптимизация чанков
// ──────────────────────────────────────────────

/** Минимальный размер чанка в байтах (20KB) — меньше создаёт overhead от HTTP-запросов */
export const MIN_CHUNK_SIZE_BYTES = 20 * 1024

/** Порог предупреждения о размере чанка (250KB) — больше замедляет загрузку */
export const MAX_CHUNK_WARNING_SIZE_KB = 250

/** Порог предупреждения о размере ассета (150KB) */
export const MAX_ASSET_WARNING_SIZE_KB = 150

// ──────────────────────────────────────────────
// Оптимизация изображений
// ──────────────────────────────────────────────

/** Настройки качества сжатия для каждого формата */
export const IMAGE_QUALITY = {
	mozjpeg: 75,
	webp: 80,
	avif: 60,
	pngQuality: { min: 65, max: 80 },
	gif: 70,
} as const

// ──────────────────────────────────────────────
// Сжатие (Compression)
// ──────────────────────────────────────────────

/** Уровень сжатия Brotli (0–11), 11 = максимум */
export const BROTLI_COMPRESSION_LEVEL = 11

/** Уровень сжатия Gzip (0–9), 9 = максимум */
export const GZIP_COMPRESSION_LEVEL = 9

/** Минимальный размер файла для сжатия (1KB) — меньше не имеет смысла */
export const COMPRESSION_THRESHOLD_BYTES = 1024

// ──────────────────────────────────────────────
// Terser и обфускация
// ──────────────────────────────────────────────

/** Консольные методы для удаления из production */
export const PRODUCTION_DROP_CONSOLE = ['console.log', 'console.info', 'console.debug', 'console.warn'] as const

/** Количество проходов Terser — 2 = оптимальный баланс скорость/размер */
export const TERSER_COMPRESS_PASSES = 2

// ──────────────────────────────────────────────
// Legacy
// ──────────────────────────────────────────────

/** Целевые браузеры для legacy-полифиллов */
export const LEGACY_TARGETS = ['defaults', 'not IE 11'] as const

// ──────────────────────────────────────────────
// Пути проекта
// ──────────────────────────────────────────────

/** Корневая директория исходного кода */
export const SOURCE_DIR = 'src'

/** Директория вывода сборки */
export const OUTPUT_DIR = 'dist'

/** Директория статических ассетов в выводе */
export const ASSETS_DIR = 'assets'

/** Поддиректории ассетов для организации вывода */
export const ASSET_SUBDIRS = {
	js: 'js',
	css: 'css',
	images: 'images',
	fonts: 'fonts',
	media: 'media',
} as const
```

## Шаг 3: Создай вспомогательные функции

build/utils/helpers.ts

```ts
/**
 * Вспомогательные чистые функции сборки.
 * Каждая функция решает одну задачу (SRP — Чистый код, гл.3).
 * Все функции детерминированные — один вход, один выход.
 */

import { resolve } from 'node:path'

/** Определяет, является ли текущий режим production */
export function isProductionMode(mode: string): boolean {
	return mode === 'production'
}

/** Определяет, является ли текущий режим development */
export function isDevelopmentMode(mode: string): boolean {
	return mode === 'development'
}

/** Создаёт абсолютный путь относительно корня проекта */
export function resolveFromRoot(...segments: string[]): string {
	return resolve(process.cwd(), ...segments)
}

/**
 * Определяет поддиректорию ассета по расширению файла.
 * Используется в output.assetFileNames для организации dist/.
 */
export function getAssetSubdirByExtension(extname: string): string {
	const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tiff'])
	const fontExtensions = new Set(['.woff', '.woff2', '.eot', '.ttf', '.otf'])
	const mediaExtensions = new Set(['.mp4', '.webm', '.ogg', '.mp3', '.wav', '.flac', '.aac'])

	if (imageExtensions.has(extname)) return 'images'
	if (fontExtensions.has(extname)) return 'fonts'
	if (mediaExtensions.has(extname)) return 'media'

	return 'css'
}

/** Формирует шаблон имени файла для ассетов */
export function createAssetFileName(extname: string): string {
	const subdir = getAssetSubdirByExtension(extname)
	return `assets/${subdir}/[name]-[hash][extname]`
}
```

## Шаг 4: Настрой alias

build/config/alias.ts

```ts
/**
 * Псевдонимы путей.
 * Исключают магические относительные пути из кодовой базы.
 * Каждый alias ОБЯЗАТЕЛЬНО продублируй в tsconfig.json → paths.
 */

import type { AliasOptions } from 'vite'
import { resolveFromRoot } from '../utils/helpers'
import { SOURCE_DIR } from '../constants'

/** Создаёт карту alias для resolve.alias в Vite */
export function createAliasConfig(): AliasOptions {
	const srcPath = resolveFromRoot(SOURCE_DIR)

	return {
		'@': srcPath,
		'@components': resolveFromRoot(SOURCE_DIR, 'components'),
		'@views': resolveFromRoot(SOURCE_DIR, 'views'),
		'@layouts': resolveFromRoot(SOURCE_DIR, 'layouts'),
		'@composables': resolveFromRoot(SOURCE_DIR, 'composables'),
		'@stores': resolveFromRoot(SOURCE_DIR, 'stores'),
		'@assets': resolveFromRoot(SOURCE_DIR, 'assets'),
		'@styles': resolveFromRoot(SOURCE_DIR, 'assets/styles'),
		'@images': resolveFromRoot(SOURCE_DIR, 'assets/images'),
		'@utils': resolveFromRoot(SOURCE_DIR, 'utils'),
		'@types': resolveFromRoot(SOURCE_DIR, 'types'),
		'@api': resolveFromRoot(SOURCE_DIR, 'api'),
		'@constants': resolveFromRoot(SOURCE_DIR, 'constants'),
		'@router': resolveFromRoot(SOURCE_DIR, 'router'),
		'@plugins': resolveFromRoot(SOURCE_DIR, 'plugins'),
		'@directives': resolveFromRoot(SOURCE_DIR, 'directives'),
	}
}
```

Синхронизируй с tsconfig.json

```json
// tsconfig.json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@/*": ["src/*"],
			"@components/*": ["src/components/*"],
			"@views/*": ["src/views/*"],
			"@layouts/*": ["src/layouts/*"],
			"@composables/*": ["src/composables/*"],
			"@stores/*": ["src/stores/*"],
			"@assets/*": ["src/assets/*"],
			"@styles/*": ["src/assets/styles/*"],
			"@images/*": ["src/assets/images/*"],
			"@utils/*": ["src/utils/*"],
			"@types/*": ["src/types/*"],
			"@api/*": ["src/api/*"],
			"@constants/*": ["src/constants/*"],
			"@router/*": ["src/router/*"],
			"@plugins/*": ["src/plugins/*"],
			"@directives/*": ["src/directives/*"]
		}
	}
}
```

## Шаг 5: Настрой разрешение модулей

build/config/resolve.ts

```ts
/**
 * Конфигурация разрешения модулей.
 * Определяет порядок поиска расширений и дедупликацию.
 */

import type { ResolveOptions } from 'vite'
import { createAliasConfig } from './alias'

/** Расширения, которые Vite разрешает без явного указания */
const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.scss', '.css'] as const

/** Создаёт конфигурацию resolve для Vite */
export function createResolveConfig(): ResolveOptions {
	return {
		alias: createAliasConfig(),
		extensions: [...RESOLVE_EXTENSIONS],
		dedupe: ['vue', 'vue-router', 'pinia'],
	}
}
```

## Шаг 6: Настрой CSS и SCSS

build/config/css.ts

```ts
/**
 * Конфигурация стилей: SCSS, PostCSS, CSS-модули.
 * Глобальные переменные и миксины подключаются автоматически
 * через additionalData — не нужно импортировать вручную в каждом компоненте.
 */

import type { CSSOptions } from 'vite'
import { isProductionMode } from '../utils/helpers'

/** Глобальные SCSS-файлы, доступные во всех компонентах без импорта */
const GLOBAL_SCSS_IMPORTS = [
	'@use "@styles/variables" as *;',
	'@use "@styles/mixins" as *;',
	'@use "@styles/functions" as *;',
].join('\n')

/** Создаёт конфигурацию CSS для Vite */
export function createCssConfig(mode: string): CSSOptions {
	const isProduction = isProductionMode(mode)

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
			generateScopedName: isProduction ? '[hash:base64:8]' : '[name]__[local]--[hash:base64:5]',
		},

		devSourcemap: !isProduction,
	}
}
```

## Шаг 7: Настрой dev-сервер

build/config/server.ts

```ts
/**
 * Конфигурация dev-сервера.
 * HMR, proxy для API, CORS — всё для комфортной разработки.
 */

import type { ServerOptions, PreviewOptions } from 'vite'
import { DEV_SERVER_HOST, DEV_SERVER_PORT, PREVIEW_PORT } from '../constants'

/** Создаёт конфигурацию dev-сервера */
export function createServerConfig(): ServerOptions {
	return {
		host: DEV_SERVER_HOST,
		port: DEV_SERVER_PORT,
		strictPort: false,
		open: true,

		hmr: {
			overlay: true,
		},

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
	}
}

/** Создаёт конфигурацию preview-сервера */
export function createPreviewConfig(): PreviewOptions {
	return {
		host: DEV_SERVER_HOST,
		port: PREVIEW_PORT,
		strictPort: false,
		open: true,
		cors: true,
	}
}
```

## Шаг 8: Настрой оптимизацию сборки и чанки

build/config/build.ts

```ts
/**
 * Конфигурация production-сборки.
 * Чанки, минификация Terser, output-пути, лимиты.
 *
 * Стратегия чанков:
 * — vendor-vue:   Vue экосистема (vue, vue-router, pinia)
 * — vendor-ui:    UI-фреймворк (если подключён)
 * — vendor-utils: Утилитарные библиотеки
 * — vendor-libs:  Остальные node_modules
 * — app:          Код приложения — автоматический split по роутам
 */

import type { BuildOptions } from 'vite'
import { extname } from 'node:path'
import {
  # MIN_CHUNK_SIZE_BYTES,
  # MAX_CHUNK_WARNING_SIZE_KB,
  # PRODUCTION_DROP_CONSOLE,
  # TERSER_COMPRESS_PASSES,
  ## OUTPUT_DIR,
  ## ASSET_SUBDIRS,
} from '../constants'
import { createAssetFileName } from '../utils/helpers'

/** Пакеты Vue-экосистемы */
const VUE_ECOSYSTEM_PACKAGES = ['vue', '@vue', 'vue-router', 'pinia']

/** Пакеты UI-фреймворка — замени на свой */
const UI_FRAMEWORK_PACKAGES = ['element-plus', '@element-plus']

/** Утилитарные библиотеки */
const UTILITY_PACKAGES = ['lodash', 'lodash-es', 'axios', 'dayjs', 'date-fns']

/** Проверяет, принадлежит ли модуль одному из указанных пакетов */
function isFromPackages(moduleId: string, packages: string[]): boolean {
  return packages.some((pkg) => moduleId.includes(`node_modules/${pkg}`))
}

/**
 * Стратегия разделения на чанки.
 * Порядок проверок критичен — от частного к общему.
 */
function createManualChunks(moduleId: string): string | undefined {
  if (!moduleId.includes('node_modules')) return undefined

  if (isFromPackages(moduleId, VUE_ECOSYSTEM_PACKAGES)) return 'vendor-vue'
  if (isFromPackages(moduleId, UI_FRAMEWORK_PACKAGES)) return 'vendor-ui'
  if (isFromPackages(moduleId, UTILITY_PACKAGES)) return 'vendor-utils'

  return 'vendor-libs'
}

/** Создаёт конфигурацию production-сборки */
export function createBuildConfig(): BuildOptions {
  return {
    outDir: OUTPUT_DIR,
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2020',

    modulePreload: {
      polyfill: true,
    },

    chunkSizeWarningLimit: MAX_CHUNK_WARNING_SIZE_KB,

    // Terser медленнее esbuild, но сжимает на 10–15% лучше
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
        // hoist_vars: false — НЕ включай, ломает let/const в Safari
        hoist_vars: false,
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
          const ext = extname(assetInfo.name ?? '')
          return createAssetFileName(ext)
        },

        experimentalMinChunkSize: MIN_CHUNK_SIZE_BYTES,
        compact: true,
      },

      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    reportCompressedSize: true,
    // Файлы < 4KB инлайнятся в JS как base64 — экономит HTTP-запрос
    assetsInlineLimit: 4096,
  }
}
```

## Создание плагинов

### build/plugins/vue.ts

```ts
/**
 * Плагин Vue — компиляция SFC, defineModel, propsDestructure.
 */

import vue from '@vitejs/plugin-vue'
import type { PluginOption } from 'vite'
import { isProductionMode } from '../utils/helpers'

/** Создаёт плагин Vue с оптимальными настройками */
export function createVuePlugin(mode: string): PluginOption {
	const isProduction = isProductionMode(mode)

	return vue({
		script: {
			defineModel: true,
			propsDestructure: true,
		},

		template: {
			compilerOptions: {
				// В production удаляем комментарии из шаблонов — экономия размера
				comments: !isProduction,
			},
		},
	})
}
```

### build/plugins/svg.ts

```ts
/**
 * SVG: загрузка как Vue-компонент + SVGO-оптимизация.
 * Удаляет мусор из SVG (metadata, editor tags), сохраняет viewBox.
 */

import svgLoader from 'vite-svg-loader'
import type { PluginOption } from 'vite'

/** Конфигурация SVGO — удаление мусора с сохранением функциональности */
const SVGO_CONFIG = {
	multipass: true,
	plugins: [
		{
			name: 'preset-default',
			params: {
				overrides: {
					// КРИТИЧНО: viewBox нужен для масштабирования — не удаляем
					removeViewBox: false,
					// Сохраняем title для доступности (a11y)
					removeTitle: false,
				},
			},
		},
		{ name: 'removeDimensions' },
		{ name: 'removeXMLProcInst' },
		{ name: 'removeComments' },
		{ name: 'removeEmptyAttrs' },
		{ name: 'sortAttrs' },
	],
}

/** Создаёт плагин SVG-загрузчика */
export function createSvgPlugin(): PluginOption {
	return svgLoader({
		defaultImport: 'component',
		svgoConfig: SVGO_CONFIG,
	})
}
```

### build/plugins/images.ts

```ts
/**
 * Оптимизация растровых изображений.
 * Сжимает PNG, JPEG, WebP, GIF при сборке.
 *
 * ВАЖНО: vite-plugin-imagemin использует native-зависимости.
 * Если на CI не собирается — используй vite-plugin-image-optimizer
 * или оптимизируй изображения ДО сборки (squoosh, sharp CLI, tinypng).
 */

import imagemin from 'vite-plugin-imagemin'
import type { PluginOption } from 'vite'
import { IMAGE_QUALITY } from '../constants'

/** Создаёт плагин оптимизации изображений */
export function createImagePlugin(): PluginOption {
	return imagemin({
		gifsicle: {
			optimizationLevel: 3,
			interlaced: true,
			colors: IMAGE_QUALITY.gif,
		},

		optipng: {
			optimizationLevel: 7,
		},

		mozjpeg: {
			quality: IMAGE_QUALITY.mozjpeg,
			progressive: true,
		},

		pngquant: {
			quality: [IMAGE_QUALITY.pngQuality.min / 100, IMAGE_QUALITY.pngQuality.max / 100],
			speed: 4,
		},

		webp: {
			quality: IMAGE_QUALITY.webp,
			method: 6,
		},

		// SVG обрабатывается отдельным плагином
		svgo: false,
	})
}
```

### build/plugins/legacy.ts

```ts
/**
 * Поддержка старых браузеров.
 * Создаёт legacy-бандл с полифиллами.
 * Добавляет ~30–80KB — подключай только при реальной необходимости.
 */

import legacy from '@vitejs/plugin-legacy'
import type { PluginOption } from 'vite'
import { LEGACY_TARGETS } from '../constants'

/** Создаёт плагин legacy-поддержки */
export function createLegacyPlugin(): PluginOption {
	return legacy({
		targets: [...LEGACY_TARGETS],
		renderLegacyChunks: true,
		modernPolyfills: true,
		additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
	})
}
```

### build/plugins/compression.ts

```ts
/**
 * Сжатие ассетов: Brotli (приоритет) + Gzip (фолбэк).
 * Brotli сжимает на 15–25% лучше Gzip.
 * Оригиналы сохраняются — сервер выбирает формат по Accept-Encoding.
 */

import { compression } from 'vite-plugin-compression2'
import type { PluginOption } from 'vite'
import {
  # BROTLI_COMPRESSION_LEVEL,
  # GZIP_COMPRESSION_LEVEL,
  # COMPRESSION_THRESHOLD_BYTES,
} from '../constants'

/** Расширения файлов, которые имеет смысл сжимать */
const COMPRESSIBLE_EXTENSIONS = /\.(js|css|html|json|svg|xml|txt|wasm)$/

/** Создаёт плагин Brotli-сжатия */
function createBrotliPlugin(): PluginOption {
  return compression({
    algorithm: 'brotliCompress',
    include: COMPRESSIBLE_EXTENSIONS,
    threshold: COMPRESSION_THRESHOLD_BYTES,
    deleteOriginalAssets: false,
    compressionOptions: {
      level: BROTLI_COMPRESSION_LEVEL,
    },
  })
}

/** Создаёт плагин Gzip-сжатия */
function createGzipPlugin(): PluginOption {
  return compression({
    algorithm: 'gzip',
    include: COMPRESSIBLE_EXTENSIONS,
    threshold: COMPRESSION_THRESHOLD_BYTES,
    deleteOriginalAssets: false,
    compressionOptions: {
      level: GZIP_COMPRESSION_LEVEL,
    },
  })
}

/** Создаёт оба плагина сжатия */
export function createCompressionPlugins(): PluginOption[] {
  return [createBrotliPlugin(), createGzipPlugin()]
}
```

### build/plugins/obfuscation.ts

```ts
/**
 * Обфускация JS-кода.
 * ЗАМЕДЛЯЕТ сборку в 3–5 раз — используй ТОЛЬКО если нужно скрыть бизнес-логику.
 * Для большинства проектов Terser mangling достаточно.
 */

import obfuscator from 'rollup-plugin-obfuscator'
import type { PluginOption } from 'vite'

/** Создаёт плагин обфускации */
export function createObfuscationPlugin(): PluginOption {
	return obfuscator({
		options: {
			compact: true,
			controlFlowFlattening: false,
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
	}) as PluginOption
}
```

### build/plugins/index.ts

```ts
/**
 * Агрегатор плагинов.
 * Собирает все плагины в единый массив.
 * Порядок важен — Vue должен быть первым.
 *
 * Legacy и обфускация опциональны — раскомментируй при необходимости.
 */

import type { PluginOption } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { isProductionMode } from '../utils/helpers'
import { createVuePlugin } from './vue'
import { createSvgPlugin } from './svg'
import { createImagePlugin } from './images'
import { createLegacyPlugin } from './legacy'
import { createCompressionPlugins } from './compression'
import { createObfuscationPlugin } from './obfuscation'

/** Создаёт массив плагинов в зависимости от режима сборки */
export function createPlugins(mode: string): PluginOption[] {
	const isProduction = isProductionMode(mode)

	const plugins: PluginOption[] = [
		// Vue — всегда первый
		createVuePlugin(mode),

		// SVG как Vue-компоненты с SVGO-оптимизацией
		createSvgPlugin(),
	]

	if (isProduction) {
		plugins.push(
			// Оптимизация изображений
			createImagePlugin(),

			// Brotli + Gzip сжатие
			...createCompressionPlugins(),

			// Legacy-поддержка — раскомментируй если нужна
			// createLegacyPlugin(),

			// Обфускация — раскомментируй если нужно скрыть логику
			// createObfuscationPlugin(),
		)
	}

	// Анализатор бандла — создаёт stats.html в корне
	const isAnalyze = process.argv.includes('--analyze')
	if (isAnalyze) {
		plugins.push(
			visualizer({
				filename: 'stats.html',
				open: true,
				gzipSize: true,
				brotliSize: true,
				template: 'treemap',
			}) as PluginOption,
		)
	}

	return plugins
}
```

## Главный конфиг Vite

```ts
/**
 * Главный конфигурационный файл Vite.
 * Принцип: тонкий файл-делегатор.
 * Вся логика в build/ — здесь только композиция.
 */

import { defineConfig } from 'vite'
import { createResolveConfig } from './build/config/resolve'
import { createCssConfig } from './build/config/css'
import { createServerConfig, createPreviewConfig } from './build/config/server'
import { createBuildConfig } from './build/config/build'
import { createPlugins } from './build/plugins'

export default defineConfig(({ mode }) => ({
	resolve: createResolveConfig(),
	css: createCssConfig(mode),
	server: createServerConfig(),
	preview: createPreviewConfig(),
	plugins: createPlugins(mode),
	build: createBuildConfig(),
}))
```
