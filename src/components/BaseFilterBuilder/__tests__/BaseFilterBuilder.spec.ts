import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import type { FilterBuilderField, FilterBuilderGroup } from '../types/BaseFilterBuilder.types'

const FIELDS: FilterBuilderField[] = [
	{ key: 'title', label: 'Задача', type: 'text' },
	{
		key: 'status',
		label: 'Статус',
		type: 'select',
		options: [
			{ value: 'todo', label: 'К выполнению' },
			{ value: 'done', label: 'Готово' },
		],
	},
	{ key: 'estimate', label: 'Оценка', type: 'number' },
	{ key: 'due', label: 'Срок', type: 'date' },
	{ key: 'isUrgent', label: 'Срочно', type: 'boolean' },
]

const FILTER: FilterBuilderGroup = {
	match: 'all',
	conditions: [
		{ id: 'a', field: 'title', operator: 'contains', value: 'таблиц' },
		{ id: 'b', field: 'estimate', operator: 'between', value: '1', valueTo: '5' },
	],
}

const row = (n: number) => screen.getByRole('group', { name: `Условие ${n}` })

const last = (emitted: Record<string, unknown[]>) => (emitted['update:modelValue'].at(-1) as FilterBuilderGroup[])[0]

describe('BaseFilterBuilder', () => {
	afterEach(() => setLocale('ru'))

	it('условия из v-model: группы, связки, поля и диапазон', () => {
		render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		expect(screen.getByRole('group', { name: 'Фильтр' })).toBeInTheDocument()
		expect(screen.getByRole('combobox', { name: 'Показывать строки, где выполняются' })).toHaveValue('all')
		expect(row(1)).toHaveTextContent(/^Где/)
		expect(row(2)).toHaveTextContent(/^и/)
		expect(within(row(1)).getByRole('combobox', { name: 'Поле' })).toHaveValue('title')
		expect(within(row(1)).getByRole('combobox', { name: 'Сравнение' })).toHaveValue('contains')
		expect(within(row(1)).getByRole('textbox', { name: 'Значение' })).toHaveValue('таблиц')
		expect(within(row(2)).getByRole('spinbutton', { name: 'От' })).toHaveValue(1)
		expect(within(row(2)).getByRole('spinbutton', { name: 'До' })).toHaveValue(5)
		expect(within(row(2)).getByRole('spinbutton', { name: 'От' })).toHaveAttribute('inputmode', 'decimal')
		expect(screen.getByRole('button', { name: 'Сбросить' })).toBeInTheDocument()
	})

	it('без условий — подсказка, без связки и «Сбросить»; v-model снаружи', async () => {
		const { rerender } = render(BaseFilterBuilder, { props: { fields: FIELDS } })

		expect(screen.getByText('Условий нет — показаны все строки')).toBeInTheDocument()
		expect(screen.queryByRole('combobox')).toBeNull()
		expect(screen.queryByRole('button', { name: 'Сбросить' })).toBeNull()
		await rerender({ modelValue: FILTER })
		expect(row(2)).toBeInTheDocument()
		await rerender({ modelValue: undefined })
		expect(screen.queryByRole('group', { name: 'Условие 1' })).toBeNull()
	})

	it('«Добавить условие»: первое поле и сравнение, фокус в новое условие', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		await fireEvent.click(screen.getByRole('button', { name: 'Добавить условие' }))
		const added = last(emitted())
		expect(added.conditions).toHaveLength(3)
		expect(added.conditions[2]).toMatchObject({ field: 'title', operator: 'contains', value: '' })
		await waitFor(() => expect(within(row(3)).getByRole('combobox', { name: 'Поле' })).toHaveFocus())
		expect(row(3)).toHaveTextContent(/^и/)
	})

	it('смена поля сбрасывает сравнение и значение; select, boolean и дата', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		await fireEvent.update(within(row(1)).getByRole('combobox', { name: 'Поле' }), 'status')
		expect(last(emitted()).conditions[0]).toEqual({ id: 'a', field: 'status', operator: 'eq', value: '', valueTo: undefined })
		const value = within(row(1)).getByRole('combobox', { name: 'Значение' })
		expect(within(value).getByRole('option', { name: 'Выберите…' })).toBeInTheDocument()
		await fireEvent.update(value, 'done')
		expect(last(emitted()).conditions[0].value).toBe('done')
		await fireEvent.update(within(row(1)).getByRole('combobox', { name: 'Поле' }), 'isUrgent')
		expect(within(row(1)).getByRole('combobox', { name: 'Сравнение' })).toHaveValue('isTrue')
		expect(within(row(1)).queryByRole('textbox')).toBeNull()
		await fireEvent.update(within(row(1)).getByRole('combobox', { name: 'Поле' }), 'due')
		expect(row(1).querySelector('input')).toHaveAttribute('type', 'date')
		expect(row(1).querySelector('input')).not.toHaveAttribute('inputmode')
	})

	it('сравнение, значение, верхняя граница и связка «любое»', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		await fireEvent.update(within(row(1)).getByRole('combobox', { name: 'Сравнение' }), 'startsWith')
		expect(last(emitted()).conditions[0].operator).toBe('startsWith')
		await fireEvent.update(within(row(1)).getByRole('textbox', { name: 'Значение' }), 'Тёмная')
		expect(last(emitted()).conditions[0].value).toBe('Тёмная')
		await fireEvent.update(within(row(2)).getByRole('spinbutton', { name: 'До' }), '8')
		expect(last(emitted()).conditions[1].valueTo).toBe('8')
		await fireEvent.update(screen.getByRole('combobox', { name: 'Показывать строки, где выполняются' }), 'any')
		expect(last(emitted()).match).toBe('any')
		expect(row(2)).toHaveTextContent(/^или/)
	})

	it('удаление переводит фокус на соседнее условие или «Добавить условие»; «Сбросить» очищает', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить условие 1' }))
		expect(last(emitted()).conditions.map(condition => condition.id)).toEqual(['b'])
		await waitFor(() => expect(within(row(1)).getByRole('combobox', { name: 'Поле' })).toHaveFocus())
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить условие' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить условие 2' }))
		await waitFor(() => expect(within(row(1)).getByRole('combobox', { name: 'Поле' })).toHaveFocus())
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить условие 1' }))
		await waitFor(() => expect(screen.getByRole('button', { name: 'Добавить условие' })).toHaveFocus())
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить условие' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }))
		expect(last(emitted()).conditions).toEqual([])
		await waitFor(() => expect(screen.getByRole('button', { name: 'Добавить условие' })).toHaveFocus())
	})

	it('is-disabled и пустой fields: всё неактивно', async () => {
		const { rerender } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER, isDisabled: true } })

		for (const field of screen.getAllByRole('combobox')) expect(field).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Добавить условие' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Сбросить' })).toBeDisabled()
		expect(screen.getByRole('group', { name: 'Фильтр' })).toHaveClass('base-filter-builder--disabled')
		await rerender({ fields: [], isDisabled: false })
		expect(screen.getByRole('button', { name: 'Добавить условие' })).toBeDisabled()
	})

	it('язык, вариант, масштаб и customClass', () => {
		setLocale('en')
		const { container } = render(BaseFilterBuilder, {
			props: {
				fields: FIELDS,
				modelValue: FILTER,
				variant: 'soft',
				sizeScale: 125,
				customClass: { root: 'r', row: 'w', actions: 'x' },
			},
		})
		const root = container.querySelector('.base-filter-builder') as HTMLElement

		expect(screen.getByRole('button', { name: 'Add condition' })).toBeInTheDocument()
		expect(root).toHaveClass('base-filter-builder--soft', 'r')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-filter-builder__row')).toHaveClass('w')
		expect(container.querySelector('.base-filter-builder__actions')).toHaveClass('x')
	})
})
