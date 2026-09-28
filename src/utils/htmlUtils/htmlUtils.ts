/** Утилиты: очистка HTML из недоверенных источников и экранирование текста для HTML */

import { isSafeUrl, NAVIGATION_PROTOCOLS } from '@utils/urlUtils'

/**
 * Элементы, которые удаляются вместе с содержимым: исполняют код, встраивают чужие документы,
 * меняют разбор разметки (foreign content, raw text) или стили страницы.
 */
const DROPPED_TAGS = new Set([
	'applet',
	'base',
	'button',
	'embed',
	'form',
	'frame',
	'frameset',
	'head',
	'iframe',
	'input',
	'link',
	'math',
	'meta',
	'noembed',
	'noframes',
	'noscript',
	'object',
	'option',
	'plaintext',
	'script',
	'select',
	'style',
	'svg',
	'template',
	'textarea',
	'title',
	'xmp',
])

const GLOBAL_ATTRIBUTES = new Set(['style', 'title', 'dir', 'lang', 'align'])

/** Разрешённые элементы и их собственные атрибуты. Остальные элементы разворачиваются: остаётся содержимое. */
const ALLOWED_TAGS: Record<string, ReadonlySet<string>> = {
	a: new Set(['href', 'target', 'rel']),
	b: new Set(),
	blockquote: new Set(),
	br: new Set(),
	code: new Set(),
	del: new Set(),
	div: new Set(),
	em: new Set(),
	figcaption: new Set(),
	figure: new Set(),
	font: new Set(['color', 'size']),
	h1: new Set(),
	h2: new Set(),
	h3: new Set(),
	h4: new Set(),
	h5: new Set(),
	h6: new Set(),
	hr: new Set(),
	i: new Set(),
	img: new Set(['src', 'alt', 'width', 'height', 'loading']),
	ins: new Set(),
	kbd: new Set(),
	li: new Set(['value']),
	mark: new Set(),
	ol: new Set(['start', 'type', 'reversed']),
	p: new Set(),
	pre: new Set(),
	s: new Set(),
	small: new Set(),
	span: new Set(),
	strike: new Set(),
	strong: new Set(),
	sub: new Set(),
	sup: new Set(),
	u: new Set(),
	ul: new Set(),
	video: new Set(['src', 'poster', 'controls', 'width', 'height', 'loop', 'muted', 'playsinline', 'preload']),
}

/** CSS-свойства, которые оставляет редактор: цвет, выравнивание, начертание, размеры медиа */
const ALLOWED_STYLE_PROPERTIES = new Set([
	'background-color',
	'border-radius',
	'color',
	'font-size',
	'font-style',
	'font-weight',
	'height',
	'max-height',
	'max-width',
	'text-align',
	'text-decoration',
	'text-decoration-line',
	'width',
])

/** Значение CSS или цвета: только слова, числа, единицы, #hex и функции цвета — без url(), expression(), экранирования */
const SAFE_CSS_VALUE_RE = /^[#\w\s.,%()+-]+$/
const UNSAFE_CSS_VALUE_RE = /(url|expression|image-set|element|attr)\s*\(|\\/i

const ALLOWED_ALIGN = new Set(['left', 'center', 'right', 'justify'])
const ALLOWED_TARGETS = new Set(['_blank', '_self'])

/** Схемы источников медиа: blob: — файлы, выбранные пользователем в редакторе */
const MEDIA_PROTOCOLS = ['http:', 'https:', 'blob:'] as const
/**
 * Встроенные изображения data: — только тип image/*. SVG внутри <img> не исполняет скрипты,
 * а переход на data:-адрес в новой вкладке браузеры блокируют.
 */
const DATA_IMAGE_RE = /^data:image\/[\w.+-]+[;,]/i

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Экранирует текст для вставки в HTML — в содержимое элемента или в значение атрибута в кавычках. */
function escapeHtml(text: string): string {
	return text.replace(/[&<>"']/g, char => HTML_ESCAPES[char])
}

function isSafeCssValue(value: string): boolean {
	return SAFE_CSS_VALUE_RE.test(value) && !UNSAFE_CSS_VALUE_RE.test(value)
}

/** Если убирать нечего, возвращает исходную строку без изменений: иначе пересборка стиля меняла бы разметку, которую выдал сам редактор, и v-model сбрасывал бы содержимое вместе с кареткой. */
function sanitizeStyle(style: string): string {
	const declarations = style
		.split(';')
		.map(part => part.trim())
		.filter(Boolean)
	const safe = declarations.filter(declaration => {
		const colon = declaration.indexOf(':')
		if (colon === -1) return false
		const property = declaration.slice(0, colon).trim().toLowerCase()
		const value = declaration.slice(colon + 1).trim()
		return ALLOWED_STYLE_PROPERTIES.has(property) && isSafeCssValue(value)
	})
	return safe.length === declarations.length ? style : safe.join('; ')
}

function isSafeAttributeUrl(tag: string, value: string): boolean {
	if (tag === 'a') return isSafeUrl(value, NAVIGATION_PROTOCOLS)
	if (tag === 'img' && DATA_IMAGE_RE.test(value.trim())) return true
	return isSafeUrl(value, MEDIA_PROTOCOLS)
}

function isAllowedAttribute(tag: string, name: string, value: string): boolean {
	if (!GLOBAL_ATTRIBUTES.has(name) && !ALLOWED_TAGS[tag].has(name)) return false
	if (name === 'href' || name === 'src' || name === 'poster') return isSafeAttributeUrl(tag, value)
	if (name === 'align') return ALLOWED_ALIGN.has(value.trim().toLowerCase())
	if (name === 'target') return ALLOWED_TARGETS.has(value)
	if (name === 'color') return isSafeCssValue(value)
	return true
}

function sanitizeAttributes(element: Element, tag: string): void {
	for (const attribute of [...element.attributes]) {
		const name = attribute.name.toLowerCase()
		if (!isAllowedAttribute(tag, name, attribute.value)) {
			element.removeAttribute(attribute.name)
			continue
		}
		if (name !== 'style') continue
		const style = sanitizeStyle(attribute.value)
		if (!style) element.removeAttribute(attribute.name)
		else if (style !== attribute.value) element.setAttribute('style', style)
	}
	// Новая вкладка не должна получать доступ к странице через window.opener
	if (tag === 'a' && element.getAttribute('target') === '_blank') element.setAttribute('rel', 'noopener noreferrer')
}

function sanitizeChildren(parent: Element): void {
	for (const node of [...parent.childNodes]) {
		if (node.nodeType === Node.TEXT_NODE) continue
		if (node.nodeType !== Node.ELEMENT_NODE) {
			node.remove()
			continue
		}
		const element = node as Element
		const tag = element.tagName.toLowerCase()
		if (DROPPED_TAGS.has(tag)) {
			element.remove()
			continue
		}
		sanitizeChildren(element)
		if (tag in ALLOWED_TAGS) sanitizeAttributes(element, tag)
		else element.replaceWith(...element.childNodes)
	}
}

/**
 * Очищает HTML по списку разрешённых элементов, атрибутов и CSS-свойств — для разметки из редактора,
 * буфера обмена, CMS и других недоверенных источников.
 *
 * - `<script>`, `<style>`, `<iframe>`, `<svg>`, формы и похожие элементы удаляются вместе с содержимым;
 *   прочие неразрешённые элементы разворачиваются — текст остаётся.
 * - Обработчики `on*`, `class`, `id` и остальные неразрешённые атрибуты удаляются.
 * - Ссылки — только безопасные схемы (`isSafeUrl`); медиа — http, https, blob и `data:image/*` у изображений.
 * - `target="_blank"` получает `rel="noopener noreferrer"`.
 *
 * Разбор идёт в неактивном документе (`DOMParser`): скрипты не выполняются, ресурсы не загружаются.
 * Разметка, в которой нечего удалять, возвращается в той же сериализации.
 * Без DOM (SSR) возвращает экранированный текст.
 */
function sanitizeHtml(html: string): string {
	if (!html) return ''
	if (typeof DOMParser === 'undefined') return escapeHtml(html)
	const body = new DOMParser().parseFromString(html, 'text/html').body
	sanitizeChildren(body)
	return body.innerHTML
}

export { escapeHtml, sanitizeHtml }
