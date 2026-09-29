/** Composable: логика выбора и фильтрации для BaseSelect */
import { computed, onScopeDispose, ref, watch } from 'vue'
import type { UseSelectOptions } from './types/useSelect.types'
import { findTypeaheadIndex } from '@utils/navigation/menuUtils'
import type { BaseSelectOption } from '@components/BaseSelect/types/BaseSelect.types'

/** Пауза, после которой набранные буквы сбрасываются, мс */
const TYPEAHEAD_RESET = 500

/**
 * Логика выбора/фильтрации для BaseSelect.
 * Инкапсулирует состояние дропдауна, поиск, вычисление выбранных опций,
 * выбор/снятие значений (включая multi-select), удаление тегов
 * и активную (подсвеченную) опцию для управления с клавиатуры.
 */
function useSelect({ props, emit, onBlur, isDisabled = () => Boolean(props.isDisabled) }: UseSelectOptions) {
	const isOpen = ref(false)
	const searchQuery = ref('')
	/** Индекс активной опции в filteredOptions: её выбирает Enter, на неё указывает aria-activedescendant; -1 — нет */
	const activeIndex = ref(-1)

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

	function isSelected(value: string | number): boolean {
		if (props.isMultiple) {
			return Array.isArray(props.modelValue) && props.modelValue.includes(value)
		}
		return props.modelValue === value
	}

	/** Ближайшая доступная опция от индекса from (включительно) в направлении step; -1 — таких нет */
	function findEnabledIndex(from: number, step: 1 | -1): number {
		const options = filteredOptions.value
		for (let index = from; index >= 0 && index < options.length; index += step) {
			const option = options[index]
			if (option && !option.isDisabled) return index
		}
		return -1
	}

	/** Активная опция при открытии: выбранная (если доступна), иначе первая доступная */
	function initialActiveIndex(): number {
		const selectedIndex = filteredOptions.value.findIndex(opt => isSelected(opt.value) && !opt.isDisabled)
		return selectedIndex === -1 ? findEnabledIndex(0, 1) : selectedIndex
	}

	/** Откуда искать следующую опцию: от активной или, если её нет, с края списка */
	function moveOrigin(step: 1 | -1): number {
		if (activeIndex.value !== -1) return activeIndex.value + step
		return step === 1 ? 0 : filteredOptions.value.length - 1
	}

	/** Сдвиг активной опции стрелками: без зацикливания, отключённые опции пропускаются */
	function moveActive(step: 1 | -1): void {
		const next = findEnabledIndex(moveOrigin(step), step)
		if (next !== -1) activeIndex.value = next
	}

	/** Первая (Home) или последняя (End) доступная опция */
	function setActiveEdge(edge: 'first' | 'last'): void {
		const next = edge === 'first' ? findEnabledIndex(0, 1) : findEnabledIndex(filteredOptions.value.length - 1, -1)
		if (next !== -1) activeIndex.value = next
	}

	/** Подсветка опции указателем мыши: клавиатура продолжит с неё */
	function setActive(index: number): void {
		const option = filteredOptions.value[index]
		if (option && !option.isDisabled) activeIndex.value = index
	}

	let typeahead = ''
	let typeaheadTimer: ReturnType<typeof setTimeout> | null = null

	/** Идёт набор букв: пробел — часть поиска, а не выбор */
	function isTypingAhead(): boolean {
		return typeahead !== ''
	}

	/**
	 * Поиск по буквам (APG select-only combobox): активной становится доступная опция, подпись которой начинается
	 * с набранного. Повтор буквы перебирает опции на неё; через полсекунды без ввода набранное сбрасывается.
	 */
	function typeaheadActive(char: string): void {
		typeahead += char
		if (typeaheadTimer) clearTimeout(typeaheadTimer)
		typeaheadTimer = setTimeout(() => {
			typeahead = ''
			typeaheadTimer = null
		}, TYPEAHEAD_RESET)

		const enabled = filteredOptions.value.map((option, index) => ({ option, index })).filter(({ option }) => !option.isDisabled)
		const current = enabled.findIndex(({ index }) => index === activeIndex.value)
		const found = findTypeaheadIndex(
			enabled.map(({ option }) => option.label),
			typeahead,
			current,
		)
		if (found !== -1) activeIndex.value = enabled[found].index
	}

	onScopeDispose(() => {
		if (typeaheadTimer) clearTimeout(typeaheadTimer)
	})

	// Открытие ставит активной выбранную опцию, закрытие снимает подсветку. Синхронно: клавиша, которая открыла
	// список (буква, Home, End), сразу двигает активную опцию, и watch не перезаписывает её
	watch(
		isOpen,
		value => {
			activeIndex.value = value ? initialActiveIndex() : -1
		},
		{ flush: 'sync' },
	)

	// Новый поисковый запрос — активной становится первая подходящая опция
	watch(filteredOptions, () => {
		if (isOpen.value) activeIndex.value = findEnabledIndex(0, 1)
	})

	function openDropdown(): void {
		if (!isDisabled()) isOpen.value = true
	}

	function toggleDropdown(): void {
		if (!isDisabled()) {
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

	/** Выбор активной опции (Enter/Space); без активной опции ничего не происходит */
	function selectActive(): void {
		const option = filteredOptions.value[activeIndex.value]
		if (option) handleSelect(option)
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
		activeIndex,
		selectedOption,
		selectedLabel,
		selectedItems,
		selectedLabels,
		filteredOptions,
		openDropdown,
		toggleDropdown,
		handleClose,
		isSelected,
		handleSelect,
		selectActive,
		moveActive,
		setActiveEdge,
		setActive,
		typeaheadActive,
		isTypingAhead,
		removeValue,
	}
}

export { useSelect }
