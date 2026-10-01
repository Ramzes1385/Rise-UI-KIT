/** Composable: активная (подсвеченная) опция useSelect для управления с клавиатуры */
import { ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { SelectStep, SelectValue } from './types/useSelect.types'
import type { BaseSelectOption } from '@components/BaseSelect/types/BaseSelect.types'
import { findEdgeIndex, findEnabledIndex, findInitialIndex, findMoveIndex } from './selectOptions'

/** Описание: индекс активной опции в filteredOptions и его сдвиг стрелками, Home/End и указателем */
function useSelectActive(
	isOpen: Ref<boolean>,
	filteredOptions: ComputedRef<BaseSelectOption[]>,
	isSelected: (value: SelectValue) => boolean,
) {
	/** Индекс активной опции в filteredOptions: её выбирает Enter, на неё указывает aria-activedescendant; -1 — нет */
	const activeIndex = ref(-1)

	function setIfFound(index: number): void {
		if (index !== -1) activeIndex.value = index
	}

	// Открытие ставит активной выбранную опцию, закрытие снимает подсветку. Синхронно: клавиша, которая открыла
	// список (буква, Home, End), сразу двигает активную опцию, и watch не перезаписывает её
	watch(
		isOpen,
		value => {
			activeIndex.value = value ? findInitialIndex(filteredOptions.value, isSelected) : -1
		},
		{ flush: 'sync' },
	)

	// Новый поисковый запрос — активной становится первая подходящая опция
	watch(filteredOptions, () => {
		if (isOpen.value) activeIndex.value = findEnabledIndex(filteredOptions.value, 0, 1)
	})

	return {
		activeIndex,
		/** Сдвиг активной опции стрелками: без зацикливания, отключённые опции пропускаются */
		moveActive: (step: SelectStep): void => setIfFound(findMoveIndex(filteredOptions.value, activeIndex.value, step)),
		/** Первая (Home) или последняя (End) доступная опция */
		setActiveEdge: (edge: 'first' | 'last'): void => setIfFound(findEdgeIndex(filteredOptions.value, edge)),
		/** Подсветка опции указателем мыши: клавиатура продолжит с неё */
		setActive: (index: number): void => {
			const option = filteredOptions.value[index]
			if (option && !option.isDisabled) activeIndex.value = index
		},
	}
}

export { useSelectActive }
