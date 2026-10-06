import type { ImageMapData, ImageMapLayer, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'

/**
 * 3D-модель этажа: GLB или GLTF. Единицы — единицы слоя (`width` × `height`), ось Y вверх,
 * начало координат — левый верхний угол плана
 */
export interface ImageMapLayerModel {
	/** Адрес модели (`.glb` или `.gltf`) */
	url: string
	/** Масштаб модели; по умолчанию 1 */
	scale?: number
	/** Сдвиг модели `[x, y, z]` в единицах слоя */
	position?: [number, number, number]
	/** Поворот вокруг вертикальной оси, градусы */
	rotationY?: number
}

/** Слой (этаж) с необязательными 3D-полями: любой `ImageMapLayer` подходит без правок */
export interface ImageMap3DLayer extends ImageMapLayer {
	/** Модель этажа: есть — этаж строится из неё; нет — пол с картинкой слоя и выдавленные объекты */
	model?: ImageMapLayerModel
	/** Высота этажа по оси Y в единицах слоя; по умолчанию — номер слоя × `scene3d.floorGap` */
	elevation?: number
}

/** 3D-поля объекта карты */
export interface ImageMap3DObjectFields {
	/** Высота выдавливания в единицах слоя; по умолчанию `scene3d.objectHeight` (не `height`: у `rect` это размер) */
	height3d?: number
	/** Имя узла в модели этажа; по умолчанию `id` объекта. Пробелы по краям не учитываются; узел с тем же именем, что `id` объекта, достаётся ему, остальным объектам с этим `meshName` — свободные меши */
	meshName?: string
}

/** Объект карты с необязательными 3D-полями */
export type ImageMap3DObject = ImageMapObject & ImageMap3DObjectFields

/** Общие настройки 3D-сцены */
export interface ImageMapScene3D {
	/** Расстояние между этажами стопкой; по умолчанию 0,25 × большая сторона слоя */
	floorGap?: number
	/** Толщина плиты этажа; по умолчанию 4 */
	floorThickness?: number
	/** Высота выдавливания объектов без `height3d`; по умолчанию 0,03 × большая сторона слоя */
	objectHeight?: number
}

/**
 * JSON карты для BaseImageMap3D: `ImageMapData` плюс необязательные 3D-поля.
 * Любая `ImageMapData` подходит без правок, а `ImageMap3DData` — для BaseImageMap (2D-вид)
 */
export interface ImageMap3DData extends Omit<ImageMapData, 'layers' | 'objects'> {
	/** Слои (этажи) снизу вверх */
	layers: ImageMap3DLayer[]
	/** Объекты всех слоёв */
	objects: ImageMap3DObject[]
	/** Настройки 3D-сцены */
	scene3d?: ImageMapScene3D
}
