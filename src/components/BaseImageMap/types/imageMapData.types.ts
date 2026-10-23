import type { ImageMapHours } from './ImageMapHours.types'
import type { ImageMapRoutes } from './ImageMapRoutes.types'

/**
 * Формат данных BaseImageMap — JSON карты. Версия 1.
 * Координаты — в долях картинки слоя: `0` — левый или верхний край, `1` — правый или нижний.
 * Следующие части (список объектов, редактор, маршруты) только добавляют поля: старый JSON остаётся рабочим.
 */
export const IMAGE_MAP_DATA_VERSION = 1

/** Виды объектов: точка, прямоугольник, эллипс, многоугольник, элемент SVG слоя по `id` */
export const IMAGE_MAP_OBJECT_TYPES = ['point', 'rect', 'ellipse', 'polygon', 'svg'] as const

/** Тип объекта карты */
export type ImageMapObjectType = (typeof IMAGE_MAP_OBJECT_TYPES)[number]

/**
 * Что делает клик или Enter по объекту:
 * popup — окно с картинкой, описанием, видео и ссылками (на узком экране — нижняя панель);
 * link — переход по `link`; layer — переход на этаж `targetLayer`; none — только выбор и подсказка.
 */
export const IMAGE_MAP_ACTIONS = ['popup', 'link', 'layer', 'none'] as const

/** Действие объекта */
export type ImageMapAction = (typeof IMAGE_MAP_ACTIONS)[number]

/** Оформление объекта в одном состоянии. Цвета — любые CSS-цвета, лучше токены: `var(--rise-primary)` */
export interface ImageMapStateStyle {
	/** Заливка фигуры или фон точки */
	fill?: string
	/** Непрозрачность заливки, 0–1 */
	fillOpacity?: number
	/** Цвет обводки */
	stroke?: string
	/** Толщина обводки, px экрана */
	strokeWidth?: number
}

/** Оформление объекта по состояниям: обычное, под указателем или в фокусе, выбранное */
export interface ImageMapStyle {
	/** Обычное состояние */
	base?: ImageMapStateStyle
	/** Под указателем и в фокусе */
	hover?: ImageMapStateStyle
	/** Выбранный объект (`active`) */
	active?: ImageMapStateStyle
}

/** Слой — этаж или отдельная картинка. Основа — картинка (`image`) или SVG (`svg` строкой, `svgUrl` по адресу) */
export interface ImageMapLayer {
	/** Уникальный id слоя */
	id: string
	/** Название: кнопка переключателя этажей и имя карты для скринридера */
	title: string
	/** Короткая подпись на переключателе: «1», «B1». Без неё — `title` */
	shortTitle?: string
	/** Адрес картинки (PNG, JPG, WebP, SVG как картинка — без объектов `svg`) */
	image?: string
	/** Описание картинки для скринридера; по умолчанию картинка декоративная — объекты описывают её сами */
	imageAlt?: string
	/** Разметка SVG. Очищается по белому списку: без скриптов, обработчиков и внешних ссылок */
	svg?: string
	/** Адрес SVG: загружается `fetch` и очищается так же, как `svg` */
	svgUrl?: string
	/** Ширина картинки в её единицах (px картинки или единицы viewBox): задаёт пропорции слоя */
	width: number
	/** Высота картинки в её единицах */
	height: number
}

/** Группа (категория) объектов: цвет и значок по умолчанию для своих объектов */
export interface ImageMapGroup {
	/** Уникальный id группы */
	id: string
	/** Название группы */
	title: string
	/** Цвет объектов группы: CSS-цвет или токен */
	color?: string
	/** Значок точек группы — имя BaseIcon */
	icon?: string
	/** Id именованного стиля из `styles` */
	style?: string
}

/** Вариант фильтра: значение и подпись */
export interface ImageMapFilterOption {
	/** Значение */
	value: string
	/** Подпись */
	label: string
}

/**
 * Вид фильтра в списке объектов: checkbox — флажки; tags — метки-переключатели; select — выпадающий список с одним
 * значением; switch — переключатели; open-now — один переключатель «Открыто сейчас» по `hours` объектов
 * (объекты без `hours` при включённом фильтре скрываются)
 */
export const IMAGE_MAP_FILTER_TYPES = ['checkbox', 'tags', 'select', 'switch', 'open-now'] as const

/** Вид фильтра */
export type ImageMapFilterType = (typeof IMAGE_MAP_FILTER_TYPES)[number]

/** Как сочетаются выбранные варианты одного фильтра: or — объект подходит под любой; and — под все сразу */
export const IMAGE_MAP_FILTER_LOGIC = ['or', 'and'] as const

/** Логика вариантов фильтра */
export type ImageMapFilterLogic = (typeof IMAGE_MAP_FILTER_LOGIC)[number]

/**
 * Фильтр объектов (вторая часть BaseImageMap). Разные фильтры сочетаются по «и»; варианты одного — по `logic`.
 * Без `options` фильтр — по группам: варианты — `groups`, объект подходит по своему `group`.
 * С `options` объект подходит по своим `tags`.
 */
export interface ImageMapFilter {
	/** Уникальный id фильтра: ключ в `v-model:filters` */
	id: string
	/** Подпись фильтра */
	title: string
	/** Варианты; без них фильтр — по группам. У `open-now` не нужны */
	options?: ImageMapFilterOption[]
	/** Вид: `checkbox` (по умолчанию), `tags`, `select`, `switch` */
	type?: ImageMapFilterType
	/** Логика вариантов: `or` (по умолчанию) или `and`; у `select` выбран один вариант */
	logic?: ImageMapFilterLogic
	/** Выбранные при открытии карты значения */
	value?: string[]
}

/** Ссылка-кнопка в подсказке и окне объекта */
export interface ImageMapObjectLink {
	/** Текст кнопки */
	label: string
	/** Адрес: http(s), mailto, tel или относительный */
	href: string
	/** Открыть в новой вкладке */
	isExternal?: boolean
}

/** Общие поля всех объектов */
export interface ImageMapObjectBase {
	/** Уникальный id объекта: `v-model:active`, ссылки и события */
	id: string
	/** Название: имя объекта для скринридера, заголовок подсказки и окна */
	title: string
	/** Слой объекта; без него — первый слой */
	layer?: string
	/** Описание: текст подсказки и окна (простой текст, переносы строк сохраняются) */
	description?: string
	/** Картинка подсказки и окна */
	image?: string
	/** Описание картинки для скринридера */
	imageAlt?: string
	/** Видео окна (mp4, webm) */
	video?: string
	/** Кнопки-ссылки в подсказке и окне */
	links?: ImageMapObjectLink[]
	/** Группа (категория) */
	group?: string
	/** Действие по клику; по умолчанию — `defaultAction` компонента */
	action?: ImageMapAction
	/** Адрес для `action: 'link'` */
	link?: string
	/** Ссылка `action: 'link'` открывается в новой вкладке */
	isLinkExternal?: boolean
	/** Этаж для `action: 'layer'` */
	targetLayer?: string
	/** Свой стиль: id из `styles` или объект стиля */
	style?: string | ImageMapStyle
	/** Без подсказки при наведении и фокусе */
	isTooltipHidden?: boolean
	/** Объект недоступен: виден, но не выбирается */
	isDisabled?: boolean
	/** Масштаб при приближении к объекту (`hasZoomToActive`); по умолчанию — чтобы объект занял треть окна */
	zoom?: number
	/** Метки объекта для фильтров с `options`: значения вариантов */
	tags?: string[]
	/** Дополнительные слова для поиска в списке объектов: синонимы, номер павильона */
	keywords?: string[]
	/** Объект не показывается в списке объектов (лестницы, лифты); на карте остаётся */
	isHiddenInDirectory?: boolean
	/** Часы работы: «Открыто до 21:00» в подсказке, окне и списке, фильтр `open-now` (`ImageMapHours`) */
	hours?: ImageMapHours
	/** Свои данные приложения: доступны в слотах `tooltip` и `popup` */
	data?: Record<string, unknown>
}

/** Точка (метка) */
export interface ImageMapPoint extends ImageMapObjectBase {
	/** Вид объекта: точка */
	type: 'point'
	/** Центр метки по горизонтали, доля ширины */
	x: number
	/** Центр метки по вертикали, доля высоты */
	y: number
	/** Значок — имя BaseIcon; без него — значок группы или кружок */
	icon?: string
	/** Подпись под меткой на карте */
	label?: string
	/** Размер метки, px; по умолчанию 28 */
	size?: number
	/** Метка растёт вместе с картой при масштабе; по умолчанию размер постоянный на экране */
	isScaled?: boolean
	/** Пульсация метки (без неё при reduced motion) */
	isPulsing?: boolean
}

/** Прямоугольник */
export interface ImageMapRect extends ImageMapObjectBase {
	/** Вид объекта: прямоугольник */
	type: 'rect'
	/** Левый край, доля ширины */
	x: number
	/** Верхний край, доля высоты */
	y: number
	/** Ширина, доля ширины картинки */
	width: number
	/** Высота, доля высоты картинки */
	height: number
	/** Скругление углов, доля ширины картинки */
	radius?: number
}

/** Эллипс */
export interface ImageMapEllipse extends ImageMapObjectBase {
	/** Вид объекта: эллипс */
	type: 'ellipse'
	/** Центр по горизонтали, доля ширины */
	x: number
	/** Центр по вертикали, доля высоты */
	y: number
	/** Радиус по горизонтали, доля ширины */
	rx: number
	/** Радиус по вертикали, доля высоты */
	ry: number
}

/** Многоугольник */
export interface ImageMapPolygon extends ImageMapObjectBase {
	/** Вид объекта: многоугольник */
	type: 'polygon'
	/** Вершины `[x, y]` в долях картинки, не меньше трёх */
	points: [number, number][]
}

/** Элемент SVG слоя (`svg` или `svgUrl`) по его `id`: магазин на плане этажа */
export interface ImageMapSvgObject extends ImageMapObjectBase {
	/** Вид объекта: элемент SVG слоя */
	type: 'svg'
	/** Id элемента в SVG слоя */
	elementId: string
}

/** Объект карты */
export type ImageMapObject = ImageMapPoint | ImageMapRect | ImageMapEllipse | ImageMapPolygon | ImageMapSvgObject

/** JSON карты: слои, объекты, группы, фильтры и именованные стили */
export interface ImageMapData {
	/** Версия формата; сейчас 1 */
	version?: number
	/** Слои (этажи) снизу вверх — по этому порядку «вверх» и «вниз» в маршрутах; первый показывается по умолчанию */
	layers: ImageMapLayer[]
	/** Объекты всех слоёв */
	objects: ImageMapObject[]
	/** Группы (категории) */
	groups?: ImageMapGroup[]
	/** Фильтры списка объектов */
	filters?: ImageMapFilter[]
	/** Именованные стили: объект или группа ссылаются на них по ключу */
	styles?: Record<string, ImageMapStyle>
	/** Часовой пояс IANA для `hours` объектов без своего `timeZone`: `'Europe/Moscow'`. Без него — пояс браузера */
	timeZone?: string
	/** Граф путей для маршрутов «Как пройти»: узлы, коридоры, лестницы и лифты (`ImageMapRoutes`) */
	routes?: ImageMapRoutes
}

/** Область карты в долях картинки: начальный вид (`initArea`) */
export interface ImageMapArea {
	/** Левый край */
	x: number
	/** Верхний край */
	y: number
	/** Ширина */
	width: number
	/** Высота */
	height: number
}
