import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseRadio from '../ui/BaseRadio.vue'
import { render, screen } from '@testing-library/vue'
import { BaseFormField } from '@components/BaseFormField'
import type { BaseRadioOption } from '../types/BaseRadio.types'

const OPTIONS: BaseRadioOption[] = [
	{ value: 'card', label: 'Картой' },
	{ value: 'cash', label: 'Наличными' },
]

describe('BaseRadio: имя группы и контекст поля', () => {
	it('ariaLabel называет radiogroup без видимого заголовка', () => {
		render(BaseRadio, { props: { modelValue: '', options: OPTIONS, name: 'pay', ariaLabel: 'Способ оплаты' } })

		const group = screen.getByRole('radiogroup', { name: 'Способ оплаты' })
		expect(group).not.toHaveAttribute('aria-labelledby')
	})

	it('видимый заголовок важнее ariaLabel', () => {
		render(BaseRadio, { props: { modelValue: '', options: OPTIONS, name: 'pay', label: 'Оплата', ariaLabel: 'Скрытое имя' } })

		const group = screen.getByRole('radiogroup', { name: 'Оплата' })
		expect(group).not.toHaveAttribute('aria-label')
	})

	it('внутри BaseFormField группа называется подписью обёртки и описана её описанием; лишней группы нет', async () => {
		const { container } = render({
			components: { BaseRadio, BaseFormField },
			template: `
				<BaseFormField label="Оплата" description="Комиссии нет" is-required>
					<BaseRadio model-value="" :options="options" name="pay" />
				</BaseFormField>
			`,
			setup: () => ({ options: OPTIONS }),
		})
		await nextTick()

		const group = screen.getByRole('radiogroup', { name: 'Оплата' })
		expect(group).toHaveAccessibleDescription('Комиссии нет')
		expect(group).toHaveAttribute('aria-required', 'true')
		expect(container.querySelector('[role="group"]')).toBeNull()
		expect(container.querySelector('label.base-form-field__label')).not.toHaveAttribute('for')
	})

	it('ошибка обёртки: aria-invalid, описание ошибкой и цвет ошибки у группы и опций', async () => {
		const { container } = render({
			components: { BaseRadio, BaseFormField },
			template: `
				<BaseFormField label="Оплата" error="Выберите способ">
					<BaseRadio model-value="" :options="options" name="pay" />
				</BaseFormField>
			`,
			setup: () => ({ options: OPTIONS }),
		})
		await nextTick()

		const group = screen.getByRole('radiogroup', { name: 'Оплата' })
		expect(group).toHaveAttribute('aria-invalid', 'true')
		expect(group).toHaveAccessibleDescription('Выберите способ')
		expect(container.querySelector('.base-radio')).toHaveClass('base-radio--error')
		expect(container.querySelectorAll('.base-radio-item--error')).toHaveLength(OPTIONS.length)
	})

	it('собственная ошибка идёт в описание первой, перед описанием обёртки', async () => {
		render({
			components: { BaseRadio, BaseFormField },
			template: `
				<BaseFormField label="Оплата" description="Комиссии нет">
					<BaseRadio model-value="" :options="options" name="pay" error="Обязательно" />
				</BaseFormField>
			`,
			setup: () => ({ options: OPTIONS }),
		})
		await nextTick()

		expect(screen.getByRole('radiogroup', { name: 'Оплата' })).toHaveAccessibleDescription('Обязательно Комиссии нет')
	})

	it('focus и blur из defineExpose переводят фокус на первый input и снимают его', () => {
		const wrapper = mount(BaseRadio, { props: { modelValue: '', options: OPTIONS, name: 'pay' }, attachTo: document.body })
		const input = wrapper.find('input').element

		wrapper.vm.focus()
		expect(document.activeElement).toBe(input)
		wrapper.vm.blur()
		expect(document.activeElement).not.toBe(input)
		wrapper.unmount()
	})

	it('обязательная группа без выбора не проходит validate', () => {
		const wrapper = mount(BaseRadio, { props: { modelValue: '', options: OPTIONS, name: 'pay', isRequired: true } })

		expect(wrapper.vm.validate()).toBe(false)
		wrapper.unmount()
	})
})
