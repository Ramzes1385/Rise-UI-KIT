import type { Vector3 } from 'three'
import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { useImageMap3DMap } from '../../model/useImageMap3DMap'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { useImageMap3DStage } from '../../model/useImageMap3DStage'
import type { ImageMapPoint } from '@components/BaseImageMap/types/imageMapData.types'
import type { BaseImageMapProps } from '@components/BaseImageMap/types/BaseImageMap.types'
import type { Center } from '@components/BaseImageMap/types/internal/imageMapInternal.types'
import type { RouteGraph, RoutePath } from '@components/BaseImageMap/types/ImageMapRoutes.types'
import type { ImageMap3DLayerMode, ImageMap3DProps, ImageMap3DRenderer } from '../BaseImageMap3D.types'
import type { ResolvedImageMapObject } from '@components/BaseImageMap/types/internal/imageMapModel.types'
import type { ImageMap3DData, ImageMap3DLayer, ImageMap3DObject, ImageMapLayerModel } from '../imageMap3dData.types'
import type {
	Box3,
	BufferGeometry,
	Camera,
	Vector2,
	Color,
	Group,
	LineBasicMaterial,
	LineSegments,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	Scene,
	Shape,
	TubeGeometry,
} from 'three'
import type {
	Scene3DCameraKeyAction,
	Scene3DCameraPose,
	Scene3DCardPlacement,
	Scene3DColorResolver,
	Scene3DPointerOptions,
	Scene3DPoseState,
	Scene3DScreenSize,
	Scene3DScreenSpot,
	Scene3DViewCamera,
} from '@/scene3d/types/internal/scene3dInternal.types'

/** Правило проверки 3D-поля данных */
export type ImageMap3DFieldRule =
	'number' | 'positive' | 'nonNegative' | 'text' | 'vector' | 'model' | 'object' | 'list' | 'flag' | 'svgOnly'

/** Неверное 3D-поле данных: путь, значение и нарушенное правило */
export interface ImageMap3DIssue {
	/** Путь к полю: `layers["floor-1"].elevation` */
	path: string
	/** Значение поля как есть */
	value: unknown
	/** Нарушенное правило */
	rule: ImageMap3DFieldRule
}

/** Пропсы и обработчики событий для BaseImageMap в 2D-виде */
export type ImageMap2DBindings = BaseImageMapProps & Record<string, unknown>

/** Состояние объекта в сцене: обычное, под указателем или в фокусе, выбранное */
export type SceneObjectState = 'base' | 'hover' | 'active'

/** Настройки сцены после проверки `scene3d`: неверные поля заменены умолчаниями */
export interface SceneSettings {
	/** Большая сторона слоёв — масштаб сцены */
	extent: number
	/** Расстояние между этажами стопкой */
	floorGap: number
	/** Толщина плиты этажа */
	floorThickness: number
	/** Высота выдавливания объектов без `height3d` */
	objectHeight: number
	/** Скос кромок тел объектов; 0 — без скоса */
	bevel: number
	/** Контур по рёбрам тел объектов */
	outline: boolean
	/** Контур по рёбрам мешей модели этажа: включается только явным `scene3d.outline: true` */
	modelOutline: boolean
}

/** Рамка сцены для камеры: границы стопки этажей и размеры, по которым подбирается кадр */
export interface SceneFrame {
	/** Границы стопки: планы всех этажей по X и Z, по Y — от низа плиты нижнего этажа до верха самых высоких объектов */
	bounds: Box3
	/** Радиус окружности вокруг центра плана, описанной вокруг стопки: кадр не обрежет сцену при любом повороте */
	radius: number
	/** Половина высоты стопки по оси Y: режим `stack` смотрит на середину стопки */
	stackHalf: number
	/** Наибольшая высота одного этажа над его плоскостью или под ней: режим `single` смотрит на этаж */
	floorHalf: number
}

/** Рамка сцены и режим этажей: по ним подбирается кадр камеры */
export interface SceneFraming {
	/** Рамка сцены */
	frame: SceneFrame
	/** Режим этажей */
	mode: ImageMap3DLayerMode
}

/** Цвет и непрозрачность материала в одном состоянии */
export interface SceneStateColor {
	/** Цвет */
	color: Color
	/** Непрозрачность 0–1 */
	opacity: number
}

/** CSS-цвет (в том числе `var(--rise-*)`) → цвет three в теме области карты */
export type SceneColorResolver = Scene3DColorResolver

/** Объект карты в сцене: его меши и материал состояний */
export interface SceneObjectEntry {
	/** Id объекта */
	id: string
	/** Id слоя объекта */
	layerId: string
	/** Общий материал всех мешей объекта; цвет и непрозрачность меняются по состоянию */
	material: MeshStandardMaterial
	/** Меши объекта: выдавленные фигуры (по одной на часть) или узлы модели этажа */
	meshes: Mesh[]
	/** Контуры по рёбрам: по одному на меш фигуры; у мешей модели этажа — только при `scene3d.outline: true` (дети меша) */
	lines: LineSegments[]
	/** Общий материал контуров; меняется по состоянию объекта */
	outline: LineBasicMaterial | null
	/** Откуда меши: выдавливание фигуры или модель этажа */
	source: 'shape' | 'model'
	/** Цвета состояний */
	colors: Record<SceneObjectState, SceneStateColor>
	/** Текущее состояние */
	state: SceneObjectState
}

/** Тело для выдавливания: высота, основание над полом и размер скоса */
export interface SceneBody {
	/** Высота тела: от основания до верха */
	height: number
	/** Высота основания над полом этажа; 0 — тело стоит на полу */
	base: number
	/** Размер скоса кромок; 0 — без скоса */
	bevel: number
	/** Отрезков на кривую контура; нет — по умолчанию выдавливания */
	curveSegments?: number
}

/** Часть объекта для выдавливания: фигуры и размеры по высоте */
export interface SceneShapePart {
	/** Фигуры части: контуры и дыры */
	shapes: Shape[]
	/** Высота части */
	height: number
	/** Высота основания над полом этажа */
	base: number
	/** Отрезков на кривую контура: у фигур SVG меньше — у них много кривых */
	curveSegments?: number
}

/** Размеры части объекта `svg` после проверки полей: элемент, высота и основание */
export interface ScenePartSpec {
	/** `id` элемента SVG */
	elementId: string
	/** Высота части */
	height: number
	/** Высота основания над полом этажа */
	base: number
}

/** Геометрии тела объекта: по одной на часть */
export interface SceneBodySet {
	/** Выдавленные геометрии */
	geometries: BufferGeometry[]
	/** Строить контур по рёбрам */
	hasOutline: boolean
}

/** Этаж в сцене */
export interface SceneLayerEntry {
	/** Id слоя */
	id: string
	/** Группа этажа: начало — левый верхний угол плана на высоте этажа */
	group: Group
	/** Высота этажа по оси Y */
	elevation: number
	/** Материалы пола: плита и картинка слоя */
	floorMaterials: MeshStandardMaterial[]
	/** Материалы модели этажа, кроме мешей объектов: исходная непрозрачность — `userData.baseOpacity` */
	modelMaterials: Material[]
	/** Непрозрачность этажа: 1 — активный или режим `single`; меньше — неактивный в стопке */
	opacity: number
}

/** Содержимое сцены карты */
export interface SceneContent {
	/** Корень содержимого: этажи и свет */
	root: Group
	/** Настройки сцены */
	settings: SceneSettings
	/** Этажи по id */
	layers: Map<string, SceneLayerEntry>
	/** Объекты по id */
	objects: Map<string, SceneObjectEntry>
}

/** Объект для выдавливания: данные, слой и цвета состояний */
export interface SceneShapeItem {
	/** Объект карты */
	object: ImageMap3DObject
	/** Id слоя */
	layerId: string
	/** Цвета состояний */
	colors: Record<SceneObjectState, SceneStateColor>
}

/** Загрузка поверхности этажа: SVG слоя, объекты `svg` и текстура пола */
export interface SceneSurfaceJob {
	/** Содержимое сцены */
	content: SceneContent
	/** Данные карты */
	data: ImageMap3DData
	/** Слой */
	layer: ImageMap3DLayer
	/** Материал картинки пола */
	floor: MeshStandardMaterial
	/** Цвета темы */
	resolve: SceneColorResolver
	/** Отмена: сцена перестроена или освобождена */
	signal: AbortSignal
	/** Что-то добавилось — нужен кадр */
	onUpdate: () => void
	/** План этажа не загрузился: SVG, картинка или текстура пола */
	onFailure: () => void
}

/** Учёт загрузок этажей: идёт ли загрузка и у каких этажей план не загрузился */
export interface LayerLoads {
	/** Хотя бы одна загрузка идёт */
	isLoading: ComputedRef<boolean>
	/** Id этажей, чей план не загрузился */
	failedLayerIds: ComputedRef<string[]>
	/** Начать заново: сцена перестроена или освобождена */
	reset: () => void
	/** Учесть загрузку: пока `task` не завершилась, `isLoading` истинно; отменённая загрузка не считается */
	track: (signal: AbortSignal, task: Promise<void>) => void
	/** Отметить этаж как не загрузившийся; отменённая загрузка не считается */
	fail: (layerId: string, signal: AbortSignal) => void
}

/** Состояние карты вместо сцены: загрузка, пустые данные или ошибка загрузки плана этажа */
export interface ImageMap3DLoadState {
	/** Вид состояния */
	kind: 'loading' | 'empty' | 'error'
	/** Текст на карте и для скринридера */
	text: string
}

/** Параметры содержимого сцены */
export interface SceneOptions {
	/** Сцена three */
	scene: Scene
	/** Рендерер: появился — сцена строится, пропал — освобождается */
	renderer: Readonly<ShallowRef<ImageMap3DRenderer | null>>
	/** Область карты: по её теме разрешаются цвета */
	hostRef: Readonly<Ref<HTMLElement | null>>
	/** Данные карты */
	getData: () => ImageMap3DData
	/** Id активного этажа */
	getLayerId: () => string | undefined
	/** Режим этажей */
	getLayerMode: () => ImageMap3DLayerMode
	/** Id выбранного объекта */
	getActive: () => string | null
	/** Id объекта под указателем или в фокусе клавиатуры */
	getHover: () => string | null
	/** Id объектов, скрытых фильтрами и поиском: их меши не рисуются и не выбираются */
	getHidden: () => ReadonlySet<string>
	/** Запросить кадр */
	invalidate: () => void
	/** Настройка загрузчика моделей этажей (`configureLoader`) */
	getConfigureLoader: () => ((loader: GLTFLoader) => void) | undefined
	/** Модель этажа не загрузилась */
	onModelError: (error: unknown) => void
	/** Границы загруженных моделей этажей: по ним расширяется рамка кадра */
	modelBounds: ShallowRef<Box3[]>
}

/** Загруженная модель этажа для сцены */
export interface SceneModelItem {
	/** Данные карты */
	data: ImageMap3DData
	/** Id слоя модели */
	layerId: string
	/** Корень модели: уже масштабирован и сдвинут по `layer.model` */
	root: Object3D
}

/** Итог подключения модели этажа: какие объекты не нашли свой узел и чей узел уже занят другим объектом */
export interface ModelAttachResult {
	/** Id объектов без узла в модели — выдавлены по своей фигуре */
	missing: string[]
	/** Id объектов, чей узел (или его меши) уже занят другим объектом: занятые меши не переназначаются */
	shared: string[]
}

/** Загрузка модели этажа */
export interface SceneModelJob extends Omit<SceneSurfaceJob, 'floor' | 'onFailure'> {
	/** Модель слоя */
	model: ImageMapLayerModel
	/** Настройка загрузчика приложением (`configureLoader`) */
	configure?: (loader: GLTFLoader) => void
	/** Модель не загрузилась */
	onError: (error: unknown) => void
	/** Модель этажа добавлена в сцену; `bounds` — её границы в координатах сцены */
	onBounds: (bounds: Box3) => void
}

/** Камера сцены: ортографическая (изометрия) или перспективная */
export type ImageMap3DViewCamera = Scene3DViewCamera

/** Положение камеры: цель `[x, y, z]`, азимут и полярный угол (радианы), масштаб */
export type CameraPose = Scene3DCameraPose

/** Действие камеры по клавише */
export type CameraKeyAction = Scene3DCameraKeyAction

/** Параметры управления камерой */
export interface CameraOptions {
	/** Камера сцены */
	camera: Readonly<ShallowRef<ImageMap3DViewCamera>>
	/** Рендерер: есть — работают OrbitControls */
	renderer: Readonly<ShallowRef<ImageMap3DRenderer | null>>
	/** Холст: к нему подключаются OrbitControls */
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	/** Данные карты */
	getData: () => ImageMap3DData
	/** Рамка кадра и режим этажей */
	getFraming: () => SceneFraming
	/** Счётчик подгонок камеры под размер области: после подгонки поза применяется заново */
	fitted: Readonly<ShallowRef<number>>
	/** Id активного этажа: камера смотрит на его высоту */
	getLayerId: () => string | undefined
	/** Режим этажей: `stack` — камера на середине стопки, `single` — на активном этаже */
	getLayerMode: () => ImageMap3DLayerMode
	/** Вращение и наклон указателем */
	getHasOrbit: () => boolean
	/** Границы мешей объекта в сцене; нет объекта — `null` */
	getObjectBox: (id: string) => Box3 | null
	/** Запросить кадр */
	invalidate: () => void
}

/** Параметры 3D-сцены компонента: область, этажи, содержимое и камера */
export interface StageOptions {
	/** Пропсы компонента */
	props: ImageMap3DProps
	/** Ядро карты: данные, выбор, наведение */
	map: Map3DParts
	/** Карточка объекта */
	cardRef: Readonly<Ref<HTMLElement | null>>
	/** Холст */
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	/** Область карты */
	hostRef: Readonly<Ref<HTMLElement | null>>
	/** Рендерер не создался или модель этажа не загрузилась */
	onError: (error: unknown) => void
}

/** Положение камеры: твин, масштаб, OrbitControls и переходы */
export type CameraPoseState = Scene3DPoseState

/** Размер области карты, px */
export type ScreenSize = Scene3DScreenSize

/** Точка сцены на экране: координаты в области карты (px) и видна ли она камере */
export type ScreenSpot = Scene3DScreenSpot

/** Положение карточки объекта: якорь (px) и сторона — над объектом или под ним у верхнего края */
export type CardPlacement = Scene3DCardPlacement

/** Метка `point` над сценой */
export interface ScenePointView {
	/** Объект */
	item: ResolvedImageMapObject
	/** Данные точки */
	point: ImageMapPoint
	/** Атрибуты элемента: id объекта для выбора указателем */
	attributes: Record<string, string>
	/** Положение и цвета */
	style: Record<string, string>
	/** Точка перед камерой и внутри области */
	isVisible: boolean
	/** Выбрана */
	isActive: boolean
	/** Под указателем или в фокусе клавиатуры */
	isHovered: boolean
	/** Метка пульсирует: `isPulsing` карты или точки */
	isPulsing: boolean
}

/** Указатель над сценой */
export type ScenePointerOptions = Scene3DPointerOptions

/** Клавиатура объектов сцены */
export interface SceneKeyboardOptions {
	/** Центры доступных объектов активного этажа на экране */
	centers: () => Center[]
	/** Объект в фокусе клавиатуры */
	getFocus: () => string | null
	/** Выбранный объект */
	getActive: () => string | null
	/** Перевести фокус клавиатуры на объект (или снять) */
	focus: (id: string | null) => void
	/** Выбрать объект */
	activate: (id: string, event: Event) => void
	/** Соседний этаж: 1 — выше, -1 — ниже */
	stepLayer: (step: 1 | -1) => void
}

/** Карточка объекта и метки над сценой */
export interface SceneOverlayOptions {
	/** Область карты */
	hostRef: Readonly<Ref<HTMLElement | null>>
	/** Карточка: её размер нужен, чтобы не выйти за край */
	cardRef: Readonly<Ref<HTMLElement | null>>
	/** Камера */
	getCamera: () => ImageMap3DViewCamera
	/** Подписка на каждый нарисованный кадр */
	onFrame: (hook: () => void) => void
	/** Запросить кадр */
	invalidate: () => void
	/** Границы мешей объекта */
	objectBox: (id: string) => Box3 | null
	/** Данные карты: высота этажей */
	getData: () => ImageMap3DData
	/** Объект карточки */
	getCardItem: () => ResolvedImageMapObject | undefined
	/** Точки активного этажа */
	getPoints: () => ResolvedImageMapObject[]
	/** Выбранный объект */
	getActive: () => string | null
	/** Объект под указателем или в фокусе */
	getHover: () => string | null
	/** Пульсация всех меток (`isPulsing` карты) */
	getIsPulsing: () => boolean
}

/** Ядро 2D-карты (данные, фильтры, часы, действия, каталог, маршруты) для 3D */
export interface Map3DOptions {
	/** Корень компонента */
	rootRef: Readonly<Ref<HTMLElement | null>>
	/** Показать объект камерой */
	zoomTo: (id: string) => void
}

/** Ядро 2D-карты в 3D: данные, фильтры, часы, действия, оверлей, каталог, маршруты и `setHover` */
export type Map3DParts = ReturnType<typeof useImageMap3DMap>

/** Выбор объекта лучом: активный этаж, камера и точка экрана в нормализованных координатах */
export interface ScenePickQuery {
	layerId: string | undefined
	camera: Camera
	ndc: Vector2
}

/** 3D-сцена компонента: область, содержимое, камера, оверлей и состояние */
export type ImageMap3DStage = ReturnType<typeof useImageMap3DStage>

/** Метка маршрута в сцене: начало, конец или переход на другой этаж */
interface RouteMarkerSpec {
	kind: 'start' | 'end' | 'transition'
	position: Vector3
}

/** Участки маршрута для трубок: ломаные без разрывов и метки */
export interface RouteSegments {
	runs: Vector3[][]
	markers: RouteMarkerSpec[]
}

/** Трубка маршрута в сцене: группа (трубки участков и метки), геометрии для роста, метка конца и материалы */
export interface RouteTube {
	group: Group
	geometries: TubeGeometry[]
	end: Mesh | null
	materials: Record<'line' | 'start' | 'end' | 'transition', MeshBasicMaterial>
}

/** Найденный путь маршрута: граф и узлы */
export interface Route3DPath {
	graph: RouteGraph
	path: RoutePath
}

/** Параметры маршрута в сцене */
export interface RouteTubeOptions {
	/** Сцена three */
	scene: Scene
	/** Рендерер: есть — маршрут рисуется */
	renderer: Readonly<ShallowRef<ImageMap3DRenderer | null>>
	/** Область карты: цвета темы */
	hostRef: Readonly<Ref<HTMLElement | null>>
	/** Данные карты: высоты этажей */
	getData: () => ImageMap3DData
	/** Найденный путь или `null` */
	getRoute: () => Route3DPath | null
	/** Id активного этажа: в режиме `single` рисуется только его участок */
	getLayerId: () => string | undefined
	/** Режим этажей: в `single` маршрут через этажи обрезается по активному этажу */
	getLayerMode: () => ImageMap3DLayerMode
	/** Запросить кадр */
	invalidate: () => void
}

/** Запись списка объектов для скринридера: объект, тег (ссылка или кнопка) и атрибуты */
export interface ObjectListEntry {
	/** Объект карты */
	item: ResolvedImageMapObject
	/** Тег: `a` — у объекта есть адрес и он не отключён, иначе `button` */
	tag: 'a' | 'button'
	/** Текст записи: название объекта; у внешней ссылки — с пометкой «откроется в новой вкладке» */
	label: string
	/** Атрибуты: адрес, `target` и `rel` внешней ссылки, `aria-current`, `aria-disabled`, `aria-haspopup` */
	attributes: Record<string, string | undefined>
}

/** Список объектов одного этажа для скринридера: этажи идут группами, текущий первым */
export interface ObjectListGroup {
	/** Id этажа */
	id: string
	/** Имя списка: «Список объектов, <этаж>» */
	label: string
	/** Записи этажа */
	entries: ObjectListEntry[]
}

/** Дерево габаритных рамок вершин контура: ускоряет поиск вершин в полосе вдоль ребра */
export interface PointTree {
	/** Вершины подряд: `x, y` на каждую */
	coords: Float64Array
	/** Номера вершин в порядке обхода листьев */
	order: Uint32Array
	/** Рамка узла: `minX, minY, maxX, maxY` на каждый узел */
	box: number[]
	/** Дети узла: номера левого и правого; `-1, -1` у листа */
	kids: number[]
	/** Диапазон листа в `order`: начало и конец (не включая) на каждый узел */
	span: number[]
}
