import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { UI_TEXT } from '@/locales/messages'
import BaseFormField from '../ui/BaseFormField.vue'
import { render, screen } from '@testing-library/vue'
import type { FormFieldValidateExpose } from '@composables/useFormField'

describe('BaseFormField unit', () => {
	describe('рендер', () => {
		it('должен рендерить обёртку поля', () => {
			const { container } = render(BaseFormField)

			expect(container.querySelector('.base-form-field')).toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseFormField, { slots: { default: '<input type="text" />' } })

			expect(screen.getByRole('textbox')).toBeInTheDocument()
		})
	})

	describe('пропс label', () => {
		it('должен рендерить заголовок когда передан', () => {
			render(BaseFormField, { props: { label: 'Имя', for: 'name-input' } })

			expect(screen.getByText('Имя')).toBeInTheDocument()
		})

		it('не должен рендерить заголовок когда не передан', () => {
			const { container } = render(BaseFormField)

			expect(container.querySelector('.base-form-field__label')).not.toBeInTheDocument()
		})

		it('должен связывать label с input через for', () => {
			render(BaseFormField, { props: { label: 'Имя', for: 'name-input' } })

			const label = screen.getByText('Имя')
			expect(label.getAttribute('for')).toBe('name-input')
		})
	})

	describe('пропс isRequired', () => {
		it('должен рендерить звёздочку когда isRequired=true', () => {
			render(BaseFormField, { props: { label: 'Имя', isRequired: true } })

			expect(screen.getByText('*')).toBeInTheDocument()
		})

		it('не должен рендерить звёздочку по умолчанию', () => {
			const { container } = render(BaseFormField, { props: { label: 'Имя' } })

			expect(container.querySelector('.base-form-field__required')).not.toBeInTheDocument()
		})
	})

	describe('пропс description', () => {
		it('должен рендерить описание когда передано', () => {
			render(BaseFormField, { props: { description: 'Подсказка' } })

			expect(screen.getByText('Подсказка')).toBeInTheDocument()
		})

		it('не должен рендерить описание когда есть ошибка', () => {
			render(BaseFormField, { props: { description: 'Подсказка', error: 'Ошибка' } })

			expect(screen.queryByText('Подсказка')).not.toBeInTheDocument()
		})
	})

	describe('пропс error', () => {
		it('должен рендерить ошибку когда передана', () => {
			render(BaseFormField, { props: { error: 'Обязательное поле' } })

			expect(screen.getByText('Обязательное поле')).toBeInTheDocument()
		})

		it('должен добавлять класс --error когда есть ошибка', () => {
			const { container } = render(BaseFormField, { props: { error: 'Ошибка' } })

			expect(container.querySelector('.base-form-field')?.classList.contains('base-form-field--error')).toBe(true)
		})

		it('не должен добавлять класс --error когда нет ошибки', () => {
			const { container } = render(BaseFormField)

			expect(container.querySelector('.base-form-field')?.classList.contains('base-form-field--error')).toBe(false)
		})
	})

	describe('доступность: связь подписи, описания и ошибки', () => {
		it('без for помечает содержимое группой с именем из подписи и описанием', () => {
			render(BaseFormField, {
				props: { label: 'Каналы', description: 'Можно выбрать несколько' },
				slots: { default: '<input type="checkbox" aria-label="Email" />' },
			})

			const group = screen.getByRole('group', { name: 'Каналы' })
			expect(group).toHaveAccessibleDescription('Можно выбрать несколько')
			expect(group).toContainElement(screen.getByRole('checkbox', { name: 'Email' }))
		})

		it('ошибка вытесняет описание и в тексте, и в aria-describedby группы', () => {
			render(BaseFormField, {
				props: { label: 'Каналы', description: 'Можно выбрать несколько', error: 'Выберите канал' },
			})

			expect(screen.getByRole('group', { name: 'Каналы' })).toHaveAccessibleDescription('Выберите канал')
			expect(screen.queryByText('Можно выбрать несколько')).not.toBeInTheDocument()
		})

		it('с for связывает подпись с полем по id и не создаёт группу', () => {
			render(BaseFormField, {
				props: { label: 'Имя', for: 'name-input' },
				slots: { default: '<input id="name-input" type="text" />' },
			})

			expect(screen.getByLabelText('Имя')).toBe(screen.getByRole('textbox'))
			expect(screen.queryByRole('group')).not.toBeInTheDocument()
		})

		it('без подписи не создаёт безымянную группу', () => {
			render(BaseFormField, { slots: { default: '<input type="text" />' } })

			expect(screen.queryByRole('group')).not.toBeInTheDocument()
		})

		it('без ошибки не рендерит пустую обёртку анимации ошибки', () => {
			const { container } = render(BaseFormField, { props: { label: 'Имя' } })

			expect(container.querySelector('.base-animation')).not.toBeInTheDocument()
		})
	})

	describe('defineExpose: validate/reset', () => {
		function mountField(props: Record<string, unknown>) {
			const wrapper = mount(BaseFormField, {
				props,
				slots: { default: '<input type="text" value="Иван" />' },
			})
			return { wrapper, api: wrapper.vm as unknown as FormFieldValidateExpose }
		}

		it('validate() обязательного поля без внешней ошибки возвращает true и не показывает ложную ошибку', async () => {
			const { wrapper, api } = mountField({ label: 'Имя', isRequired: true })

			expect(api.validate()).toBe(true)
			await nextTick()
			expect(wrapper.text()).not.toContain(UI_TEXT.REQUIRED_FIELD)

			wrapper.unmount()
		})

		it('validate() возвращает false при внешней ошибке и показывает её текст', async () => {
			const { wrapper, api } = mountField({ label: 'Имя', isRequired: true, error: 'Введите имя' })

			expect(api.validate()).toBe(false)
			await nextTick()
			expect(wrapper.text()).toContain('Введите имя')
			expect(wrapper.text()).not.toContain(UI_TEXT.REQUIRED_FIELD)

			wrapper.unmount()
		})

		it('reset() после validate() не оставляет сообщений об ошибке', async () => {
			const { wrapper, api } = mountField({ label: 'Имя', isRequired: true })

			api.validate()
			api.reset()
			await nextTick()
			expect(wrapper.find('.base-form-field__error').exists()).toBe(false)

			wrapper.unmount()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseFormField, {
				props: {
					customClass: 'custom-field-class',
				},
			})

			expect(container.querySelector('.base-form-field')?.classList.contains('custom-field-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseFormField, {
				props: {
					customClass: {
						root: 'custom-field-root',
						header: 'custom-field-header',
						label: 'custom-field-label',
						required: 'custom-field-required',
						content: 'custom-field-content',
						description: 'custom-field-description',
						animation: 'custom-field-animation',
						error: 'custom-field-error',
					},
					label: 'Имя',
					isRequired: true,
					description: 'Подсказка',
					error: 'Ошибка',
				},
			})

			expect(container.querySelector('.base-form-field')?.classList.contains('custom-field-root')).toBe(true)
			expect(container.querySelector('.base-form-field__header')?.classList.contains('custom-field-header')).toBe(true)
			expect(container.querySelector('.base-form-field__label')?.classList.contains('custom-field-label')).toBe(true)
			expect(container.querySelector('.base-form-field__required')?.classList.contains('custom-field-required')).toBe(true)
			expect(container.querySelector('.base-form-field__content')?.classList.contains('custom-field-content')).toBe(true)
			expect(container.querySelector('.custom-field-animation')).toBeInTheDocument()
			expect(container.querySelector('.base-form-field__error')?.classList.contains('custom-field-error')).toBe(true)
		})
	})
})
