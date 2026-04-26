/**
 * Сжатие ассетов: Brotli (приоритет) + Gzip (фолбэк).
 */

import { constants as zlibConstants } from 'node:zlib'
import type { PluginOption } from 'vite'
import { compression, defineAlgorithm } from 'vite-plugin-compression2'
import { BROTLI_COMPRESSION_LEVEL, COMPRESSION_THRESHOLD_BYTES, GZIP_COMPRESSION_LEVEL } from '../constants'

/** Расширения файлов, которые имеет смысл сжимать */
const COMPRESSIBLE_EXTENSIONS = /\.(js|css|html|json|svg|xml|txt|wasm)$/

/** Создаёт плагин сжатия (Brotli + Gzip) */
export function createCompressionPlugins(): PluginOption[] {
	return [
		compression({
			include: COMPRESSIBLE_EXTENSIONS,
			threshold: COMPRESSION_THRESHOLD_BYTES,
			deleteOriginalAssets: false,
			algorithms: [
				defineAlgorithm('brotliCompress', {
					params: { [zlibConstants.BROTLI_PARAM_QUALITY]: BROTLI_COMPRESSION_LEVEL },
				}),
				defineAlgorithm('gzip', { level: GZIP_COMPRESSION_LEVEL }),
			],
		}),
	]
}
