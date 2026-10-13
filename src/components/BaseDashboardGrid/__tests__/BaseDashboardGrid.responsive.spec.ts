import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, render } from '@testing-library/vue'
import BaseDashboardGrid from '../ui/BaseDashboardGrid.vue'
import { lastCall, mockGridWidth } from './dashboardGrid.test-utils'
import type { DashboardLayouts } from '../types/BaseDashboardGrid.types'

const layouts: DashboardLayouts = {
	lg: [
		{ id: 'a', x: 0, y: 0, w: 2, h: 1 },
		{ id: 'b', x: 2, y: 0, w: 2, h: 1 },
	],
	md: [
		{ id: 'a', x: 0, y: 0, w: 2, h: 1 },
		{ id: 'c', x: 0, y: 1, w: 2, h: 1 },
	],
}
const props = { cols: { lg: 4, md: 2, sm: 1 }, gap: 0, rowHeight: 100, layouts }

const ids = (container: Element): string[] =>
	[...container.querySelectorAll('[data-item-id]')].map(item => (item as HTMLElement).dataset.itemId as string)
const itemOf = (container: Element, id: string): HTMLElement => container.querySelector(`[data-item-id="${id}"]`) as HTMLElement

async function mount(width: number, extra: Record<string, unknown> = {}) {
	mockGridWidth(width)
	const result = render(BaseDashboardGrid, { props: { ...props, ...extra } })
	await nextTick()
	return result
}

describe('BaseDashboardGrid адаптивные раскладки', () => {
	const NativeObserver = globalThis.ResizeObserver
	afterEach(() => {
		vi.restoreAllMocks()
		globalThis.ResizeObserver = NativeObserver
	})

	it('широкая сетка берёт раскладку lg, средняя — md', async () => {
		const wide = await mount(1200)
		expect(ids(wide.container)).toEqual(['a', 'b'])
		expect(itemOf(wide.container, 'b').style.width).toBe('600px')
		wide.unmount()

		const medium = await mount(700)
		expect(ids(medium.container)).toEqual(['a', 'c'])
		expect(itemOf(medium.container, 'c').style.transform).toBe('translate3d(0px, 100px, 0)')
	})

	it('узкая сетка без своей раскладки берёт ближайшую и подгоняет под колонки', async () => {
		const { container } = await mount(300)

		expect(ids(container)).toEqual(['a', 'c'])
		expect(itemOf(container, 'a').style.width).toBe('300px')
		expect(itemOf(container, 'c').style.transform).toBe('translate3d(0px, 100px, 0)')
	})

	it('свои границы брейкпоинтов и колонки lg по умолчанию', async () => {
		const { container } = await mount(700, {
			breakpoints: { md: 800 },
			layouts: { sm: [{ id: 's', x: 0, y: 0, w: 5, h: 1 }] },
			cols: { lg: 3 },
		})

		expect(ids(container)).toEqual(['s'])
		expect(itemOf(container, 's').style.width).toBe('700px')
	})

	it('при изменении ширины переключает раскладку', async () => {
		const callbacks: Array<() => void> = []
		globalThis.ResizeObserver = class {
			constructor(callback: () => void) {
				callbacks.push(callback)
			}
			observe = vi.fn()
			unobserve = vi.fn()
			disconnect = vi.fn()
		} as unknown as typeof ResizeObserver
		const { container } = await mount(1200)
		expect(ids(container)).toEqual(['a', 'b'])

		mockGridWidth(700)
		callbacks[0]()
		await nextTick()
		expect(ids(container)).toEqual(['a', 'c'])
	})

	it('правка в узкой сетке добавляет её раскладку и не трогает остальные', async () => {
		const onLayouts = vi.fn()
		const onChange = vi.fn()
		const { container } = await mount(300, { isEditable: true, 'onUpdate:layouts': onLayouts, onChange })
		const widget = itemOf(container, 'a')

		await fireEvent.keyDown(widget, { key: 'Enter' })
		await fireEvent.keyDown(widget, { key: 'ArrowDown' })
		await fireEvent.keyDown(widget, { key: 'Enter' })

		expect(lastCall(onLayouts).lg).toEqual(layouts.lg)
		expect(lastCall(onLayouts).md).toEqual(layouts.md)
		expect(lastCall(onLayouts).sm).toMatchObject([
			{ id: 'a', y: 1 },
			{ id: 'c', y: 0 },
		])
		expect(lastCall(onChange)).toMatchObject({ breakpoint: 'sm', id: 'a', action: 'move' })
	})
})
