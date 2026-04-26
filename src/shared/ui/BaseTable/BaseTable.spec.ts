/**
 * Unit-тесты для BaseTable.
 * Проверяют рендер и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import type { TableColumn, TableRow } from './BaseTable.types'
import BaseTable from './BaseTable.vue'

/** Стабаем дочерние компоненты для изоляции */
const globalConfig = {
	stubs: {
		BaseInput: true,
		BaseSelect: true,
		BaseButton: true,
		BaseCheckbox: true,
		BaseText: true,
		BaseIcon: true,
		BaseLoader: true,
	},
}

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя' },
	{ key: 'age', label: 'Возраст' },
]

const ROWS: TableRow[] = [
	{ id: '1', data: { name: 'Иван', age: 25 } },
	{ id: '2', data: { name: 'Мария', age: 30 } },
]

describe('BaseTable unit', () => {
	describe('рендер', () => {
		it('должен рендерить таблицу', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table')).toBeInTheDocument()
		})

		it('должен рендерить заголовки колонок', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(screen.getByText('Имя')).toBeInTheDocument()
			expect(screen.getByText('Возраст')).toBeInTheDocument()
		})

		it('должен рендерить данные строк', () => {
			render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			expect(screen.getByText('Иван')).toBeInTheDocument()
			expect(screen.getByText('Мария')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('должен не добавлять модификатор для default', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS },
				global: globalConfig,
			})

			const table = container.querySelector('.base-table')
			expect(table?.classList.contains('base-table--default')).toBe(false)
			expect(table?.classList.contains('base-table--bordered')).toBe(false)
			expect(table?.classList.contains('base-table--striped')).toBe(false)
		})

		it('должен применять модификатор --bordered', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, variant: 'bordered' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table')?.classList.contains('base-table--bordered')).toBe(true)
		})

		it('должен применять модификатор --striped', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: ROWS, variant: 'striped' },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table')?.classList.contains('base-table--striped')).toBe(true)
		})
	})

	describe('пустое состояние', () => {
		it('должен рендерить таблицу без строк', () => {
			const { container } = render(BaseTable, {
				props: { columns: COLUMNS, rows: [] },
				global: globalConfig,
			})

			expect(container.querySelector('.base-table__table')).toBeInTheDocument()
		})
	})
})
