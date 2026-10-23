import type { Ref } from 'vue'
import { onBeforeUnmount, ref, watch } from 'vue'
import type { IdleControlsOptions } from '../../types/playback/MediaCore.types'

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'focusin'] as const

export function useIdleControls(target: Readonly<Ref<HTMLElement | null>>, options: IdleControlsOptions) {
	const isIdle = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	let isKeyboard = false
	const canHide = (): boolean => options.canHide({ isKeyboard })

	const schedule = (): void => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			isIdle.value = canHide()
		}, options.timeout())
	}
	const wake = (): void => {
		isIdle.value = false
		schedule()
	}
	const onActivity = (event: Event): void => {
		if (event.type === 'keydown') isKeyboard = true
		else if (event.type === 'pointerdown') isKeyboard = false
		wake()
	}
	const onLeave = (event: Event): void => {
		if ((event as PointerEvent).pointerType !== 'mouse') return schedule()
		clearTimeout(timer)
		isKeyboard = false
		isIdle.value = canHide()
	}

	watch(
		target,
		(element, _, onCleanup) => {
			if (!element) return
			ACTIVITY_EVENTS.forEach(name => element.addEventListener(name, onActivity))
			element.addEventListener('pointerleave', onLeave)
			onCleanup(() => {
				ACTIVITY_EVENTS.forEach(name => element.removeEventListener(name, onActivity))
				element.removeEventListener('pointerleave', onLeave)
			})
		},
		{ immediate: true },
	)
	watch(canHide, value => (value ? schedule() : wake()))
	onBeforeUnmount(() => clearTimeout(timer))

	return { isIdle, wake }
}
