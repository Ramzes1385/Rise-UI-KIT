import { computed, ref } from 'vue'
import type { BaseSelectEmits, BaseSelectOption, BaseSelectProps } from '../model/BaseSelect.types'

/** Опции composable useSelect */
interface UseSelectOptions {
	props: BaseSelectProps
	emit: BaseSelectEmits
	onBlur: () => void
}

/**
 * Логика выбора/фильтрации для BaseSelect.
 * Инкапсулирует состояние дропдауна, поиск, вычисление выбранных опций,
 * выбор/снятие значений (включая multi-select) и удаление тегов.
 */
function useSelect({ props, emit, onBlur }: UseSelectOptions) {
	const isOpen = ref(false)
	const searchQuery = ref('')

	const selectedOption = computed(() => {
		return props.options.find(opt => opt.value === props.modelValue) ?? null
	})

	const selectedLabel = computed(() => {
		return selectedOption.value?.label ?? ''
	})

	const selectedItems = computed((): BaseSelectOption[] => {
		const values = props.modelValue
		if (!Array.isArray(values)) return []
		return props.options.filter(opt => values.includes(opt.value))
	})

	const selectedLabels = computed((): string[] => selectedItems.value.map(opt => opt.label))

	const filteredOptions = computed(() => {
		if (!searchQuery.value) return props.options
		const query = searchQuery.value.toLowerCase()
		return props.options.filter(opt => {
			const matchLabel = opt.label.toLowerCase().includes(query)
			const matchDesc = opt.description ? opt.description.toLowerCase().includes(query) : false
			return matchLabel || matchDesc
		})
	})

	function toggleDropdown(): void {
		if (!props.isDisabled) {
			isOpen.value = !isOpen.value
			if (!isOpen.value) {
				searchQuery.value = ''
			}
		}
	}

	function handleClose(): void {
		searchQuery.value = ''
		onBlur()
	}

	function isSelected(value: string | number): boolean {
		if (props.isMultiple) {
			return Array.isArray(props.modelValue) && props.modelValue.includes(value)
		}
		return props.modelValue === value
	}

	function handleSelect(option: BaseSelectOption): void {
		if (option.isDisabled) return

		if (props.isMultiple) {
			/* istanbul ignore next — defensive: при isMultiple modelValue гарантированно массив */
			const newValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
			const index = newValue.indexOf(option.value)
			if (index > -1) {
				newValue.splice(index, 1)
			} else {
				newValue.push(option.value)
			}
			emit('update:modelValue', newValue)
			emit('change', newValue)
		} else {
			emit('update:modelValue', option.value)
			emit('change', option.value)
			isOpen.value = false
			searchQuery.value = ''
		}
	}

	function removeValue(value: string | number): void {
		if (!Array.isArray(props.modelValue)) return
		const targetValue = resolveOptionValue(value)
		const newValue = props.modelValue.filter(v => v !== targetValue)
		emit('update:modelValue', newValue)
		emit('change', newValue)
	}

	function resolveOptionValue(value: string | number): string | number {
		if (props.options.some(opt => opt.value === value)) return value
		const byLabel = props.options.find(opt => opt.label === value)
		return byLabel ? byLabel.value : value
	}

	return {
		isOpen,
		searchQuery,
		selectedOption,
		selectedLabel,
		selectedItems,
		selectedLabels,
		filteredOptions,
		toggleDropdown,
		handleClose,
		isSelected,
		handleSelect,
		removeValue,
	}
}

export { useSelect }
