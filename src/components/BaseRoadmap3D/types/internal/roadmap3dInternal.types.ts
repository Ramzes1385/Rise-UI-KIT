import type { Roadmap3DQuality } from '../BaseRoadmap3D.types'
import type { ScenePalette } from '@/scene3d/types/internal/scene3dGeometry.types'
import type { IslandModel, IslandPoint, RoadTable } from '../roadmap3dIsland.types'
import type { Model3DDefinitions, Model3DHandle, Model3DNode } from '@/scene3d/types/model3d.types'
import type { RoadmapStageStatus, RoadmapTopicStatus } from '@components/BaseRoadmap/types/roadmapData.types'
import type { Model3DGltfLoader, Model3DRegistry, Model3DSelection } from '@/scene3d/types/internal/model3dInternal.types'
import type { Box3, Color, CylinderGeometry, Group, Mesh, MeshStandardMaterial, Object3D, RingGeometry, Vector3 } from 'three'
import type {
	Scene3DColorResolver,
	Scene3DLabelItem,
	Scene3DLoop,
	Scene3DResourceCache,
} from '@/scene3d/types/internal/scene3dInternal.types'

/** Тема этапа в снимке: статус и вид для камня у пьедестала и бирки-фишки */
export interface Roadmap3DTopicItem {
	id: string
	title: string
	status: RoadmapTopicStatus
	isAlternative: boolean
	isOptional: boolean
}

/** Этап в снимке: всё, что нужно сцене, подписям и панели */
export interface Roadmap3DStageItem {
	id: string
	index: number
	title: string
	status: RoadmapStageStatus
	/** 0..100 */
	percent: number
	done: number
	total: number
	hours: number
	/** CSS-цвет пьедестала: `model3d.tint` или `--rise-chart-<n>` */
	tint: string
	selection: Model3DSelection
	/** Место пьедестала в мире: x и z сцены (z острова с обратным знаком) */
	position: IslandPoint
	topics: Roadmap3DTopicItem[]
}

/** Снимок пути для сцены: этапы, остров, доля пройденной дороги */
export interface Roadmap3DSnapshot {
	stages: Roadmap3DStageItem[]
	island: IslandModel
	table: RoadTable
	/** Положение этапов на дороге, 0..1 */
	positions: number[]
	/** Доля пройденной дороги, 0..1 */
	progress: number
	/** Номер текущего этапа; -1 — текущего нет */
	currentIndex: number
	hasCar: boolean
	goal: string | null
}

/** Цвета сцены и функция чтения CSS-цвета */
export interface Roadmap3DPalette {
	palette: ScenePalette
	resolve: Scene3DColorResolver
}

/** Цвета частей сцены */
export interface Roadmap3DColors {
	top: Color
	side: Color
	cliffs: Color[]
	rim: Color
	road: Color
	curb: Color
	doneFrom: Color
	doneTo: Color
	success: Color
	primary: Color
	onPrimary: Color
	locked: Color
	neutral: Color
	warning: Color
	alternative: Color
	mountain: Color
	snow: Color
	trunk: Color
	cones: Color[]
	round: Color
	cloud: Color
}

/** Какие части рисовать: на узком контейнере и при `low` — без мелочи */
export interface Roadmap3DDetail {
	hasTrees: boolean
	hasClouds: boolean
	hasShadows: boolean
}

/** Часть сцены: корень и перекраска под тему */
export interface Roadmap3DPart {
	group: Object3D
	recolor: (palette: Roadmap3DPalette) => void
}

/** Дорога: лента с пройденной частью */
export interface Roadmap3DRoad extends Roadmap3DPart {
	setProgress: (fraction: number) => void
}

/** Подвижные части: пин «Вы здесь» и машинка */
export interface Roadmap3DMarkers extends Roadmap3DPart {
	/** Поставить машинку на дорогу в долю пути */
	setCar: (fraction: number) => void
	/** Поставить пин над этапом; `null` — убрать */
	setPin: (point: IslandPoint | null) => void
	/** Покачать пин: время в секундах */
	bob: (time: number) => void
}

/** Пьедесталы: якоря бирок и камней тем, обновление кольца прогресса */
export interface Roadmap3DPedestals extends Roadmap3DPart {
	anchors: ReadonlyMap<string, Vector3>
	setStates: (states: Roadmap3DStates) => void
	/** Статусы и проценты этапов, статусы тем: структура та же */
	update: (items: readonly Roadmap3DStageItem[]) => void
}

/** Декор: горы, деревья, облака и флаг; облака дрейфуют */
export interface Roadmap3DDecor extends Roadmap3DPart {
	drift: (time: number) => void
}

/** Состояния для моделей, колец и подписей */
export interface Roadmap3DStates {
	hover: string | null
	focus: string | null
	selected: string | null
	currentId: string | null
}

/** Что нужно сборке сцены от компонента */
export interface Roadmap3DRuntime {
	loop: Scene3DLoop
	cache: Scene3DResourceCache
	getModels: () => Model3DDefinitions
	isReducedMotion: () => boolean
	onModelReady: (handle: Model3DHandle) => void
	onFocus: (id: string) => void
}

/** Всё, что собрано на сцене */
export interface Roadmap3DContent {
	root: Group
	registry: Model3DRegistry
	road: Roadmap3DRoad
	markers: Roadmap3DMarkers
	pedestals: Roadmap3DPedestals
	decor: Roadmap3DDecor
	anchors: ReadonlyMap<string, Vector3>
	bounds: Box3
	setStates: (states: Roadmap3DStates) => void
	/** Прогресс, статусы и пин без пересборки: структура снимка та же */
	update: (snapshot: Roadmap3DSnapshot, states: Roadmap3DStates) => void
	recolor: (palette: Roadmap3DPalette) => void
	dispose: () => void
}

/** Подпись поверх холста: этап, тема, старт или цель */
export interface Roadmap3DTag {
	id: string
	kind: 'stage' | 'topic' | 'start' | 'goal'
	text: string
	meta: string
	statusId: string
	index: number
	color: string
	isCurrent: boolean
	isSelected: boolean
	isFocused: boolean
	isDim: boolean
}

/** Подписи сцены вместе с якорями для ядра */
export interface Roadmap3DLabelSet {
	tags: Roadmap3DTag[]
	items: Scene3DLabelItem[]
}

/** Качество, приведённое к решению «что рисовать» */
export interface Roadmap3DQualityInput {
	quality: Roadmap3DQuality
	isCompact: boolean
}

/** Что нужно сборке всего содержимого сцены */
export interface Roadmap3DBuildOptions {
	snapshot: Roadmap3DSnapshot
	palette: Roadmap3DPalette
	runtime: Roadmap3DRuntime
	detail: Roadmap3DDetail
	appModels: Model3DDefinitions
	modelResolver?: (node: Model3DNode) => string | null | undefined
	gltf?: Model3DGltfLoader
}

/** Рамка острова в мире: границы, радиус и половина высоты — для камеры и тени */
export interface Roadmap3DFrame {
	bounds: Box3
	radius: number
	halfHeight: number
}

export type Roadmap3DSolid = Mesh<CylinderGeometry, MeshStandardMaterial>
export type Roadmap3DRing = Mesh<RingGeometry, MeshStandardMaterial>

/** Части пьедестала одного этапа */
export interface Roadmap3DPedestalStage {
	group: Group
	base: Roadmap3DSolid
	tier: Roadmap3DSolid
	cap: Roadmap3DSolid
	track: Roadmap3DRing
	arc: Roadmap3DRing
	percent: number
}

/** Камень темы: место у пьедестала */
export interface Roadmap3DGem {
	id: string
	position: Vector3
}
