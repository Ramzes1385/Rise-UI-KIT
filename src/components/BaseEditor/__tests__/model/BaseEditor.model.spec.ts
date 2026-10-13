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
	const event = new Event(type, { bubbles: true, cancelable: true })
	const store = { getData: (format: string) => data[format] ?? '' }
	Object.defineProperty(event, type === 'paste' ? 'clipboardData' : 'dataTransfer', { value: store })
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
		vi.mocked(document.execCommand).mockClear()

		const locked = dataEvent('paste', { 'text/plain': 'текст' })
		content.dispatchEvent(locked)
		const withoutData = new Event('paste', { bubbles: true, cancelable: true })
		content.dispatchEvent(withoutData)

		expect(locked.defaultPrevented).toBe(false)
		expect(withoutData.defaultPrevented).toBe(false)
		expect(document.execCommand).not.toHaveBeenCalled()
	})

	it.each([
		['caretRangeFromPoint', 'caretRangeFromPoint'],
		['caretPositionFromPoint', 'caretPositionFromPoint'],
	])('перетаскивание HTML ставит каретку в точку сброса (%s)', (_name, api) => {
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

		content.dispatchEvent(dataEvent('drop', { 'text/html': '<b>вставка</b>' }))

		expect(window.getSelection()?.anchorOffset).toBe(2)
		expect(document.execCommand).toHaveBeenLastCalledWith('insertHTML', false, '<b>вставка</b>')
	})

	it('перетаскивание без позиции в документе вставляет HTML в текущее выделение', () => {
		render(BaseEditor, { global })
		const content = screen.getByRole('textbox')
		Object.defineProperty(document, 'caretPositionFromPoint', { configurable: true, value: vi.fn(() => null) })

		content.dispatchEvent(dataEvent('drop', { 'text/html': '<i>x</i>' }))

		expect(document.execCommand).toHaveBeenLastCalledWith('insertHTML', false, '<i>x</i>')
	})

	it('ссылка запрашивается через prompt и вставляется командой createLink', async () => {
		vi.spyOn(window, 'prompt').mockReturnValue('https://example.com')
		render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global })

		await fireEvent.click(screen.getByRole('button', { name: 'Ссылка' }))

		expect(window.prompt).toHaveBeenCalled()
		expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com')
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

		expect(wrapper.find('.base-editor__color-picker--active').exists()).toBe(true)
	})

	it('фокус вне элементов панели не меняет остановку Tab', async () => {
		const wrapper = mount(BaseEditor, { global, attachTo: document.body })
		await nextTick()
		const toolbar = wrapper.find('[role="toolbar"]')

		await toolbar.trigger('focusin')

		expect(toolbar.findAll('[tabindex="0"]')).toHaveLength(1)
	})
})
