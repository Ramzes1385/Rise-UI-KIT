import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ChatMessageContextMenu from '../ui/ChatMessageContextMenu.vue'
import { placeContextMenu } from '../model/contextMenu/contextMenuPlacement'

const VIEWPORT = { width: 1000, height: 800 }

function menuElement(size: { width: number; height: number }, parent: HTMLElement = document.body): HTMLElement {
	const menu = document.createElement('div')
	Object.defineProperty(menu, 'offsetWidth', { value: size.width })
	Object.defineProperty(menu, 'offsetHeight', { value: size.height })
	parent.append(menu)
	return menu
}

function stubViewport(): void {
	vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(VIEWPORT.width)
	vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(VIEWPORT.height)
}

afterEach(() => {
	document.body.innerHTML = ''
	vi.restoreAllMocks()
})

describe('placeContextMenu', () => {
	it('у курсора, если места хватает', () => {
		stubViewport()

		expect(placeContextMenu({ x: 100, y: 120 }, menuElement({ width: 200, height: 280 }))).toEqual({
			top: 120,
			left: 100,
			maxHeight: undefined,
		})
	})

	it('у правого края переворачивается влево от курсора', () => {
		stubViewport()

		expect(placeContextMenu({ x: 950, y: 100 }, menuElement({ width: 200, height: 100 })).left).toBe(750)
	})

	it('если не помещается ни справа, ни слева — прижимается к краю окна с отступом', () => {
		stubViewport()

		expect(placeContextMenu({ x: 100, y: 100 }, menuElement({ width: 1100, height: 100 })).left).toBe(8)
		expect(placeContextMenu({ x: 5, y: 100 }, menuElement({ width: 100, height: 100 })).left).toBe(8)
	})

	it('у нижнего края открывается вверх от курсора, а не выходит за окно', () => {
		stubViewport()

		expect(placeContextMenu({ x: 100, y: 700 }, menuElement({ width: 200, height: 280 })).top).toBe(420)
	})

	it('меню выше свободного места с обеих сторон: берётся большая сторона, высота ограничивается', () => {
		stubViewport()

		expect(placeContextMenu({ x: 100, y: 300 }, menuElement({ width: 200, height: 900 }))).toEqual({
			top: 300,
			left: 100,
			maxHeight: 492,
		})
		expect(placeContextMenu({ x: 100, y: 600 }, menuElement({ width: 200, height: 900 }))).toEqual({
			top: 8,
			left: 100,
			maxHeight: 592,
		})
	})

	it('без раскладки (размер 0) остаётся у курсора', () => {
		expect(placeContextMenu({ x: 30, y: 40 }, menuElement({ width: 0, height: 0 }))).toEqual({
			top: 40,
			left: 30,
			maxHeight: undefined,
		})
	})

	it('без clientWidth берётся размер окна', () => {
		vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(0)
		vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(0)
		vi.stubGlobal('innerWidth', 400)
		vi.stubGlobal('innerHeight', 300)

		expect(placeContextMenu({ x: 390, y: 290 }, menuElement({ width: 100, height: 100 }))).toEqual({
			top: 190,
			left: 290,
			maxHeight: undefined,
		})
		vi.unstubAllGlobals()
	})

	it('открытое кнопкой меню у нижнего края переворачивается вверх от верха кнопки, не закрывая её', () => {
		stubViewport()

		expect(placeContextMenu({ x: 100, y: 700, anchorY: 660 }, menuElement({ width: 200, height: 280 })).top).toBe(380)
	})

	it('anchorY не мешает, пока меню помещается вниз', () => {
		stubViewport()

		expect(placeContextMenu({ x: 100, y: 120, anchorY: 80 }, menuElement({ width: 200, height: 280 })).top).toBe(120)
	})

	it('ширина меряется при left: 0 и прежний left возвращается', () => {
		stubViewport()
		const menu = document.createElement('div')
		document.body.append(menu)
		Object.defineProperty(menu, 'offsetHeight', { value: 100 })
		menu.style.left = '940px'
		const seen: string[] = []
		Object.defineProperty(menu, 'offsetWidth', {
			get: () => {
				seen.push(menu.style.left)
				return 200
			},
		})

		placeContextMenu({ x: 940, y: 100 }, menu)

		expect(seen).toEqual(['0px'])
		expect(menu.style.left).toBe('940px')
	})

	it('окно и размеры берутся из документа меню (iframe, Picture-in-Picture)', () => {
		const foreign = document.implementation.createHTMLDocument('')
		const menu = foreign.createElement('div')
		Object.defineProperty(menu, 'offsetWidth', { value: 200 })
		Object.defineProperty(menu, 'offsetHeight', { value: 100 })
		foreign.body.append(menu)
		vi.spyOn(foreign.documentElement, 'clientWidth', 'get').mockReturnValue(300)
		vi.spyOn(foreign.documentElement, 'clientHeight', 'get').mockReturnValue(150)

		expect(placeContextMenu({ x: 280, y: 140 }, menu)).toEqual({ top: 40, left: 80, maxHeight: undefined })
	})

	it('у документа без окна и без размеров меню остаётся с прижатием к краю', () => {
		const foreign = document.implementation.createHTMLDocument('')
		const menu = foreign.createElement('div')
		Object.defineProperty(menu, 'offsetWidth', { value: 100 })
		Object.defineProperty(menu, 'offsetHeight', { value: 100 })
		foreign.body.append(menu)

		expect(placeContextMenu({ x: 50, y: 50 }, menu).left).toBe(8)
	})

	it('внутри предка с transform координаты отсчитываются от него', () => {
		stubViewport()
		const frame = document.createElement('div')
		frame.style.transform = 'translate(0, 0)'
		frame.getBoundingClientRect = () => ({ left: 50, top: 70, right: 0, bottom: 0, width: 0, height: 0, x: 50, y: 70 }) as DOMRect
		document.body.append(frame)
		const menu = menuElement({ width: 100, height: 100 }, frame)

		expect(placeContextMenu({ x: 200, y: 300 }, menu)).toEqual({ top: 230, left: 150, maxHeight: undefined })
	})

	it('предок с scale(0.5): координаты меню переводятся в единицы предка', () => {
		stubViewport()
		const frame = document.createElement('div')
		frame.style.transform = 'scale(0.5)'
		frame.getBoundingClientRect = () => new DOMRect(50, 70, 400, 300)
		Object.defineProperty(frame, 'offsetWidth', { configurable: true, value: 800 })
		Object.defineProperty(frame, 'offsetHeight', { configurable: true, value: 600 })
		document.body.append(frame)
		const menu = menuElement({ width: 100, height: 100 }, frame)

		expect(placeContextMenu({ x: 200, y: 300 }, menu)).toEqual({ top: 460, left: 300, maxHeight: undefined })
	})
})

describe('ChatMessageContextMenu: положение', () => {
	const props = {
		isOpen: false,
		x: 960,
		y: 790,
		message: { id: 'm1', text: 'Привет', sender: 'me', senderId: 'u1', time: '10:00' },
		currentUserRole: 'member',
		sizeScale: 100,
	} as const

	it('после открытия меню пересчитывается по реальному размеру, закрытое возвращается к точке вызова', async () => {
		stubViewport()
		vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200)
		vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300)
		const wrapper = mount(ChatMessageContextMenu, { props, attachTo: document.body })

		await wrapper.setProps({ isOpen: true })
		await nextTick()
		await nextTick()
		const menu = document.querySelector<HTMLElement>('.base-chat-context-menu')
		expect(menu?.style.left).toBe('760px')
		expect(menu?.style.top).toBe('490px')
		expect(menu?.style.maxHeight).toBe('')

		await wrapper.setProps({ x: 100, y: 100 })
		await nextTick()
		await nextTick()
		expect(document.querySelector<HTMLElement>('.base-chat-context-menu')?.style.left).toBe('100px')

		await wrapper.setProps({ isOpen: false })
		expect(document.querySelector('.base-chat-context-menu')).toBeNull()
		wrapper.unmount()
	})

	it('высота ограничивается, когда меню не помещается ни выше, ни ниже курсора', async () => {
		stubViewport()
		vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200)
		vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(900)
		const wrapper = mount(ChatMessageContextMenu, { props: { ...props, isOpen: true, x: 100, y: 300 }, attachTo: document.body })
		await nextTick()
		await nextTick()

		const menu = document.querySelector<HTMLElement>('.base-chat-context-menu')
		expect(menu?.style.maxHeight).toBe('492px')
		expect(menu?.style.overflowY).toBe('auto')
		wrapper.unmount()
	})

	it('открытое меню пересчитывается при изменении размера окна и перестаёт слушать после закрытия', async () => {
		stubViewport()
		vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200)
		vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300)
		const removeSpy = vi.spyOn(window, 'removeEventListener')
		const wrapper = mount(ChatMessageContextMenu, { props: { ...props, isOpen: true, x: 700, y: 100 }, attachTo: document.body })
		await nextTick()
		await nextTick()
		const menu = document.querySelector<HTMLElement>('.base-chat-context-menu')
		expect(menu?.style.left).toBe('700px')

		vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(800)
		window.dispatchEvent(new Event('resize'))
		await nextTick()
		expect(menu?.style.left).toBe('500px')

		await wrapper.setProps({ isOpen: false })
		await nextTick()
		expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
		wrapper.unmount()
	})

	it('документ без окна: на resize не подписывается', async () => {
		stubViewport()
		vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200)
		vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300)
		const addSpy = vi.spyOn(window, 'addEventListener')
		vi.spyOn(document, 'defaultView', 'get').mockReturnValue(null)
		const wrapper = mount(ChatMessageContextMenu, { props: { ...props, isOpen: true, x: 100, y: 100 }, attachTo: document.body })
		await nextTick()
		await nextTick()

		expect(addSpy).not.toHaveBeenCalledWith('resize', expect.any(Function))
		wrapper.unmount()
	})
})
