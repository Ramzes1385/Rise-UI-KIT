/** Composable: навигация по месяцам/годам панели дейтпикера, вычисление отображаемого года и списка месяцев */
import { computed, ref, watch } from 'vue'
import type { MonthItem, UseDatePickerPanelNavigationOptions } from './types/useDatePickerPanelNavigation.types'
import {
	baseForMonth,
	baseForYear,
	buildMonthItems,
	formatDisplayYear,
	monthStart,
	normalizeMonthsCount,
	resolveBaseDate,
} from './datePickerPanelUtils'

/** Описание: обеспечивает навигацию по месяцам/годам панели дейтпикера, вычисляет отображаемый год, список месяцев и обработчики переключения диапазона */
function useDatePickerPanelNavigation(options: UseDatePickerPanelNavigationOptions) {
	const currentBaseDate = ref<Date>(resolveBaseDate(options))

	const safeMonthsCount = computed((): number => normalizeMonthsCount(options.monthsCount()))

	watch(
		() => [
			options.isOpen(),
			options.modelValue()?.getTime() ?? null,
			options.modelValueEnd()?.getTime() ?? null,
			options.selectedDates()?.[0]?.getTime() ?? null,
		],
		([isOpen]) => {
			if (isOpen) {
				currentBaseDate.value = resolveBaseDate(options)
			}
		},
		{ immediate: true },
	)

	const displayYear = computed((): string => formatDisplayYear(currentBaseDate.value, safeMonthsCount.value))

	const monthItems = computed((): MonthItem[] => buildMonthItems(currentBaseDate.value, safeMonthsCount.value))

	function handleMonthChange(month: number, itemIndex: number): void {
		currentBaseDate.value = baseForMonth(currentBaseDate.value, month, itemIndex)
	}

	function handleYearChange(year: number, itemIndex: number): void {
		currentBaseDate.value = baseForYear(currentBaseDate.value, year, itemIndex)
	}

	function handlePrevRange(): void {
		currentBaseDate.value = monthStart(currentBaseDate.value, -safeMonthsCount.value)
	}

	function handleNextRange(): void {
		currentBaseDate.value = monthStart(currentBaseDate.value, safeMonthsCount.value)
	}

	function handlePrevYear(): void {
		currentBaseDate.value = monthStart(currentBaseDate.value, 0, -1)
	}

	function handleNextYear(): void {
		currentBaseDate.value = monthStart(currentBaseDate.value, 0, 1)
	}

	return {
		currentBaseDate,
		safeMonthsCount,
		displayYear,
		monthItems,
		handleMonthChange,
		handleYearChange,
		handlePrevRange,
		handleNextRange,
		handlePrevYear,
		handleNextYear,
	}
}

export { useDatePickerPanelNavigation }
