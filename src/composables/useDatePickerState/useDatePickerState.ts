/** Composable: управление состоянием дейтпикера — открытие/закрытие, значения, форматирование, позиционирование панели */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useClickOutside } from '@composables/useClickOutside'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { UI_SIZE } from '@constants'
import { formatDatePickerValue } from '@utils/dateUtils'
import type { UseDatePickerStateOptions } from './useDatePickerState.types'
import type { Ref } from 'vue'

/** Описание: управляет полным состоянием дейтпикера — открытие/закрытие, значения, форматирование, позиционирование панели и обработка выбора даты/диапазона */
function useDatePickerState(options: UseDatePickerStateOptions) {
	const { props, resolvedProps, emit, calendarConfig } = options

	const isOpen = ref(false)
	const currentTheme = ref<string | null>(null)
	const wrapperRef = ref<HTMLElement | null>(null)
	const panelRef = ref<{ panelRef: HTMLElement | null } | null>(null)

	const innerValue = ref<Date | null>(props.modelValue ?? null)
	const innerValueEnd = ref<Date | null>(props.modelValueEnd ?? null)
	const innerDates = ref<Date[]>(props.selectedDates ? [...props.selectedDates] : [])

	const wrapperWidth = ref(0)
	let resizeObserver: ResizeObserver | null = null

	const computedMonthsCount = computed((): number => {
		if (!resolvedProps.value.isMultiMonth) return 1

		const scale = resolvedProps.value.sizeScale / 100
		const minCalendarWidth = 260 * scale
		const gap = 8 * scale
		const padding = 16 * scale

		const currentWidth = wrapperWidth.value || (wrapperRef.value?.clientWidth ?? 0)
		const availableWidth = currentWidth - padding + gap
		const stepWidth = minCalendarWidth + gap

		const count = Math.floor(availableWidth / stepWidth)

		return Math.max(1, count)
	})

	const panelEl = computed(() => panelRef.value?.panelRef ?? null)

	const { panelStyle } = useDropdownPosition({
		wrapperRef,
		dropdownRef: panelEl,
		position: () => 'bottom-start',
		gap: () => resolvedProps.value.gap,
		matchWidth: () => resolvedProps.value.isMultiMonth,
		maxHeight: () => UI_SIZE.PANEL_MAX_HEIGHT,
		isOpen: () => isOpen.value,
	})

	watch(
		() => props.modelValue,
		value => {
			if (value === undefined) return
			innerValue.value = value
		},
	)

	watch(
		() => props.modelValueEnd,
		value => {
			if (value === undefined) return
			innerValueEnd.value = value
		},
	)

	watch(
		() => props.selectedDates,
		value => {
			if (!value) return
			innerDates.value = [...value]
		},
	)

	const activeValue = computed((): Date | null => {
		if (props.modelValue === undefined) return innerValue.value
		return props.modelValue
	})

	const activeValueEnd = computed((): Date | null => {
		if (props.modelValueEnd === undefined) return innerValueEnd.value
		return props.modelValueEnd
	})

	const activeDates = computed((): Date[] => {
		if (props.selectedDates === undefined) return innerDates.value
		return props.selectedDates
	})

	const hasValue = computed((): boolean => {
		if (resolvedProps.value.selectionMode === 'range') {
			return !!(activeValue.value || activeValueEnd.value)
		}
		if (resolvedProps.value.selectionMode === 'multiple') {
			return activeDates.value.length > 0
		}
		return !!activeValue.value
	})

	const displayValue = computed((): string =>
		formatDatePickerValue({
			selectionMode: resolvedProps.value.selectionMode,
			date: activeValue.value,
			endDate: activeValueEnd.value,
			dates: activeDates.value,
			dateFormat: resolvedProps.value.dateFormat,
			showTime: calendarConfig.value.showTime,
			showSeconds: calendarConfig.value.showSeconds,
			is24Hour: calendarConfig.value.is24Hour,
			locale: calendarConfig.value.locale,
		}),
	)

	function open(): void {
		if (resolvedProps.value.isDisabled) return
		if (isOpen.value) return

		/* istanbul ignore else -- defensive: wrapperRef всегда привязан после mount */
		if (wrapperRef.value) {
			if (resolvedProps.value.isMultiMonth) {
				wrapperWidth.value = wrapperRef.value.clientWidth
			}
			const themeEl = wrapperRef.value.closest('[data-theme]')
			currentTheme.value = themeEl?.getAttribute('data-theme') ?? null
		}

		isOpen.value = true
		emit('open')
	}

	function close(): void {
		if (!isOpen.value) return
		isOpen.value = false
		emit('close')
	}

	function handleFieldClick(): void {
		open()
	}

	function handleClear(): void {
		innerValue.value = null
		innerValueEnd.value = null
		innerDates.value = []
		emit('update:modelValue', null)
		emit('update:modelValueEnd', null)
		emit('update:selectedDates', [])
		emit('clear')
	}

	function handleModelUpdate(value: Date | null): void {
		innerValue.value = value
		emit('update:modelValue', value)
		if (resolvedProps.value.selectionMode === 'single' && value && !calendarConfig.value.showTime) {
			close()
		}
	}

	function handleModelEndUpdate(value: Date | null): void {
		innerValueEnd.value = value
		emit('update:modelValueEnd', value)
	}

	function handleSelectedDatesUpdate(value: Date[]): void {
		innerDates.value = [...value]
		emit('update:selectedDates', value)
	}

	function handleRangeSelect(start: Date, end: Date): void {
		innerValue.value = start
		innerValueEnd.value = end
		emit('update:modelValue', start)
		emit('update:modelValueEnd', end)
		emit('range-select', start, end)

		if (!calendarConfig.value.showTime) {
			close()
		}
	}

	onMounted(() => {
		if (resolvedProps.value.isMultiMonth && wrapperRef.value) {
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

	useClickOutside({
		targets: [wrapperRef, panelEl as Ref<HTMLElement | null>],
		callback: close,
		isActive: () => isOpen.value && resolvedProps.value.closeOnClickOutside,
	})

	useEscapeKey({
		isActive: () => isOpen.value && resolvedProps.value.closeOnEscape,
		callback: close,
	})

	return {
		isOpen,
		currentTheme,
		wrapperRef,
		panelRef,
		computedMonthsCount,
		panelStyle,
		activeValue,
		activeValueEnd,
		activeDates,
		hasValue,
		displayValue,
		handleFieldClick,
		handleClear,
		handleModelUpdate,
		handleModelEndUpdate,
		handleSelectedDatesUpdate,
		handleRangeSelect,
	}
}

export { useDatePickerState }
export type { UseDatePickerStateOptions }
