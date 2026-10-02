import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import { render, screen } from '@testing-library/vue'
import { BaseFormField } from '@components/BaseFormField'

describe('BaseCheckbox: имя и контекст поля', () => {
	it('ariaLabel называет флажок без видимой подписи', () => {
		const { container } = render(BaseCheckbox, { props: { ariaLabel: 'Выбрать строку 1' } })

		expect(screen.getByRole('checkbox', { name: 'Выбрать строку 1' })).toBeInTheDocument()
		expect(container.querySelector('.base-checkbox__label')).toBeNull()
	})

	it('inputAttrs попадают на нативный input: свой id, name и aria-describedby вместе с ошибкой', () => {
		render({
			components: { BaseCheckbox },
			template: `
				<p id="hint">Подсказка</p>
				<BaseCheckbox label="Согласен" error="Нужно согласие" :input-attrs="{ id: 'agree', name: 'agree', 'aria-describedby': 'hint' }" />
			`,
		})

		const checkbox = screen.getByRole('checkbox', { name: 'Согласен' })
		expect(checkbox).toHaveAttribute('id', 'agree')
		expect(checkbox).toHaveAttribute('name', 'agree')
		expect(checkbox).toHaveAttribute('aria-invalid', 'true')
		expect(checkbox).toHaveAccessibleDescription('Нужно согласие Подсказка')
	})

	it('без своей подписи внутри BaseFormField называется её подписью и описан её описанием', async () => {
		const { container } = render({
			components: { BaseCheckbox, BaseFormField },
			template: `
				<BaseFormField label="Рассылка" description="Раз в неделю" is-required>
					<BaseCheckbox />
				</BaseFormField>
			`,
		})
		await nextTick()

		const checkbox = screen.getByRole('checkbox', { name: 'Рассылка' })
		expect(checkbox).toHaveAccessibleDescription('Раз в неделю')
		expect(checkbox).toHaveAttribute('aria-required', 'true')
		expect(container.querySelector('[role="group"]')).toBeNull()
	})

	it('со своей подписью не занимает подпись обёртки: ошибку описывает группа, у флажка — только цвет ошибки', async () => {
		const { container } = render({
			components: { BaseCheckbox, BaseFormField },
			template: `
				<BaseFormField label="Условия" error="Примите условия">
					<BaseCheckbox label="Принимаю условия" />
				</BaseFormField>
			`,
		})
		await nextTick()

		expect(screen.getByRole('group', { name: 'Условия' })).toHaveAccessibleDescription('Примите условия')
		const checkbox = screen.getByRole('checkbox', { name: 'Принимаю условия' })
		expect(checkbox).not.toHaveAttribute('aria-invalid')
		expect(checkbox).not.toHaveAttribute('aria-describedby')
		expect(container.querySelector('.base-checkbox')).toHaveClass('base-checkbox--error')
		expect(container.querySelector('label.base-form-field__label')).not.toHaveAttribute('for')
	})

	it('подпись, появившаяся позже, освобождает обёртку; пропавшая — подключает флажок к подписи обёртки', async () => {
		const wrapper = mount(
			{
				components: { BaseCheckbox, BaseFormField },
				props: { label: { type: String, default: undefined } },
				template: `
				<BaseFormField label="Рассылка" error="Нужно выбрать">
					<BaseCheckbox :label="label" />
				</BaseFormField>
			`,
			},
			{ attachTo: document.body },
		)
		await nextTick()

		const input = wrapper.find('input')
		expect(wrapper.find('label.base-form-field__label').attributes('for')).toBe(input.attributes('id'))
		expect(input.attributes('aria-invalid')).toBe('true')
		expect(wrapper.find('[role="group"]').exists()).toBe(false)

		await wrapper.setProps({ label: 'Получать новости' })
		expect(wrapper.find('label.base-form-field__label').attributes('for')).toBeUndefined()
		expect(wrapper.find('[role="group"]').exists()).toBe(true)
		expect(input.attributes('aria-invalid')).toBeUndefined()

		await wrapper.setProps({ label: undefined })
		expect(wrapper.find('label.base-form-field__label').attributes('for')).toBe(input.attributes('id'))
		expect(input.attributes('aria-invalid')).toBe('true')
		wrapper.unmount()
	})

	it('вне обёртки без ошибки aria-invalid и aria-describedby нет', () => {
		render(BaseCheckbox, { props: { label: 'Флажок' } })

		const checkbox = screen.getByRole('checkbox', { name: 'Флажок' })
		expect(checkbox).not.toHaveAttribute('aria-invalid')
		expect(checkbox).not.toHaveAttribute('aria-describedby')
	})

	it('focus и blur из defineExpose переводят фокус на первый input и снимают его', () => {
		const wrapper = mount(BaseCheckbox, { props: { label: 'Фокус' }, attachTo: document.body })
		const input = wrapper.find('input').element

		wrapper.vm.focus()
		expect(document.activeElement).toBe(input)
		wrapper.vm.blur()
		expect(document.activeElement).not.toBe(input)
		wrapper.unmount()
	})

	it('change без поля в target не эмитит значение', () => {
		const wrapper = mount(BaseCheckbox, { props: { label: 'Событие' } })
		const event = new Event('change')
		Object.defineProperty(event, 'target', { value: null })
		wrapper.find('input').element.dispatchEvent(event)
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
	})
})
