import type { Shape, ShapePath } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { attributeSelector } from '@components/BaseImageMap/model/svg/useImageMapSvg'
import type { SvgLayerSize } from '@components/BaseImageMap/types/internal/svgViewport.types'
import { mappingTransform, svgLayerMapping } from '@components/BaseImageMap/model/svg/svgViewport'

const SVG_NS = 'http://www.w3.org/2000/svg'

function mapToLayer(markup: string, layer: SvgLayerSize): string {
	const document = new DOMParser().parseFromString(markup, 'image/svg+xml')
	const root = document.documentElement
	const transform = mappingTransform(svgLayerMapping(root, layer))
	if (!transform) return markup
	const group = document.createElementNS(SVG_NS, 'g')
	group.setAttribute('transform', transform)
	group.append(...root.childNodes)
	root.append(group)
	return new XMLSerializer().serializeToString(document)
}

export function parseSvgPaths(markup: string, layer: SvgLayerSize): ShapePath[] {
	if (!markup) return []
	return new SVGLoader().parse(mapToLayer(markup, layer)).paths
}

function belongsTo(path: ShapePath, elementId: string): boolean {
	const node = path.userData.node as Element | undefined
	return Boolean(node?.closest(attributeSelector('id', elementId)))
}

export function svgElementShapes(paths: ShapePath[], elementId: string): Shape[] {
	return paths.filter(path => belongsTo(path, elementId)).flatMap(path => path.toShapes())
}
