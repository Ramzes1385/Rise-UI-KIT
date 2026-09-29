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

/** Адрес электронной почты без схемы: team@example.com */
const EMAIL_RE = /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/
/** Хост с портом без схемы: localhost:3000, example.com:8080/path — двоеточие здесь не отделяет схему */
const HOST_WITH_PORT_RE = /^[\w-]+(\.[\w-]+)*:\d+([/?#]|$)/
/** Схемы, у которых после двоеточия сразу идут данные: tel:88005553535 не должен стать хостом с портом */
const DATA_SCHEME_RE = /^(mailto|tel):/i

/**
 * Приводит введённый пользователем адрес к ссылке: `example.com` → `https://example.com`,
 * `localhost:3000` → `https://localhost:3000`, `team@example.com` → `mailto:team@example.com`.
 * Адреса со схемой и относительные (`/docs`, `#anchor`, `./file`, `?q=1`) не меняются —
 * их безопасность проверяет `isSafeUrl`.
 */
function normalizeLinkUrl(input: string): string {
	const url = input.trim()
	if (!url || /^[/#?.]/.test(url) || DATA_SCHEME_RE.test(url)) return url
	if (EMAIL_RE.test(url)) return `mailto:${url}`
	if (HOST_WITH_PORT_RE.test(url) || !SCHEME_RE.test(url)) return `https://${url}`
	return url
}

/**
 * Адрес вне приложения: со схемой (`https://…`, `mailto:`) или протокол-относительный (`//cdn.example.com`).
 * Такой адрес открывается обычной ссылкой `<a href>`, а не RouterLink: роутер принял бы его за путь.
 */
function isExternalUrl(url: string): boolean {
	const normalized = normalizeUrl(url)
	return normalized.startsWith('//') || SCHEME_RE.test(normalized)
}

export { DOWNLOAD_PROTOCOLS, isExternalUrl, isSafeUrl, NAVIGATION_PROTOCOLS, normalizeLinkUrl }
