/** Composable: открытие и закрытие панели дейтпикера — позиция, тема, фокус, клик вне и Escape */
import type { Ref } from 'vue'
import { computed, nextTick, ref } from 'vue'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import { useDropdownPosition } from '@composables/overlay/useDropdownPosition'
import type { DatePickerDismissOptions, UseDatePickerPopupOptions } from './types/useDatePickerState.types'

/** Предел высоты панели: календарь не прокручивается внутри панели, пока помещается в окно */
const PANEL_MAX_HEIGHT = 'calc(100vh - 16px)'

/** Кандидаты на начальный фокус при открытии с клавиатуры: выбранная → сегодняшняя → первая доступная дата месяца */
const INITIAL_FOCUS_SELECTORS = [
	'.base-calendar__day--selected:not(:disabled)',
	'.base-calendar__day--today:not(:disabled)',
	'.base-calendar__day:not(.base-calendar__day--other):not(:disabled)',
]

/** Перевести фокус на выбранную (иначе сегодняшнюю или первую доступную) дату панели */
function focusInitialDay(panel: HTMLElement | null): void {
	if (!panel) return
	for (const selector of INITIAL_FOCUS_SELECTORS) {
		const day = panel.querySelector<HTMLElement>(selector)
		if (day) {
			day.focus()
			return
		}
	}
}

function useDatePickerDismiss(options: DatePickerDismissOptions): void {
	const { wrapperRef, panelEl, isOpen, resolvedProps, close } = options

	useClickOutside({
		targets: [wrapperRef, panelEl as Ref<HTMLElement | null>],
		callback: close,
		isActive: () => isOpen.value && resolvedProps.value.closeOnClickOutside,
	})

	useEscapeKey({
		isActive: () => isOpen.value && resolvedProps.value.closeOnEscape,
		callback: close,
	})
}

function useDatePickerPopup(options: UseDatePickerPopupOptions) {
	const { wrapperRef, panelRef, wrapperWidth, resolvedProps, emit } = options

	const isOpen = ref(false)
	const currentTheme = ref<string | null>(null)
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

	function open(): void {
		if (resolvedProps.value.isDisabled) return
		if (isOpen.value) return

		/* istanbul ignore else -- defensive: wrapperRef всегда привязан после mount */
		if (wrapperRef.value) {
			wrapperWidth.value = wrapperRef.value.clientWidth
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
		if (shouldRestoreFocus) wrapperRef.value?.querySelector<HTMLInputElement>('input')?.focus()
	}

	/**
	 * Открытие с клавиатуры: панель телепортирована в конец body, поэтому Tab из поля в неё не попадает —
	 * фокус переводится на дату явно (при открытии мышью фокус остаётся в поле, как раньше).
	 */
	function handleKeyboardOpen(): void {
		open()
		if (!isOpen.value) return
		nextTick(() => focusInitialDay(panelEl.value))
	}

	useDatePickerDismiss({ wrapperRef, panelEl, isOpen, resolvedProps, close })

	return { isOpen, currentTheme, panelStyle, close, handleFieldClick: open, handleKeyboardOpen }
}

export { useDatePickerPopup }
