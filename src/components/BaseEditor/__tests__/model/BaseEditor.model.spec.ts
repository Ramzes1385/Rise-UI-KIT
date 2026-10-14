import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseEditor from '../../ui/BaseEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const global = { stubs: { BaseTooltip: { template: '<div><slot /></div>' } } }

interface EditorVm {
	handleInput: () => void
	isCodeMode: boolean
	handleTextColor: (color: string) => void
}

function dataEvent(type: 'paste' | 'drop', data: Record<string, string>): Event {
	const event = new InputEvent('beforeinput', {
		bubbles: true,
		cancelable: true,
		inputType: type === 'paste' ? 'insertFromPaste' : 'insertFromDrop',
	})
	Object.defineProperty(event, 'dataTransfer', { value: { getData: (format: string) => data[format] ?? '' } })
	return event
}

function dropAt(content: HTMLElement, html: string, targets: StaticRange[] = []): Event {
	content.dispatchEvent(new MouseEvent('drop', { bubbles: true, clientX: 12, clientY: 34 }))
	const event = dataEvent('drop', { 'text/html': html })
	Object.defineProperty(event, 'getTargetRanges', { value: () => targets })
	content.dispatchEvent(event)
	return event
}

describe('BaseEditor: модель редактора', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
		Reflect.deleteProperty(document, 'caretPositionFromPoint')
		Reflect.deleteProperty(document, 'caretRangeFromPoint')
	})

	it('вставка в режиме чтения и без данных буфера не меняет текст', () => {
		render(BaseEditor, { props: { isReadonly: true }, global })
		const content = screen.getByRole('textbox')

		const locked = dataEvent('paste', { 'text/plain': 'текст' })
		content.dispatchEvent(locked)
		const withoutData = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertFromPaste' })
		content.dispatchEvent(withoutData)

		expect(locked.defaultPrevented).toBe(false)
		expect(withoutData.defaultPrevented).toBe(false)
		expect(content.textContent).toBe('')
	})

	it('другие виды ввода (набор, удаление) обработчик вставки не трогает', () => {
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global })
		const content = screen.getByRole('textbox')
		const typing = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: 'a' })

		content.dispatchEvent(typing)

		expect(typing.defaultPrevented).toBe(false)
	})

	it('перетаскивание HTML вставляется в место из targetRanges события beforeinput', () => {
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global })
		const content = screen.getByRole('textbox')
		const text = content.querySelector('p')?.firstChild as Text
		const target = new StaticRange({ startContainer: text, startOffset: 2, endContainer: text, endOffset: 2 })

		const event = dropAt(content, '<b>вставка</b>', [target])

		expect(event.defaultPrevented).toBe(true)
		expect(content.innerHTML).toBe('<p>Те<b>вставка</b>кст</p>')
	})

	it.each([
		['caretRangeFromPoint', 'caretRangeFromPoint'],
		['caretPositionFromPoint', 'caretPositionFromPoint'],
	])('без targetRanges место сброса берётся по координатам drop (%s)', (_name, api) => {
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global })
		const content = screen.getByRole('textbox')
		const text = content.querySelector('p')?.firstChild as Text
		const range = document.createRange()
		range.setStart(text, 2)
		if (api === 'caretRangeFromPoint') {
			Object.defineProperty(document, api, { configurable: true, value: vi.fn(() => range) })
		} else {
			Object.defineProperty(document, api, { configurable: true, value: vi.fn(() => ({ offsetNode: text, offset: 2 })) })
		}

		dropAt(content, '<b>вставка</b>')

		expect(document[api as 'caretRangeFromPoint']).toHaveBeenCalledWith(12, 34)
		expect(content.innerHTML).toBe('<p>Те<b>вставка</b>кст</p>')
	})

	it('перетаскивание без позиции в документе вставляет HTML в текущее выделение', () => {
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global })
		const content = screen.getByRole('textbox')
		const text = content.querySelector('p')?.firstChild as Text
		const current = document.createRange()
		current.setStart(text, 0)
		current.collapse(true)
		window.getSelection()?.removeAllRanges()
		window.getSelection()?.addRange(current)
		Object.defineProperty(document, 'caretPositionFromPoint', { configurable: true, value: vi.fn(() => null) })

		dropAt(content, '<i>x</i>')

		expect(content.innerHTML).toBe('<p><i>x</i>Текст</p>')
	})

	it('перетаскивание без позиции и без доступных API ставит HTML в текущее выделение', () => {
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global })
		const content = screen.getByRole('textbox')
		const text = content.querySelector('p')?.firstChild as Text
		const current = document.createRange()
		current.setStart(text, 5)
		current.collapse(true)
		window.getSelection()?.removeAllRanges()
		window.getSelection()?.addRange(current)

		dropAt(content, '<i>x</i>')

		expect(content.innerHTML).toBe('<p>Текст<i>x</i></p>')
	})

	it('кнопка «Ссылка» открывает диалог вместо prompt', async () => {
		vi.spyOn(window, 'prompt')
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global })

		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))

		expect(await screen.findByRole('dialog', { name: 'Ссылка' })).toBeInTheDocument()
		expect(window.prompt).not.toHaveBeenCalled()
	})

	it('в режиме кода ввод отправляет очищенный HTML из поля кода', async () => {
		const wrapper = mount(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global, attachTo: document.body })
		await wrapper.find('button[aria-label="Режим кода"]').trigger('click')
		const code = wrapper.find('textarea')

		await code.setValue('<p>Новый</p><script>alert(1)</script>')

		expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['<p>Новый</p>'])
	})

	it('ввод, пришедший после выхода из режима кода, но до перерисовки, не падает без области текста', async () => {
		const wrapper = mount(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global, attachTo: document.body })
		await wrapper.find('button[aria-label="Режим кода"]').trigger('click')
		const vm = wrapper.vm as unknown as EditorVm
		const before = wrapper.emitted('update:modelValue')?.length ?? 0

		vm.isCodeMode = false
		vm.handleInput()

		expect(wrapper.emitted('update:modelValue')?.length ?? 0).toBe(before)
	})

	it('включение режима чтения в режиме кода возвращает визуальный режим', async () => {
		const wrapper = mount(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global, attachTo: document.body })
		await wrapper.find('button[aria-label="Режим кода"]').trigger('click')
		expect(wrapper.find('textarea').exists()).toBe(true)

		await wrapper.setProps({ isReadonly: true })
		await nextTick()
		await wrapper.setProps({ isReadonly: false })

		expect(wrapper.find('textarea').exists()).toBe(false)
		expect(wrapper.find('.base-editor__content').exists()).toBe(true)
	})

	it('выбранный цвет текста не заменяется цветом области при фокусе', async () => {
		const wrapper = mount(BaseEditor, { global, attachTo: document.body })
		;(wrapper.vm as unknown as EditorVm).handleTextColor('#ff0000')
		await nextTick()

		await wrapper.find('.base-editor__content').trigger('focus')

		expect(wrapper.find('.base-color-picker__swatch--indicated').exists()).toBe(true)
	})

	it('фокус вне элементов панели не меняет остановку Tab', async () => {
		const wrapper = mount(BaseEditor, { global, attachTo: document.body })
		await nextTick()
		const toolbar = wrapper.find('[role="toolbar"]')

		await toolbar.trigger('focusin')

		expect(toolbar.findAll('[tabindex="0"]')).toHaveLength(1)
	})
})
