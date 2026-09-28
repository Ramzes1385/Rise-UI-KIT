import type { ComputedRef, Ref } from 'vue'
import { useEscapeKey } from '@composables/useEscapeKey'
import type { TooltipLayout } from '@utils/tooltipUtils'
import type { TooltipProps } from '../types/BaseTooltip.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useTriggerAttributes } from '@composables/useTriggerAttributes'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
/** Composable: логика BaseTooltip — показ с задержками, положение у триггера с переворотом и сдвигом у края окна */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { calcTooltipPosition, calcTooltipShift, resolveTooltipPlacement } from '@utils/tooltipUtils'

/** Отступ подсказки от элемента, px */
const GAP = 8
/** Задержка показа, мс: подсказка не мелькает, когда курсор проходит мимо */
const SHOW_DELAY_MS = 100
/** Задержка скрытия, мс: курсор успевает перейти на подсказку */
const HIDE_DELAY_MS = 150

/** Размер окна без полос прокрутки; в среде без раскладки (jsdom) clientWidth равен 0 — берётся innerWidth */
function getViewport(): { width: number; height: number } {
	const root = document.documentElement
	return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight }
}

function useTooltipPosition(props: TooltipProps, wrapperRef: Ref<HTMLElement | null>, popupRef: Ref<HTMLElement | null>) {
	const coords = ref({ top: 0, left: 0, width: 0, height: 0 })
	// Размер подсказки: нужен, чтобы перевернуть её и сдвинуть от края окна
	const popupSize = ref({ width: 0, height: 0 })
	const currentLayout = (): TooltipLayout => ({ coords: coords.value, size: popupSize.value, viewport: getViewport() })
	// Сторона подсказки: выбранная или противоположная, если у края окна не хватает места
	const placement = computed(() => resolveTooltipPlacement(props.position, currentLayout(), GAP))

	return {
		placement,
		// Координаты со сдвигом от края окна; стрелка сдвигается обратно и смотрит на триггер
		tooltipStyle: computed((): Record<string, string> => {
			const shift = calcTooltipShift(placement.value, currentLayout())
			return {
				...calcTooltipPosition({ position: placement.value, coords: coords.value, gap: GAP, shift }),
				'--tooltip-arrow-offset': `${-shift}px`,
			}
		}),
		/** Новые координаты — только если триггер сдвинулся: иначе подсказка перерисовывалась бы каждый кадр */
		updateCoords(): void {
			/* istanbul ignore next -- defensive guard: wrapperRef всегда доступен после onMounted */
			if (!wrapperRef.value) return
			const { top, left, width, height } = wrapperRef.value.getBoundingClientRect()
			const current = coords.value
			if (current.top !== top || current.left !== left || current.width !== width || current.height !== height) {
				coords.value = { top, left, width, height }
			}
		},
		measurePopup(): void {
			const popup = popupRef.value
			if (!popup) return
			const { offsetWidth: width, offsetHeight: height } = popup
			if (popupSize.value.width !== width || popupSize.value.height !== height) popupSize.value = { width, height }
		},
	}
}

/** Пока подсказка видна, её положение пересчитывается каждый кадр */
function createUpdateLoop(isVisible: Ref<boolean>, onFrame: () => void) {
	let rafId: number | null = null
	const tick = (): void => {
		onFrame()
		/* istanbul ignore else -- RAF race-condition: tick может выполниться после isVisible=false */
		if (isVisible.value) {
			rafId = requestAnimationFrame(tick)
		}
	}
	return {
		start(): void {
			rafId = requestAnimationFrame(tick)
		},
		stop(): void {
			if (rafId !== null) {
				cancelAnimationFrame(rafId)
				rafId = null
			}
		},
	}
}

/** Наведение и фокус показывают подсказку после задержки, уход — скрывает с задержкой, чтобы не мигать между элементами */
function createDelays(props: TooltipProps, show: () => void, hide: () => void) {
	let showTimer: ReturnType<typeof setTimeout> | null = null
	let hideTimer: ReturnType<typeof setTimeout> | null = null
	return {
		handleEnter(): void {
			if (props.isAlwaysVisible) return
			/* istanbul ignore if -- hideTimer присутствует только после handleLeave с активным таймером, цепочка тестируется в e2e */
			if (hideTimer) {
				clearTimeout(hideTimer)
				hideTimer = null
			}
			showTimer = setTimeout(show, SHOW_DELAY_MS)
		},
		handleLeave(): void {
			if (props.isAlwaysVisible) return
			/* istanbul ignore else -- showTimer всегда установлен после handleEnter перед handleLeave */
			if (showTimer) {
				clearTimeout(showTimer)
				showTimer = null
			}
			hideTimer = setTimeout(hide, HIDE_DELAY_MS)
		},
		/** Указатель перешёл с триггера на подсказку: она остаётся на экране */
		cancelHide(): void {
			if (hideTimer) clearTimeout(hideTimer)
			hideTimer = null
		},
		clearTimers(): void {
			if (showTimer) clearTimeout(showTimer)
			if (hideTimer) clearTimeout(hideTimer)
			showTimer = null
			hideTimer = null
		},
	}
}

function useTooltipVisibility(props: TooltipProps, isVisible: Ref<boolean>, position: ReturnType<typeof useTooltipPosition>) {
	const loop = createUpdateLoop(isVisible, () => {
		position.updateCoords()
		position.measurePopup()
	})
	const show = (): void => {
		position.updateCoords()
		isVisible.value = true
		loop.start()
	}
	const hide = (): void => {
		isVisible.value = false
		loop.stop()
	}
	const delays = createDelays(props, show, hide)

	// Escape скрывает подсказку сразу (WCAG 1.4.13): она не должна мешать, пока фокус остаётся на триггере
	useEscapeKey({
		isActive: () => isVisible.value && !props.isAlwaysVisible,
		callback: () => {
			delays.clearTimers()
			hide()
		},
	})
	onMounted(() => {
		if (props.isAlwaysVisible) show()
	})
	/* istanbul ignore next -- watch isAlwaysVisible: переключение во время жизни компонента покрывается e2e/visual тестами */
	watch(
		() => props.isAlwaysVisible,
		isAlways => {
			if (isAlways) show()
			else hide()
		},
	)
	onBeforeUnmount(() => {
		loop.stop()
		delays.clearTimers()
	})

	return { handleEnter: delays.handleEnter, handleLeave: delays.handleLeave, cancelHide: delays.cancelHide }
}

/** Триггер описан подсказкой, пока она на экране: скринридер читает её после имени элемента */
function useDescribedTrigger(wrapperRef: Ref<HTMLElement | null>, isShown: ComputedRef<boolean>, tooltipId: string) {
	const triggerAttributes = computed(() => ({ 'aria-describedby': isShown.value ? tooltipId : undefined }))
	useTriggerAttributes(
		() => wrapperRef.value,
		() => triggerAttributes.value,
	)
	return triggerAttributes
}

/** Появившуюся подсказку измеряем до отрисовки кадра: переворот и сдвиг — без мигания на старом месте */
function useMeasureOnShow(isShown: ComputedRef<boolean>, measurePopup: () => void): void {
	watch(isShown, async shown => {
		if (!shown) return
		await nextTick()
		measurePopup()
	})
}

export function useBaseTooltip(props: TooltipProps) {
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
	const teleportTarget = useTeleportTarget()
	const standard = useStandardBaseComponent('base-tooltip-popup', props, ['root', 'tooltip', 'text'])
	const isVisible = ref(false)
	// Подсказка на экране: видима и есть текст — пустой пузырь не показывается
	const isShown = computed(() => isVisible.value && Boolean(props.text))
	const wrapperRef = ref<HTMLElement | null>(null)
	const popupRef = ref<HTMLElement | null>(null)
	// Тема блока, в котором стоит триггер: подсказка в body иначе взяла бы тему страницы
	const inheritedTheme = useInheritedTheme(
		() => wrapperRef.value,
		() => isVisible.value,
	)
	const tooltipId = `rise-tooltip-${useId()}`
	const triggerAttributes = useDescribedTrigger(wrapperRef, isShown, tooltipId)
	const position = useTooltipPosition(props, wrapperRef, popupRef)
	useMeasureOnShow(isShown, position.measurePopup)

	return {
		...standard,
		teleportTarget,
		isShown,
		wrapperRef,
		popupRef,
		inheritedTheme,
		tooltipId,
		triggerAttributes,
		placement: position.placement,
		tooltipStyle: position.tooltipStyle,
		...useTooltipVisibility(props, isVisible, position),
	}
}
