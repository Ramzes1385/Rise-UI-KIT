import type { Shape, ShapePath } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { attributeSelector } from '@components/BaseImageMap/model/svg/useImageMapSvg'

const SVG_NS = 'http://www.w3.org/2000/svg'

function viewBoxOrigin(root: Element): [number, number] | null {
	const box = (root.getAttribute('viewBox') ?? '')
		.trim()
		.split(/[\s,]+/)
		.map(Number)
	if (box.length !== 4 || box.some(value => !Number.isFinite(value))) return null
	return box[0] || box[1] ? [box[0], box[1]] : null
}

function shiftToViewBox(markup: string): string {
	const document = new DOMParser().parseFromString(markup, 'image/svg+xml')
	const root = document.documentElement
	const origin = viewBoxOrigin(root)
	if (!origin) return markup
	const group = document.createElementNS(SVG_NS, 'g')
	group.setAttribute('transform', `translate(${-origin[0]} ${-origin[1]})`)
	group.append(...root.childNodes)
	root.append(group)
	return new XMLSerializer().serializeToString(document)
}

export function parseSvgPaths(markup: string): ShapePath[] {
	if (!markup) return []
	return new SVGLoader().parse(shiftToViewBox(markup)).paths
}

function belongsTo(path: ShapePath, elementId: string): boolean {
	const node = path.userData.node as Element | undefined
	return Boolean(node?.closest(attributeSelector('id', elementId)))
}

export function svgElementShapes(paths: ShapePath[], elementId: string): Shape[] {
	return paths.filter(path => belongsTo(path, elementId)).flatMap(path => path.toShapes())
}
