/** Утилиты: проверка URL из недоверенных данных перед навигацией, открытием окна или скачиванием */

/** Схемы, переход по которым не исполняет код в контексте страницы */
const NAVIGATION_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'] as const

/** Для скачивания дополнительно допустимы локально созданные blob: и data: URL */
const DOWNLOAD_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

/** Схема URL по RFC 3986: буква, затем буквы/цифры/+/-/. и двоеточие */
const SCHEME_RE = /^([a-z][a-z\d+.-]*):/i

/** Верхняя граница C0-диапазона (управляющие символы и пробел), который URL Standard срезает по краям */
const C0_OR_SPACE_MAX = 0x20

/**
 * Приводит строку к виду, в котором её разбирает браузер (URL Standard):
 * удаляет табы/переводы строк в любом месте и управляющие символы/пробелы по краям.
 * Без этого `java\tscript:` или ` javascript:` обошли бы проверку схемы.
 */
function normalizeUrl(url: string): string {
	const withoutBreaks = url.replace(/[\t\n\r]/g, '')
	let start = 0
	let end = withoutBreaks.length
	while (start < end && withoutBreaks.charCodeAt(start) <= C0_OR_SPACE_MAX) start++
	while (end > start && withoutBreaks.charCodeAt(end - 1) <= C0_OR_SPACE_MAX) end--
	return withoutBreaks.slice(start, end)
}

/**
 * Проверяет, что URL можно передать в `location.href`, `window.open` или `<a href>`.
 * Относительные адреса безопасны: они наследуют схему страницы.
 * Абсолютные — только из `allowedProtocols` (по умолчанию http/https/mailto/tel),
 * поэтому `javascript:`, `vbscript:`, `data:` и прочие схемы отклоняются.
 */
function isSafeUrl(url: string, allowedProtocols: readonly string[] = NAVIGATION_PROTOCOLS): boolean {
	if (typeof url !== 'string') return false
	const normalized = normalizeUrl(url)
	if (!normalized) return false
	const scheme = SCHEME_RE.exec(normalized)?.[1]
	if (!scheme) return true
	return allowedProtocols.includes(`${scheme.toLowerCase()}:`)
}

export { DOWNLOAD_PROTOCOLS, isSafeUrl, NAVIGATION_PROTOCOLS }
