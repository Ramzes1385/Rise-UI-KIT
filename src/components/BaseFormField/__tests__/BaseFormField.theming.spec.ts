import '@testing-library/jest-dom/vitest'
import BaseFormField from '../ui/BaseFormField.vue'
import FormFieldError from '../ui/FormFieldError.vue'
import { DEFAULTS_KEY } from '@composables/base/useDefaults'
import { render, screen, waitFor } from '@testing-library/vue'
import { FORM_FIELD_PARTS } from '../types/BaseFormField.types'

const PROPS = { label: 'Имя', isRequired: true, description: 'Как в паспорте' }

function motionHost(): HTMLElement {
	const host = document.createElement('div')
	host.setAttribute('data-rise-motion', 'none')
	document.body.append(host)
	return host
}

describe('BaseFormField: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...FORM_FIELD_PARTS.map(part => [part, `u-${part}`])])
		const { container, rerender } = render(BaseFormField, {
			props: { ...PROPS, variant: 'soft', customClass: { root: 'own-root', label: 'own-label' }, ui },
		})
		const root = container.querySelector('.base-form-field')!

		expect(root).toHaveClass('u-root', 'base-form-field--soft', 'own-root')
		expect(root.querySelector('.base-form-field__description')).toHaveClass('u-description')
		await rerender({ error: 'Введите имя' })
		for (const part of FORM_FIELD_PARTS.filter(part => part !== 'description')) {
			expect(root.querySelector(`.base-form-field__${part}`)).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-form-field__label')).toHaveClass('own-label')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseFormField, {
			props: { ...PROPS, ui: { label: 'own' } },
			global: { provide: { [DEFAULTS_KEY]: { BaseFormField: { ui: { label: 'app', root: 'app-root' } } } } },
		})
		const root = container.querySelector('.base-form-field')!

		expect(root).toHaveClass('base-form-field', 'app-root')
		expect(root.querySelector('.base-form-field__header')).toHaveAttribute('class', 'base-form-field__header')
		expect(root.querySelector('.base-form-field__label')).toHaveAttribute('class', 'base-form-field__label app own')
	})
})

describe('BaseFormField: движение описания и ошибки', () => {
	it('обёртки сообщений раскрываются классом --open: описание без ошибки, ошибка — при ошибке', async () => {
		const { container, rerender } = render(BaseFormField, { props: PROPS })
		const [description, error] = container.querySelectorAll('.base-form-field__message')

		expect(description).toHaveClass('base-form-field__message--open')
		expect(error).not.toHaveClass('base-form-field__message--open')
		await rerender({ error: 'Введите имя' })
		expect(description).not.toHaveClass('base-form-field__message--open')
		expect(error).toHaveClass('base-form-field__message--open')
		expect(screen.queryByText('Как в паспорте')).not.toBeInTheDocument()
		await rerender({ error: '' })
		expect(error).not.toHaveClass('base-form-field__message--open')
		expect(screen.getByText('Как в паспорте')).toBeInTheDocument()
	})

	it('без описания — одна обёртка ошибки, пустая и закрытая', () => {
		const { container } = render(BaseFormField, { props: { label: 'Имя' } })
		const messages = container.querySelectorAll('.base-form-field__message')

		expect(messages).toHaveLength(1)
		expect(messages[0]).not.toHaveClass('base-form-field__message--open')
		expect(container.querySelector('.base-form-field__error')).not.toBeInTheDocument()
	})

	it('aria-describedby группы указывает только на сообщение, которое есть в DOM', async () => {
		const { rerender } = render(BaseFormField, { props: PROPS })
		const group = screen.getByRole('group', { name: 'Имя' })

		expect(document.getElementById(group.getAttribute('aria-describedby')!)).toHaveTextContent('Как в паспорте')
		await rerender({ error: 'Введите имя' })
		expect(document.getElementById(group.getAttribute('aria-describedby')!)).toHaveTextContent('Введите имя')
		expect(group).toHaveAccessibleDescription('Введите имя')
	})

	it('в пресете none ошибка уходит и описание возвращается сразу, без ожидания transitionend', async () => {
		const host = motionHost()
		const { rerender } = render(BaseFormField, {
			container: host,
			props: { ...PROPS, error: 'Введите имя' },
			global: { stubs: { transition: false } },
		})

		expect(screen.getByText('Введите имя')).toBeInTheDocument()
		await rerender({ error: '' })
		await waitFor(() => expect(screen.queryByText('Введите имя')).not.toBeInTheDocument())
		await waitFor(() => expect(screen.getByText('Как в паспорте')).not.toHaveClass('base-form-field-message-enter-active'))
		host.remove()
	})
})

describe('FormFieldError', () => {
	it('показывает текст ошибки с id и классом; без ошибки ничего не рендерит', async () => {
		const { container, rerender } = render(FormFieldError, { props: { error: 'Ошибка', id: 'e1', className: 'field__error' } })

		expect(screen.getByText('Ошибка')).toHaveAttribute('id', 'e1')
		expect(screen.getByText('Ошибка')).toHaveClass('field__error')
		expect(screen.getByRole('alert')).toHaveTextContent('Ошибка')
		await rerender({ error: '' })
		expect(container.querySelector('.field__error')).not.toBeInTheDocument()
	})

	it('в пресете none ошибка появляется и уходит переходом base-form-field-error сразу', async () => {
		const host = motionHost()
		const { rerender } = render(FormFieldError, { container: host, props: { error: '' }, global: { stubs: { transition: false } } })

		await rerender({ error: 'Ошибка' })
		await waitFor(() => expect(screen.getByText('Ошибка')).not.toHaveClass('base-form-field-error-enter-active'))
		await rerender({ error: '' })
		await waitFor(() => expect(screen.queryByText('Ошибка')).not.toBeInTheDocument())
		host.remove()
	})
})
