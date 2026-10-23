import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { Scene3DFallbackReason } from '@/scene3d/types/scene3d.types'
import type { FlowSize } from '@components/BaseFlowMap/types/data/flowData.types'
import type { BaseFlowMapProps } from '@components/BaseFlowMap/types/BaseFlowMap.types'
import type { FlowMap3DCameraApi, FlowMap3DCaptureSource } from './flowMap3dInternal.types'
import type { FlowMapController, FlowViewport } from '@components/BaseFlowMap/types/api/flowController.types'
import type { FlowModelInternal } from '@components/BaseFlowMap/types/internal/core/flowRenderInternal.types'
import type { BaseFlowMap3DEmits, FlowMap3DMode, FlowMap3DProps, FlowMap3DView } from '../BaseFlowMap3D.types'

/** Что нужно адаптеру вида модели ядра */
export interface FlowMap3DAdapterParts {
	camera: FlowMap3DCameraApi
	getView: () => FlowMap3DView
	getTwoD: () => FlowMapController | null
	getSize: () => { width: number; height: number }
	focusNode: (id: string) => void
	getCapture: () => FlowMap3DCaptureSource | null
	announce: (text: string) => void
}

/** Размер области и признак компактного вида */
export interface FlowMap3DFrameState {
	frame: Ref<FlowSize>
	isCompact: ComputedRef<boolean>
	/** Контейнер уже 768 px: правка в 3D недоступна */
	isNarrow: ComputedRef<boolean>
}

/** Что нужно контексту карты для частей 2D */
export interface FlowMap3DContextParts {
	model: FlowModelInternal
	camera: FlowMap3DCameraApi
	state: FlowMap3DFrameState
	onFrame: (hook: () => void) => () => void
	focused: Readonly<Ref<string | null>>
	hovered: Readonly<Ref<string | null>>
	isReducedMotion: Readonly<Ref<boolean>>
	isVisible: Readonly<Ref<boolean>>
	announce: (text: string) => void
}

/** Параметры состояния вида */
export interface FlowMap3DViewOptions {
	props: FlowMap3DProps
	emit: BaseFlowMap3DEmits
	/** Правка в 3D недоступна (узкий контейнер): режим `edit` открывает 2D */
	isNarrow: () => boolean
}

/** Вид и 2D-замена */
export interface FlowMap3DViewState {
	view: Ref<FlowMap3DView>
	mode: Ref<FlowMap3DMode>
	fallback: {
		isSupported: Readonly<ShallowRef<boolean | null>>
		hasRenderError: Ref<boolean>
		reason: ComputedRef<Scene3DFallbackReason | null>
		statusText: ComputedRef<string>
	}
	/** Вид, который запрошен: сразу меняется при `v-model:view`, режиме и запасном виде */
	targetView: ComputedRef<FlowMap3DView>
	/** Вид на экране: следует за запрошенным; полёт камеры и перекрёстный переход откладывают смену */
	shownView: ComputedRef<FlowMap3DView>
	/** Идёт перекрёстный переход: обе области на экране, пришедшая проявляется поверх */
	isFading: Ref<boolean>
	/** Режим «Правка» открыт в 2D: контейнер уже 768 px */
	isEditIn2D: ComputedRef<boolean>
	/** Режим «Правка» открыт в 3D */
	isEditIn3D: ComputedRef<boolean>
	setView: (view: FlowMap3DView) => void
	setMode: (mode: FlowMap3DMode) => void
	/** Подключить переход: возвращает, на сколько мс отложить смену вида (0 — сразу) */
	setDeferrer: (deferrer: FlowMap3DViewDeferrer | null) => void
}

/** Переход между видами: `wait` — на сколько мс отложить смену на экране (запрошенный и показанный вид; 0 — сразу), `fade` — сколько мс идёт перекрёстный переход (0 — мгновенно) */
export interface FlowMap3DViewDeferrer {
	wait: (next: FlowMap3DView, current: FlowMap3DView) => number
	fade: () => number
}

/** Привязки для 2D-вида: пропсы карты и слушатели */
export type FlowMap3DBindings = BaseFlowMapProps & Record<string, unknown>

/** Что нужно привязкам 2D-вида */
export interface FlowMap3DBindingParts {
	props: FlowMap3DProps
	emit: BaseFlowMap3DEmits
	model: FlowModelInternal
	view: FlowMap3DViewState
	track: {
		viewport: (viewport: FlowViewport) => void
		ready: (controller: FlowMapController) => void
	}
}

/** Что нужно переходу между видами */
export interface FlowMap3DTransitionOptions {
	shownView: Readonly<Ref<FlowMap3DView>>
	camera: FlowMap3DCameraApi
	/** Холст 3D вернулся и встал в кадр 2D: можно лететь в изометрию */
	onReturn: () => void
}
