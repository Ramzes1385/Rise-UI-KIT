import type { Camera, Object3D } from 'three'
import type { ImageMap3DData } from './imageMap3dData.types'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type {
	BaseImageMapEmits,
	BaseImageMapProps,
	BaseImageMapSlots,
	ImageMapVariant,
} from '@components/BaseImageMap/types/BaseImageMap.types'

/** Вид карты: 3d — сцена three.js; 2d — BaseImageMap с теми же данными */
export const IMAGE_MAP_3D_VIEWS = ['3d', '2d'] as const

/** Вид карты */
export type ImageMap3DView = (typeof IMAGE_MAP_3D_VIEWS)[number]

/**
 * Рендерер сцены: подмножество `WebGLRenderer`, которым пользуется карта.
 * Своя реализация (тесты, особые настройки WebGL) передаётся через `rendererFactory`
 */
export interface ImageMap3DRenderer {
	/** Холст, в который рисует рендерер */
	readonly domElement: HTMLCanvasElement
	/** Плотность пикселей; карта передаёт `min(devicePixelRatio, 2)` */
	setPixelRatio: (ratio: number) => void
	/** Размер области рисования в CSS-пикселях; `updateStyle: false` — стиль холста не трогается */
	setSize: (width: number, height: number, updateStyle?: boolean) => void
	/** Нарисовать кадр */
	render: (scene: Object3D, camera: Camera) => void
	/** Освободить ресурсы рендерера */
	dispose: () => void
	/** Отпустить контекст WebGL сразу, не дожидаясь сборщика мусора */
	forceContextLoss: () => void
}

/** Фабрика рендерера: получает холст карты и возвращает рендерер; ошибка внутри — карта переходит в 2D */
export type ImageMap3DRendererFactory = (canvas: HTMLCanvasElement) => ImageMap3DRenderer

/** Почему показан 2D-вид, хотя просили 3D: unsupported — нет WebGL; error — рендерер не создался */
export const IMAGE_MAP_3D_FALLBACK_REASONS = ['unsupported', 'error'] as const

/** Причина перехода в 2D */
export type ImageMap3DFallbackReason = (typeof IMAGE_MAP_3D_FALLBACK_REASONS)[number]

/** Элементы для `customClass` */
type ImageMap3DClassKey = 'root' | 'viewport' | 'canvas' | 'status'

/** Пропсы BaseImageMap, которых у 3D-карты нет или они свои: колесо, предел и начальная область масштаба — у камеры */
type ImageMap2DOnlyProp = 'data' | 'wheelZoom' | 'maxZoom' | 'initArea' | 'variant' | 'sizeScale' | 'color' | 'customClass'

/**
 * Пропсы компонента BaseImageMap3D. Общие с BaseImageMap пропсы называются так же и передаются в 2D-вид
 */
export interface BaseImageMap3DProps
	extends Omit<BaseImageMapProps, ImageMap2DOnlyProp>, BaseComponentProps<ImageMapVariant, ImageMap3DClassKey> {
	/** JSON карты: `ImageMapData` с необязательными 3D-полями (`ImageMap3DData`) */
	data: ImageMap3DData
	/** Вид (`v-model:view`): `3d` (по умолчанию) или `2d`. Без WebGL показывается 2D при любом значении */
	view?: ImageMap3DView
	/** Фабрика рендерера; по умолчанию — `WebGLRenderer` three.js со сглаживанием и прозрачным фоном */
	rendererFactory?: ImageMap3DRendererFactory
}

/** Пропсы после `withDefaults` */
export type ImageMap3DProps = PropsWithDefaults<
	BaseImageMap3DProps,
	| 'active'
	| 'defaultAction'
	| 'hasZoomControls'
	| 'hasFullscreen'
	| 'hasTooltip'
	| 'hasZoomToActive'
	| 'isPulsing'
	| 'sheetBreakpoint'
	| 'hasDirectory'
	| 'directoryPosition'
	| 'directoryView'
	| 'directoryGroupBy'
	| 'directoryScope'
	| 'hasSearch'
	| 'hasFilters'
	| 'hasLegend'
	| 'hasDeepLinking'
	| 'deepLinkParam'
	| 'hasRoutes'
	| 'route'
	| 'view'
>

/**
 * События компонента BaseImageMap3D: те же, что у BaseImageMap, и смена вида
 */
export interface BaseImageMap3DEmits extends BaseImageMapEmits {
	/** Сменился вид (`v-model:view`) */
	(event: 'update:view', view: ImageMap3DView): void
	/** Карта показала 2D вместо 3D: нет WebGL или рендерер не создался */
	(event: 'fallback', reason: ImageMap3DFallbackReason): void
}

/**
 * Слоты компонента BaseImageMap3D: те же, что у BaseImageMap (в 2D-виде передаются ему)
 */
export type BaseImageMap3DSlots = BaseImageMapSlots

/**
 * Методы компонента BaseImageMap3D (ref)
 */
export interface BaseImageMap3DExpose {
	/** Перерисовать сцену в ближайшем кадре: несколько вызовов за кадр дают одну отрисовку */
	invalidate: () => void
	/** Показать вид: `3d` или `2d` (то же, что `v-model:view`) */
	setView: (view: ImageMap3DView) => void
}
