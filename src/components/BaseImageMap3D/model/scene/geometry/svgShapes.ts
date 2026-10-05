import type { Shape, ShapePath } from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { attributeSelector } from '@components/BaseImageMap/model/svg/useImageMapSvg'

export function parseSvgPaths(markup: string): ShapePath[] {
	if (!markup) return []
	return new SVGLoader().parse(markup).paths
}

function belongsTo(path: ShapePath, elementId: string): boolean {
	const node = path.userData.node as Element | undefined
	return Boolean(node?.closest(attributeSelector('id', elementId)))
}

export function svgElementShapes(paths: ShapePath[], elementId: string): Shape[] {
	return paths.filter(path => belongsTo(path, elementId)).flatMap(path => path.toShapes())
}
