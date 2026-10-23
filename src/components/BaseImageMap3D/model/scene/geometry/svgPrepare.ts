import { warn } from '@/locales/warn'
import { UI_IMAGE_MAP_3D } from '@/locales/messages'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import { attributeSelector } from '@components/BaseImageMap/model/svg/useImageMapSvg'

const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'
const MAX_USE_PASSES = 6
const MAX_USES = 500
const MAX_COPIED_ELEMENTS = 20_000
const NOT_RENDERED = 'defs, clipPath, mask, pattern, symbol'
const DISPLAY_NONE_STYLE = /(?:^|;)\s*display\s*:\s*none\s*(?:;|$)/i
const VISIBILITY_STYLE = /(?:^|;)\s*visibility\s*:\s*([a-z]+)\s*(?:;|$)/i
const USE_ATTRIBUTES = new Set(['href', 'xlink:href', 'x', 'y', 'width', 'height'])

function isDisplayNone(element: Element): boolean {
	return element.getAttribute('display')?.trim() === 'none' || DISPLAY_NONE_STYLE.test(element.getAttribute('style') ?? '')
}

function visibilityOf(element: Element): string | undefined {
	const style = VISIBILITY_STYLE.exec(element.getAttribute('style') ?? '')?.[1]
	return (style ?? element.getAttribute('visibility')?.trim())?.toLowerCase() || undefined
}

function isInvisible(element: Element): boolean {
	for (let node: Element | null = element; node; node = node.parentElement) {
		const visibility = visibilityOf(node)
		if (visibility && visibility !== 'inherit') return visibility !== 'visible'
	}
	return false
}

function isHidden(element: Element): boolean {
	if (isDisplayNone(element)) return true
	return isInvisible(element) && ![...element.querySelectorAll('*')].some(child => visibilityOf(child) === 'visible')
}

function referencedElement(use: Element, root: Element): Element | null {
	const href = use.getAttribute('href') ?? use.getAttributeNS(XLINK_NS, 'href') ?? ''
	if (!href.startsWith('#')) return null
	const target = root.querySelector(attributeSelector('id', href.slice(1)))
	return target && !target.contains(use) ? target : null
}

function useOffset(use: Element): string | null {
	const x = Number.parseFloat(use.getAttribute('x') ?? '') || 0
	const y = Number.parseFloat(use.getAttribute('y') ?? '') || 0
	return x || y ? `translate(${x} ${y})` : null
}

function expandUse(use: Element, target: Element): void {
	const group = use.ownerDocument.createElementNS(SVG_NS, 'g')
	for (const attribute of use.attributes) if (!USE_ATTRIBUTES.has(attribute.name)) group.setAttribute(attribute.name, attribute.value)
	const transform = [use.getAttribute('transform'), useOffset(use)].filter(Boolean).join(' ')
	if (transform) group.setAttribute('transform', transform)
	const copy = target.cloneNode(true) as Element
	for (const element of [copy, ...copy.querySelectorAll('[id]')]) element.removeAttribute('id')
	group.append(...(target.localName === 'symbol' ? copy.childNodes : [copy]))
	use.replaceWith(group)
}

function warnUseLimit(): void {
	if (isDevelopmentBuild()) warn(UI_IMAGE_MAP_3D.SVG_USE_LIMIT, { uses: MAX_USES, elements: MAX_COPIED_ELEMENTS })
}

function expandPass(uses: Element[], root: Element, budget: { uses: number; elements: number }): boolean {
	for (const use of uses) {
		const target = referencedElement(use, root)
		const size = target ? target.getElementsByTagName('*').length + 1 : 0
		if (!target || budget.uses <= 0 || size > budget.elements) {
			use.remove()
			if (target) return false
			continue
		}
		budget.uses -= 1
		budget.elements -= size
		expandUse(use, target)
	}
	return true
}

function expandUses(root: Element): void {
	const budget = { uses: MAX_USES, elements: MAX_COPIED_ELEMENTS }
	for (let pass = 0; pass < MAX_USE_PASSES; pass += 1) {
		const uses = [...root.querySelectorAll('use')].filter(use => !use.closest(NOT_RENDERED))
		if (!uses.length) return
		if (!expandPass(uses, root, budget)) {
			warnUseLimit()
			break
		}
	}
	root.querySelectorAll('use').forEach(use => use.remove())
}

function dropNotRendered(root: Element): void {
	root.querySelectorAll('*').forEach(element => {
		if (isHidden(element)) element.remove()
	})
	root.querySelectorAll('clipPath, mask, pattern, symbol').forEach(element => element.remove())
}

export function prepareSvgRoot(root: Element): void {
	expandUses(root)
	dropNotRendered(root)
}
