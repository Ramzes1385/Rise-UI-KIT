import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import BaseEditor from '../ui/BaseEditor.vue'
import { BaseForm } from '@components/BaseForm'
import { BaseFormField } from '@components/BaseFormField'
import { fireEvent, render, screen } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

describe('BaseEditor: поле формы', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('label называет область текста через aria-labelledby, клик по заголовку переводит фокус в редактор', async () => {
		render(BaseEditor, { props: { label: 'Описание' }, global: { stubs } })
		const textbox = screen.getByRole('textbox', { name: 'Описание' })

		expect(textbox).not.toHaveAttribute('aria-label')
		await fireEvent.click(screen.getByText('Описание'))

		expect(textbox).toHaveFocus()
	})

	it('без label область текста называется по умолчанию', () => {
		render(BaseEditor, { global: { stubs } })

		expect(screen.getByRole('textbox', { name: 'Текстовый редактор' })).not.toHaveAttribute('aria-labelledby')
	})

	it('error показывает текст, красит рамку и связывает его с областью текста', async () => {
		const { container } = render(BaseEditor, { props: { error: 'Заполните описание' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')
		await nextTick()

		const message = screen.getByText('Заполните описание')
		expect(textbox).toHaveAttribute('aria-invalid', 'true')
		expect(textbox).toHaveAttribute('aria-describedby', message.id)
		expect(container.querySelector('.base-editor')).toHaveClass('base-editor--error')
	})

	it('без error нет ни aria-invalid, ни описания', () => {
		const { container } = render(BaseEditor, { global: { stubs } })

		expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
		expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
		expect(container.querySelector('.base-editor')).not.toHaveClass('base-editor--error')
	})

	it('isDisabled: текст не редактируется и не получает фокус, панель скрыта, aria-disabled', () => {
		const { container } = render(BaseEditor, { props: { isDisabled: true }, global: { stubs } })
		const textbox = screen.getByRole('textbox')

		expect(textbox).toHaveAttribute('contenteditable', 'false')
		expect(textbox).toHaveAttribute('aria-disabled', 'true')
		expect(textbox).not.toHaveAttribute('tabindex')
		expect(screen.queryByRole('toolbar')).toBeNull()
		expect(container.querySelector('.base-editor')).toHaveClass('base-editor--disabled')
		expect(container.querySelector('.base-editor')).not.toHaveClass('base-editor--readonly')
	})

	it('isReadonly: область текста попадает в порядок Tab, но не редактируется', () => {
		render(BaseEditor, { props: { isReadonly: true }, global: { stubs } })
		const textbox = screen.getByRole('textbox')

		expect(textbox).toHaveAttribute('tabindex', '0')
		expect(textbox).toHaveAttribute('aria-readonly', 'true')
		expect(textbox).not.toHaveAttribute('aria-disabled')
	})

	it('отключённая BaseForm отключает и редактор', () => {
		render(
			{
				components: { BaseForm, BaseEditor },
				template: '<BaseForm is-disabled><BaseEditor /></BaseForm>',
			},
			{ global: { stubs } },
		)

		expect(screen.getByRole('textbox')).toHaveAttribute('contenteditable', 'false')
		expect(screen.getByRole('textbox')).toHaveAttribute('aria-disabled', 'true')
	})

	it('внутри BaseFormField область текста называется подписью обёртки и получает её ошибку', async () => {
		render(
			{
				components: { BaseFormField, BaseEditor },
				render() {
					return h(BaseFormField, { label: 'Текст статьи', error: 'Слишком коротко' }, () => h(BaseEditor))
				},
			},
			{ global: { stubs } },
		)
		await nextTick()

		const textbox = screen.getByRole('textbox', { name: 'Текст статьи' })
		expect(textbox).toHaveAttribute('aria-invalid', 'true')
	})

	it('скрытое поле name получает очищенный HTML, а не сырое значение', () => {
		const { container } = render(BaseEditor, {
			props: { name: 'body', modelValue: '<p>текст</p><script>alert(1)</script><img src="x" onerror="alert(1)">' },
			global: { stubs },
		})

		const value = container.querySelector<HTMLInputElement>('input[type="hidden"][name="body"]')?.value ?? ''
		expect(value).toContain('текст')
		expect(value).not.toMatch(/<script|onerror/i)
	})

	it('скрытое поле name использует собственную функцию sanitize', () => {
		const sanitize = vi.fn(() => '<p>чисто</p>')
		const { container } = render(BaseEditor, { props: { name: 'body', modelValue: '<p>сырой</p>', sanitize }, global: { stubs } })

		expect(container.querySelector<HTMLInputElement>('input[type="hidden"][name="body"]')?.value).toBe('<p>чисто</p>')
	})
})
