/** Утилиты: проверка и обработка изображений */

/** Проверить, является ли URL внешним (http/https), blob или data-url */
function isExternalImage(src: string): boolean {
	return src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:') || src.startsWith('data:')
}

/** Индекс начала пути: у абсолютного и protocol-relative URL путь идёт после хоста (-1 — пути нет) */
function getPathStart(url: string): number {
	const schemeIndex = url.indexOf('://')
	if (schemeIndex !== -1) return url.indexOf('/', schemeIndex + 3)
	if (url.startsWith('//')) return url.indexOf('/', 2)
	return 0
}

/** Заменить расширение файла, сохраняя query-параметры и hash; без расширения у файла возвращает src без изменений */
function replaceExtension(src: string, newExt: string): string {
	const suffixIndex = src.search(/[?#]/)
	const basePath = suffixIndex === -1 ? src : src.substring(0, suffixIndex)
	const suffix = suffixIndex === -1 ? '' : src.substring(suffixIndex)
	if (getPathStart(basePath) === -1) return src
	// Расширение ищется только в имени файла: точки в домене и каталогах (images.unsplash.com, ../img) им не являются
	const fileNameStart = basePath.lastIndexOf('/') + 1
	const dotIndex = basePath.lastIndexOf('.')
	if (dotIndex <= fileNameStart) return src
	return basePath.substring(0, dotIndex) + newExt + suffix
}

function buildOptimizedSrc(src: string, srcWidth?: number): string {
	if (!srcWidth) return src
	const separator = src.includes('?') ? '&' : '?'
	return `${src}${separator}w=${srcWidth}`
}

function buildSrcset(src: string, srcWidth?: number): string | undefined {
	if (!srcWidth) return undefined
	const w1x = srcWidth
	const w2x = srcWidth * 2
	return `${src}?w=${w1x} 1x, ${src}?w=${w2x} 2x`
}

export { buildOptimizedSrc, buildSrcset, isExternalImage, replaceExtension }
