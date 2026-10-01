/** Composable: фокусировка тура на шаге — подсветка с края окна, затем прокрутка и перенос фокуса */
import { nextTick, ref } from 'vue'

/** Время на прокрутку к шагу до переноса фокуса, мс */
const FOCUS_DURATION_MS = 450

/** Описание: запуск и сброс фокусировки с таймером и кадром анимации */
function createTourFocus(recalculate: () => Promise<void>) {
	const isFocusing = ref(false)
	const focusFromViewport = ref(false)
	let focusTimer: ReturnType<typeof setTimeout> | null = null
	let focusRaf = 0

	function stopFocus(): void {
		if (focusTimer !== null) {
			clearTimeout(focusTimer)
			focusTimer = null
		}
		if (focusRaf !== 0) {
			cancelAnimationFrame(focusRaf)
			focusRaf = 0
		}
		isFocusing.value = false
		focusFromViewport.value = false
	}

	async function startFocus(): Promise<void> {
		stopFocus()
		isFocusing.value = true
		focusFromViewport.value = true

		await recalculate()
		await nextTick()

		focusRaf = requestAnimationFrame(() => {
			focusFromViewport.value = false
			focusTimer = setTimeout(() => {
				isFocusing.value = false
				focusTimer = null
			}, FOCUS_DURATION_MS)
		})
	}

	return { isFocusing, focusFromViewport, stopFocus, startFocus }
}

export { createTourFocus }
