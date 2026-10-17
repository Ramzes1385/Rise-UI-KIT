import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_PANELS } from '@/locales/messages'
import userEvent from '@testing-library/user-event'
import FlowMinimap from '../../ui/panels/FlowMinimap.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { FlowLayoutResult } from '../../types/api/flowLayout.types'
import { createFakeContext, panelsData, provideContext, stubBox } from '../fixtures/panelsContext'

function mount(options: Parameters<typeof createFakeContext>[0] = {}) {
	const fake = createFakeContext(options)
	const view = render(FlowMinimap, { global: provideContext(fake.context) })
	return { ...fake, ...view }
}

function minimap(): HTMLElement {
	return screen.getByRole('group', { name: UI_FLOW_PANELS.MINIMAP })
}

function pointer(type: string, at: [number, number], init: PointerEventInit = {}): PointerEvent {
	return new PointerEvent(type, { bubbles: true, clientX: at[0], clientY: at[1], button: 0, pointerId: 7, ...init })
}

describe('FlowMinimap', () => {
	it('показывается группой с подписью и подсказкой клавиш, доступной с клавиатуры', () => {
		mount()
		const root = minimap()
		expect(root).toHaveAttribute('tabindex', '0')
		expect(root).toHaveAttribute('aria-description', UI_FLOW_PANELS.MINIMAP_HINT)
	})

	it('на узком экране не показывается', () => {
		mount({ isCompact: true })
		expect(screen.queryByRole('group')).not.toBeInTheDocument()
	})

	it('рисует группы, узлы и рамку видимой области', () => {
		const { container } = mount()
		expect(container.querySelectorAll('.base-flow-map__minimap-group')).toHaveLength(1)
		expect(container.querySelectorAll('.base-flow-map__minimap-node')).toHaveLength(4)
		expect(container.querySelectorAll('.base-flow-map__minimap-viewport')).toHaveLength(1)
	})

	it('цвет группы передаётся оттенком, группа без цвета рисуется без него', () => {
		const data = panelsData()
		data.groups!.push({ id: 'plain', kind: 'zone', label: 'Без цвета' })
		const layout: FlowLayoutResult = {
			nodes: {},
			edges: {},
			bounds: { x: 0, y: 0, width: 100, height: 100 },
			groups: { core: { x: 0, y: 0, width: 50, height: 50 }, plain: { x: 50, y: 50, width: 50, height: 50 } },
		}
		const { container } = mount({ data, layout })
		const [tinted, plain] = [...container.querySelectorAll<SVGRectElement>('.base-flow-map__minimap-group')]
		expect(tinted!.style.getPropertyValue('--base-flow-map-minimap-tint')).toBe('var(--rise-primary)')
		expect(plain!.getAttribute('style')).toBeNull()
	})

	it('статус узла — в классе прямоугольника; живой статус главнее своего', async () => {
		const { container, live } = mount()
		const nodeClasses = (): string[] =>
			[...container.querySelectorAll('.base-flow-map__minimap-node')].map(item => item.getAttribute('class') ?? '')
		expect(nodeClasses()[0]).toContain('base-flow-map__minimap-node--ok')
		expect(nodeClasses()[1]).toContain('base-flow-map__minimap-node--down')
		expect(nodeClasses()[3]).not.toContain('--')
		live.value = { nodes: { api: { status: 'error' } } }
		await nextTick()
		expect(nodeClasses()[0]).toContain('base-flow-map__minimap-node--error')
	})

	it('рамка видимой области следует за видом: сдвиг и масштаб меняют её размер', async () => {
		const { container, viewport } = mount()
		const frame = (): SVGRectElement => container.querySelector('.base-flow-map__minimap-viewport')!
		const before = Number(frame().getAttribute('width'))
		viewport.value = { x: 0, y: 0, zoom: 2 }
		await nextTick()
		expect(Number(frame().getAttribute('width'))).toBeCloseTo(before / 2, 5)
	})

	describe('щелчок и перетаскивание мышью', () => {
		it('щелчок центрирует вид на точке карты с анимацией, масштаб остаётся', async () => {
			const { setViewport } = mount()
			stubBox(minimap(), { left: 10, top: 20 })
			await fireEvent(minimap(), pointer('pointerdown', [94, 75]))
			expect(setViewport).toHaveBeenCalledTimes(1)
			const [viewport, options] = setViewport.mock.calls[0]!
			expect(options).toEqual({ isAnimated: true })
			expect(viewport.zoom).toBe(1)
			expect(Number.isFinite(viewport.x)).toBe(true)
			expect(Number.isFinite(viewport.y)).toBe(true)
		})

		it('центр карты (середина мини-карты) даёт середину содержимого в центре рамки', async () => {
			const { setViewport, frame } = mount()
			stubBox(minimap())
			await fireEvent(minimap(), pointer('pointerdown', [84, 55]))
			const [viewport] = setViewport.mock.calls[0]!
			const centerX = (frame.value.width / 2 - viewport.x) / viewport.zoom
			const centerY = (frame.value.height / 2 - viewport.y) / viewport.zoom
			expect(centerX).toBeCloseTo(-20 + 480 / 2, 0)
			expect(centerY).toBeCloseTo(-20 + 276 / 2, 0)
		})

		it('пока кнопка зажата, движение двигает вид без анимации; после отпускания — нет', async () => {
			const { setViewport } = mount()
			stubBox(minimap())
			await fireEvent(minimap(), pointer('pointerdown', [40, 40]))
			await fireEvent(minimap(), pointer('pointermove', [60, 50]))
			await fireEvent(minimap(), pointer('pointermove', [80, 60]))
			expect(setViewport.mock.calls.map(call => call[1])).toEqual([
				{ isAnimated: true },
				{ isAnimated: false },
				{ isAnimated: false },
			])
			expect(minimap()).toHaveClass('base-flow-map__minimap--dragging')
			await fireEvent(minimap(), pointer('pointerup', [80, 60]))
			expect(minimap()).not.toHaveClass('base-flow-map__minimap--dragging')
			await fireEvent(minimap(), pointer('pointermove', [100, 60]))
			expect(setViewport).toHaveBeenCalledTimes(3)
		})

		it('движение без нажатия вид не двигает', async () => {
			const { setViewport } = mount()
			stubBox(minimap())
			await fireEvent(minimap(), pointer('pointermove', [60, 50]))
			expect(setViewport).not.toHaveBeenCalled()
		})

		it('правая кнопка мыши вид не двигает', async () => {
			const { setViewport } = mount()
			stubBox(minimap())
			await fireEvent(minimap(), pointer('pointerdown', [40, 40], { button: 2 }))
			expect(setViewport).not.toHaveBeenCalled()
			expect(minimap()).not.toHaveClass('base-flow-map__minimap--dragging')
		})

		it('отмена жеста (pointercancel) заканчивает перетаскивание', async () => {
			mount()
			stubBox(minimap())
			await fireEvent(minimap(), pointer('pointerdown', [40, 40]))
			await fireEvent(minimap(), pointer('pointercancel', [40, 40]))
			expect(minimap()).not.toHaveClass('base-flow-map__minimap--dragging')
		})

		it('захватывает указатель на время перетаскивания и отпускает его после', async () => {
			mount()
			stubBox(minimap())
			const capture = vi.fn()
			const release = vi.fn()
			Object.assign(minimap(), { setPointerCapture: capture, releasePointerCapture: release })
			await fireEvent(minimap(), pointer('pointerdown', [40, 40]))
			await fireEvent(minimap(), pointer('pointerup', [40, 40]))
			expect(capture).toHaveBeenCalledWith(7)
			expect(release).toHaveBeenCalledWith(7)
		})
	})

	describe('клавиатура', () => {
		it.each([
			['{ArrowRight}', -80, 0],
			['{ArrowLeft}', 80, 0],
			['{ArrowDown}', 0, -60],
			['{ArrowUp}', 0, 60],
		])('%s сдвигает вид на десятую часть рамки с анимацией', async (key, dx, dy) => {
			const { setViewport, viewport } = mount({ viewport: { x: 0, y: 0, zoom: 1 } })
			const user = userEvent.setup()
			minimap().focus()
			await user.keyboard(key)
			expect(setViewport).toHaveBeenCalledWith({ zoom: 1, x: dx || 0, y: dy || 0 }, { isAnimated: true })
			expect(viewport.value).toEqual({ zoom: 1, x: dx || 0, y: dy || 0 })
		})

		it('Home вписывает всё содержимое с анимацией', async () => {
			const { fitView, setViewport } = mount()
			const user = userEvent.setup()
			minimap().focus()
			await user.keyboard('{Home}')
			expect(fitView).toHaveBeenCalledWith({ isAnimated: true })
			expect(setViewport).not.toHaveBeenCalled()
		})

		it('прочие клавиши не перехватываются', async () => {
			const { fitView, setViewport } = mount()
			const user = userEvent.setup()
			minimap().focus()
			await user.keyboard('a{Enter}{Tab}')
			expect(fitView).not.toHaveBeenCalled()
			expect(setViewport).not.toHaveBeenCalled()
		})

		it('стрелки отменяют прокрутку страницы', async () => {
			mount()
			minimap().focus()
			const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
			minimap().dispatchEvent(event)
			expect(event.defaultPrevented).toBe(true)
		})
	})
})
