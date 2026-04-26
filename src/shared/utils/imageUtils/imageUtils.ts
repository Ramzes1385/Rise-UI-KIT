/** Проверить, является ли URL внешним (http/https) */
function isExternalImage(src: string): boolean {
	return src.startsWith('http://') || src.startsWith('https://')
}

/** Заменить расширение файла, сохраняя query-параметры */
function replaceExtension(src: string, newExt: string): string {
	const queryIndex = src.indexOf('?')
	const basePath = queryIndex === -1 ? src : src.substring(0, queryIndex)
	const query = queryIndex === -1 ? '' : src.substring(queryIndex)
	const dotIndex = basePath.lastIndexOf('.')
	if (dotIndex === -1) return src
	return basePath.substring(0, dotIndex) + newExt + query
}

/** Построить оптимизированный src с параметром ширины */
function buildOptimizedSrc(src: string, srcWidth?: number): string {
	if (!srcWidth) return src
	const separator = src.includes('?') ? '&' : '?'
	return `${src}${separator}w=${srcWidth}`
}

/** Построить srcset для адаптивных изображений */
function buildSrcset(src: string, srcWidth?: number): string | undefined {
	if (!srcWidth) return undefined
	const w1x = srcWidth
	const w2x = srcWidth * 2
	return `${src}?w=${w1x} 1x, ${src}?w=${w2x} 2x`
}

export { buildOptimizedSrc, buildSrcset, isExternalImage, replaceExtension }
