import type { UiProp } from '@composables/base/useUi'
import type { ImageMapHoursState } from './ImageMapHours.types'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { ImageMapRouteResult, ImageMapRouteValue } from './ImageMapRoutes.types'
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

/** Список объектов: list — строки; grid — сетка карточек с миниатюрами (`image` объекта) */
export const IMAGE_MAP_DIRECTORY_VIEWS = ['list', 'grid'] as const

/** Вид списка объектов */
export type ImageMapDirectoryView = (typeof IMAGE_MAP_DIRECTORY_VIEWS)[number]

/** Группировка списка: group — по группам (порядок `groups`); alpha — по первой букве; none — одним списком по алфавиту */
export const IMAGE_MAP_DIRECTORY_GROUPINGS = ['group', 'alpha', 'none'] as const

/** Группировка списка объектов */
export type ImageMapDirectoryGrouping = (typeof IMAGE_MAP_DIRECTORY_GROUPINGS)[number]

/** Какие объекты в списке: all — всех слоёв (выбор переключает слой); layer — только показанного слоя */
export const IMAGE_MAP_DIRECTORY_SCOPES = ['all', 'layer'] as const

/** Охват списка объектов */
export type ImageMapDirectoryScope = (typeof IMAGE_MAP_DIRECTORY_SCOPES)[number]

/** Сторона списка объектов на широком экране; на узком (контейнер уже 640px) список всегда под картой */
export const IMAGE_MAP_DIRECTORY_POSITIONS = ['start', 'end'] as const

/** Сторона списка объектов */
export type ImageMapDirectoryPosition = (typeof IMAGE_MAP_DIRECTORY_POSITIONS)[number]

/** Выбранные значения фильтров: id фильтра → значения вариантов */
export type ImageMapFilterValues = Record<string, string[]>

/**
 * Части BaseImageMap для пропа `ui` (БЭМ-элементы `.base-image-map__<часть>`, `root` — вся карта): toolbar — панель над картой,
 * layers — переключатель этажей, zoom — кнопки масштаба, viewport — окно карты, stage — план (изображение и объекты),
 * image — изображение слоя, svg — SVG-план, shapes — слой фигур, object — фигура или точка, point — точка, marker — значок точки,
 * label — подпись точки, hint — подсказка про колесо мыши, legend — легенда, legend-item — строка легенды, swatch — образец цвета,
 * tooltip — подсказка объекта, directory — список объектов, search — поиск в списке, filters — фильтры, results — строка статуса
 * и «Сбросить фильтры», list — перечень строк, entry — строка объекта, route — панель «Как пройти», route-steps — список шагов,
 * route-step — шаг маршрута.
 */
export const IMAGE_MAP_PARTS = [
	'toolbar',
	'layers',
	'zoom',
	'viewport',
	'stage',
	'image',
	'svg',
	'shapes',
	'object',
	'point',
	'marker',
	'label',
	'hint',
	'legend',
	'legend-item',
	'swatch',
	'tooltip',
	'directory',
	'search',
	'filters',
	'results',
	'list',
	'entry',
	'route',
	'route-steps',
	'route-step',
] as const

/** Часть BaseImageMap для пропа `ui` (или `root`) */
export type BaseImageMapPart = (typeof IMAGE_MAP_PARTS)[number]

/** Элементы для `customClass` */
type ImageMapClassKey =
	| 'root'
	| 'toolbar'
	| 'layers'
	| 'zoom'
	| 'viewport'
	| 'stage'
	| 'object'
	| 'point'
	| 'tooltip'
	| 'popup'
	| 'directory'
	| 'filters'
	| 'legend'
	| 'route'

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
	/** Список объектов с поиском и фильтрами — основной путь к объектам для скринридера и клавиатуры */
	hasDirectory?: boolean
	/** Сторона списка на широком экране: `start` (по умолчанию) или `end` */
	directoryPosition?: ImageMapDirectoryPosition
	/** Вид списка: `list` (по умолчанию) или `grid` с миниатюрами */
	directoryView?: ImageMapDirectoryView
	/** Группировка списка: `group` (по умолчанию), `alpha`, `none` */
	directoryGroupBy?: ImageMapDirectoryGrouping
	/** Объекты в списке: `all` — всех слоёв (по умолчанию), `layer` — показанного слоя */
	directoryScope?: ImageMapDirectoryScope
	/** Поле поиска над списком (без учёта регистра, «ё» = «е»; по названию, описанию, группе и `keywords`) */
	hasSearch?: boolean
	/** Фильтры из `data.filters` над списком; скрытые фильтром объекты пропадают и с карты */
	hasFilters?: boolean
	/** Легенда групп под картой: цвет, значок, название */
	hasLegend?: boolean
	/** Строка поиска (`v-model:search`) */
	search?: string
	/** Выбранные значения фильтров (`v-model:filters`): `{ [id фильтра]: значения }` */
	filters?: ImageMapFilterValues
	/** Ссылка на объект в адресе: при открытии выбирает объект из `?location=<id>`, выбор обновляет адрес */
	hasDeepLinking?: boolean
	/** Имя параметра адреса для `hasDeepLinking` */
	deepLinkParam?: string
	/**
	 * Момент, на который считаются часы работы объектов (`hours`): дата или метка времени.
	 * Без него — текущее время, состояние обновляется в начале каждой минуты
	 */
	now?: Date | number
	/** Панель «Как пройти» под картой: откуда, куда, «Без лестниц» и шаги списком. Нужен `data.routes` */
	hasRoutes?: boolean
	/** Запрос маршрута (`v-model:route`): `{ from, to, isStepFree }`; линия рисуется и без панели */
	route?: ImageMapRouteValue | null
	/**
	 * Классы частей (`root`, `viewport`, `stage`, `point`, `legend`, `tooltip`… — см. `IMAGE_MAP_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseImageMap.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseImageMap :data="plan" :ui="{ root: 'shadow-sm', viewport: 'rounded-none' }" />
	 */
	ui?: UiProp<BaseImageMapPart>
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
	/** Изменилась строка поиска (`v-model:search`) */
	(event: 'update:search', value: string): void
	/** Изменились значения фильтров (`v-model:filters`) */
	(event: 'update:filters', value: ImageMapFilterValues): void
	/** Изменился запрос маршрута (`v-model:route`) */
	(event: 'update:route', value: ImageMapRouteValue): void
	/** Найден маршрут (шаги, узлы, длина) или `null` — маршрут сброшен или не найден */
	(event: 'route-change', result: ImageMapRouteResult | null): void
}

/** Данные объекта в слотах */
export interface ImageMapSlotProps {
	/** Объект карты */
	object: ImageMapObject
	/** Группа объекта */
	group: ImageMapGroup | undefined
}

/** Часы работы объекта в слотах подсказки, окна и строки списка; у объекта без `hours` — `undefined` */
export interface ImageMapHoursSlotProps {
	/** Состояние сейчас: открыто ли, текст «Открыто до 21:00», расписание недели */
	hours: ImageMapHoursState | undefined
}

/**
 * Слоты компонента BaseImageMap
 */
export interface BaseImageMapSlots {
	/** Содержимое подсказки вместо заголовка, текста, картинки и кнопок */
	tooltip?: (props: ImageMapSlotProps & ImageMapHoursSlotProps) => unknown
	/** Содержимое окна объекта вместо картинки, описания, видео и ссылок; `close` закрывает окно */
	popup?: (props: ImageMapSlotProps & ImageMapHoursSlotProps & { close: () => void }) => unknown
	/** Содержимое точки вместо значка; `isActive` — точка выбрана */
	point?: (props: ImageMapSlotProps & { isActive: boolean }) => unknown
	/** Содержимое строки списка объектов вместо миниатюры, названия и группы; `isActive` — объект выбран */
	'directory-item'?: (props: ImageMapSlotProps & ImageMapHoursSlotProps & { isActive: boolean }) => unknown
	/** Пустой список: ничего не найдено поиском и фильтрами */
	'directory-empty'?: () => unknown
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
	/** Очистить поиск и снять все фильтры */
	clearFilters: () => void
	/** Проложить маршрут от объекта `from` до объекта `to` */
	showRoute: (from: string, to: string) => void
	/** Сбросить маршрут */
	clearRoute: () => void
}
