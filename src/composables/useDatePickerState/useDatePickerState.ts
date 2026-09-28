/** Composable: управление состоянием дейтпикера — открытие/закрытие, значения, форматирование, позиционирование панели */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useEscapeKey } from '@composables/useEscapeKey'
import { formatDatePickerValue } from '@utils/dateUtils'
import { useClickOutside } from '@composables/useClickOutside'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import type { Ref } from 'vue'
import type { UseDatePickerStateOptions } from './useDatePickerState.types'

/** Предел высоты панели: календарь не прокручивается внутри панели, пока помещается в окно */
const PANEL_MAX_HEIGHT = 'calc(100vh - 16px)'

/** Кандидаты на начальный фокус при открытии с клавиатуры: выбранная → сегодняшняя → первая доступная дата месяца */
const INITIAL_FOCUS_SELECTORS = [
	'.base-calendar__day--selected:not(:disabled)',
	'.base-calendar__day--today:not(:disabled)',
	'.base-calendar__day:not(.base-calendar__day--other):not(:disabled)',
]

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

	/**
	 * Сколько месяцев помещается в панель шириной с поле. Размеры повторяют стили панели и BaseCalendar
	 * (DatePickerPanel.style.scss, BaseCalendar.style.scss): 7 колонок по 36px, отступ календаря 4px, рамка 1px,
	 * номер недели +28px; между календарями 8px; отступ панели 4px и рамка 1px. Рамки не масштабируются.
	 */
	const computedMonthsCount = computed((): number => {
		if (!resolvedProps.value.isMultiMonth) return 1

		const scale = resolvedProps.value.sizeScale / 100
		const gridWidth = (7 * 36 + (calendarConfig.value.showWeekNumber ? 28 : 0)) * scale
		const calendarWidth = gridWidth + 2 * 4 * scale + 2
		const gap = 8 * scale
		const panelChrome = 2 * 4 * scale + 2

		const currentWidth = wrapperWidth.value || (wrapperRef.value?.clientWidth ?? 0)
		// N календарей: N × calendarWidth + (N − 1) × gap + panelChrome ≤ ширина поля
		const count = Math.floor((currentWidth - panelChrome + gap) / (calendarWidth + gap))

		return Math.max(1, count)
	})

	const panelEl = computed(() => panelRef.value?.panelRef ?? null)

	const { panelStyle } = useDropdownPosition({
		wrapperRef,
		dropdownRef: panelEl,
		position: () => 'bottom-start',
		gap: () => resolvedProps.value.gap,
		matchWidth: () => resolvedProps.value.isMultiMonth,
		// Панель с календарём и временем выше 320px (высота списков BaseDropdown) — ограничена только окном
		maxHeight: () => PANEL_MAX_HEIGHT,
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
		// Фокус внутри панели (выбор с клавиатуры, Escape) после её удаления из DOM ушёл бы на <body>
		const shouldRestoreFocus = !!panelEl.value?.contains(document.activeElement)
		isOpen.value = false
		emit('close')
		if (shouldRestoreFocus) focusField()
	}

	/** Вернуть фокус в поле ввода */
	function focusField(): void {
		wrapperRef.value?.querySelector<HTMLInputElement>('input')?.focus()
	}

	/** Перевести фокус на выбранную (иначе сегодняшнюю или первую доступную) дату панели */
	function focusInitialDay(): void {
		const panel = panelEl.value
		if (!panel) return
		for (const selector of INITIAL_FOCUS_SELECTORS) {
			const day = panel.querySelector<HTMLElement>(selector)
			if (day) {
				day.focus()
				return
			}
		}
	}

	function handleFieldClick(): void {
		open()
	}

	/**
	 * Открытие с клавиатуры: панель телепортирована в конец body, поэтому Tab из поля в неё не попадает —
	 * фокус переводится на дату явно (при открытии мышью фокус остаётся в поле, как раньше).
	 */
	function handleKeyboardOpen(): void {
		open()
		if (!isOpen.value) return
		nextTick(focusInitialDay)
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
		handleKeyboardOpen,
		handleClear,
		handleModelUpdate,
		handleModelEndUpdate,
		handleSelectedDatesUpdate,
		handleRangeSelect,
	}
}

export { useDatePickerState }
export type { UseDatePickerStateOptions }
