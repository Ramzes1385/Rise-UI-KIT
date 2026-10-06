import { warn } from '@/locales/warn'
import type { ShapePath } from 'three'
import { svgElementShapes } from './svgShapes'
import { UI_IMAGE_MAP_3D } from '@/locales/messages'
import { objectHeight, svgPartSpecs } from '../sceneLayout'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { ImageMap3DObject } from '../../../types/imageMap3dData.types'
import type { ImageMapSvgObject } from '@components/BaseImageMap/types/imageMapData.types'
import type { SceneSettings, SceneShapePart } from '../../../types/internal/imageMap3dInternal.types'

const SVG_CURVE_SEGMENTS = 10

function warnMissing(message: string, info: { layer: string; element: string; id: string }): void {
	if (isDevelopmentBuild()) warn(message, info)
}

function usedAncestors(path: ShapePath, used: ReadonlySet<string>): string[] {
	const ids: string[] = []
	for (let node = path.userData.node as Element | null; node; node = node.parentElement) if (used.has(node.id)) ids.push(node.id)
	return ids
}

export function svgElementIds(object: ImageMap3DObject & ImageMapSvgObject, settings: SceneSettings): string[] {
	const specs = svgPartSpecs(object, settings)
	return specs.length ? specs.map(spec => spec.elementId) : [object.elementId]
}

export function warnNestedElements(paths: ShapePath[], used: ReadonlySet<string>, layerId: string): void {
	if (!isDevelopmentBuild()) return
	const pairs = new Set(
		paths.map(path => usedAncestors(path, used)).flatMap(ids => (ids.length > 1 ? [`${ids[0]}\n${ids[ids.length - 1]}`] : [])),
	)
	pairs.forEach(pair => {
		const [inner, outer] = pair.split('\n')
		warn(UI_IMAGE_MAP_3D.SVG_ELEMENT_NESTED, { layer: layerId, inner, outer })
	})
}

export function svgParts(
	object: ImageMap3DObject & ImageMapSvgObject,
	source: { paths: ShapePath[]; layerId: string },
	settings: SceneSettings,
): SceneShapePart[] {
	const specs = svgPartSpecs(object, settings)
	if (!specs.length) {
		const shapes = svgElementShapes(source.paths, object.elementId)
		if (!shapes.length)
			warnMissing(UI_IMAGE_MAP_3D.SVG_SHAPE_MISSING, { layer: source.layerId, element: object.elementId, id: object.id })
		return [{ shapes, height: objectHeight(object, settings), base: 0, curveSegments: SVG_CURVE_SEGMENTS }]
	}
	return specs.map(spec => {
		const shapes = svgElementShapes(source.paths, spec.elementId)
		if (!shapes.length) warnMissing(UI_IMAGE_MAP_3D.SVG_PART_MISSING, { layer: source.layerId, element: spec.elementId, id: object.id })
		return { shapes, height: spec.height, base: spec.base, curveSegments: SVG_CURVE_SEGMENTS }
	})
}
