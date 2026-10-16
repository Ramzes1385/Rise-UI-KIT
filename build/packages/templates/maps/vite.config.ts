import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const KIT_SCSS = fileURLToPath(new URL('./src/styles/kit', import.meta.url))

export default defineConfig({
	plugins: [vue()],
	css: {
		preprocessorOptions: {
			scss: {
				loadPaths: [KIT_SCSS],
				additionalData: '@use "variables" as *;\n@use "mixins" as *;\n@use "functions" as *;\n',
			},
		},
	},
	build: {
		target: 'es2020',
		lib: {
			entry: { index: 'src/index.ts', map3d: 'src/map3d.ts' },
			formats: ['es'],
			fileName: (_format, entryName) => `${entryName}.js`,
			cssFileName: 'maps',
		},
		rollupOptions: { external: ['vue', /^three(\/.*)?$/, /^@ramzes1385\/rise-ui-kit(\/.*)?$/] },
	},
})
