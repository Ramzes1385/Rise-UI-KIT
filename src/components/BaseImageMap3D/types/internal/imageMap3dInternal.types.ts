import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { useImageMap3DMap } from '../../model/useImageMap3DMap'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { UseTweenReturn } from '@composables/interaction/useTween'
import type { useImageMap3DStage } from '../../model/useImageMap3DStage'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { ImageMapPoint } from '@components/BaseImageMap/types/imageMapData.types'
import type { BaseImageMapProps } from '@components/BaseImageMap/types/BaseImageMap.types'
import type { Center } from '@components/BaseImageMap/types/internal/imageMapInternal.types'
import type { RouteGraph, RoutePath } from '@components/BaseImageMap/types/ImageMapRoutes.types'
import type { ResolvedImageMapObject } from '@components/BaseImageMap/types/internal/imageMapModel.types'
import type { ImageMap3DData, ImageMap3DLayer, ImageMap3DObject, ImageMapLayerModel } from '../imageMap3dData.types'
import type {
	ImageMap3DCamera,
	ImageMap3DLayerMode,
	ImageMap3DProps,
	ImageMap3DRenderer,
	ImageMap3DRendererFactory,
} from '../BaseImageMap3D.types'
import type {
	Box3,
	Camera,
	Vector2,
	Color,
	Group,
	Material,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	TubeGeometry,
} from 'three'

/** Правило проверки 3D-поля данных */
export type ImageMap3DFieldRule = 'number' | 'positive' | 'nonNegative' | 'text' | 'vector' | 'model' | 'object'

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

/** Параметры области рисования 3D-карты */
export interface ImageMap3DViewportOptions {
	/** Холст: есть в DOM — рендерер работает, пропал — всё освобождается */
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	/** Элемент, по размеру которого рисуется сцена */
	hostRef: Readonly<Ref<HTMLElement | null>>
	/** Данные карты: по ним подбирается камера */
	getData: () => ImageMap3DData
	/** Фабрика рендерера */
	getFactory: () => ImageMap3DRendererFactory
	/** Вид камеры */
	getCameraKind: () => ImageMap3DCamera
	/** Режим этажей: от него зависит рамка кадра */
	getLayerMode: () => ImageMap3DLayerMode
	/** Рендерер не создался или графический контекст потерян и не вернулся */
	onError: (error: unknown) => void
}

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

/** Точка на ободе цилиндра сцены в системе камеры начального вида: по ней подбирается кадр перспективной камеры */
export interface SceneRimPoint {
	/** Смещение вбок от оси взгляда по модулю */
	sideways: number
	/** Смещение вверх от оси взгляда по модулю */
	up: number
	/** Смещение к камере вдоль оси взгляда: больше — ближе к камере */
	toward: number
}

/** Цвет и непрозрачность материала в одном состоянии */
export interface SceneStateColor {
	/** Цвет */
	color: Color
	/** Непрозрачность 0–1 */
	opacity: number
}

/** CSS-цвет (в том числе `var(--rise-*)`) → цвет three в теме области карты */
export type SceneColorResolver = (css: string) => Color

/** Объект карты в сцене: его меши и материал состояний */
export interface SceneObjectEntry {
	/** Id объекта */
	id: string
	/** Id слоя объекта */
	layerId: string
	/** Общий материал всех мешей объекта; цвет и непрозрачность меняются по состоянию */
	material: MeshStandardMaterial
	/** Меши объекта: выдавленная фигура или узлы модели этажа */
	meshes: Mesh[]
	/** Откуда меши: выдавливание фигуры или модель этажа */
	source: 'shape' | 'model'
	/** Цвета состояний */
	colors: Record<SceneObjectState, SceneStateColor>
	/** Текущее состояние */
	state: SceneObjectState
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
}

/** Камера сцены: ортографическая (изометрия) или перспективная */
export type ImageMap3DViewCamera = OrthographicCamera | PerspectiveCamera

/** Положение камеры: цель `[x, y, z]`, азимут и полярный угол (радианы), масштаб */
export type CameraPose = [number, number, number, number, number, number]

/** Действие камеры по клавише */
export type CameraKeyAction =
	{ type: 'rotate'; degrees: number } | { type: 'tilt'; degrees: number } | { type: 'zoom'; direction: 1 | -1 } | { type: 'reset' }

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
export interface CameraPoseState {
	/** Твин положения камеры */
	tween: UseTweenReturn<CameraPose>
	/** Текущий масштаб */
	zoom: Ref<number>
	/** OrbitControls, пока есть рендерер */
	controls: ShallowRef<OrbitControls | null>
	/** Положение камеры сейчас */
	current: () => CameraPose
	/** Основа следующего шага: цель идущего перехода (нажатия копятся) или положение сейчас */
	next: () => CameraPose
	/** Запомнить положение после жеста */
	sync: () => void
	/** Плавно перейти к положению */
	goTo: (pose: CameraPose) => void
	/** Сразу поставить положение */
	jump: (pose: CameraPose) => void
	/** Последнее показанное положение */
	lastPose: () => CameraPose | null
}

/** Размер области карты, px */
export interface ScreenSize {
	width: number
	height: number
}

/** Точка сцены на экране: координаты в области карты (px) и видна ли она камере */
export interface ScreenSpot {
	x: number
	y: number
	isVisible: boolean
}

/** Положение карточки объекта: якорь (px) и сторона — над объектом или под ним у верхнего края */
export interface CardPlacement {
	left: number
	top: number
	isBelow: boolean
}

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
}

/** Указатель над сценой */
/** Последнее положение указателя: наведение по нему считается раз в кадр */
export interface PointerSpot {
	/** Элемент под указателем (метка точки) */
	target: EventTarget | null
	/** clientX */
	x: number
	/** clientY */
	y: number
}

export interface ScenePointerOptions {
	/** Id объекта под точкой экрана (clientX, clientY) */
	pickAt: (x: number, y: number) => string | null
	/** Объект под указателем */
	setHover: (id: string | null) => void
	/** Выбрать объект */
	activate: (id: string, event: Event) => void
}

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

/** Трубка маршрута в сцене: группа (трубка и метки начала и конца), геометрия для роста и материалы */
export interface RouteTube {
	group: Group
	geometry: TubeGeometry
	materials: Record<'line' | 'start' | 'end', MeshBasicMaterial>
}

/** Найденный путь маршрута: граф и узлы */
interface Route3DPath {
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
	/** Запросить кадр */
	invalidate: () => void
}
