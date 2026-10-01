/** Composable: поиск опции useSelect по набранным буквам (APG select-only combobox) */
import { onScopeDispose } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { findTypeaheadOption } from './selectOptions'
import type { BaseSelectOption } from '@components/BaseSelect/types/BaseSelect.types'

/** Пауза, после которой набранные буквы сбрасываются, мс */
const TYPEAHEAD_RESET = 500

/**
 * Описание: поиск по буквам — активной становится доступная опция, подпись которой начинается с набранного.
 * Повтор буквы перебирает опции на неё; через полсекунды без ввода набранное сбрасывается.
 */
function useSelectTypeahead(filteredOptions: ComputedRef<BaseSelectOption[]>, activeIndex: Ref<number>) {
	let typeahead = ''
	let typeaheadTimer: ReturnType<typeof setTimeout> | null = null

	/** Идёт набор букв: пробел — часть поиска, а не выбор */
	function isTypingAhead(): boolean {
		return typeahead !== ''
	}

	function typeaheadActive(char: string): void {
		typeahead += char
		if (typeaheadTimer) clearTimeout(typeaheadTimer)
		typeaheadTimer = setTimeout(() => {
			typeahead = ''
			typeaheadTimer = null
		}, TYPEAHEAD_RESET)

		const found = findTypeaheadOption(filteredOptions.value, activeIndex.value, typeahead)
		if (found !== -1) activeIndex.value = found
	}

	onScopeDispose(() => {
		if (typeaheadTimer) clearTimeout(typeaheadTimer)
	})

	return { isTypingAhead, typeaheadActive }
}

export { useSelectTypeahead }
