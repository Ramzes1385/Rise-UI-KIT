import type { Ref } from 'vue'
import { onBeforeUnmount, ref, watch } from 'vue'
import type { IdleControlsOptions } from '../types/MediaCore.types'

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'focusin'] as const

export function useIdleControls(target: Readonly<Ref<HTMLElement | null>>, options: IdleControlsOptions) {
	const isIdle = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined

	const schedule = (): void => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			isIdle.value = options.canHide()
		}, options.timeout())
	}
	const wake = (): void => {
		isIdle.value = false
		schedule()
	}

	watch(
		target,
		(element, _, onCleanup) => {
			if (!element) return
			ACTIVITY_EVENTS.forEach(name => element.addEventListener(name, wake))
			element.addEventListener('pointerleave', schedule)
			onCleanup(() => {
				ACTIVITY_EVENTS.forEach(name => element.removeEventListener(name, wake))
				element.removeEventListener('pointerleave', schedule)
			})
		},
		{ immediate: true },
	)
	watch(options.canHide, canHide => (canHide ? schedule() : wake()))
	onBeforeUnmount(() => clearTimeout(timer))

	return { isIdle, wake }
}
