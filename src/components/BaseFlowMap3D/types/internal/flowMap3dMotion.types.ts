import type { Ref, ShallowRef } from 'vue'
import type { FlowMap3DProps } from '../BaseFlowMap3D.types'
import type { FlowMap3DTrack } from './flowMap3dBuild.types'
import type { FlowMap3DViewState } from './flowMap3dView.types'
import type { useOrbitCamera } from '@/scene3d/camera/useOrbitCamera'
import type { FlowStatus } from '@components/BaseFlowMap/types/data/flowData.types'
import type { RibbonMaterial } from '@/scene3d/types/internal/scene3dGeometry.types'
import type { Scene3DViewCamera } from '@/scene3d/types/internal/scene3dInternal.types'
import type { BufferAttribute, Group, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowScenarioAction, FlowScenarioStatus, FlowTimelineEntry } from '@components/BaseFlowMap/types/data/flowScenario.types'
import type {
	FlowMap3DArrows,
	FlowMap3DCameraApi,
	FlowMap3DContent,
	FlowMap3DEdges,
	FlowMap3DGroundGroups,
	FlowMap3DGroupItem,
	FlowMap3DPalette,
	FlowMap3DPreset,
	FlowMap3DSnapshot,
	FlowMap3DStageOptions,
	FlowMap3DViewport,
} from './flowMap3dInternal.types'

/** Вид частицы: `call` — вызов (сплошная связь), `event` — событие (пунктир); у `data` частиц нет */
export type FlowMap3DParticleKind = 'call' | 'event'

/** Дорожка частиц одной связи: путь, число частиц, место среди экземпляров своего цвета */
export interface FlowMap3DParticleLane {
	edge: string
	source: string
	target: string
	track: FlowMap3DTrack
	count: number
	kind: FlowMap3DParticleKind
	first: number
	isSilent: boolean
}

/** Токен сценария на связи: место в сцене и статус шага */
interface FlowMap3DTokenMark {
	step: string
	edge: string
	x: number
	y: number
	z: number
	status: FlowStatus | undefined
}

/** След шага на связи: какая доля ленты уже прорисована; пройденный шаг остаётся подсвеченным */
interface FlowMap3DTrailMark {
	step: string
	edge: string
	shown: number
	isDone: boolean
	status: FlowStatus | undefined
}

/** Что показать на сцене в момент времени сценария */
export interface FlowMap3DScenarioMarks {
	tokens: FlowMap3DTokenMark[]
	trails: FlowMap3DTrailMark[]
}

/** Вход расчёта меток сценария: состояние модели, хронометраж и пути связей */
export interface FlowMap3DMarksInput {
	status: FlowScenarioStatus
	time: number
	timeline: readonly FlowTimelineEntry[]
	tracks: ReadonlyMap<string, FlowMap3DTrack>
	actions: ReadonlyMap<string, FlowScenarioAction>
	isReduced: boolean
}

/** Шаг, у которого пришла пора сыграть анимацию модели: узел и название (`null` — без анимации, `undefined` — анимация пресета) */
export interface FlowMap3DArrival {
	step: string
	node: string
	animation: string | null | undefined
}

/** Вход поиска прибытий: окно времени между двумя состояниями сценария */
export interface FlowMap3DArrivalWindow {
	timeline: readonly FlowTimelineEntry[]
	actions: ReadonlyMap<string, FlowScenarioAction>
	targets: ReadonlyMap<string, string>
	from: number
	to: number
}

/** Слой сценария в сцене: токены и прорисованные следы по лентам */
export interface FlowMap3DScenarioLayer {
	group: Group
	/** Пути связей, по которым идут токены */
	tracks: ReadonlyMap<string, FlowMap3DTrack>
	set: (marks: FlowMap3DScenarioMarks) => void
	/** Скрыть на время перехода «Слоёв» */
	setSuspended: (isSuspended: boolean) => void
	recolor: (palette: FlowMap3DPalette) => void
	dispose: () => void
}

/** Что нужно привязке сценария к сцене */
export interface FlowMap3DScenarioOptions {
	model: FlowModelInternal
	content: Readonly<ShallowRef<FlowMap3DContent | null>>
	invalidate: () => void
	isReducedMotion: () => boolean
}

/** Флажок яруса: подпись HTML у переднего края платформы («Слой клиентов») */
export interface FlowMap3DFlag {
	id: string
	text: string
	anchor: Vector3
}

/** «Слои» в сцене: платформы-плиты, стрелки между ярусами, флажки */
export interface FlowMap3DLayers {
	group: Group
	flags: FlowMap3DFlag[]
	/** Показ режима: 0 — платформы и стрелки скрыты, 1 — видны целиком */
	setBlend: (blend: number) => void
	recolor: (palette: FlowMap3DPalette) => void
}

/** Пятна-тени под моделями: когда карта теней дорога (`auto`, больше 80 узлов) */
export interface FlowMap3DBlobs {
	group: Group
	recolor: (palette: FlowMap3DPalette) => void
}

/** Части сцены, которые перемещаются между «плоско» и «Слоями»: лежат в одном месте по снимку */
export interface FlowMap3DLayout {
	groups: FlowMap3DGroundGroups
	edges: FlowMap3DEdges
	arrows: FlowMap3DArrows
	layers: FlowMap3DLayers
	blobs: FlowMap3DBlobs | null
	/** Корни, по вершинам которых идёт переход: порядок обхода не зависит от режима */
	roots: Object3D[]
}

/** Как рисовать тень модели: картой, пятном или не рисовать */
export type FlowMap3DShadowMode = 'map' | 'blob' | 'none'

/** Вершины или матрицы, которые переходят от одного положения к другому: атрибут и конечные значения */
export interface FlowMap3DBlendSlot {
	attribute: BufferAttribute
	to: Float32Array
}

/** Что нужно переходу «Слоёв» */
export interface FlowMap3DBlendOptions {
	/** Непрерывные кадры цикла (без поправки на «уменьшить движение»: при ней перехода нет) */
	animate: (tick: (delta: number) => boolean | void) => () => void
	invalidate: () => void
	/** Длительность перехода, мс: `--rise-duration-xslow` × 2; 0 — перехода нет */
	getDuration: () => number
	/** Положения подписей поверх холста изменились */
	onMoved: () => void
}

/** Переход «Слоёв»: ставит новую сцену в прежнее положение и ведёт её к своему */
export interface FlowMap3DBlend {
	start: (parts: FlowMap3DBlendStart) => boolean
	stop: () => void
}

/** Откуда и куда идёт переход */
export interface FlowMap3DBlendStart {
	content: FlowMap3DContent
	from: FlowMap3DSnapshot
	to: FlowMap3DSnapshot
	palette: FlowMap3DPalette
	hasSlabs: boolean
}

/** Что нужно уровню детализации: сцена, камера, размер области и качество */
export interface FlowMap3DDetailOptions {
	content: Readonly<ShallowRef<FlowMap3DContent | null>>
	getCamera: () => Scene3DViewCamera
	getSize: () => { width: number; height: number }
	getCell: () => number
	getQuality: () => NonNullable<FlowMap3DProps['quality']>
	invalidate: () => void
}

/** Что нужно полёту между 3D и 2D */
export interface FlowMap3DViewTransitionOptions {
	view: FlowMap3DViewState
	camera: FlowMap3DCameraApi
	getPreset: () => FlowMap3DPreset
	/** Длительность полёта камеры, мс: `--rise-duration-xslow`; 0 — без полёта */
	getFlightMs: () => number
	/** Длительность перекрёстного перехода, мс: `--rise-duration`; 0 — мгновенно */
	getFadeMs: () => number
}

/** Что нужно пресетам и полётам камеры: состояние орбитальной камеры, пресет и центр кадра */
export interface FlowMap3DFlightOptions {
	state: ReturnType<typeof useOrbitCamera>['state']
	preset: Ref<FlowMap3DPreset>
	getCenter: () => Vector3
}

/** Ярус «Слоёв» для стрелок между ними: номер, платформы и середина */
export interface FlowMap3DTier {
	tier: number
	items: FlowMap3DGroupItem[]
	center: Vector3
}

/** Качество сцены: `auto`, `low` или `high` */
export type FlowMap3DQuality = NonNullable<FlowMap3DProps['quality']>

/** След шага на связи в сцене: лента и материал */
export interface FlowMap3DTrailEntry {
	mesh: Mesh
	material: RibbonMaterial
}

/** Токен сценария: корень, ядро и ореол */
export interface FlowMap3DTokenEntry {
	group: Group
	core: MeshBasicMaterial
	halo: MeshBasicMaterial
}

/** Что нужно движению сцены: параметры сцены, область рисования, собранное содержимое и размер */
export interface FlowMap3DStageMotionParts {
	options: FlowMap3DStageOptions
	viewport: FlowMap3DViewport
	built: Readonly<ShallowRef<FlowMap3DContent | null>>
	size: () => { width: number; height: number }
}
