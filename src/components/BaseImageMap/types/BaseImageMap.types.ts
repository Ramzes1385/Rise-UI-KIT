import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { ImageMapAction, ImageMapArea, ImageMapData, ImageMapGroup, ImageMapObject } from './imageMapData.types'

/**
 * Варианты оформления BaseImageMap:
 * default — рамка и фон; outline — заметная рамка без фона; ghost — без рамки и фона (карта встроена в страницу).
 */
export const IMAGE_MAP_VARIANTS = ['default', 'outline', 'ghost'] as const

/** Вариант оформления */
export type ImageMapVariant = (typeof IMAGE_MAP_VARIANTS)[number]

/**
 * Масштаб колесом мыши: ctrl — только с Ctrl (или ⌘), как в Google Картах, без него страница прокручивается и
 * появляется подсказка; always — колесо всегда меняет масштаб; none — колесо не меняет масштаб
 */
export const IMAGE_MAP_WHEEL_MODES = ['ctrl', 'always', 'none'] as const

/** Режим колеса мыши */
export type ImageMapWheelMode = (typeof IMAGE_MAP_WHEEL_MODES)[number]

/** Элементы для `customClass` */
type ImageMapClassKey = 'root' | 'toolbar' | 'layers' | 'zoom' | 'viewport' | 'stage' | 'object' | 'point' | 'tooltip' | 'popup'

/**
 * Пропсы компонента BaseImageMap
 */
export interface BaseImageMapProps extends BaseComponentProps<ImageMapVariant, ImageMapClassKey> {
	/** JSON карты: слои, объекты, группы, стили (`ImageMapData`) */
	data: ImageMapData
	/** Id выбранного объекта (`v-model:active`); `null` — ничего не выбрано */
	active?: string | null
	/** Id показанного слоя (`v-model:layer`); по умолчанию — первый слой */
	layer?: string
	/** Действие по клику для объектов без своего `action` */
	defaultAction?: ImageMapAction
	/** Имя карты для скринридера; по умолчанию — название слоя */
	ariaLabel?: string
	/** Высота окна карты (CSS-длина): картинка вписывается целиком. Без неё высота — по пропорциям слоя */
	height?: string
	/** Масштаб колесом мыши: `ctrl` (по умолчанию), `always`, `none` */
	wheelZoom?: ImageMapWheelMode
	/** Наибольший масштаб, во сколько раз */
	maxZoom?: number
	/** Начальный вид — область карты в долях картинки; масштаб подбирается, чтобы она поместилась */
	initArea?: ImageMapArea
	/** Кнопки «+», «−» и «Сбросить» */
	hasZoomControls?: boolean
	/** Кнопка полного экрана */
	hasFullscreen?: boolean
	/** Подсказка при наведении и фокусе */
	hasTooltip?: boolean
	/** Приближать карту к выбранному объекту */
	hasZoomToActive?: boolean
	/** Пульсация всех точек (без неё при reduced motion); у точки — `isPulsing` */
	isPulsing?: boolean
	/** Ширина экрана, px, до которой окно объекта — нижняя панель */
	sheetBreakpoint?: number
}

/** Пропсы после `withDefaults` */
export type ImageMapProps = PropsWithDefaults<
	BaseImageMapProps,
	| 'active'
	| 'defaultAction'
	| 'wheelZoom'
	| 'maxZoom'
	| 'hasZoomControls'
	| 'hasFullscreen'
	| 'hasTooltip'
	| 'hasZoomToActive'
	| 'isPulsing'
	| 'sheetBreakpoint'
>

/**
 * События компонента BaseImageMap
 */
export interface BaseImageMapEmits {
	/** Выбран объект или выбор снят (`v-model:active`) */
	(event: 'update:active', id: string | null): void
	/** Сменился слой (`v-model:layer`) */
	(event: 'update:layer', id: string): void
	/** Клик или Enter по объекту — до его действия */
	(event: 'select', object: ImageMapObject): void
	/** Указатель или фокус на объекте; `null` — ушёл с объектов */
	(event: 'hover', object: ImageMapObject | null): void
	/** Сменился слой: переключателем, действием `layer` или `setLayer` */
	(event: 'layer-change', id: string): void
}

/** Данные объекта в слотах */
export interface ImageMapSlotProps {
	/** Объект карты */
	object: ImageMapObject
	/** Группа объекта */
	group: ImageMapGroup | undefined
}

/**
 * Слоты компонента BaseImageMap
 */
export interface BaseImageMapSlots {
	/** Содержимое подсказки вместо заголовка, текста, картинки и кнопок */
	tooltip?: (props: ImageMapSlotProps) => unknown
	/** Содержимое окна объекта вместо картинки, описания, видео и ссылок; `close` закрывает окно */
	popup?: (props: ImageMapSlotProps & { close: () => void }) => unknown
	/** Содержимое точки вместо значка; `isActive` — точка выбрана */
	point?: (props: ImageMapSlotProps & { isActive: boolean }) => unknown
}

/**
 * Методы компонента BaseImageMap (ref)
 */
export interface BaseImageMapExpose {
	/** Увеличить масштаб на шаг */
	zoomIn: () => void
	/** Уменьшить масштаб на шаг */
	zoomOut: () => void
	/** Вернуть начальный вид (`initArea` или вся карта) */
	resetZoom: () => void
	/** Приблизить карту к объекту (и переключить слой, если объект на другом) */
	zoomToObject: (id: string) => void
	/** Показать слой */
	setLayer: (id: string) => void
}
