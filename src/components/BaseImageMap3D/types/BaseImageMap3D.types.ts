import type { Camera, Object3D } from 'three'
import type { ImageMap3DData } from './imageMap3dData.types'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
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

/** Этажи в 3D: stack — стопкой, неактивные полупрозрачны; single — виден только активный этаж */
export const IMAGE_MAP_3D_LAYER_MODES = ['stack', 'single'] as const

/** Режим этажей */
export type ImageMap3DLayerMode = (typeof IMAGE_MAP_3D_LAYER_MODES)[number]

/** Камера: isometric — ортографическая изометрия (вид Mapplic); perspective — перспектива */
export const IMAGE_MAP_3D_CAMERAS = ['isometric', 'perspective'] as const

/** Вид камеры */
export type ImageMap3DCamera = (typeof IMAGE_MAP_3D_CAMERAS)[number]

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

/** Почему показан 2D-вид, хотя просили 3D: unsupported — нет WebGL; error — рендерер не создался или модель этажа не загрузилась */
export const IMAGE_MAP_3D_FALLBACK_REASONS = ['unsupported', 'error'] as const

/** Причина перехода в 2D */
export type ImageMap3DFallbackReason = (typeof IMAGE_MAP_3D_FALLBACK_REASONS)[number]

/** Элементы для `customClass` */
type ImageMap3DClassKey =
	| 'root'
	| 'views'
	| 'toolbar'
	| 'layers'
	| 'camera'
	| 'viewport'
	| 'canvas'
	| 'point'
	| 'tooltip'
	| 'popup'
	| 'directory'
	| 'filters'
	| 'legend'
	| 'route'
	| 'status'

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
	/** Камера: `isometric` (по умолчанию, ортографическая изометрия) или `perspective` */
	camera?: ImageMap3DCamera
	/** Этажи: `stack` (по умолчанию) — стопкой, неактивные полупрозрачны; `single` — только активный этаж */
	layerMode?: ImageMap3DLayerMode
	/** Вращение и наклон сцены мышью и касанием; по умолчанию `true`. Масштаб и сдвиг работают всегда. При `false` щипок двумя пальцами браузер может отменить, начав прокрутку страницы, — масштаб тогда кнопками или Ctrl / ⌘ с колесом */
	hasOrbit?: boolean
	/**
	 * Настройка загрузчика моделей этажей перед загрузкой: подключить DRACO, KTX2 или meshopt приложения.
	 * Кит сам эти декодеры не подключает
	 */
	configureLoader?: (loader: GLTFLoader) => void
	/**
	 * Переключатель «3D / 2D» над картой: 2D — BaseImageMap с теми же данными, выбранным объектом и этажом.
	 * По умолчанию `false`; без WebGL переключатель не показывается
	 */
	has2dToggle?: boolean
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
	| 'camera'
	| 'layerMode'
	| 'hasOrbit'
	| 'has2dToggle'
>

/**
 * События компонента BaseImageMap3D: те же, что у BaseImageMap, и смена вида
 */
export interface BaseImageMap3DEmits extends BaseImageMapEmits {
	/** Сменился вид (`v-model:view`) */
	(event: 'update:view', view: ImageMap3DView): void
	/** Карта показала 2D вместо 3D: нет WebGL, рендерер не создался или модель этажа не загрузилась */
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
	/** Показать этаж по id (то же, что `v-model:layer`) */
	setLayer: (id: string) => void
	/** Плавно вернуть камеру к начальному виду активного этажа */
	resetCamera: () => void
	/** Повернуть камеру вокруг вертикали на `degrees` градусов (плюс — по часовой стрелке при взгляде сверху) */
	rotate: (degrees: number) => void
	/** Приблизить в 1,5 раза (до 8×) */
	zoomIn: () => void
	/** Отдалить в 1,5 раза (до 0,5×) */
	zoomOut: () => void
	/** Показать объект: его этаж и камера на центре объекта (объект занимает около трети области) */
	zoomToObject: (id: string) => void
	/** Сбросить поиск и фильтры каталога */
	clearFilters: () => void
	/** Построить маршрут между объектами (то же, что `v-model:route`) */
	showRoute: (from: string, to: string) => void
	/** Убрать маршрут */
	clearRoute: () => void
}
