/** Composable: ширина поля дейтпикера и число месяцев, которые помещаются в панель */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { DatePickerMonthsFit, UseDatePickerPanelSizeOptions } from './types/useDatePickerState.types'

/** Ширина колонки готовых периодов (кнопки с подписью «Прошлый месяц» и отступы), px до масштабирования */
const PRESETS_COLUMN_WIDTH = 140

/**
 * Сколько месяцев помещается в панель шириной с поле. Размеры повторяют стили панели и BaseCalendar
 * (DatePickerPanel.style.scss, BaseCalendar.style.scss): 7 колонок по 36px, отступ календаря 4px, рамка 1px,
 * номер недели +28px; между календарями 8px; отступ панели 4px и рамка 1px. Рамки не масштабируются.
 */
function countFittingMonths(fit: DatePickerMonthsFit): number {
	const scale = fit.sizeScale / 100
	const gridWidth = (7 * 36 + (fit.showWeekNumber ? 28 : 0)) * scale
	const calendarWidth = gridWidth + 2 * 4 * scale + 2
	const gap = 8 * scale
	const panelChrome = 2 * 4 * scale + 2 + fit.presetsWidth * scale

	// N календарей: N × calendarWidth + (N − 1) × gap + panelChrome ≤ ширина поля
	const count = Math.floor((fit.width - panelChrome + gap) / (calendarWidth + gap))

	return Math.max(1, Math.min(count, fit.maxMonths ?? count))
}

function useDatePickerPanelSize(options: UseDatePickerPanelSizeOptions) {
	const { wrapperRef, resolvedProps, calendarConfig } = options

	const wrapperWidth = ref(0)
	let resizeObserver: ResizeObserver | null = null

	const computedMonthsCount = computed((): number => {
		const { monthsShown, isMultiMonth } = resolvedProps.value
		if (monthsShown) return monthsShown
		if (!isMultiMonth) return 1

		return countFittingMonths({
			sizeScale: resolvedProps.value.sizeScale,
			showWeekNumber: calendarConfig.value.showWeekNumber,
			width: wrapperWidth.value || (wrapperRef.value?.clientWidth ?? 0),
			maxMonths: resolvedProps.value.maxMonths,
			presetsWidth: resolvedProps.value.hasPresets ? PRESETS_COLUMN_WIDTH : 0,
		})
	})

	onMounted(() => {
		if (wrapperRef.value) {
			wrapperWidth.value = wrapperRef.value.clientWidth
			resizeObserver = new ResizeObserver(entries => {
				for (const entry of entries) {
					if (entry.contentBoxSize && entry.contentBoxSize[0]) {
						wrapperWidth.value = entry.target.clientWidth
					} else {
						wrapperWidth.value = entry.contentRect.width
					}
				}
			})
			resizeObserver.observe(wrapperRef.value)
		}
	})

	onUnmounted(() => {
		resizeObserver?.disconnect()
	})

	return { wrapperWidth, computedMonthsCount }
}

export { useDatePickerPanelSize }
