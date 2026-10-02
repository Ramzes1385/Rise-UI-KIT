import { computed } from 'vue'
import { shapeGeometry } from './data/shapeGeometry'
import { objectAttributes, objectClasses } from './data/objectAttributes'
import type { ImageMapPoint, ImageMapSvgObject } from '../types/imageMapData.types'
import type { ResolvedImageMapObject } from '../types/internal/imageMapModel.types'
import type { ObjectState, ObjectsOptions, PointView, ShapeView, SvgBinding } from '../types/internal/imageMapInternal.types'

const POINT_SIZE = 28

function pointView(item: ResolvedImageMapObject, state: ObjectState): PointView {
	const point = item.object as ImageMapPoint
	return {
		item,
		point,
		tag: item.href ? 'a' : 'button',
		attributes: objectAttributes(item, state, true),
		classes: { ...objectClasses(item, state), 'base-image-map__point--scaled': Boolean(point.isScaled) },
		style: { ...item.style, left: `${point.x * 100}%`, top: `${point.y * 100}%`, '--im-point-size': `${point.size ?? POINT_SIZE}px` },
		isActive: state.isActive,
	}
}

function hiddenBinding(item: ResolvedImageMapObject): SvgBinding {
	const state: ObjectState = { isTabbable: false, isActive: false, isHovered: false, isPulsing: false }
	const attributes = Object.fromEntries(Object.keys(objectAttributes(item, state, false)).map(name => [name, undefined]))
	const classes = Object.fromEntries(Object.keys(objectClasses(item, state)).map(name => [name, false]))
	return {
		item,
		elementId: (item.object as ImageMapSvgObject).elementId,
		attributes: { ...attributes, 'aria-hidden': 'true' },
		classes: { ...classes, 'base-image-map__object--filtered': true },
	}
}

export function useImageMapObjects(options: ObjectsOptions) {
	const objects = computed(() => options.getView()?.objects ?? [])

	return {
		points: computed((): PointView[] =>
			objects.value.filter(item => item.object.type === 'point').map(item => pointView(item, options.getState(item))),
		),
		shapes: computed((): ShapeView[] => {
			const layer = options.getView()?.layer
			if (!layer) return []
			return objects.value.flatMap(item => {
				const geometry = shapeGeometry(item.object, layer)
				if (!geometry) return []
				const state = options.getState(item)
				return [{ item, geometry, attributes: objectAttributes(item, state, false), classes: objectClasses(item, state) }]
			})
		}),
		svgBindings: computed(() => [
			...objects.value
				.filter(item => item.object.type === 'svg')
				.map(item => {
					const state = options.getState(item)
					return {
						item,
						elementId: (item.object as ImageMapSvgObject).elementId,
						attributes: objectAttributes(item, state, false),
						classes: objectClasses(item, state),
					}
				}),
			...(options.getView()?.hidden ?? []).filter(item => item.object.type === 'svg').map(hiddenBinding),
		]),
	}
}
