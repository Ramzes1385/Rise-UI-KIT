import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import BaseEditor from '../ui/BaseEditor.vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

const global = { stubs: { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } } }

function toolbarItems(): HTMLElement[] {
	const toolbar = screen.getByRole('toolbar')
	return Array.from(toolbar.querySelectorAll<HTMLElement>('button, [role="combobox"]'))
}

function selectNode(node: Node): void {
	const range = document.createRange()
	range.selectNode(node)
	const selection = window.getSelection() as Selection
	selection.removeAllRanges()
	selection.addRange(range)
}

describe('BaseEditor: панель инструментов с клавиатуры', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		window.getSelection()?.removeAllRanges()
	})

	it('в порядке Tab одна остановка: у остальных кнопок tabindex -1', async () => {
		render(BaseEditor, { global })
		await nextTick()
		const items = toolbarItems()

		expect(items.length).toBeGreaterThan(15)
		expect(items.filter(item => item.getAttribute('tabindex') === '0')).toEqual([items[0]])
		expect(items.slice(1).every(item => item.getAttribute('tabindex') === '-1')).toBe(true)
	})

	it('стрелки, Home и End переносят фокус по кругу, а остановка Tab идёт за фокусом', async () => {
		render(BaseEditor, { global })
		await nextTick()
		const items = toolbarItems()
		items[0].focus()

		await fireEvent.keyDown(items[0], { key: 'ArrowRight' })
		expect(items[1]).toHaveFocus()
		expect(items[1]).toHaveAttribute('tabindex', '0')
		expect(items[0]).toHaveAttribute('tabindex', '-1')

		await fireEvent.keyDown(items[1], { key: 'ArrowLeft' })
		await fireEvent.keyDown(items[0], { key: 'ArrowLeft' })
		expect(items.at(-1)).toHaveFocus()

		await fireEvent.keyDown(items.at(-1) as HTMLElement, { key: 'ArrowRight' })
		expect(items[0]).toHaveFocus()
		await fireEvent.keyDown(items[0], { key: 'End' })
		expect(items.at(-1)).toHaveFocus()
		await fireEvent.keyDown(items.at(-1) as HTMLElement, { key: 'Home' })
		expect(items[0]).toHaveFocus()
	})

	it('остановка Tab запоминает элемент, на который попал фокус мышью', async () => {
		render(BaseEditor, { global })
		await nextTick()
		const items = toolbarItems()

		items[3].focus()

		expect(items[3]).toHaveAttribute('tabindex', '0')
		expect(items.filter(item => item.getAttribute('tabindex') === '0')).toHaveLength(1)
	})

	it('другие клавиши, сочетания с модификаторами и чужие элементы не двигают фокус', async () => {
		render(BaseEditor, { global })
		await nextTick()
		const items = toolbarItems()
		items[0].focus()

		await fireEvent.keyDown(items[0], { key: 'a' })
		await fireEvent.keyDown(items[0], { key: 'ArrowRight', ctrlKey: true })
		await fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowRight' })

		expect(items[0]).toHaveFocus()
	})

	it('кнопка «Блок кода» и «Режим кода» показывают разные иконки', () => {
		const { container } = render(BaseEditor, { global })
		const hrefOf = (name: string): string | null =>
			screen.getByRole('button', { name }).querySelector('use')?.getAttribute('href') ?? null

		expect(hrefOf('Блок кода')).toContain('code-block')
		expect(hrefOf('Режим кода')).not.toContain('code-block')
		expect(container.querySelector('.base-editor__toolbar')).toBeInTheDocument()
	})
})

describe('BaseEditor: меню медиа без правой кнопки мыши', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		window.getSelection()?.removeAllRanges()
	})

	function setup() {
		const utils = render(BaseEditor, { props: { modelValue: '<p>Текст <img src="data:," alt="Схема"></p>' }, global })
		const content = screen.getByRole('textbox')
		const image = content.querySelector('img') as HTMLImageElement
		return { ...utils, content, image }
	}

	it('кнопка «Размер и удаление медиа» недоступна, пока медиа не выделено, но остаётся в обходе', async () => {
		setup()
		const button = screen.getByRole('button', { name: 'Размер и удаление медиа' })

		expect(button).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(button)
		expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull()
	})

	it('выделенное изображение включает кнопку, она открывает меню под изображением', async () => {
		const { content, image } = setup()
		selectNode(image)
		await fireEvent.mouseUp(content)
		const button = screen.getByRole('button', { name: 'Размер и удаление медиа' })

		expect(button).not.toHaveAttribute('aria-disabled')
		await fireEvent.click(button)

		const menu = await screen.findByRole('dialog', { name: 'Размер медиа' })
		await waitFor(() => expect(within(menu).getByLabelText('Ширина')).toHaveFocus())
	})

	it('выделение текста, а не медиа, кнопку не включает', async () => {
		const { content } = setup()
		selectNode(content.querySelector('p')?.firstChild as Node)
		await fireEvent.mouseUp(content)

		expect(screen.getByRole('button', { name: 'Размер и удаление медиа' })).toHaveAttribute('aria-disabled', 'true')
	})

	it('Shift+F10 и клавиша меню на выделенном изображении открывают меню', async () => {
		const { content, image } = setup()
		selectNode(image)
		await fireEvent.keyUp(content)

		await fireEvent.keyDown(content, { key: 'F10', shiftKey: true })
		expect(await screen.findByRole('dialog', { name: 'Размер медиа' })).toBeInTheDocument()
		await fireEvent.keyDown(document, { key: 'Escape' })
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull())

		await fireEvent.keyDown(content, { key: 'ContextMenu' })
		expect(await screen.findByRole('dialog', { name: 'Размер медиа' })).toBeInTheDocument()
	})

	it('Shift+F10 без выделенного медиа ничего не открывает', async () => {
		const { content } = setup()

		await fireEvent.keyDown(content, { key: 'F10', shiftKey: true })

		expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull()
	})

	it('в режиме чтения меню клавишей не открывается', async () => {
		const { content, image, rerender } = setup()
		selectNode(image)
		await fireEvent.keyUp(content)
		await rerender({ isReadonly: true })

		await fireEvent.keyDown(content, { key: 'F10', shiftKey: true })

		expect(screen.queryByRole('dialog', { name: 'Размер медиа' })).toBeNull()
	})
})

describe('BaseEditor: пустота и цвет по умолчанию', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
	})

	it.each([
		['изображение', '<p><img src="data:," alt=""></p>', false],
		['разделитель', '<hr>', false],
		['пробелы', '<p>  </p>', true],
	])('содержимое: %s — признак пустоты %s', async (_name, html, isEmpty) => {
		const { container } = render(BaseEditor, { props: { modelValue: html }, global })
		await nextTick()

		expect(container.querySelector('.base-editor__content')?.classList.contains('base-editor__content--empty')).toBe(isEmpty)
	})

	it('цвет текста палитры берётся из цвета области редактирования, а не #000000', async () => {
		const original = window.getComputedStyle.bind(window)
		vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
			const style = original(element, pseudo)
			if (!element.classList.contains('base-editor__content')) return style
			return new Proxy(style, { get: (target, key) => (key === 'color' ? 'rgb(236, 239, 244)' : Reflect.get(target, key)) })
		})
		render(BaseEditor, { global })
		await nextTick()

		expect(screen.getByRole('button', { name: /^Цвет текста, выбран #eceff4/ })).toBeInTheDocument()
	})

	it('цвет, который не удалось определить, остаётся запасным', async () => {
		render(BaseEditor, { global })
		await nextTick()

		expect(screen.getByRole('button', { name: /^Цвет текста, выбран #000000/ })).toBeInTheDocument()
	})
})

describe('BaseEditor: mousedown на панели', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('кнопки не забирают фокус у текста, а поле своего слота получает его', async () => {
		render(BaseEditor, {
			global,
			slots: {
				toolbar: () => [h('button', { type: 'button' }, 'Своя'), h('input', { 'aria-label': 'Своё поле' })],
			},
		})
		await nextTick()

		const onButton = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		screen.getByRole('button', { name: 'Своя' }).dispatchEvent(onButton)
		const onField = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		screen.getByLabelText('Своё поле').dispatchEvent(onField)

		expect(onButton.defaultPrevented).toBe(true)
		expect(onField.defaultPrevented).toBe(false)
	})
})
