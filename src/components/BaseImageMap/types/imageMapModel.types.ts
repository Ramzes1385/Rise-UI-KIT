import type { ImageMapAction, ImageMapGroup, ImageMapLayer, ImageMapObject } from './imageMapData.types'

/** Атрибут с id объекта на его элементе: по нему карта находит объект в событиях */
export const IMAGE_MAP_OBJECT_ATTR = 'data-image-map-object'

/** Объект, подготовленный к показу: группа, действие, стиль в CSS-переменных и роль элемента */
export interface ResolvedImageMapObject {
	/** Исходный объект из JSON */
	object: ImageMapObject
	/** Группа объекта */
	group: ImageMapGroup | undefined
	/** Действие с учётом `defaultAction`; `link` без безопасного адреса становится `none` */
	action: ImageMapAction
	/** Безопасный адрес для `action: 'link'` */
	href: string | undefined
	/** CSS-переменные оформления по состояниям */
	style: Record<string, string>
	/** Объект недоступен */
	isDisabled: boolean
}

/** Слой с размерами для вписывания */
export interface ImageMapLayerView {
	/** Слой из JSON */
	layer: ImageMapLayer
	/** Объекты слоя в порядке JSON */
	objects: ResolvedImageMapObject[]
	/** Объекты слоя, скрытые фильтрами: точки и фигуры не рисуются, элементы SVG слоя бледнеют и не выбираются */
	hidden: ResolvedImageMapObject[]
}

/** Прямоугольник на экране относительно окна карты, px */
export interface ImageMapBox {
	left: number
	top: number
	width: number
	height: number
}

/** Направление перехода стрелкой */
export type ImageMapDirection = 'left' | 'right' | 'up' | 'down'

/** Вид карты: масштаб и сдвиг сцены в окне, px */
export interface ImageMapView {
	scale: number
	x: number
	y: number
}
