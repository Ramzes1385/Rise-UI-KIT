import { hasWebGL } from './webglSupport'
import { UI_SCENE_3D } from '@/locales/messages'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import type { Scene3DFallbackReason } from '../types/scene3d.types'
import type { Scene3DFallbackOptions } from '../types/internal/scene3dInternal.types'

/** Резервный 2D-вид: нет WebGL (`unsupported`) или рендерер не запустился (`error`); 2D-вид по просьбе сбоем не считается */
export function useWebGLFallback(options: Scene3DFallbackOptions) {
	const isSupported = shallowRef<boolean | null>(null)
	const hasRenderError = ref(false)

	const reason = computed<Scene3DFallbackReason | null>(() => {
		if (options.getView() === '2d') return null
		if (isSupported.value === false) return 'unsupported'
		return hasRenderError.value ? 'error' : null
	})

	const getMessages =
		options.getMessages ?? (() => ({ unsupported: UI_SCENE_3D.FALLBACK_UNSUPPORTED, error: UI_SCENE_3D.FALLBACK_ERROR }))
	const statusText = computed(() => (reason.value ? getMessages()[reason.value] : ''))

	onMounted(() => {
		isSupported.value = hasWebGL()
	})

	watch(reason, value => {
		if (value) options.onFallback(value)
	})

	return { isSupported, hasRenderError, reason, statusText }
}
