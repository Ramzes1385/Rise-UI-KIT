import { computed, ref, watch } from 'vue'

interface UseDatePickerPanelNavigationOptions {
	isOpen: () => boolean
	modelValue: () => Date | null | undefined
	modelValueEnd: () => Date | null | undefined
	selectedDates: () => Date[] | undefined
	monthsCount: () => number | string
}

interface MonthItem {
	key: string
	month: number
	year: number
}

function resolveBaseDate(options: UseDatePickerPanelNavigationOptions): Date {
	const firstSelectedDate = options.selectedDates()?.[0]
	const sourceDate = options.modelValue() ?? options.modelValueEnd() ?? firstSelectedDate ?? new Date()

	return new Date(sourceDate.getFullYear(), sourceDate.getMonth(), 1)
}

export function useDatePickerPanelNavigation(options: UseDatePickerPanelNavigationOptions) {
	const currentBaseDate = ref<Date>(resolveBaseDate(options))

	const safeMonthsCount = computed((): number => {
		const rawCount = options.monthsCount()
		const count = typeof rawCount === 'number' ? rawCount : Number.NaN

		if (!Number.isFinite(count) || count < 1) return 1

		return Math.floor(count)
	})

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

	const displayYear = computed((): string => {
		const startYear = currentBaseDate.value.getFullYear()
		const lastMonthDate = new Date(startYear, currentBaseDate.value.getMonth() + safeMonthsCount.value - 1, 1)
		const endYear = lastMonthDate.getFullYear()

		return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`
	})

	const monthItems = computed((): MonthItem[] => {
		const result: MonthItem[] = []

		for (let index = 0; index < safeMonthsCount.value; index++) {
			const monthDate = new Date(currentBaseDate.value.getFullYear(), currentBaseDate.value.getMonth() + index, 1)
			result.push({
				key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
				month: monthDate.getMonth(),
				year: monthDate.getFullYear(),
			})
		}

		return result
	})

	function handleMonthChange(month: number, itemIndex: number): void {
		const targetDate = new Date(currentBaseDate.value.getFullYear(), currentBaseDate.value.getMonth() + itemIndex, 1)
		const monthDiff = month - targetDate.getMonth()

		currentBaseDate.value = new Date(targetDate.getFullYear(), targetDate.getMonth() + monthDiff - itemIndex, 1)
	}

	function handleYearChange(year: number, itemIndex: number): void {
		const targetDate = new Date(currentBaseDate.value.getFullYear(), currentBaseDate.value.getMonth() + itemIndex, 1)
		const yearDiff = year - targetDate.getFullYear()

		currentBaseDate.value = new Date(currentBaseDate.value.getFullYear() + yearDiff, currentBaseDate.value.getMonth(), 1)
	}

	function handlePrevRange(): void {
		currentBaseDate.value = new Date(
			currentBaseDate.value.getFullYear(),
			currentBaseDate.value.getMonth() - safeMonthsCount.value,
			1,
		)
	}

	function handleNextRange(): void {
		currentBaseDate.value = new Date(
			currentBaseDate.value.getFullYear(),
			currentBaseDate.value.getMonth() + safeMonthsCount.value,
			1,
		)
	}

	function handlePrevYear(): void {
		currentBaseDate.value = new Date(currentBaseDate.value.getFullYear() - 1, currentBaseDate.value.getMonth(), 1)
	}

	function handleNextYear(): void {
		currentBaseDate.value = new Date(currentBaseDate.value.getFullYear() + 1, currentBaseDate.value.getMonth(), 1)
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
