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
		lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'media' },
		rollupOptions: { external: ['vue', /^@ramzes1385\/rise-ui-kit(\/.*)?$/] },
	},
})
