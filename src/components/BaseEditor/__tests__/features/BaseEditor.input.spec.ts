import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import BaseEditor from '../../ui/BaseEditor.vue'
import { BaseFormField } from '@components/BaseFormField'
import { fireEvent, render, screen } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

function emitted(wrapper: ReturnType<typeof render>): string[] {
	return ((wrapper.emitted('update:modelValue') ?? []) as string[][]).map(args => args[0])
}

async function type(textbox: HTMLElement, html: string): Promise<void> {
	textbox.innerHTML = html
	await fireEvent.input(textbox)
}

describe('BaseEditor: ввод через IME', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('во время композиции промежуточные значения не отправляются, по окончании уходит итог', async () => {
		const wrapper = render(BaseEditor, { global: { stubs } })
		const textbox = screen.getByRole('textbox')

		await fireEvent.compositionStart(textbox)
		await type(textbox, 'に')
		await type(textbox, 'にほ')
		expect(emitted(wrapper)).toEqual([])

		await type(textbox, 'にほん')
		await fireEvent.compositionEnd(textbox)

		expect(emitted(wrapper)).toEqual(['にほん'])
	})

	it('во время композиции placeholder скрывается, DOM не перезаписывается', async () => {
		const wrapper = render(BaseEditor, { props: { placeholder: 'Текст' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		expect(textbox).toHaveClass('base-editor__content--empty')

		await fireEvent.compositionStart(textbox)
		await type(textbox, '<b>x</b>')

		expect(textbox).not.toHaveClass('base-editor__content--empty')
		expect(textbox.innerHTML).toBe('<b>x</b>')
		expect(emitted(wrapper)).toEqual([])
	})

	it('Enter во время композиции не перехватывается, после неё Shift+Enter снова вставляет перенос', async () => {
		render(BaseEditor, { global: { stubs } })
		const textbox = screen.getByRole('textbox')
		Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => true) })

		await fireEvent.compositionStart(textbox)
		const duringIme = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true })
		textbox.dispatchEvent(duringIme)
		expect(duringIme.defaultPrevented).toBe(false)
		expect(document.execCommand).not.toHaveBeenCalledWith('insertLineBreak', false)

		await fireEvent.compositionEnd(textbox)
		const afterIme = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true, bubbles: true, cancelable: true })
		textbox.dispatchEvent(afterIme)
		expect(afterIme.defaultPrevented).toBe(true)
	})

	it('внешнее изменение modelValue во время композиции не трогает DOM', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')

		await fireEvent.compositionStart(textbox)
		await type(textbox, '<p>ab</p>')
		await wrapper.rerender({ modelValue: '<p>внешнее</p>' })

		expect(textbox.innerHTML).toBe('<p>ab</p>')
	})

	it('значение, которое уже в DOM, не перезаписывает содержимое', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		const paragraph = textbox.firstElementChild

		textbox.innerHTML = '<p>b</p>'
		const replaced = textbox.firstElementChild
		await wrapper.rerender({ modelValue: '<p>b</p>' })

		expect(textbox.firstElementChild).toBe(replaced)
		expect(replaced).not.toBe(paragraph)
	})

	it('значение, которое редактор сам отправил до композиции, не считается внешним, когда эхо пришло во время неё', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')

		await type(textbox, '<p>a</p>')
		await fireEvent.compositionStart(textbox)
		await wrapper.rerender({ modelValue: '<p>a</p>' })
		await fireEvent.compositionEnd(textbox)
		await wrapper.rerender({ modelValue: '' })

		expect(textbox.innerHTML).toBe('')
	})

	it('Safari: compositionend раньше последнего input — итог уходит, значение не теряется', async () => {
		const wrapper = render(BaseEditor, { global: { stubs } })
		const textbox = screen.getByRole('textbox')

		await fireEvent.compositionStart(textbox)
		textbox.innerHTML = 'にほん'
		await fireEvent.compositionEnd(textbox)
		await fireEvent.input(textbox)

		expect(emitted(wrapper)[emitted(wrapper).length - 1]).toBe('にほん')
		expect(new Set(emitted(wrapper))).toEqual(new Set(['にほん']))
	})

	it('Chrome и Firefox: input раньше compositionend — итог уходит один раз по окончании', async () => {
		const wrapper = render(BaseEditor, { global: { stubs } })
		const textbox = screen.getByRole('textbox')

		await fireEvent.compositionStart(textbox)
		await type(textbox, 'にほん')
		expect(emitted(wrapper)).toEqual([])
		await fireEvent.compositionEnd(textbox)

		expect(emitted(wrapper)).toEqual(['にほん'])
	})

	it('уход фокуса в диалог ссылки (Ctrl+K) не показывает ошибку пустого обязательного редактора', async () => {
		render(BaseEditor, { props: { isRequired: true }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		textbox.focus()

		const hotkey = new KeyboardEvent('keydown', { code: 'KeyK', key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
		textbox.dispatchEvent(hotkey)
		const field = await screen.findByLabelText('Адрес ссылки')
		await fireEvent.blur(textbox, { relatedTarget: field })

		expect(screen.queryByText('Обязательное поле')).toBeNull()

		await fireEvent.blur(textbox, { relatedTarget: document.body })
		expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
	})

	it('композиция в поле кода тоже не отправляет промежуточные значения', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		const code = screen.getByRole('textbox', { name: 'HTML-код' })

		await fireEvent.compositionStart(code)
		await fireEvent.update(code, '<p>に</p>')
		expect(emitted(wrapper)).toEqual([])

		await fireEvent.compositionEnd(code)
		expect(emitted(wrapper)).toEqual(['<p>に</p>'])
	})
})

describe('BaseEditor: режим кода при чтении', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('при переходе в isReadonly режим кода закрывается, правка разметки невозможна', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		expect(screen.getByRole('textbox', { name: 'HTML-код' })).toBeInTheDocument()

		await wrapper.rerender({ isReadonly: true })

		expect(screen.queryByRole('textbox', { name: 'HTML-код' })).toBeNull()
		expect(screen.getByRole('textbox')).toHaveAttribute('aria-readonly', 'true')
	})

	it('внешний modelValue в режиме кода попадает в поле кода и не затирается при выходе', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>a</p>' }, global: { stubs } })
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))

		await wrapper.rerender({ modelValue: '<p>новое</p>' })
		expect(screen.getByRole('textbox', { name: 'HTML-код' })).toHaveValue('<p>новое</p>')

		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await nextTick()
		expect(screen.getByRole('textbox').innerHTML).toBe('<p>новое</p>')
	})
})

describe('BaseEditor: isRequired и name', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('isRequired: aria-required у области текста и звёздочка у заголовка', () => {
		const { container } = render(BaseEditor, { props: { isRequired: true, label: 'Описание' }, global: { stubs } })

		expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
		expect(container.querySelector('.base-editor__required')).toHaveTextContent('*')
	})

	it('без isRequired aria-required нет', () => {
		render(BaseEditor, { global: { stubs } })

		expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required')
	})

	it('пустой обязательный редактор после ухода фокуса показывает ошибку, текст её снимает', async () => {
		const wrapper = render(BaseEditor, { props: { isRequired: true }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		expect(screen.queryByText('Обязательное поле')).toBeNull()

		await fireEvent.blur(textbox)
		expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		expect(textbox).toHaveAttribute('aria-invalid', 'true')

		await wrapper.rerender({ modelValue: '<p>Текст</p>' })
		expect(screen.queryByText('Обязательное поле')).toBeNull()
	})

	it('редактор, где остался только пустой абзац, считается пустым', async () => {
		render(BaseEditor, { props: { isRequired: true, modelValue: '<p><br></p>' }, global: { stubs } })

		await fireEvent.blur(screen.getByRole('textbox'))

		expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
	})

	it('изображение без текста — непустое содержимое', async () => {
		render(BaseEditor, { props: { isRequired: true, modelValue: '<p><img src="a.png" alt=""></p>' }, global: { stubs } })

		await fireEvent.blur(screen.getByRole('textbox'))

		expect(screen.queryByText('Обязательное поле')).toBeNull()
	})

	it('name добавляет скрытое поле с HTML, пустой редактор даёт пустую строку', async () => {
		const wrapper = render(BaseEditor, { props: { name: 'body', modelValue: '<p>Текст</p>' }, global: { stubs } })
		const input = wrapper.container.querySelector('input[type="hidden"][name="body"]') as HTMLInputElement

		expect(input.value).toBe('<p>Текст</p>')
		await wrapper.rerender({ modelValue: '<p><br></p>' })
		expect(input.value).toBe('')
	})

	it('без name скрытого поля нет, у отключённого редактора оно отключено', async () => {
		const wrapper = render(BaseEditor, { global: { stubs } })
		expect(wrapper.container.querySelector('input[type="hidden"]')).toBeNull()

		await wrapper.rerender({ name: 'body', isDisabled: true })
		expect(wrapper.container.querySelector('input[type="hidden"]')).toBeDisabled()
	})

	it('значение уходит в FormData нативной формы', () => {
		const { container } = render(
			{
				render() {
					return h('form', [h(BaseEditor, { name: 'body', modelValue: '<p>Привет</p>' })])
				},
			},
			{ global: { stubs } },
		)

		const data = new FormData(container.querySelector('form') as HTMLFormElement)
		expect(data.get('body')).toBe('<p>Привет</p>')
	})

	it('внутри BaseFormField с isRequired редактор получает aria-required обёртки', async () => {
		render(
			{
				render() {
					return h(BaseFormField, { label: 'Текст', isRequired: true }, () => h(BaseEditor))
				},
			},
			{ global: { stubs } },
		)
		await nextTick()

		expect(screen.getByRole('textbox', { name: 'Текст' })).toHaveAttribute('aria-required', 'true')
	})
})
