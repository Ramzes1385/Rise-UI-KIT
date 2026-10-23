import type { ComputedRef, Ref } from 'vue'
import type { UiClassFn } from '@composables/base/useUi'
import type { BaseFlowMap3DPart } from '../BaseFlowMap3D.types'
import type { FlowMap3DContent } from './flowMap3dInternal.types'
import type { useNodeDrag } from '../../model/edit/drag/useNodeDrag'
import type { useEdit3DState } from '../../model/edit/useEdit3DState'
import type { Model3DDefinitions } from '@/scene3d/types/model3d.types'
import type { useFlowMap3DEdit } from '../../model/edit/useFlowMap3DEdit'
import type { Color, Group, Line, LineDashedMaterial, Mesh } from 'three'
import type { useConnectTool } from '../../model/edit/connect/useConnectTool'
import type { useFlowMap3DEditKit } from '../../model/edit/useFlowMap3DEditKit'
import type { Scene3DLabels } from '@/scene3d/types/internal/scene3dInternal.types'
import type { FlowElementRef } from '@components/BaseFlowMap/types/data/flowReview.types'
import type { FlowNode, FlowPoint } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowMap3DComposeParts, FlowMap3DInput, FlowMap3DStage } from './flowMap3dCompose.types'
import type { FlowCommandResult, FlowMapController } from '@components/BaseFlowMap/types/api/flowController.types'
import type { FlowModelInternal, FlowPickApi } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { FlowMap3DCameraApi, FlowMap3DNodeItem, FlowMap3DSnapshot, FlowMap3DViewport } from './flowMap3dInternal.types'

/** Инструмент правки: select — выбор и перенос, link — протяжка связи */
export type FlowMap3DEditTool = 'select' | 'link'

/** Куда встанет узел: центр в единицах сцены, позиция рамки в px 2D (после привязки к сетке), свободна ли клетка */
export interface FlowMap3DEditTarget {
	x: number
	z: number
	position: FlowPoint
	isFree: boolean
}

/** Вердикт соединения: можно или причина отказа */
export type FlowMap3DConnectVerdict = { isAllowed: true } | { isAllowed: false; message: string }

/** Призрак переносимого узла и клетка-цель */
export interface FlowMap3DGhost {
	x: number
	z: number
	y: number
	/** Сторона клетки, единицы сцены */
	size: number
	/** Высота модели */
	height: number
	isValid: boolean
}

/** Протяжка связи: от точки к точке и кольцо на цели */
export interface FlowMap3DLinkLine {
	from: { x: number; y: number; z: number }
	to: { x: number; y: number; z: number }
	isValid: boolean
	ring: { x: number; y: number; z: number; size: number } | null
}

/** Цвета наложения правки */
export interface FlowMap3DEditColors {
	valid: Color
	invalid: Color
	link: Color
}

/** Наложение правки в сцене: призрак, клетка, линия связи */
export interface FlowMap3DEditOverlay {
	setColors: (colors: FlowMap3DEditColors) => void
	showGhost: (ghost: FlowMap3DGhost) => void
	showLink: (link: FlowMap3DLinkLine) => void
	hide: () => void
	dispose: () => void
}

/** Объявления и уведомление правки */
export interface FlowMap3DEditNotice {
	text: string
	kind: 'ok' | 'warning'
}

/** Общие части правки в 3D */
interface FlowMap3DEditParts {
	model: FlowModelInternal
	controller: FlowMapController
	pick: FlowPickApi
	camera: FlowMap3DCameraApi
	viewport: FlowMap3DViewport
	hostRef: Readonly<Ref<HTMLElement | null>>
	getContent: () => FlowMap3DContent | null
	getSnapshot: () => FlowMap3DSnapshot
	isActive: Readonly<ComputedRef<boolean>>
	focused: Readonly<Ref<string | null>>
	announce: (text: string) => void
	/** Показать уведомление и озвучить */
	notify: (notice: FlowMap3DEditNotice) => void
	moveFocus: (id: string | null) => void
}

/** Действия правки: команды контроллера и их озвучка */
export interface FlowMap3DEditActions {
	rotate: (ids: readonly string[]) => Promise<void>
	remove: (ids: readonly string[]) => Promise<void>
	replaceModel: (ids: readonly string[], choice: { model: string } | { url: string }) => Promise<boolean>
	setTint: (ids: readonly string[], tint: string | null) => Promise<void>
	setStatus: (ids: readonly string[], status: string) => Promise<void>
	rename: (id: string, label: string) => Promise<void>
	setPose: (ids: readonly string[], patch: { scale?: number; elevation?: number }) => Promise<void>
	nudge: (ids: readonly string[], delta: FlowPoint) => Promise<void>
	connect: (source: string, target: string) => Promise<boolean>
	undo: () => void
	redo: () => void
}

/** Перенос узла: состояние и отмена */
export interface FlowMap3DNodeDrag {
	isDragging: Readonly<Ref<boolean>>
	/** Отменить перенос (Escape); true — перенос был */
	cancel: () => boolean
}

/** Протяжка связи */
export interface FlowMap3DConnectTool {
	/** Цель протяжки: узел под указателем или выбранный стрелками */
	target: Readonly<Ref<string | null>>
	/** Сообщение об отказе для цели; пусто — цель допустима */
	refusal: Readonly<Ref<string>>
	/** Выбрать цель (указатель, стрелки) и обновить линию */
	aim: (id: string | null) => void
	/** Провести связь выбранного узла к цели */
	commit: (target?: string | null) => Promise<boolean>
	/** Убрать линию */
	clear: () => void
}

/** Что палитра «Заменить модель» берёт из модели */
export interface FlowMap3DPaletteEntry {
	key: string
	title: string
	icon: string
	isCurrent: boolean
}

/** Группы палитры: «Схема» и «Ещё в реестре» */
export interface FlowMap3DPaletteGroups {
	scheme: FlowMap3DPaletteEntry[]
	more: FlowMap3DPaletteEntry[]
}

/** Результат команды для озвучки */
export type FlowMap3DEditResult = Pick<FlowCommandResult, 'isApplied' | 'reject'>

/** Элемент строки истории */
export interface FlowMap3DEditHistory {
	count: number
	canUndo: boolean
	canRedo: boolean
	undoLabel: string
}

/** Узел под рукой правки: рамка в сцене */

/** Сцена с текущим снимком данных: то, на чём строится правка */
export type FlowMap3DEditStage = FlowMap3DStage & { snapshot: { value: FlowMap3DSnapshot } }

/** Перенос узла: сеанс от нажатия до отпускания */
export interface FlowMap3DDragSession {
	item: FlowMap3DNodeItem
	start: { x: number; y: number }
	offset: { x: number; z: number }
	isMoving: boolean
	target: FlowMap3DEditTarget | null
}

/** Состояние переноса: сеанс и «клик после переноса уже потрачен» */
export interface FlowMap3DDragState {
	session: FlowMap3DDragSession | null
	isClickSpent: boolean
}

/** Что нужно переносу узла */
export type FlowMap3DDragParts = Pick<
	FlowMap3DEditParts,
	'model' | 'controller' | 'pick' | 'camera' | 'viewport' | 'hostRef' | 'getSnapshot' | 'notify'
> & { getOverlay: () => FlowMap3DEditOverlay | null }

/** Что нужно протяжке связи */
export type FlowMap3DConnectParts = Pick<FlowMap3DEditParts, 'model' | 'viewport' | 'hostRef' | 'getSnapshot' | 'announce'> & {
	getOverlay: () => FlowMap3DEditOverlay | null
	getSource: () => string | null
	actions: Pick<FlowMap3DEditActions, 'connect'>
}

/** Что нужно действиям правки */
export type FlowMap3DActionParts = Pick<FlowMap3DEditParts, 'model' | 'controller' | 'notify' | 'announce' | 'getSnapshot'>

/** Что нужно клавиатуре правки */
export type FlowMap3DEditKeyboardParts = Pick<FlowMap3DEditParts, 'model' | 'camera' | 'isActive'> & {
	labels: Scene3DLabels
	actions: FlowMap3DEditActions
	drag: FlowMap3DNodeDrag
	connect: FlowMap3DConnectTool
	tool: Ref<FlowMap3DEditTool>
	palette: { isOpen: Ref<boolean>; close: () => void }
	targets: () => string[]
	setTool: (tool: FlowMap3DEditTool) => void
	openInspector: () => void
	isTyping: () => boolean
}

/** Что нужно палитре «Заменить модель» */
export interface FlowMap3DPaletteOptions {
	model: FlowModelInternal
	getModels: () => Model3DDefinitions | undefined
	appModels: Model3DDefinitions
	getSelected: () => string | null
	getResolved: (id: string) => string | null
}

/** Пропсы вкладок «Правки», из которых собирается шаблон */
export interface FlowMap3DInspectorProps {
	className: string
	node: FlowNode | null
	count: number
	kindLabel: string
	groupLabel: string
	modelTitle: string
	modelKey: string
	status: string
	statuses: Array<{ value: string; label: string; color: string }>
	history: FlowMap3DEditHistory
	x: number
	y: number
	focusTick: number
}

/** Подсказка о модели узла для раздела «3D» */
export interface FlowMap3DModelInfo {
	key: string
	title: string
}

/** Пропсы раздела «3D» свойств узла */
export interface FlowInspector3DSectionProps {
	node: FlowNode
	modelTitle: string
	modelKey: string
	hasSwap: boolean
	x: number
	y: number
}

/** Пропсы раздела «3D» в слоте `inspector-end` 2D-правки */
export interface FlowInspector3DSlotProps {
	target: FlowElementRef
	controller: FlowMapController
	modelInfo: (id: string) => FlowMap3DModelInfo
	rectOf: (id: string) => { x: number; y: number } | undefined
}

/** Пропсы палитры «Заменить модель» */
export interface FlowModelPaletteProps {
	className: string
	groups: FlowMap3DPaletteGroups
	currentTitle: string
	url: string
}

/** Части наложения правки в сцене */
export interface FlowMap3DOverlayParts {
	root: Group
	plate: Mesh
	body: Mesh
	ring: Mesh
	line: Line
	lineMaterial: LineDashedMaterial
}

/** Помощник действий: отчёт о команде и правка узлов */
export interface FlowMap3DPatcher {
	report: (result: FlowMap3DEditResult, ok: string, fail?: string) => boolean
	patchNodes: (ids: readonly string[], build: (node: FlowNode) => Partial<FlowNode>, ok: string) => Promise<boolean>
	nodesOf: (ids: readonly string[]) => FlowNode[]
}

/** Правка в 3D целиком: то, что отдаёт `useFlowMap3DEdit` */
export type FlowMap3DEdit = ReturnType<typeof useFlowMap3DEdit>

/** Состояние правки: инструмент, выбор, уведомления, история */
type FlowMap3DEditState = ReturnType<typeof useEdit3DState>

/** Части, из которых собирается указатель правки */
export interface FlowMap3DPointerParts {
	parts: FlowMap3DComposeParts
	stage: FlowMap3DEditStage
	state: FlowMap3DEditState
	drag: ReturnType<typeof useNodeDrag>
	connect: ReturnType<typeof useConnectTool>
}

/** Класс части для шаблона */
export type FlowMap3DEditUi = UiClassFn<BaseFlowMap3DPart>

/** Что нужно вычислениям панелей: правка, выбранный узел и функция классов */
export interface FlowMap3DPanelContext {
	parts: FlowMap3DComposeParts
	edit: FlowMap3DEdit
	ui: FlowMap3DEditUi
	node: ComputedRef<FlowNode | null>
}

/** Загруженная «Правка» в 3D: правка и её панели */
export type FlowMap3DEditKit = ReturnType<typeof useFlowMap3DEditKit>

/** Вход загрузчика «Правки»: части компонента, сцена, ввод, классы и предзагрузка интерфейса */
export interface FlowMap3DEditLoaderInput {
	parts: FlowMap3DComposeParts
	stage: FlowMap3DEditStage
	input: FlowMap3DInput
	ui: FlowMap3DEditUi
	preload: () => Promise<unknown>
}
