import { Vector3 } from 'three'
import { shallowRef, watch } from 'vue'
import { layerElevation, sceneSettings } from '../scene/sceneLayout'
import type { ImageMap3DLayer } from '../../types/imageMap3dData.types'
import { boxAnchor, placeCard, projectPoint } from '@/scene3d/overlay/projection'
import type { ImageMapPoint } from '@components/BaseImageMap/types/imageMapData.types'
import { IMAGE_MAP_OBJECT_ATTR } from '@components/BaseImageMap/types/internal/imageMapModel.types'
import type { ResolvedImageMapObject } from '@components/BaseImageMap/types/internal/imageMapModel.types'
import type {
	CardPlacement,
	SceneOverlayOptions,
	ScenePointView,
	ScreenSize,
	ScreenSpot,
} from '../../types/internal/imageMap3dInternal.types'

function pointWorld(options: SceneOverlayOptions, item: ResolvedImageMapObject): Vector3 {
	const data = options.getData()
	const index = data.layers.findIndex(layer => layer.id === (item.object.layer ?? data.layers[0]?.id))
	const layer = data.layers[index] as ImageMap3DLayer
	const elevation = layerElevation(layer, index, sceneSettings(data))
	const point = item.object as ImageMapPoint
	return new Vector3(point.x * layer.width, elevation, point.y * layer.height)
}

function objectAnchor(options: SceneOverlayOptions, item: ResolvedImageMapObject): Vector3 | null {
	if (item.object.type === 'point') return pointWorld(options, item)
	const box = options.objectBox(item.object.id)
	return box ? boxAnchor(box) : null
}

function pointView(options: SceneOverlayOptions, item: ResolvedImageMapObject, spot: ScreenSpot): ScenePointView {
	const id = item.object.id
	return {
		item,
		point: item.object as ImageMapPoint,
		attributes: { [IMAGE_MAP_OBJECT_ATTR]: id },
		style: { ...item.style, left: `${spot.x}px`, top: `${spot.y}px` },
		isVisible: spot.isVisible,
		isActive: options.getActive() === id,
		isHovered: options.getHover() === id,
		isPulsing: options.getIsPulsing() || Boolean(item.object.type === 'point' && item.object.isPulsing),
	}
}

function hostSize(host: HTMLElement): ScreenSize {
	return { width: host.clientWidth, height: host.clientHeight }
}

export function useSceneOverlay(options: SceneOverlayOptions) {
	const card = shallowRef<CardPlacement | null>(null)
	const points = shallowRef<ScenePointView[]>([])

	function project(world: Vector3, size: ScreenSize): ScreenSpot {
		return projectPoint(world, options.getCamera(), size)
	}

	function placeCurrentCard(size: ScreenSize): CardPlacement | null {
		const item = options.getCardItem()
		const anchor = item ? objectAnchor(options, item) : null
		const element = options.cardRef.value
		if (!anchor) return null
		return placeCard(project(anchor, size), { width: element?.offsetWidth ?? 0, height: element?.offsetHeight ?? 0 }, size)
	}

	function update(): void {
		const size = hostSize(options.hostRef.value as HTMLElement)
		points.value = options.getPoints().map(item => pointView(options, item, project(pointWorld(options, item), size)))
		card.value = placeCurrentCard(size)
	}

	options.onFrame(update)

	watch([options.getCardItem, options.getPoints, options.getActive, options.getHover, options.getIsPulsing], options.invalidate, {
		flush: 'post',
	})

	return { card, points, project, anchorOf: (item: ResolvedImageMapObject) => objectAnchor(options, item) }
}
