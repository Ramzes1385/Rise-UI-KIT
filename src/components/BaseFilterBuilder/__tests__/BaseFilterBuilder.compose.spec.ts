import '@testing-library/jest-dom/vitest'
import BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import type { FilterBuilderField, FilterBuilderGroup } from '../types/BaseFilterBuilder.types'

const FIELDS: FilterBuilderField[] = [
	{ key: 'title', label: 'Задача', type: 'text' },
	{ key: 'estimate', label: 'Оценка', type: 'number' },
]

const FILTER: FilterBuilderGroup = {
	match: 'all',
	conditions: [
		{ id: 'a', field: 'title', operator: 'contains', value: 'x' },
		{ id: 'b', field: 'estimate', operator: 'gt', value: '1' },
	],
}

const row = (n: number) => screen.getByRole('group', { name: `Условие ${n}` })

const last = (emitted: Record<string, unknown[]>) => (emitted['update:modelValue'].at(-1) as FilterBuilderGroup[])[0]

describe('BaseFilterBuilder: кнопки на BaseButton', () => {
	it('кнопки названы, type=button, прежние классы на кнопках', () => {
		render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		const remove = screen.getByRole('button', { name: 'Удалить условие 2' })
		const add = screen.getByRole('button', { name: 'Добавить условие' })
		const clear = screen.getByRole('button', { name: 'Сбросить' })
		expect(screen.getByRole('button', { name: 'Удалить условие 1' })).toHaveAttribute('type', 'button')
		expect(remove).toHaveClass('base-button', 'base-filter-builder__remove')
		expect(add).toHaveClass('base-button', 'base-filter-builder__button', 'base-filter-builder__add')
		expect(clear).toHaveClass('base-button', 'base-filter-builder__button')
		expect(add).toHaveAttribute('type', 'button')
		expect(clear).toHaveAttribute('type', 'button')
		expect(add).toBeEnabled()
	})

	it('isDisabled отключает все кнопки', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER, isDisabled: true } })

		for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
		expect(screen.getAllByRole('button')).toHaveLength(4)
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить условие' }))
		expect(emitted()['update:modelValue']).toBeUndefined()
	})

	it('без полей «Добавить условие» отключена', () => {
		render(BaseFilterBuilder, { props: { fields: [] } })
		expect(screen.getByRole('button', { name: 'Добавить условие' })).toBeDisabled()
	})

	it('добавление: эмит и фокус в поле нового условия', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS } })

		await fireEvent.click(screen.getByRole('button', { name: 'Добавить условие' }))
		expect(last(emitted()).conditions).toHaveLength(1)
		await waitFor(() => expect(within(row(1)).getByRole('combobox', { name: 'Поле' })).toHaveFocus())
	})

	it('удаление: фокус на следующее условие, у последнего — на «Добавить условие»', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить условие 1' }))
		expect(last(emitted()).conditions.map(item => item.id)).toEqual(['b'])
		await waitFor(() => expect(within(row(1)).getByRole('combobox', { name: 'Поле' })).toHaveFocus())
		expect(within(row(1)).getByRole('combobox', { name: 'Сравнение' })).toHaveValue('gt')

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить условие 1' }))
		expect(last(emitted()).conditions).toEqual([])
		await waitFor(() => expect(screen.getByRole('button', { name: 'Добавить условие' })).toHaveFocus())
	})

	it('«Сбросить»: пустой фильтр в эмите и фокус на «Добавить условие»', async () => {
		const { emitted } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		await fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }))
		expect(last(emitted())).toEqual({ match: 'all', conditions: [] })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Добавить условие' })).toHaveFocus())
		expect(screen.queryByRole('button', { name: 'Сбросить' })).toBeNull()
	})
})
