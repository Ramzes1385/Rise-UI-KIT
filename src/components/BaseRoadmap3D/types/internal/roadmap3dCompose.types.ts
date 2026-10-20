import type { Scene } from 'three'
import type { Ref, ShallowRef } from 'vue'
import type { RoadmapModel } from '@components/BaseRoadmap/types/internal/roadmapView.types'
import type { Roadmap3DView, BaseRoadmap3DEmits, Roadmap3DProps } from '../BaseRoadmap3D.types'
import type { Scene3DTick, Scene3DViewCamera } from '@/scene3d/types/internal/scene3dInternal.types'
import type { Scene3DCameraPreset, Scene3DContext, Scene3DRenderer } from '@/scene3d/types/scene3d.types'
import type {
	Roadmap3DContent,
	Roadmap3DDetail,
	Roadmap3DSnapshot,
	Roadmap3DStageItem,
	Roadmap3DStates,
	Roadmap3DTag,
} from './roadmap3dInternal.types'

type Snapshot = Readonly<Ref<Roadmap3DSnapshot>>
type Animate = (tick: Scene3DTick) => () => void

/** Камера сцены: пресеты, поворот, масштаб и наезд на точку */
export interface Roadmap3DCameraApi {
	azimuth: () => number
	isMaxZoom: Readonly<Ref<boolean>>
	isMinZoom: Readonly<Ref<boolean>>
	home: () => void
	fit: () => void
	setPreset: (preset: Scene3DCameraPreset) => void
	rotate: (step: 1 | -1) => void
	turn: (degrees: number) => void
	tilt: (degrees: number) => void
	zoomIn: () => void
	zoomOut: () => void
	wheelZoom: (event: WheelEvent) => void
	pinchZoom: (factor: number) => void
	/** Наезд на место этапа в мире; `null` — весь остров */
	focusPoint: (point: { x: number; z: number } | null) => void
}

export interface Roadmap3DCameraOptions {
	camera: Readonly<ShallowRef<Scene3DViewCamera>>
	renderer: Readonly<ShallowRef<Scene3DRenderer | null>>
	fitted: Readonly<ShallowRef<number>>
	invalidate: () => void
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	snapshot: Snapshot
	preset: Ref<Scene3DCameraPreset>
	isReducedMotion: () => boolean
	onPreset: (preset: Scene3DCameraPreset) => void
}

export interface Roadmap3DCarOptions {
	content: Readonly<ShallowRef<Roadmap3DContent | null>>
	snapshot: Snapshot
	animate: Animate
	invalidate: () => void
	isReducedMotion: () => boolean
	/** Длительность токена `--rise-duration-xslow`, мс */
	getDuration: () => number
}

export interface Roadmap3DTourOptions {
	getRequested: () => boolean
	getCount: () => number
	getFocusedIndex: () => number
	focusAt: (index: number) => void
	onChange: (isPlaying: boolean) => void
}

/** Что нужно сцене от окна просмотра */
interface Roadmap3DViewportApi {
	scene: Scene
	camera: Readonly<ShallowRef<Scene3DViewCamera>>
	renderer: Readonly<ShallowRef<Scene3DRenderer | null>>
	invalidate: () => void
	onFrame: (hook: () => void) => () => void
	onBeforeRender: (hook: (frame: { delta: number; time: number }) => void) => () => void
	fitted: Readonly<ShallowRef<number>>
	refit: () => void
	animate: Animate
}

export interface Roadmap3DSceneOptions {
	viewport: Roadmap3DViewportApi
	animate: Animate
	hostRef: Readonly<Ref<HTMLElement | null>>
	snapshot: Snapshot
	props: Roadmap3DProps
	getStates: () => Roadmap3DStates
	getDetail: () => Roadmap3DDetail
	isReducedMotion: () => boolean
	onFocus: (id: string) => void
	onBuilt: (content: Roadmap3DContent | null) => void
}

export interface Roadmap3DStageOptions {
	props: Roadmap3DProps
	snapshot: Snapshot
	tags: Readonly<Ref<Roadmap3DTag[]>>
	preset: Ref<Scene3DCameraPreset>
	canvasRef: Readonly<Ref<HTMLCanvasElement | null>>
	hostRef: Readonly<Ref<HTMLElement | null>>
	labelsRef: Readonly<ShallowRef<HTMLElement | null>>
	getStates: () => Roadmap3DStates
	getDetail: () => Roadmap3DDetail
	getDuration: () => number
	isReducedMotion: () => boolean
	onError: () => void
	onPreset: (preset: Scene3DCameraPreset) => void
	onFocus: (id: string) => void
}

/** Сцена, камера и подписи, собранные `useRoadmap3DStage` */
export interface Roadmap3DStageApi {
	viewport: Roadmap3DViewportApi
	camera: Roadmap3DCameraApi
	scene: { content: Readonly<ShallowRef<Roadmap3DContent | null>>; getContext: () => Scene3DContext | null }
	content: Readonly<ShallowRef<Roadmap3DContent | null>>
	size: () => { width: number; height: number }
}

export interface Roadmap3DFocusOptions {
	props: Roadmap3DProps
	emit: BaseRoadmap3DEmits
	snapshot: Snapshot
	getCamera: () => Roadmap3DCameraApi | null
	announce: (text: string) => void
}

type Roadmap3DFocus = {
	focused: Ref<string | null>
	cursor: Ref<string | null>
	hovered: Ref<string | null>
	indexOf: (id: string | null) => number
	focusStage: (id: string | null, isSilent?: boolean) => void
	reapply: () => void
	step: (delta: 1 | -1) => void
	go: (delta: 1 | -1) => void
	first: () => void
	last: () => void
	overview: () => void
}

type Roadmap3DTour = {
	isPlaying: Ref<boolean>
	step: Ref<number>
	total: Readonly<Ref<number>>
	start: (isSilent?: boolean) => void
	stop: (isSilent?: boolean) => void
	move: (delta: 1 | -1) => void
	toggle: () => void
}

type Roadmap3DEdit = {
	shift: (id: string, delta: -1 | 1) => Promise<boolean>
	add: () => Promise<boolean>
	setModel: (id: string, patch: { model?: string; url?: string }) => Promise<boolean>
	remove: (id: string) => Promise<boolean>
	rename: (id: string, title: string) => Promise<boolean>
}

type Roadmap3DPanel = {
	selectTopic: (id: string | null) => void
	closePanel: () => void
}

export interface Roadmap3DKeyboardOptions {
	focus: Roadmap3DFocus
	tour: Roadmap3DTour
	model: RoadmapModel
	camera: Roadmap3DCameraApi
	edit: Roadmap3DEdit
	isEditing: () => boolean
	getStages: () => readonly Roadmap3DStageItem[]
}

export interface Roadmap3DPointerOptions {
	hostRef: Readonly<Ref<HTMLElement | null>>
	getContent: () => Roadmap3DContent | null
	getCamera: () => Scene3DViewCamera
	pinchZoom: (factor: number) => void
	pick: { input: () => void; hover: (id: string | null) => void; pick: (id: string) => void; clear: () => void }
}

export interface Roadmap3DListOptions {
	snapshot: Snapshot
}

export interface Roadmap3DViewOptions {
	props: Roadmap3DProps
	emit: BaseRoadmap3DEmits
	isReviewing: Readonly<Ref<boolean>>
}

export interface Roadmap3DTwoDOptions {
	props: Roadmap3DProps
	emit: BaseRoadmap3DEmits
	model: RoadmapModel
	getLabel: () => string
}

export interface Roadmap3DEditOptions {
	model: RoadmapModel
	snapshot: Snapshot
	announce: (text: string) => void
	focusStage: (id: string | null) => void
}

export interface Roadmap3DPanelOptions {
	model: RoadmapModel
	snapshot: Snapshot
	focus: Roadmap3DFocus
}

/** Общие части, из которых собираются ввод, оболочка и шаблон */
export interface Roadmap3DShellParts {
	props: Roadmap3DProps
	emit: BaseRoadmap3DEmits
	model: RoadmapModel
	view: {
		shownView: Readonly<Ref<Roadmap3DView>>
		setView: (view: Roadmap3DView) => void
		fallback: { isSupported: Readonly<Ref<boolean | null>> }
	}
	snapshot: Snapshot
	focus: Roadmap3DFocus
	tour: Roadmap3DTour
	preset: Ref<Scene3DCameraPreset>
}

export interface Roadmap3DInputParts extends Roadmap3DShellParts {
	edit: Roadmap3DEdit
	panel: Roadmap3DPanel
	hostRef: Readonly<Ref<HTMLElement | null>>
}

export type Roadmap3DTemplateParts = Roadmap3DShellParts

export type Roadmap3DEmitFn = (name: string, ...args: unknown[]) => void
