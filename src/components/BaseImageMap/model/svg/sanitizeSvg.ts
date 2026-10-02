const ALLOWED_TAGS = new Set([
	'svg',
	'g',
	'path',
	'rect',
	'circle',
	'ellipse',
	'line',
	'polyline',
	'polygon',
	'text',
	'tspan',
	'title',
	'desc',
	'defs',
	'lineargradient',
	'radialgradient',
	'stop',
	'clippath',
	'mask',
	'pattern',
	'symbol',
	'use',
	'image',
])

const ALLOWED_ATTRIBUTES = new Set([
	'id',
	'class',
	'd',
	'x',
	'y',
	'x1',
	'x2',
	'y1',
	'y2',
	'dx',
	'dy',
	'cx',
	'cy',
	'r',
	'rx',
	'ry',
	'fx',
	'fy',
	'width',
	'height',
	'points',
	'transform',
	'viewbox',
	'preserveaspectratio',
	'fill',
	'fill-opacity',
	'fill-rule',
	'clip-rule',
	'stroke',
	'stroke-width',
	'stroke-opacity',
	'stroke-linecap',
	'stroke-linejoin',
	'stroke-dasharray',
	'stroke-dashoffset',
	'stroke-miterlimit',
	'opacity',
	'offset',
	'stop-color',
	'stop-opacity',
	'gradientunits',
	'gradienttransform',
	'patternunits',
	'patterntransform',
	'clip-path',
	'mask',
	'font-size',
	'font-family',
	'font-weight',
	'font-style',
	'text-anchor',
	'dominant-baseline',
	'letter-spacing',
	'display',
	'visibility',
	'vector-effect',
	'style',
	'href',
	'xlink:href',
])

const LOCAL_URL_RE = /url\(\s*['"]?#[\w.:-]+['"]?\s*\)/gi
const UNSAFE_VALUE_RE = /url\s*\(|expression\s*\(|javascript:|@import|\\/i
const DATA_IMAGE_RE = /^data:image\/(png|jpe?g|gif|webp);base64,[\w+/=\s]+$/i
const ID_REF_RE = /^#[\w.:-]+$/

function isSafeValue(value: string): boolean {
	return !UNSAFE_VALUE_RE.test(value.replace(LOCAL_URL_RE, ''))
}

function isSafeHref(tag: string, value: string): boolean {
	if (tag === 'image') return DATA_IMAGE_RE.test(value.trim())
	return ID_REF_RE.test(value.trim())
}

function isAllowedAttribute(tag: string, name: string, value: string): boolean {
	if (name.startsWith('data-')) return isSafeValue(value)
	if (!ALLOWED_ATTRIBUTES.has(name)) return false
	if (name === 'href' || name === 'xlink:href') return isSafeHref(tag, value)
	return isSafeValue(value)
}

function cleanAttributes(element: Element): void {
	const tag = element.tagName.toLowerCase()
	for (const attribute of [...element.attributes]) {
		if (!isAllowedAttribute(tag, attribute.name.toLowerCase(), attribute.value)) element.removeAttribute(attribute.name)
	}
}

function cleanTree(parent: Element): void {
	for (const child of [...parent.children]) {
		if (ALLOWED_TAGS.has(child.tagName.toLowerCase())) {
			cleanAttributes(child)
			cleanTree(child)
		} else {
			child.remove()
		}
	}
}

function prefixReference(value: string, prefix: string): string {
	return value.replace(/#([\w.:-]+)/g, `#${prefix}$1`)
}

function prefixIds(root: Element, prefix: string): void {
	for (const element of [root, ...root.querySelectorAll('*')]) {
		for (const attribute of [...element.attributes]) {
			if (attribute.name === 'id') element.setAttribute('id', `${prefix}${attribute.value}`)
			else if (attribute.value.includes('#')) element.setAttribute(attribute.name, prefixReference(attribute.value, prefix))
		}
	}
}

export function sanitizeSvg(markup: string, idPrefix: string): string {
	const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml')
	const root = parsed.documentElement
	if (root.tagName.toLowerCase() !== 'svg' || parsed.getElementsByTagName('parsererror').length) return ''
	cleanAttributes(root)
	cleanTree(root)
	prefixIds(root, idPrefix)
	root.setAttribute('width', '100%')
	root.setAttribute('height', '100%')
	return root.outerHTML
}
