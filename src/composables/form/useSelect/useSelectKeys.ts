/** Composable: клавиатура триггера выпадающего списка по образцу APG Select-Only Combobox */
import type { UseSelectKeysOptions } from './types/useSelect.types'

function isPrintableKey(event: KeyboardEvent): boolean {
	return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
}

function createTriggerKeys(options: UseSelectKeysOptions, closeDropdown: () => void): Map<string, (event: KeyboardEvent) => void> {
	const { select } = options
	const toggleOrSelect = (event: KeyboardEvent): void => {
		event.preventDefault()
		if (select.isOpen.value && select.activeIndex.value >= 0) select.selectActive()
		else select.toggleDropdown()
	}
	const moveOrOpen = (event: KeyboardEvent): void => {
		event.preventDefault()
		if (select.isOpen.value) select.moveActive(event.key === 'ArrowDown' ? 1 : -1)
		else select.openDropdown()
	}
	const openAtEdge = (event: KeyboardEvent): void => {
		event.preventDefault()
		select.openDropdown()
		select.setActiveEdge(event.key === 'Home' ? 'first' : 'last')
	}
	return new Map<string, (event: KeyboardEvent) => void>([
		['Enter', toggleOrSelect],
		[' ', toggleOrSelect],
		['ArrowDown', moveOrOpen],
		['ArrowUp', moveOrOpen],
		['Home', openAtEdge],
		['End', openAtEdge],
		[
			'Tab',
			() => {
				if (select.isOpen.value) closeDropdown()
			},
		],
	])
}

/**
 * Клавиатура элемента `role="combobox"`, который открывает список: Enter и пробел открывают список или выбирают
 * активную опцию, стрелки открывают список и двигают активную опцию, Home и End открывают его на первой и последней
 * опции, Tab закрывает, буквы ищут опцию по началу подписи (без поля поиска). Состояние — из useSelect.
 *
 * @example
 * ```ts
 * const select = useSelect({ props, emit, onBlur })
 * const { handleTriggerKeydown } = useSelectKeys({ select, isDisabled: () => Boolean(props.isDisabled) })
 * ```
 */
function useSelectKeys(options: UseSelectKeysOptions) {
	const { select } = options
	const closeDropdown = (): void => {
		select.isOpen.value = false
		select.handleClose()
	}
	const triggerKeys = createTriggerKeys(options, closeDropdown)

	return {
		closeDropdown,
		handleTriggerKeydown(event: KeyboardEvent): void {
			if (options.isDisabled()) return
			if (event.key === ' ' && select.isTypingAhead()) {
				event.preventDefault()
				select.typeaheadActive(' ')
				return
			}
			const action = triggerKeys.get(event.key)
			if (action) {
				action(event)
				return
			}
			if (options.isSearchable?.() || !isPrintableKey(event)) return
			event.preventDefault()
			select.openDropdown()
			select.typeaheadActive(event.key)
		},
	}
}

export { useSelectKeys }
