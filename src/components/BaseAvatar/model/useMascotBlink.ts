import { onBeforeUnmount, onMounted, readonly, ref, watch } from 'vue'
import { AVATAR_MASCOT_BLINK_DELAY, AVATAR_MASCOT_BLINK_HOLD, AVATAR_MASCOT_DOUBLE_BLINK } from '../types/BaseAvatar.types'

const nextDelay = (): number => {
	const [min, max] = AVATAR_MASCOT_BLINK_DELAY
	return min + Math.random() * (max - min)
}

export function useMascotBlink(isActive: () => boolean) {
	const isClosed = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined

	function schedule(): void {
		timer = setTimeout(() => close(Math.random() < AVATAR_MASCOT_DOUBLE_BLINK ? 2 : 1), nextDelay())
	}

	function reopen(times: number): void {
		isClosed.value = false
		if (times > 1) {
			timer = setTimeout(() => close(times - 1), AVATAR_MASCOT_BLINK_HOLD)
			return
		}
		schedule()
	}

	function close(times: number): void {
		isClosed.value = true
		timer = setTimeout(() => reopen(times), AVATAR_MASCOT_BLINK_HOLD)
	}

	const stop = (): void => {
		clearTimeout(timer)
		timer = undefined
		isClosed.value = false
	}

	const sync = (): void => {
		stop()
		if (isActive()) schedule()
	}

	onMounted(() => {
		watch(isActive, sync)
		sync()
	})
	onBeforeUnmount(stop)

	return readonly(isClosed)
}
