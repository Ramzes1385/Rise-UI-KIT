import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useToolbarKeyboard } from '../useToolbarKeyboard'

function mountToolbar(content: string, orientation: 'horizontal' | 'vertical' = 'horizontal') {
	let api!: ReturnType<typeof useToolbarKeyboard>
	const Host = defineComponent({
		setup() {
			const rootRef = ref<HTMLElement | null>(null)
			api = useToolbarKeyboard({ rootRef, orientation: () => orientation })
			return () =>
				h('div', {
					ref: rootRef,
					role: 'toolbar',
					innerHTML: content,
					onKeydown: api.handleKeydown,
					onFocusin: api.handleFocusin,
				})
		},
	})
	const wrapper = mount(Host, { attachTo: document.body })
	return { wrapper, api, root: wrapper.element as HTMLElement }
}

const buttons = (root: HTMLElement): HTMLElement[] => [...root.querySelectorAll<HTMLElement>('button')]

function press(element: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
	element.dispatchEvent(event)
	return event
}

describe('useToolbarKeyboard', () => {
	it('после монтирования одна точка Tab — первый элемент, остальные tabindex=-1', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><button>B</button><button>C</button>')
		expect(buttons(root).map(item => item.tabIndex)).toEqual([0, -1, -1])
		wrapper.unmount()
	})

	it('стрелки, Home и End переносят фокус по кругу и переставляют точку Tab', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><button>B</button><button>C</button>')
		const [first, second, third] = buttons(root)
		first.focus()
		expect(press(first, 'ArrowRight').defaultPrevented).toBe(true)
		expect(document.activeElement).toBe(second)
		expect(buttons(root).map(item => item.tabIndex)).toEqual([-1, 0, -1])
		press(second, 'End')
		expect(document.activeElement).toBe(third)
		press(third, 'ArrowRight')
		expect(document.activeElement).toBe(first)
		press(first, 'ArrowLeft')
		expect(document.activeElement).toBe(third)
		press(third, 'Home')
		expect(document.activeElement).toBe(first)
		wrapper.unmount()
	})

	it('вертикальная панель двигается ↑/↓ и не реагирует на ←/→', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><button>B</button>', 'vertical')
		const [first, second] = buttons(root)
		first.focus()
		expect(press(first, 'ArrowRight').defaultPrevented).toBe(false)
		press(first, 'ArrowDown')
		expect(document.activeElement).toBe(second)
		press(second, 'ArrowUp')
		expect(document.activeElement).toBe(first)
		wrapper.unmount()
	})

	it('в вертикальной панели из поля ввода уводят ↑/↓ у края текста', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><input value="ab" /><button>B</button>', 'vertical')
		const [first, third] = buttons(root)
		const input = root.querySelector('input') as HTMLInputElement
		input.focus()
		input.setSelectionRange(2, 2)
		expect(press(input, 'ArrowLeft').defaultPrevented).toBe(false)
		press(input, 'ArrowDown')
		expect(document.activeElement).toBe(third)
		input.focus()
		input.setSelectionRange(0, 0)
		press(input, 'ArrowUp')
		expect(document.activeElement).toBe(first)
		wrapper.unmount()
	})

	it('клавиши с модификаторами, чужие клавиши и уже обработанные события пропускаются', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><button>B</button>')
		const [first] = buttons(root)
		first.focus()
		expect(press(first, 'ArrowRight', { ctrlKey: true }).defaultPrevented).toBe(false)
		expect(press(first, 'a').defaultPrevented).toBe(false)
		first.addEventListener('keydown', event => event.preventDefault(), { once: true })
		press(first, 'ArrowRight')
		expect(document.activeElement).toBe(first)
		wrapper.unmount()
	})

	it('отключённые, скрытые и вложенные в другой элемент не входят в обход', () => {
		const { root, wrapper, api } = mountToolbar(
			'<button>A</button><button disabled>X</button><button hidden>H</button><div role="combobox" tabindex="0"><button>nested</button></div><span aria-hidden="true"><button>I</button></span><button data-toolbar-skip>S</button>',
		)
		expect(api.getItems().map(item => item.getAttribute('role') ?? item.textContent)).toEqual(['A', 'combobox'])
		wrapper.unmount()
		expect(root).toBeTruthy()
	})

	it('в поле ввода стрелка уводит фокус, только когда каретка у края текста', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><input value="abc" /><button>B</button>')
		const [first, third] = buttons(root)
		const input = root.querySelector('input') as HTMLInputElement
		input.focus()
		input.setSelectionRange(1, 1)
		expect(press(input, 'ArrowRight').defaultPrevented).toBe(false)
		input.setSelectionRange(0, 3)
		expect(press(input, 'ArrowLeft').defaultPrevented).toBe(false)
		input.setSelectionRange(3, 3)
		expect(press(input, 'Home').defaultPrevented).toBe(false)
		expect(press(input, 'ArrowRight').defaultPrevented).toBe(true)
		expect(document.activeElement).toBe(third)
		input.focus()
		input.setSelectionRange(0, 0)
		press(input, 'ArrowLeft')
		expect(document.activeElement).toBe(first)
		wrapper.unmount()
	})

	it('поле без каретки (number, email) оставляет стрелки себе, флажок не блокирует', () => {
		const { root, wrapper } = mountToolbar('<input type="number" /><input type="email" /><input type="checkbox" /><button>B</button>')
		const [number, email, checkbox] = [...root.querySelectorAll<HTMLInputElement>('input')]
		number.focus()
		expect(press(number, 'ArrowRight').defaultPrevented).toBe(false)
		expect(press(number, 'ArrowLeft').defaultPrevented).toBe(false)
		expect(document.activeElement).toBe(number)
		expect(press(email, 'ArrowRight').defaultPrevented).toBe(false)
		press(checkbox, 'ArrowRight')
		expect(document.activeElement).toBe(buttons(root)[0])
		wrapper.unmount()
	})

	it('выбор цвета и файла (color, file) не текстовые: стрелки уводят фокус', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><input type="color" /><input type="file" /><button>B</button>')
		const [color, file] = [...root.querySelectorAll<HTMLInputElement>('input')]
		color.focus()
		expect(press(color, 'ArrowRight').defaultPrevented).toBe(true)
		expect(document.activeElement).toBe(file)
		expect(press(file, 'ArrowLeft').defaultPrevented).toBe(true)
		expect(document.activeElement).toBe(color)
		wrapper.unmount()
	})

	it('textarea в обходе: стрелка внутри текста остаётся за ним', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><textarea>ab</textarea>')
		const area = root.querySelector('textarea') as HTMLTextAreaElement
		area.focus()
		area.setSelectionRange(1, 1)
		expect(press(area, 'ArrowLeft').defaultPrevented).toBe(false)
		area.setSelectionRange(0, 0)
		expect(press(area, 'ArrowLeft').defaultPrevented).toBe(true)
		wrapper.unmount()
	})

	it('contenteditable не считается полем с кареткой: стрелки остаются за ним', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><div contenteditable="true" tabindex="0">text</div>')
		const editable = root.querySelector('[contenteditable]') as HTMLElement
		editable.focus()
		expect(press(editable, 'ArrowLeft').defaultPrevented).toBe(false)
		wrapper.unmount()
	})

	it('focusin на элементе делает его единственной точкой Tab, событие вне элементов игнорируется', () => {
		const { root, wrapper } = mountToolbar('<button>A</button><button>B</button><p tabindex="-1" id="p">text</p>')
		const [, second] = buttons(root)
		second.focus()
		expect(buttons(root).map(item => item.tabIndex)).toEqual([-1, 0])
		;(root.querySelector('#p') as HTMLElement).focus()
		expect(buttons(root).map(item => item.tabIndex)).toEqual([-1, 0])
		wrapper.unmount()
	})

	it('если активный элемент исчез, точка Tab возвращается на первый; новые элементы подхватываются наблюдателем', async () => {
		const { root, wrapper } = mountToolbar('<button>A</button><button>B</button>')
		const [first, second] = buttons(root)
		second.focus()
		second.remove()
		await new Promise(resolve => setTimeout(resolve))
		expect(first.tabIndex).toBe(0)
		const added = document.createElement('button')
		root.append(added)
		await new Promise(resolve => setTimeout(resolve))
		expect(added.tabIndex).toBe(-1)
		expect(added.hasAttribute('data-toolbar-item')).toBe(true)
		wrapper.unmount()
	})

	it('focusItem переносит фокус по номеру, -1 — на последний, за границы не выходит', () => {
		const { root, wrapper, api } = mountToolbar('<button>A</button><button>B</button><button>C</button>')
		const [first, second, third] = buttons(root)
		api.focusItem(1)
		expect(document.activeElement).toBe(second)
		api.focusItem(-1)
		expect(document.activeElement).toBe(third)
		api.focusItem(10)
		expect(document.activeElement).toBe(third)
		api.focusItem(0)
		expect(document.activeElement).toBe(first)
		wrapper.unmount()
	})

	it('пустая панель: focusItem ничего не делает, обработчики не падают', async () => {
		const { root, wrapper, api } = mountToolbar('')
		api.focusItem(0)
		api.sync()
		press(root, 'ArrowRight')
		await nextTick()
		expect(api.getItems()).toEqual([])
		wrapper.unmount()
	})

	it('без корня (ref пуст) список элементов пуст', () => {
		const rootRef = ref<HTMLElement | null>(null)
		let api!: ReturnType<typeof useToolbarKeyboard>
		const Host = defineComponent({
			setup() {
				api = useToolbarKeyboard({ rootRef })
				return () => h('div')
			},
		})
		const wrapper = mount(Host)
		expect(api.getItems()).toEqual([])
		wrapper.unmount()
	})

	it('панель, появившаяся по v-if после монтирования, получает roving tabindex', async () => {
		const isShown = ref(false)
		const Host = defineComponent({
			setup() {
				const rootRef = ref<HTMLElement | null>(null)
				const api = useToolbarKeyboard({ rootRef })
				return () =>
					isShown.value
						? h('div', { ref: rootRef, role: 'toolbar', onFocusin: api.handleFocusin }, [h('button', 'A'), h('button', 'B')])
						: h('p')
			},
		})
		const wrapper = mount(Host, { attachTo: document.body })
		isShown.value = true
		await nextTick()
		await nextTick()
		expect(buttons(wrapper.element as HTMLElement).map(item => item.tabIndex)).toEqual([0, -1])
		isShown.value = false
		await nextTick()
		wrapper.unmount()
	})

	it('inert, aria-hidden и data-toolbar-skip на существующем элементе исключают его из обхода', async () => {
		const { root, wrapper, api } = mountToolbar('<button>A</button><button>B</button><button>C</button>')
		const [, second, third] = buttons(root)
		second.setAttribute('inert', '')
		third.setAttribute('aria-hidden', 'true')
		await new Promise(resolve => setTimeout(resolve))
		expect(api.getItems().map(item => item.textContent)).toEqual(['A'])
		third.removeAttribute('aria-hidden')
		third.setAttribute('data-toolbar-skip', '')
		await new Promise(resolve => setTimeout(resolve))
		expect(api.getItems().map(item => item.textContent)).toEqual(['A'])
		wrapper.unmount()
	})
})
