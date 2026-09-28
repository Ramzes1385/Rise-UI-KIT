/**
 * Integration-тесты для BaseSelect.
 * Проверяют взаимодействие: выбор опций, мультивыбор, поиск.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { UI_TEXT } from '@/locales/messages'
import BaseSelect from '../ui/BaseSelect.vue'
import type { BaseSelectOption } from '../model/BaseSelect.types'

/** Стандартный набор опций для тестов */
const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
	{ value: 'stone', label: 'Камень' },
	{ value: 'ceramic', label: 'Керамика', isDisabled: true },
]

describe('BaseSelect integration', () => {
	describe('выбор опции', () => {
		it('должен открывать дропдаун по клику', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			expect(container.querySelector('.base-select--open')).toBeInTheDocument()
		})

		it('должен эмитить update:modelValue при выборе опции', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			const option = screen.getByText('Металл')
			await user.click(option)

			const events = emitted()['update:modelValue'] as (string | number)[][]
			expect(events.at(-1)?.[0]).toBe('metal')
		})

		it('должен эмитить change при выборе опции', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			const option = screen.getByText('Металл')
			await user.click(option)

			expect(emitted()).toHaveProperty('change')
		})
	})

	describe('отключённый селект', () => {
		it('не должен открываться когда isDisabled=true', async () => {
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isDisabled: true },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await fireEvent.click(trigger!)

			expect(container.querySelector('.base-select--open')).not.toBeInTheDocument()
		})
	})

	describe('поиск', () => {
		it('должен принимать фокус и ввод в поле поиска и фильтровать опции', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, isSearchable: true },
			})

			await user.click(container.querySelector('.base-select__trigger')!)
			const search = screen.getByPlaceholderText(UI_TEXT.SEARCH_PLACEHOLDER)
			await user.click(search)
			expect(search).toHaveFocus()

			await user.keyboard('Дер')
			const labels = Array.from(document.querySelectorAll('.base-select__option-label')).map(el => el.textContent?.trim())
			expect(labels).toEqual(['Дерево'])
		})

		it('должен искать и по описанию опции, а без совпадений показывать «Ничего не найдено»', async () => {
			const user = userEvent.setup()
			render(BaseSelect, {
				props: {
					modelValue: '',
					label: 'Материал',
					isSearchable: true,
					options: [
						{ value: 'glass', label: 'Стекло', description: 'Прозрачный, хрупкий' },
						{ value: 'steel', label: 'Сталь', description: 'Прочная, тяжёлая' },
					],
				},
			})

			await user.click(screen.getByRole('combobox', { name: 'Материал' }))
			await user.keyboard('прозрачн')
			// «прозрачн» есть только в описании стекла
			expect(screen.getAllByRole('option')).toHaveLength(1)
			expect(screen.getByRole('option', { name: /Стекло/ })).toBeInTheDocument()

			await user.keyboard('ый металл')
			expect(screen.queryAllByRole('option')).toHaveLength(0)
			expect(screen.getByText(UI_TEXT.NO_RESULTS)).toBeInTheDocument()
		})

		it('должен сбрасывать поисковый запрос после закрытия списка', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал', isSearchable: true } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			await user.click(trigger)
			await user.keyboard('Кам')
			expect(screen.getAllByRole('option')).toHaveLength(1)

			await user.click(document.body)
			expect(trigger).toHaveAttribute('aria-expanded', 'false')

			await user.click(trigger)
			expect(screen.getByRole('textbox', { name: 'Поиск' })).toHaveValue('')
			expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length)
		})
	})

	describe('мультивыбор', () => {
		it('должен эмитить массив при выборе в режиме isMultiple', async () => {
			const user = userEvent.setup()
			const { container, emitted } = render(BaseSelect, {
				props: { modelValue: [] as (string | number)[], options: OPTIONS, isMultiple: true },
			})

			const trigger = container.querySelector('.base-select__trigger')
			await user.click(trigger!)

			const option = screen.getByText('Металл')
			await user.click(option)

			const events = emitted()['update:modelValue'] as (string | number)[][][]
			expect(events.at(-1)?.[0]).toEqual(['metal'])
		})

		it('повторный выбор отмеченной опции снимает её, список остаётся открытым', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSelect, {
				props: { modelValue: ['metal', 'stone'] as (string | number)[], options: OPTIONS, label: 'Материалы', isMultiple: true },
			})

			await user.click(screen.getByRole('combobox', { name: 'Материалы' }))
			await user.click(screen.getByRole('option', { name: 'Металл' }))

			expect(emitted()['update:modelValue']).toEqual([[['stone']]])
			expect(screen.getByRole('combobox', { name: 'Материалы' })).toHaveAttribute('aria-expanded', 'true')
		})
	})

	describe('доступность и клавиатура', () => {
		it('триггер — combobox с именем из подписи; ошибка и обязательность связаны с ним', () => {
			render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, label: 'Материал', isRequired: true, error: 'Выберите материал' },
			})

			const trigger = screen.getByRole('combobox', { name: /Материал/ })
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
			expect(trigger).toHaveAttribute('aria-invalid', 'true')
			expect(trigger).toHaveAttribute('aria-required', 'true')
			expect(trigger).toHaveAccessibleDescription('Выберите материал')
		})

		it('без подписи имя триггера и списка — плейсхолдер', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, placeholder: 'Материал' } })

			await user.click(screen.getByRole('combobox', { name: 'Материал' }))
			expect(screen.getByRole('listbox', { name: 'Материал' })).toBeInTheDocument()
		})

		it('клик по подписи ставит фокус на триггер', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал' } })

			await user.click(screen.getByText('Материал'))
			expect(screen.getByRole('combobox', { name: 'Материал' })).toHaveFocus()
		})

		it('стрелка вниз открывает список, стрелки пропускают недоступные опции, Home/End — к краям, Enter выбирает', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал' } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			await user.tab()
			expect(trigger).toHaveFocus()
			await user.keyboard('{ArrowDown}')
			expect(trigger).toHaveAttribute('aria-expanded', 'true')
			const listbox = screen.getByRole('listbox', { name: 'Материал' })
			expect(trigger).toHaveAttribute('aria-controls', listbox.id)
			const options = screen.getAllByRole('option')
			expect(trigger).toHaveAttribute('aria-activedescendant', options[0]?.id)

			// Камень — последняя доступная: Керамика отключена и пропускается
			await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}')
			expect(trigger).toHaveAttribute('aria-activedescendant', options[2]?.id)
			await user.keyboard('{Home}')
			expect(trigger).toHaveAttribute('aria-activedescendant', options[0]?.id)
			await user.keyboard('{End}')
			expect(trigger).toHaveAttribute('aria-activedescendant', options[2]?.id)

			await user.keyboard('{Enter}')
			expect(emitted()['update:modelValue']).toEqual([['stone']])
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
			expect(trigger).toHaveFocus()
		})

		it('Home и End на закрытом списке открывают его на первой и последней доступной опции', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал' } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			await user.tab()
			await user.keyboard('{End}')
			expect(trigger).toHaveAttribute('aria-expanded', 'true')
			expect(trigger).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Камень' }).id)

			await user.keyboard('{Escape}')
			await user.keyboard('{Home}')
			expect(trigger).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Металл' }).id)
		})

		it('буквы открывают список и ищут опцию по началу подписи; повтор буквы — следующая, пробел — часть слова', async () => {
			vi.useFakeTimers()
			const options: BaseSelectOption[] = [
				{ value: 'metal', label: 'Металл' },
				{ value: 'wood', label: 'Дерево' },
				{ value: 'stone', label: 'Камень' },
				{ value: 'ceramic', label: 'Керамика', isDisabled: true },
				{ value: 'clay', label: 'Кирпич' },
				{ value: 'dark-wood', label: 'Дерево тёмное' },
			]
			const { emitted } = render(BaseSelect, { props: { modelValue: '', options, label: 'Материал' } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })
			trigger.focus()
			const activeLabel = () => document.getElementById(trigger.getAttribute('aria-activedescendant') ?? '')?.textContent?.trim()

			await fireEvent.keyDown(trigger, { key: 'к' })
			expect(trigger).toHaveAttribute('aria-expanded', 'true')
			expect(activeLabel()).toBe('Камень')
			await fireEvent.keyDown(trigger, { key: 'к' })
			// Керамика отключена и пропускается
			expect(activeLabel()).toBe('Кирпич')
			vi.advanceTimersByTime(600)

			for (const key of ['д', 'е', 'р', 'е', 'в', 'о', ' ', 'т']) await fireEvent.keyDown(trigger, { key })
			expect(activeLabel()).toBe('Дерево тёмное')
			expect(emitted()['update:modelValue']).toBeUndefined()
			vi.advanceTimersByTime(600)

			await fireEvent.keyDown(trigger, { key: 'я' })
			expect(activeLabel()).toBe('Дерево тёмное')
			await fireEvent.keyDown(trigger, { key: 'c', ctrlKey: true })
			expect(activeLabel()).toBe('Дерево тёмное')
			vi.useRealTimers()
		})

		it('в поле с поиском буквы на триггере не ищут', async () => {
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал', isSearchable: true } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })
			await fireEvent.keyDown(trigger, { key: 'к' })
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
		})

		it('при открытии активна выбранная опция', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: 'wood', options: OPTIONS, label: 'Материал' } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			await user.tab()
			await user.keyboard('{Enter}')
			const selected = screen.getByRole('option', { name: 'Дерево' })
			expect(selected).toHaveAttribute('aria-selected', 'true')
			expect(trigger).toHaveAttribute('aria-activedescendant', selected.id)
		})

		it('в мультивыборе Space переключает активную опцию, список остаётся открытым', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSelect, {
				props: { modelValue: ['metal'] as (string | number)[], options: OPTIONS, label: 'Материалы', isMultiple: true },
			})
			const trigger = screen.getByRole('combobox', { name: 'Материалы' })

			await user.tab()
			await user.keyboard('{ArrowDown}')
			expect(screen.getByRole('listbox', { name: 'Материалы' })).toHaveAttribute('aria-multiselectable', 'true')
			await user.keyboard('{ArrowDown}[Space]')
			expect(emitted()['update:modelValue']).toEqual([[['metal', 'wood']]])
			expect(trigger).toHaveAttribute('aria-expanded', 'true')
		})

		it('Tab закрывает открытый список', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал' } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			await user.tab()
			await user.keyboard('{Enter}')
			expect(trigger).toHaveAttribute('aria-expanded', 'true')
			await user.tab()
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
		})

		it('поиск: при открытии фокус в поле поиска, стрелки и Enter выбирают отфильтрованную опцию', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSelect, {
				props: { modelValue: '', options: OPTIONS, label: 'Материал', isSearchable: true },
			})
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			await user.click(trigger)
			const search = screen.getByRole('textbox', { name: 'Поиск' })
			expect(search).toHaveFocus()
			await user.keyboard('ка')
			// «ка» — в «Камень» и «Керамика» (недоступна): активна первая, стрелка вниз недоступную пропускает
			const stone = screen.getByRole('option', { name: 'Камень' })
			expect(screen.getAllByRole('option')).toHaveLength(2)
			expect(search).toHaveAttribute('aria-activedescendant', stone.id)
			await user.keyboard('{ArrowDown}')
			expect(search).toHaveAttribute('aria-activedescendant', stone.id)
			await user.keyboard('{Enter}')
			expect(emitted()['update:modelValue']).toEqual([['stone']])
			expect(trigger).toHaveFocus()
		})

		it('Tab в поле поиска закрывает список и возвращает фокус на триггер', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал', isSearchable: true } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			await user.click(trigger)
			await user.tab()
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
			expect(trigger).toHaveFocus()
		})

		it('отключённый селект не фокусируется и не открывается с клавиатуры', async () => {
			const user = userEvent.setup()
			render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал', isDisabled: true } })
			const trigger = screen.getByRole('combobox', { name: 'Материал' })

			expect(trigger).not.toHaveAttribute('tabindex')
			expect(trigger).toHaveAttribute('aria-disabled', 'true')
			await user.tab()
			expect(trigger).not.toHaveFocus()
			await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
		})

		it('крестик бейджа убирает значение, не открывая список', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseSelect, {
				props: { modelValue: ['metal', 'wood'] as (string | number)[], options: OPTIONS, label: 'Материалы', isMultiple: true },
			})

			await user.click(screen.getByRole('button', { name: 'Удалить Металл' }))
			expect(emitted()['update:modelValue']).toEqual([[['wood']]])
			expect(screen.getByRole('combobox', { name: 'Материалы' })).toHaveAttribute('aria-expanded', 'false')
		})

		it('в отключённом мультивыборе крестиков у бейджей нет', () => {
			render(BaseSelect, {
				props: { modelValue: ['metal'] as (string | number)[], options: OPTIONS, isMultiple: true, isDisabled: true },
			})

			expect(screen.queryByRole('button', { name: 'Удалить Металл' })).not.toBeInTheDocument()
		})
	})
})
