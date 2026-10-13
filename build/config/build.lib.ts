import { resolve } from 'node:path'
import type { BuildOptions } from 'vite'

/** Тяжёлые компоненты `src/plugin/registry/lazy.ts`: каждый — в свой чанк, который плагин грузит по `import()` */
const LAZY_COMPONENTS = ['BaseCalendar', 'BaseChat', 'BaseDatePicker', 'BaseEditor', 'BaseFileUpload', 'BaseTable']

export function createLibBuildConfig(): BuildOptions {
	return {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: false,
		cssCodeSplit: false,
		target: 'es2020',
		minify: 'oxc',

		lib: {
			entry: {
				index: resolve(process.cwd(), 'src/index.ts'),
				components: resolve(process.cwd(), 'src/components/index.ts'),
				composables: resolve(process.cwd(), 'src/composables/index.ts'),
				utils: resolve(process.cwd(), 'src/utils/index.ts'),
				icons: resolve(process.cwd(), 'src/icons/index.ts'),
				media: resolve(process.cwd(), 'src/components/BaseMediaPlayer/index.ts'),
				map3d: resolve(process.cwd(), 'src/map3d.ts'),
			},
			formats: ['es'],
			cssFileName: 'styles',
		},

		rollupOptions: {
			external: ['vue', /^three(\/.*)?$/],
			// Нужно для includeDependenciesRecursively: false (ниже); у входов могут появиться служебные имена экспорта (в .d.ts их нет)
			preserveEntrySignatures: 'allow-extension',

			output: {
				entryFileNames: '[name].js',
				strictExecutionOrder: true,
				chunkFileNames: 'chunks/[name]-[hash].js',

				// Тяжёлые компоненты плагина — в свои чанки без общих зависимостей: потребитель, которому нужен только
				// createUiKitPlugin, грузит их по import() (FOLLOW_UPS № 58)
				codeSplitting: {
					includeDependenciesRecursively: false,
					groups: LAZY_COMPONENTS.map(component => ({
						name: `lazy-${component}`,
						test: new RegExp(`[\\/]src[\\/]components[\\/]${component}[\\/](?:ui|model|styles)[\\/]`),
						priority: 10,
					})),
				},

				assetFileNames: assetInfo => {
					const name = assetInfo.name ?? ''

					if (name.endsWith('.css')) {
						return 'styles.css'
					}

					if (name === 'icons.svg') {
						return 'icons.svg'
					}

					return 'assets/[name]-[hash][extname]'
				},
			},
		},

		reportCompressedSize: false,
	}
}
