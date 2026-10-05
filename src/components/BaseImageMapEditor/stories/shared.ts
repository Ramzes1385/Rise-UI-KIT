import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'
import type { ImageMap3DData } from '@components/BaseImageMap3D/types/imageMap3dData.types'
import { IMAGE_MAP_FLOORS, IMAGE_MAP_HOTSPOTS } from '@components/BaseImageMap/stories/fixtures'

const LONG_TITLES: Record<string, string> = {
	peak: 'Смотровая площадка на вершине горы с видом на долину, озеро и соседний хребет',
	lake: 'Озеро у нижней станции подъёмника: прокат лодок, сапов и катамаранов',
}

export const LONG_GROUP_TITLE = 'Кафе, рестораны, кофейни и точки уличной еды на склоне'

export const LONG_LAYER_TITLE = 'Горнолыжный курорт «Северный склон» — схема трасс, подъёмников, кафе и пунктов проката'

export const LONG_CONTENT_MAP: ImageMapData = {
	...IMAGE_MAP_HOTSPOTS,
	layers: IMAGE_MAP_HOTSPOTS.layers.map(layer => ({
		...layer,
		title: LONG_LAYER_TITLE,
	})),
	groups: IMAGE_MAP_HOTSPOTS.groups?.map(group => (group.id === 'food' ? { ...group, title: LONG_GROUP_TITLE } : group)),
	objects: IMAGE_MAP_HOTSPOTS.objects.map(object => (LONG_TITLES[object.id] ? { ...object, title: LONG_TITLES[object.id] } : object)),
}

export const LONG_TITLE = LONG_TITLES.peak

export function stageOf(canvasElement: HTMLElement): HTMLElement {
	return canvasElement.querySelector('.base-image-map-editor__stage') as HTMLElement
}

export function pointAt(stage: HTMLElement, x: number, y: number): { clientX: number; clientY: number } {
	const box = stage.getBoundingClientRect()
	return { clientX: box.left + box.width * x, clientY: box.top + box.height * y }
}

export function statusOf(canvasElement: HTMLElement): HTMLElement {
	return canvasElement.querySelector('[role="status"]') as HTMLElement
}

export const IMAGE_MAP_3D_FIELDS: ImageMap3DData = {
	...IMAGE_MAP_FLOORS,
	layers: IMAGE_MAP_FLOORS.layers.map((layer, index) =>
		index === 1 ? { ...layer, elevation: 240, model: { url: '/maps/floor-2.glb', scale: 1.5, rotationY: 90 } } : layer,
	),
	objects: IMAGE_MAP_FLOORS.objects.map(object =>
		object.id === 'f1-shop-1' ? { ...object, height3d: 40, meshName: 'Shop_101' } : object,
	),
	scene3d: { floorGap: 220 },
}
