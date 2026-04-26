/**
 * Конфигурация dev-сервера.
 * HMR, proxy для API, CORS — всё для комфортной разработки.
 */

import type { PreviewOptions, ServerOptions } from 'vite'
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
