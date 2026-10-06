import { attributeSelector } from '@components/BaseImageMap/model/svg/useImageMapSvg'

const SVG_NS = 'http://www.w3.org/2000/svg'
const XLINK_NS = 'http://www.w3.org/1999/xlink'
const MAX_USE_PASSES = 6
const MAX_USES = 500
const NOT_RENDERED = 'defs, clipPath, mask, pattern, symbol'
const HIDDEN_STYLE = /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse))\s*(?:;|$)/i
const USE_ATTRIBUTES = new Set(['href', 'xlink:href', 'x', 'y', 'width', 'height'])

function isHidden(element: Element): boolean {
	const visibility = element.getAttribute('visibility')?.trim()
	return (
		element.getAttribute('display')?.trim() === 'none' ||
		visibility === 'hidden' ||
		visibility === 'collapse' ||
		HIDDEN_STYLE.test(element.getAttribute('style') ?? '')
	)
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

function expandUse(use: Element, root: Element): void {
	const target = referencedElement(use, root)
	if (!target) {
		use.remove()
		return
	}
	const group = use.ownerDocument.createElementNS(SVG_NS, 'g')
	for (const attribute of use.attributes) if (!USE_ATTRIBUTES.has(attribute.name)) group.setAttribute(attribute.name, attribute.value)
	const transform = [use.getAttribute('transform'), useOffset(use)].filter(Boolean).join(' ')
	if (transform) group.setAttribute('transform', transform)
	const copy = target.cloneNode(true) as Element
	for (const element of [copy, ...copy.querySelectorAll('[id]')]) element.removeAttribute('id')
	group.append(...(target.localName === 'symbol' ? copy.childNodes : [copy]))
	use.replaceWith(group)
}

function expandUses(root: Element): void {
	let budget = MAX_USES
	for (let pass = 0; pass < MAX_USE_PASSES; pass += 1) {
		const uses = [...root.querySelectorAll('use')].filter(use => !use.closest(NOT_RENDERED))
		if (!uses.length) return
		for (const use of uses) {
			if (budget > 0) expandUse(use, root)
			else use.remove()
			budget -= 1
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
