/** Утилиты: проверка и обработка изображений */

/** Проверить, является ли URL внешним (http/https в любом регистре, protocol-relative `//`), blob или data-url */
function isExternalImage(src: string): boolean {
	return /^(?:https?:\/\/|\/\/|blob:|data:)/i.test(src)
}

/** Описание: разделитель query-параметра — `&`, если в адресе уже есть `?` */
function querySeparator(src: string): string {
	return src.includes('?') ? '&' : '?'
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

/** Адрес с параметром ширины `w`; без адреса — пустая строка */
function buildOptimizedSrc(src: string | undefined, srcWidth?: number): string {
	if (!src) return ''
	if (!srcWidth) return src
	return `${src}${querySeparator(src)}w=${srcWidth}`
}

/** srcset для 1x и 2x по параметру ширины `w`; без адреса или ширины — `undefined` */
function buildSrcset(src: string | undefined, srcWidth?: number): string | undefined {
	if (!src || !srcWidth) return undefined
	const separator = querySeparator(src)
	return `${src}${separator}w=${srcWidth} 1x, ${src}${separator}w=${srcWidth * 2} 2x`
}

/** Атрибут `sizes` по ширине: число — пиксели, строка в px, vw, em или rem — как есть, иначе (проценты, auto) — `100vw` */
function buildSizes(width: number | string | undefined): string {
	if (typeof width === 'number') return width > 0 ? `${width}px` : '100vw'
	if (width && /^\d+(?:\.\d+)?(?:px|vw|r?em)$/.test(width.trim())) return width.trim()
	return '100vw'
}

export { buildOptimizedSrc, buildSizes, buildSrcset, isExternalImage, replaceExtension }
