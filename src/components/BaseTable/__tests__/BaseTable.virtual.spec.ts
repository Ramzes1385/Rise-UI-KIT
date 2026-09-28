/** jsdom не считает раскладку: высота области и смещения строк подменяются. */

import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTable from '../ui/BaseTable.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { TableColumn, TableRow } from '../types/BaseTable.types'

const COLUMNS: TableColumn[] = [
	{ key: 'title', label: 'Заказ' },
	{ key: 'city', label: 'Город' },
]

function makeRows(count: number): TableRow[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `order-${index}`,
		data: { title: `Заказ № ${index + 1}`, city: 'Волгоград' },
	}))
}

/** ResizeObserver с записью наблюдаемых элементов: колбэк наблюдателя tbody вызывается вручную */
let observers: { callback: () => void; targets: Element[]; disconnect: ReturnType<typeof vi.fn> }[] = []

class ResizeObserverMock {
	targets: Element[] = []
	disconnect = vi.fn()
	callback: () => void
	constructor(callback: () => void) {
		this.callback = callback
		observers.push(this)
	}
	observe(target: Element): void {
		this.targets.push(target)
	}
	unobserve(): void {}
}

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
		configurable: true,
		get(this: HTMLElement) {
			return this.classList.contains('base-table__wrapper') ? 300 : 0
		},
	})
})

afterAll(() => {
	delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight
})

beforeEach(() => {
	observers = []
	vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

afterEach(() => vi.unstubAllGlobals())

function dataRows(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('tr[data-virtual-index]')]
}

function spacers(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('.base-table__spacer-cell')]
}

describe('BaseTable: виртуальная прокрутка', () => {
	it('рендерит видимые строки с запасом и распорки; таблица объявляет полное число строк', async () => {
		render(BaseTable, {
			props: { columns: COLUMNS, rows: makeRows(1000), height: '300px', isVirtual: true, features: { rowNumber: true } },
		})
		await nextTick()
		// 300px области по 44px — строки 0–6 и 5 строк запаса снизу
		expect(dataRows()).toHaveLength(12)
		expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '1001')
		expect(screen.getAllByRole('row')[0]).toHaveAttribute('aria-rowindex', '1')
		expect(dataRows()[0]).toHaveAttribute('aria-rowindex', '2')
		expect(spacers()[0]).toHaveStyle({ height: '0px' })
		expect(spacers()[1]).toHaveStyle({ height: `${(1000 - 12) * 44}px` })
		expect(spacers()[0].closest('tr')).toHaveAttribute('aria-hidden', 'true')
	})

	it('прокрутка сдвигает строки; номера и чередование — по месту строки во всей таблице', async () => {
		const { container } = render(BaseTable, {
			props: { columns: COLUMNS, rows: makeRows(1000), height: '300px', isVirtual: true, features: { rowNumber: true } },
		})
		await nextTick()
		const wrapper = container.querySelector('.base-table__wrapper') as HTMLElement
		wrapper.scrollTop = 4400
		await fireEvent.scroll(wrapper)
		await nextTick()
		const rows = dataRows()
		expect(rows[0]).toHaveAttribute('data-virtual-index', '95')
		expect(rows[0]).toHaveAttribute('aria-rowindex', '97')
		expect(rows[0]).toHaveTextContent('96')
		expect(rows[0]).toHaveClass('base-table__tr--even')
		expect(spacers()[0]).toHaveStyle({ height: `${95 * 44}px` })
	})

	it('замеряет строки по началу следующей строки и распорки: высота уточняется', async () => {
		render(BaseTable, { props: { columns: COLUMNS, rows: makeRows(1000), height: '300px', isVirtual: true } })
		await nextTick()
		const rows = dataRows()
		rows.forEach((row, index) => Object.defineProperty(row, 'offsetTop', { value: index * 60, configurable: true }))
		const endSpacer = spacers()[1].closest('tr') as HTMLElement
		Object.defineProperty(endSpacer, 'offsetTop', { value: rows.length * 60, configurable: true })
		const tbody = document.querySelector('.base-table__tbody') as HTMLElement
		const tbodyObserver = observers.find(observer => observer.targets.includes(tbody))
		tbodyObserver?.callback()
		await nextTick()
		// Строки по 60px: в 300px помещаются 0–5, с запасом — 11 строк
		expect(dataRows()).toHaveLength(11)
		expect(spacers()[1]).toHaveStyle({ height: `${12 * 60 + 988 * 44 - 11 * 60}px` })
	})

	it('без height виртуальный режим не включается; выключение снимает наблюдение, размонтирование — тоже', async () => {
		const { rerender, unmount } = render(BaseTable, { props: { columns: COLUMNS, rows: makeRows(30), isVirtual: true } })
		await nextTick()
		expect(document.querySelectorAll('tbody tr')).toHaveLength(30)
		expect(spacers()).toHaveLength(0)
		expect(screen.getByRole('table')).not.toHaveAttribute('aria-rowcount')
		await rerender({ height: '300px' })
		await nextTick()
		expect(dataRows()).toHaveLength(12)
		const tbody = document.querySelector('.base-table__tbody') as HTMLElement
		const tbodyObserver = observers.find(observer => observer.targets.includes(tbody))
		await rerender({ isVirtual: false })
		await nextTick()
		expect(tbodyObserver?.disconnect).toHaveBeenCalled()
		expect(document.querySelectorAll('tbody tr')).toHaveLength(30)
		await rerender({ isVirtual: true })
		await nextTick()
		const latest = observers.filter(observer => observer.targets.includes(tbody)).pop()
		unmount()
		expect(latest?.disconnect).toHaveBeenCalled()
	})
})
