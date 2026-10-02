/** Composable: автопрокрутка слайдера с паузой под указателем, при фокусе внутри и при prefers-reduced-motion */
import { onBeforeUnmount, onMounted, watch } from 'vue'
import type { ResolvedSliderOptions, UseSliderAutoplayReturn } from './types/useSlider.types'

/** Медиазапрос системной настройки «уменьшить движение» */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Описание: следит за prefers-reduced-motion с монтирования; `onChange` — при смене настройки во время работы */
function useReducedMotionFlag(onChange: () => void): { isReduced: boolean } {
	const state = { isReduced: false }
	let query: MediaQueryList | null = null

	function handleChange(event: MediaQueryListEvent): void {
		state.isReduced = event.matches
		onChange()
	}

	onMounted(() => {
		// matchMedia отсутствует в SSR и jsdom — тогда считаем, что ограничения движения нет
		if (typeof window.matchMedia !== 'function') return
		query = window.matchMedia(REDUCED_MOTION_QUERY)
		state.isReduced = query.matches
		query.addEventListener('change', handleChange)
	})

	onBeforeUnmount(() => {
		query?.removeEventListener('change', handleChange)
		query = null
	})

	return state
}

/** Описание: автопрокрутка (`goNext` по интервалу) и обработчики корня, которые ставят её на паузу (WCAG 2.2.2) */
function useSliderAutoplay(settings: ResolvedSliderOptions, goNext: () => void): UseSliderAutoplayReturn {
	let autoplayTimer: ReturnType<typeof setInterval> | null = null
	/**
	 * Причины паузы: указатель над слайдером и фокус внутри него. Храним раздельно: уход мыши
	 * не должен возобновлять прокрутку, пока внутри остаётся фокус, и наоборот.
	 */
	const paused = { hover: false, focus: false }
	/** Пользователь просит минимум движения — автопрокрутку не запускаем */
	const reducedMotion = useReducedMotionFlag(() => resumeAutoplay())

	function startAutoplay(): void {
		if (!settings.isAutoplay() || paused.hover || paused.focus || reducedMotion.isReduced) return
		autoplayTimer = setInterval(goNext, settings.autoplayInterval())
	}

	function pauseAutoplay(): void {
		if (!autoplayTimer) return
		clearInterval(autoplayTimer)
		autoplayTimer = null
	}

	function resumeAutoplay(): void {
		pauseAutoplay()
		startAutoplay()
	}

	/** Причина паузы появилась или ушла: пауза или попытка возобновить */
	function setPaused(reason: keyof typeof paused, isPaused: boolean): void {
		paused[reason] = isPaused
		if (isPaused) pauseAutoplay()
		else resumeAutoplay()
	}

	watch(settings.isAutoplay, enabled => {
		if (enabled) startAutoplay()
		else pauseAutoplay()
	})
	onMounted(startAutoplay)
	onBeforeUnmount(pauseAutoplay)

	return {
		pauseAutoplay,
		resumeAutoplay,
		onMouseEnter: (): void => setPaused('hover', true),
		onMouseLeave: (): void => setPaused('hover', false),
		onFocusIn: (): void => setPaused('focus', true),
		/** Фокус покинул слайдер — возобновляем; переход фокуса между его элементами паузу не снимает */
		onFocusOut: (event: FocusEvent): void => {
			const root = event.currentTarget
			const nextFocused = event.relatedTarget
			if (root instanceof Node && nextFocused instanceof Node && root.contains(nextFocused)) return
			setPaused('focus', false)
		},
	}
}

export { useSliderAutoplay }
