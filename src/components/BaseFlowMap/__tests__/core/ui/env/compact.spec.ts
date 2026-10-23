import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { mapData, mountMap, stubFrame } from '../flowUi'
import { fireEvent, screen } from '@testing-library/vue'

async function compact(props: Parameters<typeof mountMap>[0] = {}) {
	stubFrame(400, 500)
	const result = mountMap(props)
	await nextTick()
	await nextTick()
	return result
}

describe('BaseFlowMap компактный вид', () => {
	it('меньше compactBreakpoint включается компактный режим, от порога — нет', async () => {
		const narrow = await compact()
		expect(narrow.container.firstElementChild).toHaveClass('base-flow-map--compact')
		narrow.unmount()
		vi.restoreAllMocks()
		stubFrame(640)
		const exact = mountMap()
		await nextTick()
		expect(exact.container.firstElementChild).not.toHaveClass('base-flow-map--compact')
	})

	it('порог задаётся пропсом', async () => {
		stubFrame(700)
		const result = mountMap({ compactBreakpoint: 800 })
		await nextTick()
		expect(result.container.firstElementChild).toHaveClass('base-flow-map--compact')
	})

	it('HTML-узлы становятся плитками без подзаголовка, SVG-узлы не меняются', async () => {
		const { container } = await compact({
			data: mapData({
				nodes: [
					{ id: 'a', kind: 'service', label: 'Alpha', subtitle: 'описание' },
					{ id: 'n', kind: 'note', label: 'Заметка' },
				],
				edges: [],
			}),
		})
		expect(container.querySelector('.base-flow-map__node--tile')).toBeInTheDocument()
		expect(screen.queryByText('описание')).not.toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__node--svg')).not.toHaveClass('base-flow-map__node--tile')
	})

	it('сценарий в компактном виде — плеер из одной кнопки запуска и шага', async () => {
		await compact({
			data: mapData({
				scenarios: [{ id: 's', label: 'Заказ', steps: [{ id: 'one', edge: 'e1', label: 'Создать' }] }],
			}),
			scenario: 's',
		})
		expect(await screen.findByRole('group', { name: UI_FLOW_SCENARIO.PANEL })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: UI_FLOW_SCENARIO.PLAY })).toBeInTheDocument()
	})

	it('подробности узла в компактном виде открываются нижней шторкой', async () => {
		await compact()
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(await screen.findByRole('dialog')).toBeInTheDocument()
	})

	describe('первая отрисовка и смена ширины корня', () => {
		let rootWidth = 0
		let observers: (() => void)[] = []
		const editMap = () => mountMap({ mode: 'edit' }, { attachTo: document.body })

		beforeEach(() => {
			observers = []
			vi.stubGlobal(
				'ResizeObserver',
				class {
					callback: () => void
					constructor(callback: () => void) {
						this.callback = callback
						observers.push(callback)
					}
					observe() {
						queueMicrotask(this.callback)
					}
					disconnect() {}
				},
			)
			vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
				return this.classList.contains('base-flow-map') ? rootWidth : 0
			})
			vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
		})
		afterEach(() => vi.unstubAllGlobals())

		it('edit, корень 341 px, область 0: compact есть сразу после монтирования', async () => {
			rootWidth = 341
			const result = editMap()
			await nextTick()
			await nextTick()
			expect(result.container.firstElementChild).toHaveClass('base-flow-map--compact')
		})

		it('смена ширины корня 1280 → 375 → 1280 переключает класс в обе стороны', async () => {
			rootWidth = 1280
			const result = editMap()
			await nextTick()
			const root = result.container.firstElementChild
			expect(root).not.toHaveClass('base-flow-map--compact')
			rootWidth = 375
			observers.forEach(callback => callback())
			await nextTick()
			expect(root).toHaveClass('base-flow-map--compact')
			rootWidth = 1280
			observers.forEach(callback => callback())
			await nextTick()
			expect(root).not.toHaveClass('base-flow-map--compact')
		})
	})
})
