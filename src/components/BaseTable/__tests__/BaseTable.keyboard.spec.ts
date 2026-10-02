import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTable from '../ui/BaseTable.vue'
import userEvent from '@testing-library/user-event'
import { render, screen, within } from '@testing-library/vue'
import type { TableColumn, TableRow } from '../types/BaseTable.types'

const columns: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true },
	{ key: 'city', label: 'Город' },
]

function makeRows(count: number): TableRow[] {
	return Array.from({ length: count }, (_, index) => ({ id: index + 1, data: { name: `Имя ${index + 1}`, city: `Город ${index + 1}` } }))
}

function bodyRows(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('tbody tr.base-table__tr')]
}

function selectAllInput(): HTMLInputElement {
	return screen.getByRole('checkbox', { name: 'Выбрать все строки' }) as HTMLInputElement
}

describe('BaseTable — № 7: «Выбрать все» в частичном состоянии', () => {
	it('часть выбранных строк даёт indeterminate, все — checked', async () => {
		const user = userEvent.setup()
		render(BaseTable, { props: { columns, rows: makeRows(2), behavior: { selectable: true } } })

		expect(selectAllInput().indeterminate).toBe(false)
		await user.click(screen.getByRole('checkbox', { name: 'Выбрать строку 1' }))
		expect(selectAllInput().indeterminate).toBe(true)
		await user.click(screen.getByRole('checkbox', { name: 'Выбрать строку 2' }))
		expect(selectAllInput().indeterminate).toBe(false)
		expect(selectAllInput()).toBeChecked()
	})
})

describe('BaseTable — TBL-3: смена rows', () => {
	it('новая ссылка rows не сбрасывает страницу и выбор', async () => {
		const user = userEvent.setup()
		const rows = makeRows(6)
		const { rerender, emitted } = render(BaseTable, { props: { columns, rows, pageSize: 2, behavior: { selectable: true } } })

		await user.click(screen.getByRole('button', { name: /3/ }))
		expect(screen.getByText('Имя 5')).toBeInTheDocument()
		await user.click(screen.getByRole('checkbox', { name: 'Выбрать строку 5' }))

		await rerender({ rows: rows.map(row => ({ ...row })) })
		expect(screen.getByText('Имя 5')).toBeInTheDocument()
		expect(screen.getByRole('checkbox', { name: 'Выбрать строку 5' })).toBeChecked()
		expect(emitted('page-change')).toEqual([[3]])
	})

	it('страница сдвигается на последнюю существующую, когда строк стало меньше', async () => {
		const user = userEvent.setup()
		const rows = makeRows(6)
		const { rerender } = render(BaseTable, { props: { columns, rows, pageSize: 2 } })

		await user.click(screen.getByRole('button', { name: /3/ }))
		await rerender({ rows: rows.slice(0, 3) })
		await nextTick()
		expect(screen.getByText('Имя 3')).toBeInTheDocument()
		expect(screen.queryByText('Нет данных')).not.toBeInTheDocument()
	})
})

describe('BaseTable — TBL-4: догрузка', () => {
	it('строки, дописанные родителем по load-more, не сворачивают показанные', async () => {
		const user = userEvent.setup()
		const rows = makeRows(4)
		const { rerender, emitted } = render(BaseTable, { props: { columns, rows, pageSize: 2, loadMode: 'button' } })

		await user.click(screen.getByRole('button', { name: 'Загрузить еще' }))
		expect(bodyRows()).toHaveLength(4)
		expect(emitted('load-more')).toHaveLength(1)
		await rerender({ rows: makeRows(6) })
		expect(bodyRows()).toHaveLength(4)
	})

	it('hasMore оставляет кнопку, когда переданная порция показана целиком', async () => {
		const user = userEvent.setup()
		const { rerender, emitted } = render(BaseTable, {
			props: { columns, rows: makeRows(2), pageSize: 2, loadMode: 'button', hasMore: true },
		})

		await user.click(screen.getByRole('button', { name: 'Загрузить еще' }))
		expect(emitted('load-more')).toHaveLength(1)
		await rerender({ rows: makeRows(4), hasMore: false })
		expect(bodyRows()).toHaveLength(4)
		expect(screen.queryByRole('button', { name: 'Загрузить еще' })).not.toBeInTheDocument()
	})
})

describe('BaseTable — тексты пустой таблицы', () => {
	it('«Нет данных» без строк и «Ничего не найдено», когда поиск скрыл все строки', async () => {
		const user = userEvent.setup()
		const { rerender } = render(BaseTable, { props: { columns, rows: [], features: { search: true } } })
		expect(screen.getByText('Нет данных')).toBeInTheDocument()

		await rerender({ rows: makeRows(2) })
		await user.type(screen.getByLabelText('Поиск по таблице'), 'нет такого')
		expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
	})

	it('emptyFilteredText и isFiltered в слоте empty', async () => {
		const user = userEvent.setup()
		render(BaseTable, {
			props: { columns, rows: makeRows(1), features: { search: true }, emptyFilteredText: 'Измените запрос' },
		})
		await user.type(screen.getByLabelText('Поиск по таблице'), 'zzz')
		expect(screen.getByText('Измените запрос')).toBeInTheDocument()
	})

	it('слот empty получает isFiltered', async () => {
		const user = userEvent.setup()
		render(BaseTable, {
			props: { columns, rows: makeRows(1), features: { search: true } },
			slots: { empty: '<template #empty="{ isFiltered }">отфильтровано: {{ isFiltered }}</template>' },
		})
		await user.type(screen.getByLabelText('Поиск по таблице'), 'zzz')
		expect(screen.getByText('отфильтровано: true')).toBeInTheDocument()
	})
})

describe('BaseTable — строки с клавиатуры (row-click)', () => {
	it('без слушателя row-click строки не в порядке Tab', () => {
		render(BaseTable, { props: { columns, rows: makeRows(2) } })
		expect(bodyRows()[0]).not.toHaveAttribute('tabindex')
	})

	it('roving tabindex: стрелки, Home и End переводят фокус, Enter и пробел дают row-click', async () => {
		const user = userEvent.setup()
		const onRowClick = vi.fn()
		const rows = makeRows(3)
		render(BaseTable, { props: { columns: [{ key: 'name', label: 'Имя' }], rows, 'onRow-click': onRowClick } })
		const [first, second, third] = bodyRows()
		expect(first).toHaveAttribute('tabindex', '0')
		expect(second).toHaveAttribute('tabindex', '-1')

		await user.tab()
		expect(first).toHaveFocus()
		await user.keyboard('{ArrowDown}')
		expect(second).toHaveFocus()
		expect(second).toHaveAttribute('tabindex', '0')
		expect(first).toHaveAttribute('tabindex', '-1')
		await user.keyboard('{End}')
		expect(third).toHaveFocus()
		await user.keyboard('{ArrowDown}')
		expect(third).toHaveFocus()
		await user.keyboard('{Home}')
		expect(first).toHaveFocus()
		await user.keyboard('{ArrowUp}')
		expect(first).toHaveFocus()

		await user.keyboard('{Enter}')
		await user.keyboard(' ')
		expect(onRowClick).toHaveBeenCalledTimes(2)
		expect(onRowClick).toHaveBeenCalledWith(rows[0])
		await user.keyboard('a')
		expect(onRowClick).toHaveBeenCalledTimes(2)
	})

	it('клик по кнопке в ячейке не даёт row-click, клик по тексту строки — даёт', async () => {
		const user = userEvent.setup()
		const onRowClick = vi.fn()
		render(BaseTable, {
			props: { columns, rows: makeRows(1), 'onRow-click': onRowClick },
			slots: { 'cell-city': '<template #cell-city="{ value }"><button type="button">{{ value }}</button></template>' },
		})
		await user.click(screen.getByRole('button', { name: 'Город 1' }))
		expect(onRowClick).not.toHaveBeenCalled()
		await user.click(screen.getByText('Имя 1'))
		expect(onRowClick).toHaveBeenCalledTimes(1)
	})

	it('Enter на кнопке внутри строки не даёт row-click', async () => {
		const user = userEvent.setup()
		const onRowClick = vi.fn()
		render(BaseTable, {
			props: { columns, rows: makeRows(1), 'onRow-click': onRowClick },
			slots: { 'cell-city': '<template #cell-city="{ value }"><button type="button">{{ value }}</button></template>' },
		})
		screen.getByRole('button', { name: 'Город 1' }).focus()
		await user.keyboard('{Enter}')
		expect(onRowClick).not.toHaveBeenCalled()
	})

	it('после смены страницы tabindex 0 получает первая показанная строка', async () => {
		const user = userEvent.setup()
		render(BaseTable, { props: { columns: [{ key: 'name', label: 'Имя' }], rows: makeRows(4), pageSize: 2, 'onRow-click': vi.fn() } })
		await user.tab()
		await user.keyboard('{ArrowDown}')
		await user.click(screen.getByRole('button', { name: /2/ }))
		expect(bodyRows()[0]).toHaveAttribute('tabindex', '0')
	})
})

describe('BaseTable — ресайз колонки с клавиатуры', () => {
	const resizable: TableColumn[] = [
		{ key: 'name', label: 'Имя', width: '120px' },
		{ key: 'city', label: 'Город', width: '100px' },
	]

	it('ручка — separator с именем и шириной, стрелки меняют ширину', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseTable, { props: { columns: resizable, rows: makeRows(1), behavior: { resizable: true } } })
		const handle = screen.getByRole('separator', { name: 'Ширина колонки: Имя' })
		expect(handle).toHaveAttribute('aria-valuenow', '120')
		expect(handle).toHaveAttribute('aria-orientation', 'vertical')

		handle.focus()
		await user.keyboard('{ArrowRight}')
		expect(emitted('column-resize')).toEqual([['name', 130]])
		await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
		expect(emitted('column-resize')?.[1]).toEqual(['name', 80])
		await user.keyboard('{ArrowUp}')
		expect(emitted('column-resize')).toHaveLength(2)
		expect(screen.getByRole('separator', { name: 'Ширина колонки: Имя' })).toHaveAttribute('aria-valuenow', '80')
	})

	it('у колонки без ширины в px aria-valuenow — ширина ячейки', () => {
		render(BaseTable, { props: { columns: [{ key: 'name', label: 'Имя' }], rows: makeRows(1), behavior: { resizable: true } } })
		expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '0')
	})
})

describe('BaseTable — слот header-<key> у сортируемой колонки', () => {
	it('слот рисуется внутри кнопки сортировки и получает sortDirection', async () => {
		const user = userEvent.setup()
		render(BaseTable, {
			props: { columns, rows: makeRows(2) },
			slots: {
				'header-name':
					'<template #header-name="{ column, sortDirection }"><b>{{ column.label }} ({{ String(sortDirection) }})</b></template>',
				'header-city': '<template #header-city="{ sortDirection }"><i>город {{ String(sortDirection) }}</i></template>',
			},
		})
		const button = screen.getByRole('button', { name: /Имя/ })
		expect(within(button).getByText('Имя (null)')).toBeInTheDocument()
		await user.click(button)
		expect(within(button).getByText('Имя (asc)')).toBeInTheDocument()
		expect(screen.getByText('город null')).toBeInTheDocument()
	})
})

describe('BaseTable — закреплённые колонки', () => {
	it('служебные колонки закрепляются, смещения закреплённых колонок считаются по ширинам ячеек', async () => {
		const widths: Record<string, number> = { 'base-table__th--check': 40, 'base-table__th--number': 30 }
		const spy = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
			const match = Object.keys(widths).find(className => this.classList.contains(className))
			return match ? widths[match] : 100
		})
		render(BaseTable, {
			props: {
				columns: [
					{ key: 'name', label: 'Имя', isSticky: 'left' },
					{ key: 'code', label: 'Код', isSticky: 'left' },
					{ key: 'city', label: 'Город' },
					{ key: 'sum', label: 'Сумма', isSticky: 'right' },
					{ key: 'act', label: 'Действия', isSticky: 'right' },
				],
				rows: makeRows(1),
				behavior: { selectable: true },
				features: { rowNumber: true },
			},
		})
		await nextTick()
		const table = document.querySelector('table') as HTMLElement
		expect(table).toHaveClass('base-table__table--sticky-service')
		expect(table.style.getPropertyValue('--tbl-sticky-check')).toBe('0px')
		expect(table.style.getPropertyValue('--tbl-sticky-number')).toBe('40px')
		const headers = [...document.querySelectorAll<HTMLElement>('thead th')]
		expect(headers[2].style.left).toBe('70px')
		expect(headers[3].style.left).toBe('170px')
		expect(headers[5].style.right).toBe('100px')
		expect(headers[6].style.right).toBe('0px')
		spy.mockRestore()
	})

	it('без закреплённых колонок смещения не считаются', () => {
		render(BaseTable, { props: { columns, rows: makeRows(1), behavior: { selectable: true } } })
		expect(document.querySelector('table')).not.toHaveClass('base-table__table--sticky-service')
	})

	it('при снятии закрепления наблюдение за заголовком прекращается', async () => {
		const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')
		const { rerender, unmount } = render(BaseTable, {
			props: { columns: [{ key: 'name', label: 'Имя', isSticky: 'right' }], rows: makeRows(1) },
		})
		await rerender({ columns: [{ key: 'name', label: 'Имя' }] })
		expect(disconnect).toHaveBeenCalled()
		unmount()
		disconnect.mockRestore()
	})
})
