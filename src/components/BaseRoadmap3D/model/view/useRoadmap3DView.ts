import { computed, ref, watch } from 'vue'
import { UI_ROADMAP_3D } from '@/locales/messages'
import type { Roadmap3DView } from '../../types/BaseRoadmap3D.types'
import { useWebGLFallback } from '@/scene3d/renderer/useWebGLFallback'
import type { Roadmap3DViewOptions } from '../../types/internal/roadmap3dCompose.types'

export function useRoadmap3DView(options: Roadmap3DViewOptions) {
	const { props, emit, isReviewing } = options
	const view = ref<Roadmap3DView>(props.view)
	const fallback = useWebGLFallback({
		getView: () => view.value,
		onFallback: reason => emit('fallback', reason),
		getMessages: () => ({ unsupported: UI_ROADMAP_3D.FALLBACK_UNSUPPORTED, error: UI_ROADMAP_3D.FALLBACK_ERROR }),
	})

	watch(
		() => props.view,
		value => (view.value = value),
	)
	watch(view, value => {
		if (value === '3d') fallback.hasRenderError.value = false
	})
	watch(
		() => props.data,
		() => (fallback.hasRenderError.value = false),
	)

	function setView(next: Roadmap3DView): void {
		if (next === '3d') fallback.hasRenderError.value = false
		if (view.value === next) return
		view.value = next
		emit('update:view', next)
	}

	const shownView = computed<Roadmap3DView>(() => (view.value === '2d' || fallback.reason.value || isReviewing.value ? '2d' : '3d'))
	return { view, fallback, shownView, setView }
}
