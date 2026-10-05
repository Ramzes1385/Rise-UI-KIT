import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseTabs from '../ui/BaseTabs.vue'
import type { TabItem } from '../types/BaseTabs.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const TABS: TabItem[] = [
	{ id: 'info', label: 'Информация' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
]

const REAL_TRANSITION = { global: { stubs: { transition: false } } }

function rect(left: number, width: number): DOMRect {
	return { left, top: 0, width, height: 36, right: left + width, bottom: 36, x: left, y: 0, toJSON: () => ({}) } as DOMRect
}

function mockGeometry(): void {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function measure(this: Element) {
		const index = /-tab-(\d+)$/.exec(this.id)?.[1]
		return index === undefined ? rect(0, 400) : rect(10 + Number(index) * 100, 80 + Number(index))
	})
}

const indicator = (container: Element) => container.querySelector('.base-tabs__indicator')

const nextFrames = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))))

describe('BaseTabs: скользящий индикатор', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-motion')
		vi.unstubAllGlobals()
	})

	it('один индикатор на список: позиция и размер выбранной вкладки — переменные --indicator-* на tablist', async () => {
		mockGeometry()
		const { container } = render(BaseTabs, { props: { modelValue: 'specs', items: TABS } })
		const list = screen.getByRole('tablist')

		await waitFor(() => expect(indicator(container)).not.toBeNull())
		expect(container.querySelectorAll('.base-tabs__indicator')).toHaveLength(1)
		expect(indicator(container)).toHaveAttribute('aria-hidden', 'true')
		expect(list.style.getPropertyValue('--indicator-x')).toBe('110px')
		expect(list.style.getPropertyValue('--indicator-w')).toBe('81px')
		expect(list.style.getPropertyValue('--indicator-h')).toBe('36px')
	})

	it('смена вкладки переносит индикатор: новые значения переменных', async () => {
		mockGeometry()
		const { rerender } = render(BaseTabs, { props: { modelValue: 'info', items: TABS } })
		const list = screen.getByRole('tablist')
		await waitFor(() => expect(list.style.getPropertyValue('--indicator-x')).toBe('10px'))

		await rerender({ modelValue: 'reviews' })

		await waitFor(() => expect(list.style.getPropertyValue('--indicator-x')).toBe('210px'))
		expect(list.style.getPropertyValue('--indicator-w')).toBe('82px')
	})

	it('первый показ — на месте без перехода, затем переход включается', async () => {
		mockGeometry()
		const { container } = render(BaseTabs, { props: { modelValue: 'info', items: TABS } })

		await nextTick()
		expect(indicator(container)).toHaveClass('base-tabs__indicator--instant')
		await waitFor(() => expect(indicator(container)).not.toHaveClass('base-tabs__indicator--instant'))
	})

	it('пресет none: индикатор сразу на месте и после смены вкладки', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		mockGeometry()
		const { container, rerender } = render(BaseTabs, { props: { modelValue: 'info', items: TABS } })

		await nextFrames()
		expect(indicator(container)).toHaveClass('base-tabs__indicator--instant')
		await rerender({ modelValue: 'specs' })
		await nextFrames()
		expect(indicator(container)).toHaveClass('base-tabs__indicator--instant')
	})

	it('пресет none, поставленный после монтирования, выключает переход индикатора', async () => {
		mockGeometry()
		const { container } = render(BaseTabs, { props: { modelValue: 'info', items: TABS } })
		await waitFor(() => expect(indicator(container)).not.toHaveClass('base-tabs__indicator--instant'))

		document.documentElement.setAttribute('data-rise-motion', 'none')

		await waitFor(() => expect(indicator(container)).toHaveClass('base-tabs__indicator--instant'))
	})

	it('«уменьшить движение» в системе: индикатор сразу на месте', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		mockGeometry()
		const { container } = render(BaseTabs, { props: { modelValue: 'info', items: TABS } })

		await nextFrames()
		expect(indicator(container)).toHaveClass('base-tabs__indicator--instant')
	})

	it('без выбранной вкладки индикатора нет', async () => {
		const { container } = render(BaseTabs, { props: { modelValue: 'missing', items: TABS } })

		await nextTick()
		expect(indicator(container)).toBeNull()
		expect(screen.getByRole('tablist').style.getPropertyValue('--indicator-x')).toBe('')
	})
})

describe('BaseTabs: смена панели', () => {
	it('новая панель появляется, старая уходит поверх и удаляется; tabpanel остаётся тем же', async () => {
		const { container, rerender } = render(BaseTabs, {
			props: { modelValue: 'info', items: TABS },
			slots: { 'panel-info': '<p>Про товар</p>', 'panel-specs': '<p>Вес и размеры</p>' },
			...REAL_TRANSITION,
		})
		const panel = screen.getByRole('tabpanel')
		expect(container.querySelector('.base-tabs__panel')).not.toHaveClass('base-tabs-panel-enter-active')

		await rerender({ modelValue: 'specs' })

		const [leaving, entering] = container.querySelectorAll('.base-tabs__panel')
		expect(leaving).toHaveTextContent('Про товар')
		expect(leaving).toHaveClass('base-tabs-panel-leave-active')
		expect(entering).toHaveTextContent('Вес и размеры')
		expect(entering).toHaveClass('base-tabs-panel-enter-active')
		expect(screen.getByRole('tabpanel')).toBe(panel)
		await waitFor(() => expect(container.querySelectorAll('.base-tabs__panel')).toHaveLength(1))
		expect(panel).toHaveTextContent('Вес и размеры')
	})

	it('вкладка без своего слота и без default — панель пустая, без обёртки', async () => {
		const { container, rerender } = render(BaseTabs, {
			props: { modelValue: 'info', items: TABS },
			slots: { 'panel-info': '<p>Про товар</p>' },
			...REAL_TRANSITION,
		})

		await rerender({ modelValue: 'specs' })

		await waitFor(() => expect(container.querySelector('.base-tabs__panel')).toBeNull())
		expect(container.querySelector('.base-tabs__content')).toBeEmptyDOMElement()
	})
})

describe('BaseTabs: кнопки прокрутки', () => {
	it('кнопка появляется через Transition base-tabs-scroll', async () => {
		const { container } = render(BaseTabs, { props: { modelValue: 'info', items: TABS, isScrollable: true }, ...REAL_TRANSITION })
		const list = screen.getByRole('tablist')
		Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 600 })
		Object.defineProperty(list, 'clientWidth', { configurable: true, value: 300 })

		list.dispatchEvent(new Event('scroll'))

		await waitFor(() => expect(container.querySelector('.base-tabs__scroll-btn--right')).toHaveClass('base-tabs-scroll-enter-active'))
	})

	it('кнопки прокрутки листают список на страницу влево и вправо', async () => {
		const { container } = render(BaseTabs, { props: { modelValue: 'info', items: TABS, isScrollable: true } })
		const list = screen.getByRole('tablist')
		const scrollBy = vi.fn()
		Object.assign(list, { scrollBy, scrollLeft: 50 })
		Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 600 })
		Object.defineProperty(list, 'clientWidth', { configurable: true, value: 300 })
		list.dispatchEvent(new Event('scroll'))

		await waitFor(() => expect(container.querySelector('.base-tabs__scroll-btn--left')).not.toBeNull())
		await fireEvent.click(container.querySelector('.base-tabs__scroll-btn--left')!)
		await fireEvent.click(container.querySelector('.base-tabs__scroll-btn--right')!)

		expect(scrollBy).toHaveBeenNthCalledWith(1, { left: -180, behavior: 'smooth' })
		expect(scrollBy).toHaveBeenNthCalledWith(2, { left: 180, behavior: 'smooth' })
	})
})

describe('BaseTabs: все вкладки отключены', () => {
	it('стрелки не выбирают вкладку', async () => {
		const items = TABS.map(item => ({ ...item, isDisabled: true }))
		const { emitted } = render(BaseTabs, { props: { modelValue: 'info', items } })

		await fireEvent.keyDown(screen.getAllByRole('tab')[0], { key: 'ArrowRight' })

		expect(emitted()).not.toHaveProperty('update:modelValue')
	})
})

describe('BaseTabs: отмена перетаскивания', () => {
	it('pointercancel снимает режим перетаскивания', async () => {
		render(BaseTabs, { props: { modelValue: 'info', items: TABS } })
		const list = screen.getByRole('tablist')
		Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 600 })
		Object.defineProperty(list, 'clientWidth', { configurable: true, value: 300 })

		await fireEvent.pointerDown(list, { pointerType: 'mouse', clientX: 200 })
		await fireEvent.pointerMove(list, { pointerType: 'mouse', clientX: 150 })
		expect(list).toHaveClass('base-tabs__list--dragging')
		await fireEvent.pointerCancel(list)

		expect(list).not.toHaveClass('base-tabs__list--dragging')
	})
})
