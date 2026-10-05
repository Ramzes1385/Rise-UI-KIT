import type { Ref, ShallowRef } from 'vue'
import type { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { BaseImageMapProps } from '@components/BaseImageMap/types/BaseImageMap.types'
import type { Color, Group, Material, Mesh, MeshStandardMaterial, Object3D, Scene } from 'three'
import type { ImageMap3DLayerMode, ImageMap3DRenderer, ImageMap3DRendererFactory } from '../BaseImageMap3D.types'
import type { ImageMap3DData, ImageMap3DLayer, ImageMap3DObject, ImageMapLayerModel } from '../imageMap3dData.types'

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
	/** Рендерер не создался */
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

/** Загрузка модели этажа */
export interface SceneModelJob extends Omit<SceneSurfaceJob, 'floor'> {
	/** Модель слоя */
	model: ImageMapLayerModel
	/** Настройка загрузчика приложением (`configureLoader`) */
	configure?: (loader: GLTFLoader) => void
	/** Модель не загрузилась */
	onError: (error: unknown) => void
}
