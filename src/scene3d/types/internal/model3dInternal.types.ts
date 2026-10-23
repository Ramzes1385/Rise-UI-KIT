import type { Plugin } from 'vue'
import type { Scene3DRenderer } from '../scene3d.types'
import type { ScenePalette } from './scene3dGeometry.types'
import type { Scene3DColorResolver, Scene3DLoop, Scene3DResourceCache } from './scene3dInternal.types'
import type {
	AnimationAction,
	AnimationClip,
	AnimationMixer,
	BufferGeometry,
	Group,
	InstancedMesh,
	Material,
	Matrix4,
	Mesh,
	Object3D,
	WebGLRenderer,
} from 'three'
import type {
	Model3DContext,
	Model3DDefinition,
	Model3DDefinitions,
	Model3DHandle,
	Model3DInstance,
	Model3DNode,
	Model3DPart,
	Model3DSet,
	Model3DState,
	Model3DTone,
} from '../model3d.types'

/** Что известно о узле при выборе модели: сам узел, поле `model3d`, модель его вида в нотации */
export interface Model3DSelection {
	node: Model3DNode
	/** Поле узла `model3d`: адрес GLB или ключ модели */
	model3d?: { model?: string; url?: string }
	/** Модель вида нотации: id или ключ — сильнее слов; `'auto'` — слова, затем `kindFallback`; не задана — `shape` */
	kindModel?: string
	/** Запасная модель вида, если слова не подошли (карта: client → laptop, store → db…) */
	kindFallback?: string
	/** Внешний узел карты: запасная модель — `cloud` */
	isExternal?: boolean
}

/** Откуда выбрана модель (порядок раздела 6.2 контракта) */
export type Model3DSource = 'url' | 'node' | 'resolver' | 'kind' | 'words' | 'fallback' | 'shape'

/** Итог выбора: ключ модели и её определение (встроенная — `{ preset }`) */
export interface Model3DResolution {
	key: string
	definition: Model3DDefinition
	source: Model3DSource
}

/** Слова одной модели для подбора по названию; `rank` — происхождение: 0 свои компонента, 1 приложения, 2 встроенные */
export interface Model3DWordGroup {
	id: string
	words: readonly string[]
	rank: number
}

/** Фабрика встроенной модели: геометрии и материалы — только из `context` */
export type Model3DBuilder = (node: Model3DNode, context: Model3DContext) => Model3DInstance

/** Библиотека встроенных моделей по id */
export type Model3DLibrary = Readonly<Partial<Record<string, Model3DBuilder>>>

/** Кольцо состояния на земле: роль и цвет (CSS/токен) */
export interface Model3DRing {
	id: 'hover' | 'select' | 'active' | 'focus' | 'tone' | 'invalid'
	css: string
}

/** Вид, в который состояние переводит модель (чистые данные, без three) */
export interface Model3DLook {
	/** Добавка яркости свечения */
	emissive: number
	/** Непрозрачность 0–1 */
	opacity: number
	/** Серая модель (`muted`) */
	isGray: boolean
	rings: readonly Model3DRing[]
	/** Светодиод статуса над моделью */
	led: Model3DTone | null
	/** Кольцо активного шага пульсирует */
	isPulsing: boolean
	/** Частицы у модели нужны (приглушённая и серая — без них) */
	hasParticles: boolean
	/** Вид совпадает с покоем: материалы и кольца не нужны */
	isNeutral: boolean
}

/** Кольца и светодиод модели */
export interface Model3DDecor {
	group: Group
	rings: Map<Model3DRing['id'], Mesh>
	led: Mesh | null
	/** Ресурсы колец и светодиода: освобождаются вместе с узлом, а не с моделью */
	geometryKeys: Set<string>
	materialKeys: Set<string>
}

/** Меш модели с ролью и исходным материалом */
export interface Model3DMeshRef {
	mesh: Mesh
	/** Роль окраски; `null` — меш вне перечисленных частей: состояние действует, цвет роли — нет */
	part: Model3DPart | null
	base: Material
}

/** Идущая анимация узла */
export interface Model3DRun {
	name: string
	elapsed: number
	duration: number
	repeat: number | 'loop'
	step: (progress: number) => void
	done: () => void
	action: AnimationAction | null
}

/** Режим узла: ждёт сборки, грузится, отдельный объект, экземпляр группы */
export type Model3DMode = 'pending' | 'loading' | 'object' | 'instanced'

/** Узел реестра: корень, собранная модель и всё, что нужно для состояний, окраски и анимаций */
export interface Model3DEntry {
	id: string
	selection: Model3DSelection
	resolution: Model3DResolution
	root: Group
	/** Масштаб узла (`setScale`, `scale` определения): внутри корня, поэтому положение корня приложение ставит само */
	body: Group
	mode: Model3DMode
	instance: Model3DInstance | null
	meshes: Model3DMeshRef[]
	detail: Object3D[]
	geometryKeys: Set<string>
	materialKeys: Set<string>
	derived: Map<Material, Material>
	custom: Map<Model3DPart, Material>
	colors: Map<Model3DPart | 'all', string>
	/** Состояние, вычисленное компонентом */
	computed: Model3DState
	/** Итоговое состояние: вычисленное компонентом и поверх него `setState` дескриптора */
	effective: Model3DState
	override: Partial<Model3DState>
	look: Model3DLook
	runs: Map<string, Model3DRun>
	mixer: AnimationMixer | null
	clips: Map<string, AnimationClip>
	decor: Model3DDecor | null
	groupKey: string | null
	groupIndex: number
	/** Масштаб из определения модели (`scale`) */
	baseScale: number
	/** Масштаб из `setScale` */
	scale: number
	/** Номер сборки: ответ загрузки прежней сборки отбрасывается */
	version: number
	/** Состояние в виде строки: вид пересчитывается, только если оно изменилось */
	stateKey: string
	handle: Model3DHandle
}

/** Меши группы инстансинга с их положением в модели */
export interface Model3DGroupParts {
	meshes: InstancedMesh[]
	locals: Matrix4[]
	roles: Model3DPart[]
	ownedGeometries: BufferGeometry[]
}

/** Группа экземпляров одной встроенной модели: по InstancedMesh на часть */
export interface Model3DInstancedGroup {
	key: string
	/** Собранная модель-образец: её геометрии и материалы делят все экземпляры */
	template: Model3DInstance
	meshes: InstancedMesh[]
	locals: Matrix4[]
	roles: Model3DPart[]
	/** Слитые геометрии группы: освобождаются вместе с ней */
	ownedGeometries: BufferGeometry[]
	ids: string[]
	geometryKeys: Set<string>
	materialKeys: Set<string>
}

/** Связи дескриптора и анимаций с реестром: пересчёт вида, окраска, перенос из инстанса и возврат */
export interface Model3DHooks {
	restate: (entry: Model3DEntry) => void
	restyle: (entry: Model3DEntry) => void
	detach: (entry: Model3DEntry) => void
	settle: (entry: Model3DEntry) => void
	wake: () => void
}

/** GLB, загруженный один раз на адрес: оригинал клонируется узлам */
export interface Model3DGltfSource {
	object: Object3D
	clips: AnimationClip[]
}

/** Загрузчик GLB компонента: кеш по адресу, клон со скелетами */
export interface Model3DGltfLoader {
	load: (url: string) => Promise<Model3DGltfSource>
	dispose: () => Promise<void>
}

/** Материалы и геометрии моделей: ссылки считает кеш сцены, цвета ролей обновляются темой */
export interface Model3DBank {
	material: (key: string, owner: Set<string>, build: () => Material) => Material
	geometry: <T extends BufferGeometry>(key: string, owner: Set<string>, build: () => T) => T
	release: (owner: { geometryKeys: Set<string>; materialKeys: Set<string> }) => void
	/** Материал роли (общий для моделей) */
	role: (part: Model3DPart, modelId: string, owner: Set<string>) => Material
	/** Материал кольца или светодиода: цвет — CSS/токен */
	basic: (css: string, owner: Set<string>) => Material
	/** Перекрасить все материалы по теме */
	refresh: () => void
}

/** Настройки реестра моделей сцены */
export interface Model3DRegistryOptions {
	cache: Scene3DResourceCache
	loop: Scene3DLoop
	getPalette: () => ScenePalette
	resolveColor: Scene3DColorResolver
	/** Модели компонента (`models`) */
	getModels?: () => Model3DDefinitions
	/** Модели приложения (`createScene3DModels`) */
	appModels?: Model3DDefinitions
	/** Правило приложения: id или ключ модели по узлу */
	modelResolver?: (node: Model3DNode) => string | null | undefined
	/** Запасная встроенная модель: карта — `server`, роадмап — `book` */
	fallback?: string
	/** Наборы встроенных моделей, по словам которых ищется модель; по умолчанию `service` */
	wordSets?: readonly Model3DSet[]
	/** Клетка узла: ширина, глубина, высота */
	cell: { width: number; depth: number; height: number }
	seed?: number
	isReducedMotion?: () => boolean
	/** Длительность анимации по умолчанию, мс */
	getDuration?: () => number
	/** Загрузчик GLB; без него адреса не грузятся (узел остаётся запасной моделью) */
	gltf?: Model3DGltfLoader
	/** Встроенные модели; по умолчанию — `MODEL3D_LIBRARY` */
	library?: Model3DLibrary
	/** Сколько узлов одной модели нужно, чтобы рисовать её инстансингом; по умолчанию 8 */
	instanceThreshold?: number
	/** Части модели с одним материалом сливаются в один InstancedMesh: меньше вызовов отрисовки; по умолчанию нет */
	isMergedInstancing?: boolean
	onModelReady?: (handle: Model3DHandle) => void
	onFocus?: (id: string) => void
	warn?: (message: string) => void
}

/** Реестр моделей сцены: выбор, сборка, инстансинг, состояния, анимации, дескрипторы */
export interface Model3DRegistry {
	/** Корень экземпляров (InstancedMesh): добавить в сцену */
	object: Group
	/** Выбор модели узла без сборки (палитра, тесты) */
	resolve: (selection: Model3DSelection) => Model3DResolution
	/** Добавить узел: возвращает корень, который приложение ставит на место узла */
	add: (id: string, selection: Model3DSelection) => Group
	/** Сменить выбор или данные узла: модель пересобирается при commit */
	update: (id: string, selection: Model3DSelection) => void
	remove: (id: string) => void
	/** Собрать добавленные и изменённые узлы; группы от порога — инстансингом */
	commit: () => void
	/** Состояние, вычисленное компонентом; поверх него — `setState` дескриптора */
	setState: (id: string, state: Model3DState) => void
	/** Анимация шага сценария: `model3d.animation ?? анимация модели` */
	playStep: (id: string, name?: string) => Promise<void>
	/** Вид узла (кольца, частицы) */
	getLook: (id: string) => Model3DLook | null
	/** Обновить матрицы экземпляров по положению корней узлов */
	sync: () => void
	/** Перекрасить по теме */
	refreshTheme: () => void
	/** Мелкие детали: показать или скрыть (клетка на экране < 18 px — скрыть) */
	setDetail: (isVisible: boolean) => void
	getHandle: (id: string) => Model3DHandle | null
	getHandles: () => Model3DHandle[]
	dispose: () => void
}

/** Фигура 2D-вида для модели `shape` (поле `source.shape` узла) */
export const MODEL3D_SHAPES = ['rect', 'rounded', 'diamond', 'circle', 'hexagon', 'parallelogram', 'document', 'cylinder'] as const
export type Model3DShape = (typeof MODEL3D_SHAPES)[number]

/** Плагин приложения с моделями */
export type Scene3DModelsPlugin = Plugin

/** Настройки набора миниатюр */
export interface Model3DThumbnailsOptions {
	canvas: HTMLCanvasElement
	/** Рендерер с ножницами; без него — `WebGLRenderer` */
	createRenderer?: (canvas: HTMLCanvasElement) => Model3DThumbnailRenderer
	getDuration?: () => number
	isReducedMotion?: () => boolean
}

/** Рендерер миниатюр: `Scene3DRenderer` с областью и ножницами */
export type Model3DThumbnailRenderer = Scene3DRenderer & Pick<WebGLRenderer, 'setViewport' | 'setScissor' | 'setScissorTest'>

/** Ячейка миниатюр: элемент HTML и модель в ней */
export interface Model3DThumbnails {
	/** Показать модель в ячейке; повторный вызов с тем же id заменяет */
	add: (id: string, cell: HTMLElement, instance: Model3DInstance) => void
	remove: (id: string) => void
	/** Играть анимацию модели (ячейка под указателем или в фокусе); `null` — остановить */
	setActive: (id: string | null, animation?: string) => void
	/** Перерисовать (размер холста или ячеек изменился) */
	invalidate: () => void
	dispose: () => void
}
