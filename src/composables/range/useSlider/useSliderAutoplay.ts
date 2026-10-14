/** Composable: автопрокрутка слайдера по APG Carousel — кнопка «Остановить/Запустить», пауза под указателем и при фокусе, prefers-reduced-motion */
import type { Ref } from 'vue'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { onBeforeUnmount, onMounted, readonly, ref, watch } from 'vue'
import type { ResolvedSliderOptions, SliderAutoplayControls, UseSliderAutoplayReturn } from './types/useSlider.types'

/** Атрибут кнопки управления автопрокруткой (ставит компонент): фокус на ней прокрутку не останавливает */
const ROTATION_CONTROL_ATTR = 'data-slider-rotation'

/** Описание: фокус пришёл на кнопку управления автопрокруткой */
function isRotationControl(target: EventTarget | null): boolean {
	return target instanceof Element && !!target.closest(`[${ROTATION_CONTROL_ATTR}]`)
}

/**
 * Описание: фокус на слайде или стрелке останавливает автопрокрутку (APG), на кнопке автопрокрутки — нет;
 * уход фокуса из слайдера снимает временную паузу, переход фокуса между его элементами — нет
 */
function focusHandlers(isStopped: Ref<boolean>, setPaused: (reason: 'focus', isPaused: boolean) => void) {
	return {
		onFocusIn: (event: FocusEvent): void => {
			if (isRotationControl(event.target)) return setPaused('focus', false)
			isStopped.value = true
			setPaused('focus', true)
		},
		onFocusOut: (event: FocusEvent): void => {
			const root = event.currentTarget
			const nextFocused = event.relatedTarget
			if (root instanceof Node && nextFocused instanceof Node && root.contains(nextFocused)) return
			setPaused('focus', false)
		},
	}
}

/**
 * Описание: автопрокрутка (`goNext` по интервалу) по APG Carousel.
 * `isAutoplayStopped` — остановлена: кнопкой, фокусом на слайде или стрелке, запуском видео или системной настройкой
 * reduced motion; снова запускается только кнопкой (`playAutoplay`). Указатель над слайдером и фокус внутри —
 * временная пауза (WCAG 2.2.2), фокус на самой кнопке паузы не даёт. Один экран слайдов — прокрутки нет.
 */
function useSliderAutoplay(settings: ResolvedSliderOptions, controls: SliderAutoplayControls): UseSliderAutoplayReturn {
	let autoplayTimer: ReturnType<typeof setInterval> | null = null
	const isStopped = ref(false)
	const isRotating = ref(false)
	/** Причины временной паузы храним раздельно: уход мыши не возобновляет прокрутку, пока внутри фокус, и наоборот */
	const paused = { hover: false, focus: false }

	const isReducedMotion = useReducedMotion()

	function startAutoplay(): void {
		if (!settings.isAutoplay() || isStopped.value || paused.hover || paused.focus || !controls.canRotate()) return
		autoplayTimer = setInterval(controls.goNext, settings.autoplayInterval())
		isRotating.value = true
	}

	function pauseAutoplay(): void {
		isRotating.value = false
		if (!autoplayTimer) return
		clearInterval(autoplayTimer)
		autoplayTimer = null
	}

	function resumeAutoplay(): void {
		pauseAutoplay()
		startAutoplay()
	}

	function setStopped(value: boolean): void {
		isStopped.value = value
		resumeAutoplay()
	}

	function setPaused(reason: keyof typeof paused, isPaused: boolean): void {
		paused[reason] = isPaused
		resumeAutoplay()
	}

	watch(isReducedMotion, setStopped)
	watch([settings.isAutoplay, settings.autoplayInterval, controls.canRotate], resumeAutoplay)
	onMounted(() => {
		isStopped.value = isStopped.value || isReducedMotion.value
		startAutoplay()
	})
	onBeforeUnmount(pauseAutoplay)

	return {
		isAutoplayStopped: readonly(isStopped),
		isRotating: readonly(isRotating),
		pauseAutoplay,
		resumeAutoplay,
		stopAutoplay: (): void => setStopped(true),
		playAutoplay: (): void => setStopped(false),
		onMouseEnter: (): void => setPaused('hover', true),
		onMouseLeave: (): void => setPaused('hover', false),
		...focusHandlers(isStopped, setPaused),
	}
}

export { useSliderAutoplay }
