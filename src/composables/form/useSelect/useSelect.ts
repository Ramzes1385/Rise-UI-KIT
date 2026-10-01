/** Composable: логика выбора и фильтрации для BaseSelect */
import { computed, ref } from 'vue'
import { useSelectActive } from './useSelectActive'
import { createSelectActions } from './selectActions'
import { filterSelectOptions } from './selectOptions'
import { useSelectTypeahead } from './useSelectTypeahead'
import type { BaseSelectOption } from '@components/BaseSelect/types/BaseSelect.types'
import type { SelectContext, SelectValue, UseSelectOptions } from './types/useSelect.types'

/**
 * Логика выбора/фильтрации для BaseSelect.
 * Инкапсулирует состояние дропдауна, поиск, вычисление выбранных опций,
 * выбор/снятие значений (включая multi-select), удаление тегов
 * и активную (подсвеченную) опцию для управления с клавиатуры.
 */
function useSelect({ props, emit, onBlur, isDisabled = () => Boolean(props.isDisabled) }: UseSelectOptions) {
	const isOpen = ref(false)
	const searchQuery = ref('')
	const ctx: SelectContext = { props, emit, onBlur, isDisabled, isOpen, searchQuery }

	const selectedOption = computed(() => props.options.find(opt => opt.value === props.modelValue) ?? null)
	const selectedLabel = computed(() => selectedOption.value?.label ?? '')
	const selectedItems = computed((): BaseSelectOption[] => {
		const values = props.modelValue
		if (!Array.isArray(values)) return []
		return props.options.filter(opt => values.includes(opt.value))
	})
	const selectedLabels = computed((): string[] => selectedItems.value.map(opt => opt.label))
	const filteredOptions = computed(() => filterSelectOptions(props.options, searchQuery.value))

	function isSelected(value: SelectValue): boolean {
		if (props.isMultiple) {
			return Array.isArray(props.modelValue) && props.modelValue.includes(value)
		}
		return props.modelValue === value
	}

	const { activeIndex, moveActive, setActiveEdge, setActive } = useSelectActive(isOpen, filteredOptions, isSelected)
	const actions = createSelectActions(ctx)

	return {
		isOpen,
		searchQuery,
		activeIndex,
		selectedOption,
		selectedLabel,
		selectedItems,
		selectedLabels,
		filteredOptions,
		...actions,
		isSelected,
		/** Выбор активной опции (Enter/Space); без активной опции ничего не происходит */
		selectActive(): void {
			const option = filteredOptions.value[activeIndex.value]
			if (option) actions.handleSelect(option)
		},
		moveActive,
		setActiveEdge,
		setActive,
		...useSelectTypeahead(filteredOptions, activeIndex),
	}
}

export { useSelect }
