import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { useViewDefer } from '../motion/view/useViewDefer'
import { useWebGLFallback } from '@/scene3d/renderer/useWebGLFallback'
import type { FlowMap3DMode, FlowMap3DView } from '../../types/BaseFlowMap3D.types'
import type { FlowMap3DViewOptions, FlowMap3DViewState } from '../../types/internal/flowMap3dView.types'

function useRenderErrorReset(parts: {
	props: FlowMap3DViewOptions['props']
	view: Ref<FlowMap3DView>
	fallback: { hasRenderError: Ref<boolean> }
}): void {
	const { props, view, fallback } = parts
	watch(view, value => {
		if (value === '3d') fallback.hasRenderError.value = false
	})
	watch(
		() => props.data,
		() => (fallback.hasRenderError.value = false),
	)
}

export function useFlowMap3DView(options: FlowMap3DViewOptions): FlowMap3DViewState {
	const { props, emit } = options
	const view = ref<FlowMap3DView>(props.view)
	const mode = ref<FlowMap3DMode>(props.mode)
	const fallback = useWebGLFallback({
		getView: () => view.value,
		onFallback: reason => emit('fallback', reason),
		getMessages: () => ({ unsupported: UI_FLOW_MAP_3D.FALLBACK_UNSUPPORTED, error: UI_FLOW_MAP_3D.FALLBACK_ERROR }),
	})

	watch(
		() => props.view,
		value => (view.value = value),
	)
	watch(
		() => props.mode,
		value => (mode.value = value),
	)
	useRenderErrorReset({ props, view, fallback })

	function setView(next: FlowMap3DView): void {
		if (next === '3d') fallback.hasRenderError.value = false
		if (view.value === next) return
		view.value = next
		emit('update:view', next)
	}

	function setMode(next: FlowMap3DMode): void {
		if (mode.value === next) return
		mode.value = next
		emit('update:mode', next)
	}

	const isEditIn2D = computed(() => mode.value === 'edit' && options.isNarrow())
	const targetView = computed<FlowMap3DView>(() => (view.value === '2d' || fallback.reason.value || isEditIn2D.value ? '2d' : '3d'))
	const isEditIn3D = computed(() => mode.value === 'edit' && targetView.value === '3d')
	const defer = useViewDefer({ targetView, hasFallback: () => fallback.reason.value !== null })

	return {
		view,
		mode,
		fallback,
		targetView,
		shownView: defer.shownView,
		isFading: defer.isFading,
		isEditIn2D,
		isEditIn3D,
		setView,
		setMode,
		setDeferrer: defer.setDeferrer,
	}
}
