import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTable from '../ui/BaseTable.vue'
import { flushPromises } from '@vue/test-utils'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { TableColumn, TableRow } from '../types/BaseTable.types'

const globalConfig = {
	stubs: {
		BaseInput: true,
		BaseSelect: true,
		BaseButton: true,
		BaseCheckbox: true,
		BaseText: { template: '<span><slot /></span>' },
		BaseIcon: true,
		BaseLoader: true,
	},
}

describe('BaseTable integration', () => {
	it('должен эмитить sort при клике на заголовок', async () => {
		const user = userEvent.setup()
		const columns: TableColumn[] = [{ key: 'name', label: 'Name', isSortable: true }]
		const { emitted } = render(BaseTable, {
			props: { columns, rows: [] },
			global: globalConfig,
		})

		await user.click(screen.getByText('Name'))
		expect(emitted()).toHaveProperty('sort')
	})
})

describe('BaseTable integration — раскрытие строки и prefers-reduced-motion', () => {
	const columns: TableColumn[] = [{ key: 'name', label: 'Имя' }]
	const rows: TableRow[] = [{ id: 1, data: { name: 'Иван' }, isExpandable: true }]
	const originalMatchMedia = window.matchMedia

	function mockReducedMotion(isReduced: boolean): void {
		window.matchMedia = vi.fn((query: string) => ({
			matches: isReduced && query.includes('prefers-reduced-motion: reduce'),
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})) as unknown as typeof window.matchMedia
	}

	function renderExpandable() {
		return render(BaseTable, {
			props: { columns, rows },
			slots: { 'expanded-content': '<p>Подробности</p>' },
			global: { ...globalConfig, stubs: { ...globalConfig.stubs, BaseButton: false, transition: false } },
		})
	}

	afterEach(() => {
		window.matchMedia = originalMatchMedia
		vi.useRealTimers()
	})

	it('при reduce строка раскрывается сразу, без высоты и прозрачности от анимации', async () => {
		mockReducedMotion(true)
		vi.useFakeTimers()
		renderExpandable()

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть строку' }))

		const details = screen.getByText('Подробности')
		expect(details).toBeVisible()
		const wrapper = details.parentElement as HTMLElement
		expect(wrapper.style.height).toBe('')
		expect(wrapper.style.overflow).toBe('')
		expect(wrapper.style.opacity).toBe('')
	})

	it('при reduce строка сворачивается сразу, без ожидания конца перехода', async () => {
		mockReducedMotion(true)
		vi.useFakeTimers()
		renderExpandable()
		const button = screen.getByRole('button', { name: 'Развернуть строку' })

		await fireEvent.click(button)
		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть строку' }))
		await nextTick()

		expect(screen.queryByText('Подробности')).not.toBeInTheDocument()
	})

	it('без reduce сворачивание анимируется: содержимое уходит после перехода', async () => {
		mockReducedMotion(false)
		vi.useFakeTimers()
		renderExpandable()

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть строку' }))
		vi.runAllTimers()
		await nextTick()
		const wrapper = screen.getByText('Подробности').parentElement as HTMLElement
		expect(wrapper.style.height).toBe('')

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть строку' }))
		await nextTick()
		expect(screen.getByText('Подробности')).toBeInTheDocument()

		vi.runAllTimers()
		await nextTick()
		expect(screen.queryByText('Подробности')).not.toBeInTheDocument()
	})
})

describe('BaseTable integration — tabindex прокручиваемой обёртки', () => {
	const ROW_HEIGHT = 40
	const VISIBLE_HEIGHT = 120
	const columns: TableColumn[] = [{ key: 'name', label: 'Имя' }]
	const makeRows = (count: number): TableRow[] =>
		Array.from({ length: count }, (_, index) => ({ id: index + 1, data: { name: `Строка ${index + 1}` } }))

	const originalScrollHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollHeight')
	const originalClientHeight = Object.getOwnPropertyDescriptor(Element.prototype, 'clientHeight')

	beforeEach(() => {
		Object.defineProperty(Element.prototype, 'scrollHeight', {
			configurable: true,
			get(this: Element) {
				return this.querySelectorAll('tr').length * ROW_HEIGHT
			},
		})
		Object.defineProperty(Element.prototype, 'clientHeight', {
			configurable: true,
			get(this: Element) {
				return this.classList.contains('base-table__wrapper') ? VISIBLE_HEIGHT : 0
			},
		})
	})

	afterEach(() => {
		Object.defineProperty(Element.prototype, 'scrollHeight', originalScrollHeight!)
		Object.defineProperty(Element.prototype, 'clientHeight', originalClientHeight!)
	})

	function scrollRegion(): HTMLElement {
		return screen.getByRole('table').parentElement as HTMLElement
	}

	it('обёртка получает tabindex, когда строк становится больше, чем помещается, и теряет — когда меньше', async () => {
		const { rerender } = render(BaseTable, {
			props: { columns, rows: makeRows(1), pageSize: 50 },
			global: globalConfig,
		})
		await flushPromises()
		expect(scrollRegion()).not.toHaveAttribute('tabindex')

		await rerender({ columns, rows: makeRows(10), pageSize: 50 })
		await flushPromises()
		expect(scrollRegion()).toHaveAttribute('tabindex', '0')

		await rerender({ columns, rows: makeRows(1), pageSize: 50 })
		await flushPromises()
		expect(scrollRegion()).not.toHaveAttribute('tabindex')
	})
})
