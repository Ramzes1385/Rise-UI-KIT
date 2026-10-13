import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseEditor from '../../ui/BaseEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseEditorExpose, BaseEditorToolbarSlotProps } from '../../types/BaseEditor.types'

const global = { stubs: { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } } }

type Api = BaseEditorExpose & { $el: HTMLElement }

function mountEditor(props: Record<string, unknown> = {}) {
	const wrapper = mount(BaseEditor, { props: { modelValue: '<p>Текст</p>', ...props }, global, attachTo: document.body })
	return { wrapper, api: wrapper.vm as unknown as Api }
}

describe('BaseEditor: defineExpose и слот toolbar', () => {
	beforeEach(() => {
		Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true })
	})

	afterEach(() => {
		vi.restoreAllMocks()
		document.body.innerHTML = ''
	})

	it('focus и blur работают с областью текста, rootRef и isEmpty доступны', async () => {
		const { api } = mountEditor()
		await nextTick()

		api.focus()
		expect(screen.getByRole('textbox')).toHaveFocus()
		api.blur()
		expect(screen.getByRole('textbox')).not.toHaveFocus()
		expect(api.rootRef).toBe(screen.getByRole('textbox'))
		expect(api.isEmpty).toBe(false)
	})

	it('в режиме кода focus и blur работают с полем кода, getHtml возвращает очищенный код', async () => {
		const { api } = mountEditor()
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		const code = screen.getByRole('textbox', { name: 'HTML-код' })
		await fireEvent.update(code, '<p>Код</p><script>alert(1)</script>')

		api.focus()
		expect(code).toHaveFocus()
		api.blur()
		expect(code).not.toHaveFocus()
		expect(api.getHtml()).toBe('<p>Код</p>')
	})

	it('getHtml возвращает очищенное содержимое области текста, без области — пустую строку', async () => {
		const { wrapper, api } = mountEditor()
		await nextTick()
		screen.getByRole('textbox').innerHTML = '<p>Новое</p><img src="x" onerror="alert(1)">'

		expect(api.getHtml()).toBe('<p>Новое</p><img src="x">')

		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await wrapper.setProps({ modelValue: '' })
		expect(api.rootRef).toBeNull()
	})

	it('insertHtml вставляет очищенный HTML в место выделения и сообщает о вводе', async () => {
		const { wrapper, api } = mountEditor()
		await nextTick()
		const text = screen.getByRole('textbox').querySelector('p')!.firstChild!
		const range = document.createRange()
		range.setStart(text, 2)
		range.collapse(true)
		window.getSelection()?.removeAllRanges()
		window.getSelection()?.addRange(range)
		await fireEvent.keyUp(screen.getByRole('textbox'))

		api.insertHtml('<b onclick="x()">жирное</b>')

		expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, '<b>жирное</b>')
		expect(wrapper.emitted('update:modelValue')).toBeTruthy()
	})

	it('insertHtml в режиме кода вставляет в поле кода, пустой или заблокированный ввод игнорируется', async () => {
		const { wrapper, api } = mountEditor()
		api.insertHtml('<script>alert(1)</script>')
		expect(document.execCommand).not.toHaveBeenCalled()

		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		const code = screen.getByRole('textbox', { name: 'HTML-код' }) as HTMLTextAreaElement
		code.setSelectionRange(3, 3)
		api.insertHtml('<i>x</i>')
		await nextTick()
		expect(code).toHaveValue('<p><i>x</i>Текст</p>')

		await wrapper.setProps({ isReadonly: true })
		api.insertHtml('<b>y</b>')
		expect(document.execCommand).not.toHaveBeenCalledWith('insertHTML', false, '<b>y</b>')
	})

	it('validate и reset управляют ошибкой обязательного поля', async () => {
		const { api } = mountEditor({ modelValue: '', isRequired: true })
		await nextTick()
		expect(screen.queryByText('Обязательное поле')).toBeNull()

		expect(api.validate()).toBe(false)
		expect(await screen.findByText('Обязательное поле')).toBeInTheDocument()

		api.reset()
		await nextTick()
		expect(screen.queryByText('Обязательное поле')).toBeNull()
	})

	it('слот toolbar получает команды и состояние и заменяет стандартные кнопки', async () => {
		let received: BaseEditorToolbarSlotProps | null = null
		render(BaseEditor, {
			props: { modelValue: '<p>Текст</p>' },
			global,
			slots: {
				toolbar: (slotProps: BaseEditorToolbarSlotProps) => {
					received = slotProps
					return h('button', { type: 'button', onClick: () => slotProps.insertHtml('<b>vstavka</b>') }, 'Своя кнопка')
				},
			},
		})

		expect(screen.queryByRole('button', { name: 'Ссылка' })).toBeNull()
		const props = received as unknown as BaseEditorToolbarSlotProps
		expect(props.isCodeMode).toBe(false)
		expect(props.isLocked).toBe(false)
		expect(props.activeStates).toHaveProperty('isBold', false)

		await fireEvent.click(screen.getByRole('button', { name: 'Своя кнопка' }))
		expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, '<b>vstavka</b>')

		props.applyFormat('bold')
		expect(document.execCommand).toHaveBeenCalledWith('bold', false)
		props.applyBlock('h2')
		expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h2')
		props.toggleCodeMode()
		await nextTick()
		expect((received as unknown as BaseEditorToolbarSlotProps).isCodeMode).toBe(true)
		props.openLinkDialog()
		props.focus()
	})
})
