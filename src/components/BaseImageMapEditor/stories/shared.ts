import { IMAGE_MAP_HOTSPOTS } from '@components/BaseImageMap/stories/fixtures'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'

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
