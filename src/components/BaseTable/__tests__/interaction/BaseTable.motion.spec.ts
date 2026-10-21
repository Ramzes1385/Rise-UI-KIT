import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTable from '../../ui/BaseTable.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { TableColumn, TableRow } from '../../types/BaseTable.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true },
	{ key: 'total', label: 'Сумма', sortType: 'number', isSortable: true },
]

const ROWS: TableRow[] = [
	{ id: 'a', data: { name: 'Анна', total: 300 } },
	{ id: 'b', data: { name: 'Борис', total: 100 } },
	{ id: 'c', data: { name: 'Вера', total: 200 } },
]

const ROW_HEIGHT = 44

const animate = vi.fn()

function bodyRows(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('tbody > tr.base-table__tr')]
}

function rowNamed(name: string): HTMLElement {
	return screen.getByText(name).closest('tr')!
}

beforeEach(() => {
	animate.mockClear()
	Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate })
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		const index = this.parentElement ? [...this.parentElement.children].indexOf(this) : 0
		return new DOMRect(0, index * ROW_HEIGHT, 100, ROW_HEIGHT)
	})
})

afterEach(() => {
	vi.restoreAllMocks()
	delete (HTMLElement.prototype as { animate?: unknown }).animate
	document.documentElement.removeAttribute('data-rise-reduced-motion')
})

describe('BaseTable: сортировка (FLIP)', () => {
	it('строки едут со старого места на новое: transform на токенах длительности и кривой', async () => {
		render(BaseTable, { props: { columns: COLUMNS, rows: ROWS } })
		const anna = rowNamed('Анна')

		await fireEvent.click(screen.getByRole('button', { name: 'Сумма' }))
		await nextTick()

		expect(bodyRows().map(row => row.textContent)).toEqual(['Борис100', 'Вера200', 'Анна300'])
		expect(animate).toHaveBeenCalledTimes(3)
		const call = animate.mock.calls.find((_, index) => animate.mock.contexts[index] === anna)!
		expect(call).toEqual([
			[{ transform: `translateY(${-2 * ROW_HEIGHT}px)` }, { transform: 'none' }],
			{ duration: 320, easing: 'cubic-bezier(0.2,0,0,1)' },
		])
	})

	it('новые строки и строки на прежнем месте не анимируются', async () => {
		const { rerender } = render(BaseTable, { props: { columns: COLUMNS, rows: ROWS } })

		await rerender({ rows: [ROWS[0], { id: 'd', data: { name: 'Глеб', total: 400 } }, ROWS[2]] })

		expect(animate).not.toHaveBeenCalled()
	})

	it('при выключенном движении и в виртуальном режиме — сразу на новом месте', async () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		const { rerender } = render(BaseTable, { props: { columns: COLUMNS, rows: ROWS } })
		await fireEvent.click(screen.getByRole('button', { name: 'Сумма' }))
		expect(animate).not.toHaveBeenCalled()

		document.documentElement.removeAttribute('data-rise-reduced-motion')
		await rerender({ isVirtual: true, height: '300px' })
		await fireEvent.click(screen.getByRole('button', { name: 'Сумма' }))
		await nextTick()

		expect(bodyRows()[0]).toHaveTextContent('Анна')
		expect(animate).not.toHaveBeenCalled()
	})
})

describe('BaseTable: скелетон → строки', () => {
	it('после скелетона строки проявляются (класс --reveal), следующая смена строк его снимает', async () => {
		const { container, rerender } = render(BaseTable, { props: { columns: COLUMNS, rows: [], isLoading: true } })
		const tbody = container.querySelector('tbody')!
		expect(tbody).not.toHaveClass('base-table__tbody--reveal')

		await rerender({ rows: ROWS, isLoading: false })
		expect(tbody).toHaveClass('base-table__tbody--reveal')

		await rerender({ rows: ROWS.slice(0, 2) })
		expect(tbody).not.toHaveClass('base-table__tbody--reveal')
	})

	it('без строк после загрузки и при загрузке поверх строк — без проявления', async () => {
		const { container, rerender } = render(BaseTable, { props: { columns: COLUMNS, rows: [], isLoading: true } })
		const tbody = container.querySelector('tbody')!

		await rerender({ isLoading: false })
		expect(tbody).not.toHaveClass('base-table__tbody--reveal')

		await rerender({ rows: ROWS, isLoading: true })
		await rerender({ isLoading: false })
		expect(tbody).not.toHaveClass('base-table__tbody--reveal')
	})
})

describe('BaseTable: раскрытие строки', () => {
	it('переход раскрытия без CSS-классов: высоту ведёт useExpandTransition, при выключенном движении — сразу', async () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		render(BaseTable, {
			props: { columns: COLUMNS, rows: [{ ...ROWS[0], isExpandable: true }] },
			slots: { 'expanded-content': '<p>Подробности</p>' },
			global: { stubs: { Transition: false } },
		})

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть строку' }))
		const wrapper = document.querySelector<HTMLElement>('.base-table__expanded-wrapper')!

		expect(wrapper).toBeInTheDocument()
		expect(wrapper.className).toBe('base-table__expanded-wrapper')
		expect(wrapper.style.height).toBe('')
	})
})
