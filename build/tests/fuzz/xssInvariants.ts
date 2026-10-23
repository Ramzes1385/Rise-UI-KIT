/**
 * Инварианты безопасности для результата очистки и для DOM компонентов. Проверка устроена независимо от кода кита:
 * адреса разбирает `URL` по стандарту WHATWG (как браузер), а не `isSafeUrl`, поэтому ошибка в `isSafeUrl` ею ловится.
 */

export const NAVIGATION_SCHEMES: ReadonlySet<string> = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const MEDIA_SCHEMES: ReadonlySet<string> = new Set(['http:', 'https:', 'blob:'])

/** Элементы, которых нет в очищенном HTML ни при каких входах */
const FORBIDDEN_IN_SANITIZED = new Set([
	'script',
	'iframe',
	'frame',
	'frameset',
	'object',
	'embed',
	'applet',
	'style',
	'link',
	'meta',
	'base',
	'form',
	'math',
	'svg',
	'noscript',
	'template',
	'textarea',
	'select',
	'option',
	'input',
	'button',
	'title',
	'xmp',
	'plaintext',
	'noembed',
	'noframes',
	'head',
	'body',
	'html',
	'image',
	'isindex',
	'keygen',
	'portal',
	'dialog',
	'slot',
	'bgsound',
	'layer',
	'marquee',
	'details',
	'audio',
	'source',
	'track',
	'foreignobject',
	'animate',
	'set',
	'use',
	'table',
	'caption',
	'td',
	'tr',
])

/** Элементы, которых нет в DOM любого компонента кита, даже если компонент выводит пользовательский текст */
const FORBIDDEN_IN_COMPONENTS = new Set([
	'script',
	'iframe',
	'frame',
	'frameset',
	'object',
	'embed',
	'applet',
	'style',
	'link',
	'meta',
	'base',
	'math',
	'noscript',
	'template',
	'xmp',
	'plaintext',
	'noembed',
	'noframes',
	'head',
	'isindex',
	'keygen',
	'portal',
	'bgsound',
	'layer',
	'marquee',
	'foreignobject',
	'animate',
	'set',
	'image',
])

/** Атрибуты, значение которых — адрес */
const URL_ATTRIBUTES = new Set([
	'href',
	'src',
	'xlink:href',
	'action',
	'formaction',
	'poster',
	'data',
	'background',
	'cite',
	'ping',
	'manifest',
	'codebase',
	'longdesc',
	'lowsrc',
	'dynsrc',
	'usemap',
	'profile',
	'archive',
	'classid',
	'icon',
])

const FORBIDDEN_ATTRIBUTES = new Set([
	'srcdoc',
	'srcset',
	'imagesrcset',
	'formaction',
	'xlink:href',
	'dynsrc',
	'lowsrc',
	'ping',
	'manifest',
	'codebase',
])

/** Значения style и подобных, в которых нет места адресам, выражениям и экранированию */
const UNSAFE_CSS_RE = /url\s*\(|expression\s*\(|javascript\s*:|behavior\s*:|-moz-binding|@import|image-set|\\|<|>/i

/** Схема адреса так, как её увидит браузер; null — адрес не разбирается (навигация по нему невозможна) */
export function schemeOf(url: string): string | null {
	try {
		return new URL(url, 'https://fuzz.invalid/base/').protocol
	} catch {
		return null
	}
}

/** Адрес `data:image/…` так, как его читает разбор URL: пробелы и управляющие символы по краям отбрасываются, табы и переводы строк — везде */
export function isDataImageUrl(url: string): boolean {
	return /^data:image\//i.test(url.replace(/[\t\n\r]/g, '').replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, ''))
}

function urlViolation(tag: string, name: string, value: string, schemes: ReadonlySet<string>): string | null {
	const scheme = schemeOf(value)
	if (scheme === null || schemes.has(scheme)) return null
	if (scheme === 'data:' && tag === 'img' && name === 'src' && isDataImageUrl(value)) return null
	return `${tag}[${name}] со схемой ${scheme}: ${JSON.stringify(value.slice(0, 80))}`
}

function schemesFor(tag: string, name: string): ReadonlySet<string> {
	return tag === 'a' && name === 'href' ? NAVIGATION_SCHEMES : MEDIA_SCHEMES
}

/**
 * Адрес в DOM компонента. Переходы (`a`, `area`, `form`) — только http, https, mailto, tel и относительные.
 * Ресурсы (`img`, `audio`, `video`, `source`) с `isMediaStrict` — как в очищенном HTML (http, https, blob, `data:image/*` у картинок).
 * Без него ресурс — адрес из данных приложения (аватар, вложение): кит передаёт его браузеру как есть, а браузеры не исполняют
 * `javascript:` в `src` ресурсов, поэтому проверяется только то, что адрес не создаёт ссылку-переход.
 * `use` внутри значка — только ссылка на `#id` (в самом документе или в спрайте кита по относительному пути).
 */
function componentUrlViolation(tag: string, name: string, value: string, isMediaStrict: boolean): string | null {
	if (tag === 'use')
		return /^[\w./-]*#[\w-]+$/.test(value.trim()) ? null : `use[${name}] не на #id: ${JSON.stringify(value.slice(0, 80))}`
	const scheme = schemeOf(value)
	if (scheme === null) return null
	const isNavigation = (tag === 'a' || tag === 'area' || tag === 'form') && (name === 'href' || name === 'action')
	if (isNavigation)
		return NAVIGATION_SCHEMES.has(scheme) ? null : `${tag}[${name}] со схемой ${scheme}: ${JSON.stringify(value.slice(0, 80))}`
	return isMediaStrict ? urlViolation(tag, name, value, MEDIA_SCHEMES) : null
}

export interface ComponentCheckOptions {
	isMediaStrict?: boolean
}

type UrlMode = { kind: 'sanitized' } | { kind: 'component'; isMediaStrict: boolean }

function attributeViolations(element: Element, tag: string, mode: UrlMode): string[] {
	const found: string[] = []
	for (const attribute of [...element.attributes]) {
		const name = attribute.name.toLowerCase()
		const value = attribute.value
		if (name.startsWith('on')) found.push(`<${tag}> с обработчиком ${name}`)
		else if (FORBIDDEN_ATTRIBUTES.has(name)) found.push(`<${tag}> с атрибутом ${name}`)
		else if (URL_ATTRIBUTES.has(name)) {
			const problem =
				mode.kind === 'sanitized'
					? urlViolation(tag, name, value, schemesFor(tag, name))
					: componentUrlViolation(tag, name, value, mode.isMediaStrict)
			if (problem) found.push(problem)
		} else if (name === 'style' && UNSAFE_CSS_RE.test(value)) found.push(`<${tag}> style: ${JSON.stringify(value.slice(0, 80))}`)
		else if (name === 'color' && UNSAFE_CSS_RE.test(value)) found.push(`<${tag}> color: ${JSON.stringify(value.slice(0, 80))}`)
	}
	if (tag === 'a' && element.getAttribute('target') === '_blank' && !/noopener/.test(element.getAttribute('rel') ?? '')) {
		found.push('<a target="_blank"> без rel="noopener"')
	}
	return found
}

function walk(root: Element, visit: (element: Element) => void): void {
	visit(root)
	for (const child of root.querySelectorAll('*')) visit(child)
}

/**
 * Нарушения в HTML-строке, прошедшей `sanitizeHtml`. Строка разбирается так, как её разберёт приложение при `innerHTML` и `v-html`
 * (контекст `div` в `body`): `DOMParser` увёл бы ведущий `<script>` или `<style>` в `head`, и проверка его не увидела бы.
 * Проверяются запрещённые элементы, `on*`, опасные адреса и стили.
 */
export function sanitizedHtmlViolations(html: string): string[] {
	const container = document.createElement('div')
	container.innerHTML = html
	const found: string[] = []
	walk(container, element => {
		if (element === container) return
		const tag = element.localName.toLowerCase()
		if (FORBIDDEN_IN_SANITIZED.has(tag)) found.push(`элемент <${tag}>`)
		found.push(...attributeViolations(element, tag, { kind: 'sanitized' }))
	})
	return found
}

const ICON_SAFE_TAGS = new Set([
	'svg',
	'use',
	'path',
	'g',
	'circle',
	'rect',
	'line',
	'polyline',
	'polygon',
	'ellipse',
	'defs',
	'clippath',
	'symbol',
])

/** Нарушения в DOM компонента: запрещённые элементы, `on*`, опасные адреса; `svg` — только значки (без скриптов и ссылок) */
export function componentViolations(root: Element, options: ComponentCheckOptions = {}): string[] {
	const found: string[] = []
	walk(root, element => {
		const tag = element.localName.toLowerCase()
		if (FORBIDDEN_IN_COMPONENTS.has(tag)) found.push(`элемент <${tag}>`)
		else if (element.closest('svg') && !ICON_SAFE_TAGS.has(tag)) found.push(`элемент <${tag}> внутри svg`)
		if (element.namespaceURI === 'http://www.w3.org/1998/Math/MathML') found.push(`элемент MathML <${tag}>`)
		found.push(...attributeViolations(element, tag, { kind: 'component', isMediaStrict: Boolean(options.isMediaStrict) }))
	})
	return found
}

/** Разбор в DOM и обратная сериализация: у очищенной разметки результат не должен меняться */
export function reparsedHtml(html: string): string {
	return new DOMParser().parseFromString(html, 'text/html').body.innerHTML
}
