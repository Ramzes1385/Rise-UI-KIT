import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseImageMap from '../ui/BaseImageMap.vue'
import userEvent from '@testing-library/user-event'
import type { ImageMapData } from '../types/imageMapData.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { mockRects, mockViewport, objectElement, SIMPLE_DATA, stageTransform } from './imageMap.test-utils'

const BASE_PROPS = { hasFullscreen: false }
const ZOOMED = 'translate(-200px, -125px) scale(1.5)'
const OUTSIDE = { a: { left: 300, top: 240, width: 20, height: 20 }, b: { left: 900, top: 240, width: 20, height: 20 } }

const LINKS: ImageMapData = {
	layers: [{ id: 'base', title: 'Схема', width: 800, height: 500 }],
	objects: [
		{ id: 'link', type: 'rect', title: 'Ссылка', x: 0, y: 0, width: 0.2, height: 0.2, action: 'link', link: '#space-link' },
		{ id: 'shop', type: 'rect', title: 'Магазин', x: 0.5, y: 0, width: 0.2, height: 0.2, action: 'none' },
		{ id: 'pin', type: 'point', title: 'Метка', x: 0.5, y: 0.5, action: 'link', link: '#pin' },
	],
}

async function renderMap(rects = {}) {
	mockViewport()
	mockRects(rects)
	const result = render(BaseImageMap, { props: { data: SIMPLE_DATA, ...BASE_PROPS } })
	await nextTick()
	return { ...result, viewport: result.container.querySelector('.base-image-map__viewport') as HTMLElement }
}

describe('BaseImageMap клавиатура — фокус при увеличении', () => {
	afterEach(() => vi.restoreAllMocks())

	it('фокус на объекте за краем окна сдвигает вид без анимации, подсказка — после сдвига', async () => {
		const user = userEvent.setup()
		const { container } = await renderMap(OUTSIDE)
		objectElement(container, 'a').focus()
		await fireEvent.keyDown(document.activeElement as Element, { key: '+' })
		expect(stageTransform(container)).toBe(ZOOMED)
		await user.keyboard('{End}')
		expect(objectElement(container, 'b')).toHaveFocus()
		expect(stageTransform(container)).toBe('translate(-336px, -125px) scale(1.5)')
		expect(container.querySelector('.base-image-map__stage')).not.toHaveClass('base-image-map__stage--animated')
		await waitFor(() => expect(objectElement(container, 'b')).toHaveAttribute('aria-describedby'))
	})

	it('объект в окне и масштаб 1 — вид не сдвигается', async () => {
		const user = userEvent.setup()
		const { container } = await renderMap(OUTSIDE)
		objectElement(container, 'a').focus()
		await user.keyboard('{End}')
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
		await fireEvent.keyDown(document.activeElement as Element, { key: '+' })
		await user.keyboard('{Home}')
		expect(objectElement(container, 'a')).toHaveFocus()
		expect(stageTransform(container)).toBe(ZOOMED)
	})
})

describe('BaseImageMap клавиатура — панорама окна', () => {
	afterEach(() => vi.restoreAllMocks())

	it('окно получает фокус, роль и имя только при увеличении', async () => {
		const user = userEvent.setup()
		const { viewport } = await renderMap()
		expect(viewport).not.toHaveAttribute('tabindex')
		expect(viewport).not.toHaveAttribute('role')
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(viewport).toHaveAttribute('tabindex', '0')
		expect(screen.getByRole('group', { name: 'Увеличенная карта: стрелки сдвигают вид' })).toBe(viewport)
	})

	it('стрелки на окне сдвигают вид на 10% окна в пределах краёв', async () => {
		const user = userEvent.setup()
		const { container, viewport } = await renderMap()
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		viewport.focus()
		await user.keyboard('{ArrowLeft}')
		expect(stageTransform(container)).toBe('translate(-120px, -125px) scale(1.5)')
		await user.keyboard('{ArrowUp}')
		expect(stageTransform(container)).toBe('translate(-120px, -75px) scale(1.5)')
		await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}')
		expect(stageTransform(container)).toBe('translate(-280px, -125px) scale(1.5)')
		await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}')
		expect(stageTransform(container)).toBe('translate(0px, -125px) scale(1.5)')
		expect(container.querySelector('.base-image-map__stage')).not.toHaveClass('base-image-map__stage--animated')
	})

	it('с модификатором, другой клавишей и на объекте стрелки вид не сдвигают', async () => {
		const user = userEvent.setup()
		const { container, viewport } = await renderMap()
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		await fireEvent.keyDown(viewport, { key: 'ArrowLeft', ctrlKey: true })
		await fireEvent.keyDown(viewport, { key: 'a' })
		await fireEvent.keyDown(objectElement(container, 'a'), { key: 'ArrowRight' })
		expect(stageTransform(container)).toBe(ZOOMED)
		const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		viewport.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(true)
	})
})

describe('BaseImageMap клавиатура и мышь — ссылки-фигуры', () => {
	beforeEach(() => {
		window.location.hash = ''
		vi.spyOn(window, 'open').mockImplementation(() => null)
	})
	afterEach(() => vi.restoreAllMocks())

	it('Space у role="link" не переходит, Enter — переходит; Space у role="button" активирует', async () => {
		const { emitted } = render(BaseImageMap, { props: { data: LINKS, ...BASE_PROPS } })
		const link = screen.getByRole('link', { name: 'Ссылка' })
		const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
		link.dispatchEvent(space)
		expect(space.defaultPrevented).toBe(false)
		expect(window.location.hash).toBe('')
		expect(emitted().select).toBeUndefined()
		await fireEvent.keyDown(link, { key: 'Enter' })
		expect(window.location.hash).toBe('#space-link')
		await fireEvent.keyDown(screen.getByRole('button', { name: 'Магазин' }), { key: ' ' })
		expect(emitted().select).toHaveLength(2)
	})

	it('Ctrl, ⌘ и Shift при клике открывают ссылку фигуры в новой вкладке', async () => {
		render(BaseImageMap, { props: { data: LINKS, ...BASE_PROPS } })
		const link = screen.getByRole('link', { name: 'Ссылка' })
		await fireEvent.click(link, { ctrlKey: true })
		await fireEvent.click(link, { metaKey: true })
		await fireEvent.click(link, { shiftKey: true })
		expect(window.open).toHaveBeenCalledTimes(3)
		expect(window.open).toHaveBeenCalledWith('#space-link', '_blank', 'noopener,noreferrer')
		expect(window.location.hash).toBe('')
	})

	it('средняя кнопка открывает ссылку фигуры в новой вкладке, на прочих объектах — ничего', async () => {
		const { container, emitted } = render(BaseImageMap, { props: { data: LINKS, ...BASE_PROPS } })
		await fireEvent(screen.getByRole('link', { name: 'Ссылка' }), new MouseEvent('auxclick', { bubbles: true, button: 1 }))
		expect(window.open).toHaveBeenCalledWith('#space-link', '_blank', 'noopener,noreferrer')
		await fireEvent(screen.getByRole('link', { name: 'Ссылка' }), new MouseEvent('auxclick', { bubbles: true, button: 2 }))
		await fireEvent(screen.getByRole('button', { name: 'Магазин' }), new MouseEvent('auxclick', { bubbles: true, button: 1 }))
		await fireEvent(objectElement(container, 'pin'), new MouseEvent('auxclick', { bubbles: true, button: 1 }))
		await fireEvent(
			container.querySelector('.base-image-map__stage') as Element,
			new MouseEvent('auxclick', { bubbles: true, button: 1 }),
		)
		expect(window.open).toHaveBeenCalledTimes(1)
		expect(emitted().select).toHaveLength(1)
	})
})

describe('BaseImageMap подсказка — role="tooltip" и aria-describedby', () => {
	const PROPS = { ...BASE_PROPS, hasZoomControls: false }
	const tooltip = (): HTMLElement | null => document.querySelector('[role="tooltip"]')

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('при показе у объекта aria-describedby на подсказку, customClass.tooltip; уход указателя снимает через 150 мс', async () => {
		vi.useFakeTimers()
		const { container } = render(BaseImageMap, { props: { data: SIMPLE_DATA, ...PROPS, customClass: { tooltip: 'my-tip' } } })
		const point = objectElement(container, 'a')
		expect(point).not.toHaveAttribute('aria-describedby')
		await fireEvent.pointerOver(point, { pointerType: 'mouse' })
		const tip = tooltip() as HTMLElement
		expect(tip).toHaveClass('base-image-map__tooltip', 'my-tip')
		expect(point).toHaveAttribute('aria-describedby', tip.id)
		expect(tip).toHaveTextContent('Точка А')
		await fireEvent.pointerLeave(container.querySelector('.base-image-map__stage') as HTMLElement)
		await vi.advanceTimersByTimeAsync(150)
		expect(tooltip()).toBeNull()
		expect(point).not.toHaveAttribute('aria-describedby')
	})

	it('Escape снимает подсказку и aria-describedby, фокус остаётся на объекте', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseImageMap, { props: { data: SIMPLE_DATA, ...PROPS } })
		await user.tab()
		const point = objectElement(container, 'a')
		expect(point).toHaveAttribute('aria-describedby', tooltip()?.id)
		await user.keyboard('{Escape}')
		expect(tooltip()).toBeNull()
		expect(point).not.toHaveAttribute('aria-describedby')
		expect(point).toHaveFocus()
	})

	it('клик снаружи закрывает подсказку', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseImageMap, { props: { data: SIMPLE_DATA, ...PROPS } })
		await fireEvent.pointerOver(objectElement(container, 'a'), { pointerType: 'mouse' })
		expect(tooltip()).not.toBeNull()
		await user.click(document.body)
		expect(tooltip()).toBeNull()
		expect(objectElement(container, 'a')).not.toHaveAttribute('aria-describedby')
	})

	it('колесо и перетаскивание снимают подсказку', async () => {
		mockViewport()
		mockRects({})
		const { container } = render(BaseImageMap, { props: { data: SIMPLE_DATA, ...PROPS, wheelZoom: 'always' } })
		await nextTick()
		const viewport = container.querySelector('.base-image-map__viewport') as HTMLElement
		const point = objectElement(container, 'a')
		await fireEvent.pointerOver(point, { pointerType: 'mouse' })
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))
		await nextTick()
		expect(tooltip()).toBeNull()
		expect(point).not.toHaveAttribute('aria-describedby')
		await fireEvent.pointerOver(objectElement(container, 'b'), { pointerType: 'mouse' })
		expect(tooltip()).not.toBeNull()
		await fireEvent.pointerDown(viewport, { pointerType: 'mouse', pointerId: 1, button: 0, clientX: 100, clientY: 100 })
		await fireEvent.pointerMove(viewport, { pointerType: 'mouse', pointerId: 1, clientX: 140, clientY: 100 })
		expect(tooltip()).toBeNull()
		expect(objectElement(container, 'b')).not.toHaveAttribute('aria-describedby')
	})

	it('в подсказке нет ссылок — они только в окне', async () => {
		const withLinks: ImageMapData = {
			...SIMPLE_DATA,
			objects: [{ ...SIMPLE_DATA.objects[0], links: [{ label: 'Сайт', href: '#site' }] }] as ImageMapData['objects'],
		}
		const { container } = render(BaseImageMap, { props: { data: withLinks, ...PROPS } })
		await fireEvent.pointerOver(objectElement(container, 'a'), { pointerType: 'mouse' })
		expect(tooltip()?.querySelector('a')).toBeNull()
		await fireEvent.click(objectElement(container, 'a'))
		expect(await screen.findByRole('link', { name: 'Сайт' })).toHaveAttribute('href', '#site')
	})
})
