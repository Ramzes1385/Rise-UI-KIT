import { useSelect } from '../useSelect'
import { effectScope, nextTick, reactive } from 'vue'
import type { UseSelectOptions } from '../types/useSelect.types'
import type { BaseSelectOption, BaseSelectProps } from '@components/BaseSelect/types/BaseSelect.types'

const OPTIONS: BaseSelectOption[] = [
	{ value: 'apple', label: 'Яблоко', description: 'Красное' },
	{ value: 'banana', label: 'Банан', isDisabled: true },
	{ value: 'cherry', label: 'Вишня' },
	{ value: 'apricot', label: 'Абрикос', description: 'Оранжевый' },
	{ value: 'grape', label: 'Виноград' },
	{ value: 'lime', label: 'Лайм', isDisabled: true },
]

function setup(initial: Partial<BaseSelectProps> = {}, isDisabled?: () => boolean) {
	const props = reactive<BaseSelectProps>({ options: OPTIONS, ...initial })
	const emit = vi.fn()
	const onBlur = vi.fn()
	const scope = effectScope()
	const select = scope.run(() =>
		useSelect({ props, emit: emit as unknown as UseSelectOptions['emit'], onBlur, ...(isDisabled ? { isDisabled } : {}) }),
	)!
	return { select, props, emit, onBlur, scope }
}

const activeLabel = (select: ReturnType<typeof useSelect>) => select.filteredOptions.value[select.activeIndex.value]?.label

describe('useSelect', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	describe('открытие и закрытие', () => {
		it('открывается и закрывается переключателем, при закрытии сбрасывает поиск', () => {
			const { select } = setup()
			select.toggleDropdown()
			expect(select.isOpen.value).toBe(true)

			select.searchQuery.value = 'виш'
			select.toggleDropdown()
			expect(select.isOpen.value).toBe(false)
			expect(select.searchQuery.value).toBe('')
			expect(select.activeIndex.value).toBe(-1)
		})

		it('отключённый список не открывается', () => {
			const { select } = setup({ isDisabled: true })
			select.openDropdown()
			select.toggleDropdown()
			expect(select.isOpen.value).toBe(false)
		})

		it('блокировка формы вокруг важнее пропса', () => {
			const { select } = setup({}, () => true)
			select.openDropdown()
			expect(select.isOpen.value).toBe(false)
		})

		it('закрытие списка сбрасывает поиск и сообщает о потере фокуса', () => {
			const { select, onBlur } = setup()
			select.searchQuery.value = 'вин'
			select.handleClose()
			expect(select.searchQuery.value).toBe('')
			expect(onBlur).toHaveBeenCalled()
		})
	})

	describe('одиночный выбор', () => {
		it('показывает подпись выбранной опции', () => {
			const { select } = setup({ modelValue: 'cherry' })
			expect(select.selectedOption.value?.value).toBe('cherry')
			expect(select.selectedLabel.value).toBe('Вишня')
			expect(select.isSelected('cherry')).toBe(true)
			expect(select.isSelected('apple')).toBe(false)
		})

		it('без значения подпись пустая', () => {
			const { select } = setup()
			expect(select.selectedOption.value).toBeNull()
			expect(select.selectedLabel.value).toBe('')
			expect(select.selectedItems.value).toEqual([])
		})

		it('выбор опции эмитит значение и закрывает список', () => {
			const { select, emit } = setup()
			select.openDropdown()
			select.searchQuery.value = 'виш'
			select.handleSelect(OPTIONS[2])

			expect(emit).toHaveBeenCalledWith('update:modelValue', 'cherry')
			expect(emit).toHaveBeenCalledWith('change', 'cherry')
			expect(select.isOpen.value).toBe(false)
			expect(select.searchQuery.value).toBe('')
		})

		it('отключённую опцию выбрать нельзя', () => {
			const { select, emit } = setup()
			select.handleSelect(OPTIONS[1])
			expect(emit).not.toHaveBeenCalled()
		})

		it('при открытии активна выбранная опция', () => {
			const { select } = setup({ modelValue: 'grape' })
			select.openDropdown()
			expect(activeLabel(select)).toBe('Виноград')
		})

		it('если выбрана отключённая опция — активна первая доступная', () => {
			const { select } = setup({ modelValue: 'banana' })
			select.openDropdown()
			expect(activeLabel(select)).toBe('Яблоко')
		})
	})

	describe('множественный выбор', () => {
		it('добавляет и снимает значения', () => {
			const { select, emit, props } = setup({ isMultiple: true, modelValue: ['apple'] })
			select.handleSelect(OPTIONS[2])
			expect(emit).toHaveBeenLastCalledWith('change', ['apple', 'cherry'])

			props.modelValue = ['apple', 'cherry']
			select.handleSelect(OPTIONS[0])
			expect(emit).toHaveBeenLastCalledWith('change', ['cherry'])
			expect(select.isOpen.value).toBe(false)
		})

		it('показывает выбранные опции и подписи', () => {
			const { select } = setup({ isMultiple: true, modelValue: ['apple', 'grape'] })
			expect(select.selectedItems.value.map(opt => opt.value)).toEqual(['apple', 'grape'])
			expect(select.selectedLabels.value).toEqual(['Яблоко', 'Виноград'])
			expect(select.isSelected('grape')).toBe(true)
			expect(select.isSelected('cherry')).toBe(false)
		})

		it('со скалярным значением ничего не считает выбранным', () => {
			const { select } = setup({ isMultiple: true, modelValue: 'apple' })
			expect(select.isSelected('apple')).toBe(false)
		})

		it('удаляет тег по значению и по подписи', () => {
			const { select, emit } = setup({ isMultiple: true, modelValue: ['apple', 'grape', 'custom'] })
			select.removeValue('grape')
			expect(emit).toHaveBeenCalledWith('update:modelValue', ['apple', 'custom'])

			select.removeValue('Яблоко')
			expect(emit).toHaveBeenLastCalledWith('change', ['grape', 'custom'])

			select.removeValue('custom')
			expect(emit).toHaveBeenLastCalledWith('change', ['apple', 'grape'])
		})

		it('удаление тега без массива значений ничего не делает', () => {
			const { select, emit } = setup({ modelValue: 'apple' })
			select.removeValue('apple')
			expect(emit).not.toHaveBeenCalled()
		})
	})

	describe('поиск', () => {
		it('фильтрует по подписи и описанию без учёта регистра', () => {
			const { select } = setup()
			select.searchQuery.value = 'ВИН'
			expect(select.filteredOptions.value.map(opt => opt.value)).toEqual(['grape'])

			select.searchQuery.value = 'оранж'
			expect(select.filteredOptions.value.map(opt => opt.value)).toEqual(['apricot'])
		})

		it('в открытом списке новый запрос делает активной первую подходящую опцию', async () => {
			const { select } = setup()
			select.openDropdown()
			select.moveActive(1)
			select.searchQuery.value = 'в'
			await nextTick()
			expect(activeLabel(select)).toBe('Вишня')
		})

		it('в закрытом списке запрос активную опцию не трогает', async () => {
			const { select } = setup()
			select.searchQuery.value = 'в'
			await nextTick()
			expect(select.activeIndex.value).toBe(-1)
		})
	})

	describe('клавиатура', () => {
		it('стрелки пропускают отключённые опции и не зацикливаются', () => {
			const { select } = setup()
			select.openDropdown()
			expect(activeLabel(select)).toBe('Яблоко')

			select.moveActive(1)
			expect(activeLabel(select)).toBe('Вишня')
			select.moveActive(1)
			select.moveActive(1)
			expect(activeLabel(select)).toBe('Виноград')
			select.moveActive(1)
			expect(activeLabel(select)).toBe('Виноград')

			select.moveActive(-1)
			expect(activeLabel(select)).toBe('Абрикос')
		})

		it('без активной опции стрелки начинают с краёв списка', () => {
			const { select } = setup()
			select.moveActive(1)
			expect(activeLabel(select)).toBe('Яблоко')

			select.activeIndex.value = -1
			select.moveActive(-1)
			expect(activeLabel(select)).toBe('Виноград')
		})

		it('Home и End ставят первую и последнюю доступную опцию', () => {
			const { select } = setup()
			select.setActiveEdge('last')
			expect(activeLabel(select)).toBe('Виноград')
			select.setActiveEdge('first')
			expect(activeLabel(select)).toBe('Яблоко')
		})

		it('без доступных опций активной не становится ни одна', () => {
			const { select } = setup({ options: [{ value: 'x', label: 'Икс', isDisabled: true }] })
			select.openDropdown()
			select.moveActive(1)
			select.setActiveEdge('first')
			select.setActiveEdge('last')
			expect(select.activeIndex.value).toBe(-1)
		})

		it('наведение мышью делает активной только доступную опцию', () => {
			const { select } = setup()
			select.setActive(2)
			expect(activeLabel(select)).toBe('Вишня')
			select.setActive(1)
			select.setActive(99)
			expect(activeLabel(select)).toBe('Вишня')
		})

		it('Enter выбирает активную опцию, без активной — ничего', () => {
			const { select, emit } = setup()
			select.selectActive()
			expect(emit).not.toHaveBeenCalled()

			select.openDropdown()
			select.moveActive(1)
			select.selectActive()
			expect(emit).toHaveBeenCalledWith('update:modelValue', 'cherry')
		})
	})

	describe('поиск по буквам', () => {
		it('переходит к опции по первой букве и перебирает опции на неё', () => {
			vi.useFakeTimers()
			const { select } = setup()
			select.openDropdown()

			select.typeaheadActive('в')
			expect(activeLabel(select)).toBe('Вишня')
			expect(select.isTypingAhead()).toBe(true)
			select.typeaheadActive('в')
			expect(activeLabel(select)).toBe('Виноград')
		})

		it('набранное через паузу сбрасывается', () => {
			vi.useFakeTimers()
			const { select } = setup()
			select.typeaheadActive('ви')
			expect(select.isTypingAhead()).toBe(true)

			vi.advanceTimersByTime(500)
			expect(select.isTypingAhead()).toBe(false)
			select.typeaheadActive('а')
			expect(activeLabel(select)).toBe('Абрикос')
		})

		it('отключённые опции и несовпадения не делают опцию активной', () => {
			vi.useFakeTimers()
			const { select } = setup()
			select.typeaheadActive('л')
			expect(select.activeIndex.value).toBe(-1)
			select.typeaheadActive('щ')
			expect(select.activeIndex.value).toBe(-1)
		})

		it('остановка области очищает таймер набора', () => {
			vi.useFakeTimers()
			const { select, scope } = setup()
			select.typeaheadActive('в')
			scope.stop()
			expect(vi.getTimerCount()).toBe(0)
		})

		it('остановка области без набора проходит без ошибок', () => {
			const { scope } = setup()
			expect(() => scope.stop()).not.toThrow()
		})
	})
})
