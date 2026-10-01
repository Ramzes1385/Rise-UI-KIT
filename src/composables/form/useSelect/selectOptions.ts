/** Утилиты: отбор опций, поиск доступной опции и значения выбора для useSelect */
import { findTypeaheadIndex } from '@utils/navigation/menuUtils'
import type { SelectStep, SelectValue } from './types/useSelect.types'
import type { BaseSelectOption } from '@components/BaseSelect/types/BaseSelect.types'

function matchesQuery(opt: BaseSelectOption, query: string): boolean {
	const matchLabel = opt.label.toLowerCase().includes(query)
	const matchDesc = opt.description ? opt.description.toLowerCase().includes(query) : false
	return matchLabel || matchDesc
}

/** Описание: опции, подпись или описание которых содержит запрос (без учёта регистра); пустой запрос — все опции */
function filterSelectOptions(options: BaseSelectOption[], searchQuery: string): BaseSelectOption[] {
	if (!searchQuery) return options
	const query = searchQuery.toLowerCase()
	return options.filter(opt => matchesQuery(opt, query))
}

/** Описание: ближайшая доступная опция от индекса from (включительно) в направлении step; -1 — таких нет */
function findEnabledIndex(options: BaseSelectOption[], from: number, step: SelectStep): number {
	for (let index = from; index >= 0 && index < options.length; index += step) {
		const option = options[index]
		if (option && !option.isDisabled) return index
	}
	return -1
}

/** Описание: активная опция при открытии — выбранная (если доступна), иначе первая доступная */
function findInitialIndex(options: BaseSelectOption[], isSelected: (value: SelectValue) => boolean): number {
	const selectedIndex = options.findIndex(opt => isSelected(opt.value) && !opt.isDisabled)
	return selectedIndex === -1 ? findEnabledIndex(options, 0, 1) : selectedIndex
}

/** Описание: следующая доступная опция стрелкой — от активной или, если её нет, с края списка; без зацикливания */
function findMoveIndex(options: BaseSelectOption[], activeIndex: number, step: SelectStep): number {
	const edge = step === 1 ? 0 : options.length - 1
	const origin = activeIndex === -1 ? edge : activeIndex + step
	return findEnabledIndex(options, origin, step)
}

/** Описание: первая (first) или последняя (last) доступная опция */
function findEdgeIndex(options: BaseSelectOption[], edge: 'first' | 'last'): number {
	return edge === 'first' ? findEnabledIndex(options, 0, 1) : findEnabledIndex(options, options.length - 1, -1)
}

/** Описание: индекс опции по набранным буквам среди доступных; повтор буквы перебирает опции на неё; -1 — нет */
function findTypeaheadOption(options: BaseSelectOption[], activeIndex: number, typeahead: string): number {
	const enabled = options.map((option, index) => ({ option, index })).filter(({ option }) => !option.isDisabled)
	const current = enabled.findIndex(({ index }) => index === activeIndex)
	const found = findTypeaheadIndex(
		enabled.map(({ option }) => option.label),
		typeahead,
		current,
	)
	return found === -1 ? -1 : enabled[found].index
}

/** Описание: значение опции по значению или, если такого нет, по подписи (теги передают подпись) */
function resolveOptionValue(options: BaseSelectOption[], value: SelectValue): SelectValue {
	if (options.some(opt => opt.value === value)) return value
	const byLabel = options.find(opt => opt.label === value)
	return byLabel ? byLabel.value : value
}

/** Описание: новый массив значений — value убрано, если было, иначе добавлено в конец */
function toggleValue(values: SelectValue[], value: SelectValue): SelectValue[] {
	const newValue = [...values]
	const index = newValue.indexOf(value)
	if (index > -1) {
		newValue.splice(index, 1)
	} else {
		newValue.push(value)
	}
	return newValue
}

export {
	filterSelectOptions,
	findEdgeIndex,
	findEnabledIndex,
	findInitialIndex,
	findMoveIndex,
	findTypeaheadOption,
	resolveOptionValue,
	toggleValue,
}
