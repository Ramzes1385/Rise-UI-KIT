import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { FlowMap3DProps, FlowMap3DView } from '../BaseFlowMap3D.types'
import type { Box3, Color, Group, InstancedMesh, Mesh, Vector3 } from 'three'
import type { useScene3DViewport } from '@/scene3d/renderer/useScene3DViewport'
import type { Scene3DContext, Scene3DRenderer } from '@/scene3d/types/scene3d.types'
import type { FlowMap3DLayout, FlowMap3DScenarioLayer } from './flowMap3dMotion.types'
import type { RibbonPoint, ScenePalette, SceneLights } from '@/scene3d/types/internal/scene3dGeometry.types'
import type { FlowEdgeKindDef, FlowNodeKindDef } from '@components/BaseFlowMap/types/api/flowNotation.types'
import type { FlowMapController, FlowViewport } from '@components/BaseFlowMap/types/api/flowController.types'
import type { Model3DDefinitions, Model3DHandle, Model3DNode, Model3DTone } from '@/scene3d/types/model3d.types'
import type { Model3DGltfLoader, Model3DRegistry, Model3DSelection } from '@/scene3d/types/internal/model3dInternal.types'
import type { FlowEdge, FlowGroup, FlowNode, FlowRect, FlowStatus } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowModelInternal, FlowPickApi, FlowStatusView } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type {
	Scene3DLabels,
	Scene3DLoop,
	Scene3DResourceCache,
	Scene3DTick,
	Scene3DViewCamera,
} from '@/scene3d/types/internal/scene3dInternal.types'

/** Пресеты камеры на кнопках «1» и «2» нижней панели: изометрия и изометрия с поворотом на 90° */
export const FLOW_MAP_3D_DOCK_PRESETS = ['iso', 'iso-90'] as const

/** Центр плана и масштаб перевода: пикселей 2D на единицу сцены; начало мира — центр содержимого, сетка затухает от него */
export interface FlowMap3DPlan {
	unit: number
	origin: { x: number; z: number }
}

/** Режим «Слои»: включён ли и расстояние между ярусами */
export interface FlowMap3DLayers {
	isLayered: boolean
	gap: number
}

/** Ярус элемента: номер, высота и сдвиг назад (по оси z, единицы сцены); без «Слоёв» высота и сдвиг — 0, номер остаётся */
export interface FlowMap3DTierSpot {
	tier: number
	y: number
	z: number
}

/** Ярусы: узлы и группы по id, высота верхнего яруса; `isLayered` — включён ли режим */
export interface FlowMap3DLevels {
	nodes: Map<string, FlowMap3DTierSpot>
	groups: Map<string, FlowMap3DTierSpot>
	top: number
	isLayered: boolean
}

/** Узел для сцены: центр в единицах сцены, выбор модели и положение */
export interface FlowMap3DNodeItem {
	id: string
	node: FlowNode
	kind: FlowNodeKindDef
	/** Рамка в плане 2D, px */
	rect: FlowRect
	x: number
	z: number
	/** Высота яруса */
	base: number
	/** Сдвиг назад яруса, уже учтён в `z` */
	shift: number
	/** Подъём над землёй: ярус и `model3d.elevation` */
	elevation: number
	/** Поворот вокруг вертикали, радианы */
	rotation: number
	scale: number
	group: string | undefined
	selection: Model3DSelection
	/** Высота модели, единицы сцены */
	height: number
}

/** Группа для сцены: рамка на плане и основание */
export interface FlowMap3DGroupItem {
	id: string
	group: FlowGroup
	rect: { x0: number; z0: number; x1: number; z1: number }
	/** Высота яруса */
	y: number
	/** Номер яруса верхней группы */
	tier: number
	/** Сдвиг назад яруса, уже учтён в `rect` */
	shift: number
	base: 'dashed' | 'plate' | 'none'
	depth: number
	label: string
}

/** Связь для сцены: путь над землёй и стиль */
export interface FlowMap3DEdgeItem {
	id: string
	edge: FlowEdge
	kind: FlowEdgeKindDef
	shape: 'ribbon' | 'arc' | 'tube'
	height: number
	points: RibbonPoint[]
	stroke: 'solid' | 'dashed' | 'dotted'
	color: string | undefined
	hasParticles: boolean
	label: string | undefined
	/** Место подписи на земле: центр, высота и угол вдоль отрезка */
	labelSpot: { x: number; y: number; z: number; angle: number } | null
}

/** Что даёт раскладка модели ядра для сцены: структура без состояния (выбор, наведение, статус не входят) */
export interface FlowMap3DSnapshot {
	/** Режим «Слои»: высоты, сдвиги и ленты по стенкам посчитаны для него */
	isLayered: boolean
	unit: number
	origin: { x: number; z: number }
	nodes: FlowMap3DNodeItem[]
	groups: FlowMap3DGroupItem[]
	edges: FlowMap3DEdgeItem[]
	/** Клетка модели: ширина, глубина, высота */
	cell: { width: number; depth: number; height: number }
	/** Рамка содержимого на плане */
	bounds: { x0: number; z0: number; x1: number; z1: number }
	/** Высота самой высокой модели с учётом ярусов */
	height: number
}

/** Кадр камеры сцены */
export interface FlowMap3DFrame {
	bounds: Box3
	radius: number
	halfHeight: number
}

/** Вид камеры для переводов viewport ↔ положение */
export interface FlowMap3DViewSpec {
	origin: { x: number; z: number }
	size: { width: number; height: number }
	unit: number
	/** Половина высоты видимой области при масштабе 1, единицы сцены */
	half: number
}

/** Цвета сцены и перевод CSS в цвет three */
export interface FlowMap3DPalette {
	palette: ScenePalette
	resolve: (css: string) => Color
}

/** Земля: сетка и плоскость тени */
export interface FlowMap3DGround {
	group: Group
	recolor: (palette: FlowMap3DPalette) => void
}

/** Рамки и платформы групп */
export interface FlowMap3DGroundGroups {
	group: Group
	recolor: (palette: FlowMap3DPalette) => void
}

/** Надпись на земле: место, высота яруса и угол, по которому она разворачивается к камере */
export interface FlowMap3DGroundLabel {
	id: string
	text: string
	x: number
	y: number
	z: number
	angle: number
	height: number
	weight: number
}

/** Пакет подписей на земле: один меш, развороты по азимуту камеры */
export interface FlowMap3DLabelBatch {
	mesh: Mesh | null
	/** Развернуть подписи под азимут камеры; false — разворот не менялся */
	orient: (azimuth: number) => boolean
	dispose: () => void
}

/** Подписи на земле вместе с атласом */
export interface FlowMap3DLabels extends FlowMap3DLabelBatch {
	recolor: (palette: FlowMap3DPalette) => void
}

/** Ленты или трубы одного стиля: слиты в один меш */
export interface FlowMap3DEdgeBatch {
	mesh: Mesh
	setOpacity: (opacity: number) => void
	setColor: (palette: FlowMap3DPalette) => void
}

/** Все связи: меши по стилям и подсветка */
export interface FlowMap3DEdges {
	group: Group
	/** Подсветить связи с этими id: остальные тускнеют; null — без подсветки */
	setHighlight: (ids: ReadonlySet<string> | null) => void
	recolor: (palette: FlowMap3DPalette) => void
}

/** Наконечники стрелок: один InstancedMesh */
export interface FlowMap3DArrows {
	mesh: InstancedMesh | null
	setOpacity: (isDim: boolean) => void
	recolor: (palette: FlowMap3DPalette) => void
	dispose: () => void
}

/** Частицы трафика: `InstancedMesh` на цвет (вызов, событие), положение — чистая функция времени */
export interface FlowMap3DParticles {
	group: Group | null
	/** Сколько частиц на сцене: не больше проп `particles` */
	count: number
	hasParticles: boolean
	/** Поставить частицы на места момента `time` (секунды от начала; одно и то же время — одни и те же места) */
	place: (time: number) => void
	/** Связи с узлом `muted` (`down`, `unknown`) без частиц */
	setTones: (tones: ReadonlyMap<string, Model3DTone>) => void
	setVisible: (isVisible: boolean) => void
	/** Скрыть на время перехода «Слоёв»: не меняет `setVisible` */
	setSuspended: (isSuspended: boolean) => void
	recolor: (palette: FlowMap3DPalette) => void
	dispose: () => void
}

/** Узел в сцене: корень модели и точки привязки */
export interface FlowMap3DNodeEntry {
	id: string
	root: Group
	position: Vector3
	/** Точка бирки над моделью */
	anchor: Vector3
	/** Рамка для наезда камеры */
	box: Box3
}

/** Что нужно сборке сцены от ядра 3D: цикл, кеш, модели, фокус */
export interface FlowMap3DRuntime {
	loop: Scene3DLoop
	cache: Scene3DResourceCache
	getModels: () => Model3DDefinitions
	isReducedMotion: () => boolean
	onModelReady: (handle: Model3DHandle) => void
	onFocus: (id: string) => void
}

/** Параметры узлов сцены */
export interface FlowMap3DNodesOptions {
	runtime: FlowMap3DRuntime
	cell: FlowMap3DSnapshot['cell']
	getPalette: () => FlowMap3DPalette
	appModels: Model3DDefinitions
	modelResolver?: (node: Model3DNode) => string | null | undefined
	gltf: Model3DGltfLoader
}

/** Узлы сцены: корни моделей, реестр и точки привязки */
export interface FlowMap3DNodes {
	group: Group
	registry: Model3DRegistry
	entries: Map<string, FlowMap3DNodeEntry>
}

/** Параметры сборки сцены */
export interface FlowMap3DBuildOptions {
	snapshot: FlowMap3DSnapshot
	palette: FlowMap3DPalette
	runtime: FlowMap3DRuntime
	quality: NonNullable<FlowMap3DProps['quality']>
	particles: number
	/** Нужны ли платформы «Слоёв»: переключатель включён или режим уже включён */
	hasLayers: boolean
	appModels: Model3DDefinitions
	modelResolver?: (node: Model3DNode) => string | null | undefined
	gltf: Model3DGltfLoader
}

/** Всё, что собрано в сцене из снимка */
export interface FlowMap3DContent {
	/** Земля, рамки, связи, подписи, свет: освобождается `disposeObject` */
	root: Group
	/** Узлы: корни и реестр, их освобождает реестр */
	nodes: FlowMap3DNodes
	particles: FlowMap3DParticles
	/** Токены и следы сценария */
	scenario: FlowMap3DScenarioLayer
	/** Части, что переходят между «плоско» и «Слоями»: группы, связи, платформы, пятна-тени */
	layout: FlowMap3DLayout
	lights: SceneLights
	labels: FlowMap3DLabels
	bounds: Box3
	setHighlight: (ids: ReadonlySet<string> | null) => void
	recolor: (palette: FlowMap3DPalette) => void
	/** Палитра, которой сейчас окрашена сцена: после смены темы — новая, её цвета закэшированы */
	getPalette: () => FlowMap3DPalette
	dispose: () => void
}

/** Состояния для перекраски сцены: что вычислено из выбора, наведения, сценария и статусов */
export interface FlowMap3DSceneStates {
	hover: string | null
	focus: string | null
	selection: ReadonlySet<string>
	active: ReadonlySet<string>
	highlight: ReadonlySet<string> | null
	tones: ReadonlyMap<string, Model3DTone>
	/** Сценарий идёт: активные модели пульсируют только тогда, на паузе кадров нет */
	isPlaying: boolean
}

/** Область рисования ядра 3D */
export type FlowMap3DViewport = ReturnType<typeof useScene3DViewport>

/** Параметры сцены */
export interface FlowMap3DSceneOptions {
	viewport: FlowMap3DViewport
	/** Непрерывные кадры с учётом «уменьшить движение» */
	animate: (tick: Scene3DTick) => () => void
	hostRef: Readonly<Ref<HTMLElement | null>>
	snapshot: Readonly<ComputedRef<FlowMap3DSnapshot>>
	props: FlowMap3DProps
	getStates: () => FlowMap3DSceneStates
	getAzimuth: () => number
	getQuality: () => NonNullable<FlowMap3DProps['quality']>
	getParticleCount: () => number
	getHasParticles: () => boolean
	isReducedMotion: () => boolean
	getHasLayers: () => boolean
	/** Длительность перехода «Слоёв», мс; 0 — без перехода */
	getBlendDuration: () => number
	/** Положения вершин и подписей изменились без смены данных */
	onMoved: () => void
	onFocus: (id: string) => void
	onBuilt: (content: FlowMap3DContent | null) => void
}

/** Пресет камеры */
export type FlowMap3DPreset = NonNullable<FlowMap3DProps['camera']>

/** Параметры камеры */
export interface FlowMap3DCameraOptions {
	camera: Readonly<ShallowRef<Scene3DViewCamera>>
	renderer: Readonly<ShallowRef<Scene3DRenderer | null>>
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	fitted: Readonly<ShallowRef<number>>
	invalidate: () => void
	snapshot: Readonly<ComputedRef<FlowMap3DSnapshot>>
	preset: Ref<FlowMap3DPreset>
	getSize: () => { width: number; height: number }
	getBox: (id: string) => Box3 | null
	onPreset: (preset: FlowMap3DPreset) => void
}

/** Камера сцены: пресеты, повороты, масштаб, наезд и область 2D-вида */
export interface FlowMap3DCameraApi {
	azimuth: () => number
	/** Включить или выключить вращение и панораму мышью: на время переноса узла и протяжки связи */
	setOrbit: (isEnabled: boolean) => void
	zoom: Ref<number>
	isMaxZoom: ComputedRef<boolean>
	isMinZoom: ComputedRef<boolean>
	home: () => void
	setPreset: (preset: FlowMap3DPreset) => void
	/** Четверть оборота: 1 — по часовой стрелке при взгляде сверху */
	rotate: (step: 1 | -1) => void
	/** Поворот на градусы */
	turn: (degrees: number) => void
	tilt: (degrees: number) => void
	zoomIn: () => void
	zoomOut: () => void
	wheelZoom: (event: WheelEvent) => void
	pinchZoom: (factor: number) => void
	fly: (id: string) => void
	/** Полёт к виду сверху с севером вверх — кадр, в котором 2D-вид встаёт на место 3D */
	flyTo2d: () => void
	/** Полёт из кадра 2D в пресет: положение и масштаб остаются, меняются углы */
	flyFrom2d: (preset: FlowMap3DPreset) => void
	viewport: () => FlowViewport
	setViewport: (viewport: FlowViewport, options?: { isAnimated?: boolean }) => void
	fit: () => void
}

/** Параметры сцены и камеры вместе */
export interface FlowMap3DStageOptions {
	props: FlowMap3DProps
	model: FlowModelInternal
	snapshot: Readonly<ComputedRef<FlowMap3DSnapshot>>
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	hostRef: Readonly<Ref<HTMLElement | null>>
	labelsRef: Readonly<ShallowRef<HTMLElement | null>>
	preset: Ref<FlowMap3DPreset>
	hovered: Ref<string | null>
	focused: Ref<string | null>
	getQuality: () => NonNullable<FlowMap3DProps['quality']>
	getParticleCount: () => number
	getHasParticles: () => boolean
	getHasLayers: () => boolean
	getBlendDuration: () => number
	isReducedMotion: () => boolean
	onError: (error: unknown) => void
	onPreset: (preset: FlowMap3DPreset) => void
	onFocus: (id: string) => void
}

/** Части, из которых собираются параметры сцены */
export interface FlowMap3DStageParts {
	viewport: FlowMap3DViewport
	animate: (tick: Scene3DTick) => () => void
	labels: Scene3DLabels
	states: Readonly<ComputedRef<FlowMap3DSceneStates>>
	camera: FlowMap3DCameraApi
	built: ShallowRef<FlowMap3DContent | null>
}

/** Холст и рендерер для снимка сцены */
export interface FlowMap3DCaptureSource {
	host: HTMLElement
	canvas: HTMLCanvasElement
	render: () => void
}

/** Фокус клавиатуры на узле */
export interface FlowMap3DFocusApi {
	move: (id: string | null) => void
	clear: () => void
}

/** Параметры фокуса */
export interface FlowMap3DFocusOptions {
	model: FlowModelInternal
	focused: Ref<string | null>
	announce: (text: string) => void
	isVisible: (id: string) => boolean
	reveal: (id: string) => void
}

/** Параметры клавиатуры */
export interface FlowMap3DKeyboardOptions {
	model: FlowModelInternal
	labels: Scene3DLabels
	camera: FlowMap3DCameraApi
	focus: FlowMap3DFocusApi & { focused: Readonly<Ref<string | null>> }
	pick: Pick<FlowPickApi, 'pick' | 'clear'>
}

/** Параметры указателя */
export interface FlowMap3DPointerOptions {
	hostRef: Readonly<Ref<HTMLElement | null>>
	getContent: () => FlowMap3DContent | null
	getCamera: () => Scene3DViewCamera
	pick: FlowPickApi
	pinchZoom: (factor: number) => void
}

/** Элемент скрытого списка узлов */
interface FlowMap3DListEntry {
	id: string
	label: string
}

/** Группа скрытого списка */
export interface FlowMap3DListGroup {
	id: string
	label: string
	entries: FlowMap3DListEntry[]
}

/** Параметры скрытого списка */
export interface FlowMap3DListOptions {
	model: FlowModelInternal
	pick: Pick<FlowPickApi, 'pick'>
	focus: FlowMap3DFocusApi
	reveal: (id: string) => void
}

/** Бирка узла над моделью */
export interface FlowMap3DTag {
	id: string
	node: FlowNode
	kind: FlowNodeKindDef
	name: string
	status: FlowStatusView | null
	statusId: FlowStatus | undefined
	isSelected: boolean
	isFocused: boolean
	isActive: boolean
	isHovered: boolean
	isDim: boolean
}

/** Параметры бирок */
export interface FlowMap3DTagOptions {
	model: FlowModelInternal
	snapshot: Readonly<ComputedRef<FlowMap3DSnapshot>>
	states: Readonly<ComputedRef<FlowMap3DSceneStates>>
}

/** Замечание проверки 3D-полей данных */
export interface FlowMap3DIssue {
	message: string
	params: Record<string, string | number>
}

/** Что нужно контроллеру-наследнику */
export interface FlowMap3DControllerParts {
	base: FlowMapController
	camera: FlowMap3DCameraApi
	setView: (view: FlowMap3DView) => void
	setLayered: (isLayered: boolean) => void
	getContent: () => FlowMap3DContent | null
	getContext: () => Scene3DContext | null
	flyTo: (id: string) => void
}
