const SVG_NS = 'http://www.w3.org/2000/svg'

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

const TEXT_ONLY_TAGS = new Set(['title', 'desc'])

const PRESENTATION_PROPERTIES = [
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
	'stop-color',
	'stop-opacity',
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
]

const STYLE_PROPERTIES = new Set(PRESENTATION_PROPERTIES)

const ALLOWED_ATTRIBUTES = new Set([
	...PRESENTATION_PROPERTIES,
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
	'offset',
	'gradientunits',
	'gradienttransform',
	'patternunits',
	'patterntransform',
	'style',
	'href',
])

const SAFE_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'matrix', 'translate', 'scale', 'rotate', 'skewx', 'skewy'])

const LOCAL_URL_RE = /url\(\s*['"]?#[\w.:-]+['"]?\s*\)/gi
const FUNCTION_RE = /([\w-]*)\s*\(/g
const FORBIDDEN_RE = /javascript:|@|\\|\/\*|[<>]/i
const DATA_IMAGE_RE = /^data:image\/(png|jpe?g|gif|webp);base64,[\w+/=\s]+$/i
const ID_REF_RE = /^#[\w.:-]+$/

function isSafeValue(value: string): boolean {
	const rest = value.replace(LOCAL_URL_RE, '')
	if (FORBIDDEN_RE.test(rest)) return false
	return [...rest.matchAll(FUNCTION_RE)].every(([, name]) => SAFE_FUNCTIONS.has(String(name).toLowerCase()))
}

function isSafeHref(tag: string, value: string): boolean {
	if (tag === 'image') return DATA_IMAGE_RE.test(value)
	return ID_REF_RE.test(value)
}

function cleanDeclaration(declaration: string): string {
	const index = declaration.indexOf(':')
	const name = declaration.slice(0, index).trim().toLowerCase()
	const value = declaration.slice(index + 1).trim()
	return STYLE_PROPERTIES.has(name) && value && isSafeValue(value) ? `${name}: ${value}` : ''
}

function cleanValue(tag: string, name: string, value: string): string | null {
	if (name === 'style') return value.split(';').map(cleanDeclaration).filter(Boolean).join('; ') || null
	if (name === 'href') return isSafeHref(tag, value.trim()) ? value.trim() : null
	return isSafeValue(value) ? value : null
}

function targetName(source: Element, attribute: Attr): string | null {
	const name = attribute.name.toLowerCase()
	if (name === 'xlink:href') return source.hasAttribute('href') ? null : 'href'
	return ALLOWED_ATTRIBUTES.has(name) ? attribute.name : null
}

function copyAttributes(source: Element, target: Element, tag: string): void {
	for (const attribute of source.attributes) {
		const name = targetName(source, attribute)
		const value = name === null ? null : cleanValue(tag, name.toLowerCase(), attribute.value)
		if (name !== null && value !== null) target.setAttribute(name, value)
	}
}

function copyNode(node: Node, isTextOnly: boolean): Node | null {
	if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE)
		return document.createTextNode(String(node.nodeValue))
	if (node.nodeType !== Node.ELEMENT_NODE || isTextOnly) return null
	return copyElement(node as Element)
}

function copyElement(source: Element): Element | null {
	const tag = source.localName.toLowerCase()
	if (!ALLOWED_TAGS.has(tag)) return null
	const target = document.createElementNS(SVG_NS, source.localName)
	copyAttributes(source, target, tag)
	for (const node of source.childNodes) {
		const child = copyNode(node, TEXT_ONLY_TAGS.has(tag))
		if (child) target.append(child)
	}
	return target
}

const HREF_NAMES = new Set(['href', 'xlink:href'])

function prefixReference(name: string, value: string, prefix: string): string {
	if (HREF_NAMES.has(name.toLowerCase())) return value.replace(/^#/, `#${prefix}`)
	return value.replace(/url\(\s*(['"]?)#/gi, `url($1#${prefix}`)
}

function prefixIds(root: Element, prefix: string): void {
	for (const element of [root, ...root.querySelectorAll('*')]) {
		for (const attribute of [...element.attributes]) {
			if (attribute.name === 'id') element.setAttribute('id', `${prefix}${attribute.value}`)
			else if (attribute.value.includes('#'))
				element.setAttribute(attribute.name, prefixReference(attribute.name, attribute.value, prefix))
		}
	}
}

export function sanitizeSvg(markup: string, idPrefix: string): string {
	const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml')
	const source = parsed.documentElement
	if (source.localName !== 'svg' || parsed.getElementsByTagName('parsererror').length) return ''
	const root = copyElement(source) as Element
	prefixIds(root, idPrefix)
	root.setAttribute('width', '100%')
	root.setAttribute('height', '100%')
	return root.outerHTML
}
