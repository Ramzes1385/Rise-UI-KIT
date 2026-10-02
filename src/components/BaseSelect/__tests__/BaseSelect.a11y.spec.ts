import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { UI_TEXT } from '@/locales/messages'
import BaseSelect from '../ui/BaseSelect.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { BaseFormField } from '@components/BaseFormField'
import type { BaseSelectOption } from '../types/BaseSelect.types'

const OPTIONS: BaseSelectOption[] = [
	{ value: 'metal', label: 'Металл' },
	{ value: 'wood', label: 'Дерево' },
]

describe('BaseSelect: имя, атрибуты триггера и обязательный мультивыбор', () => {
	it('ariaLabel называет триггер и список без видимой подписи', async () => {
		const user = userEvent.setup()
		render(BaseSelect, { props: { modelValue: '', options: OPTIONS, ariaLabel: 'Материал', placeholder: 'Выберите' } })

		const trigger = screen.getByRole('combobox', { name: 'Материал' })
		await user.click(trigger)

		expect(await screen.findByRole('listbox', { name: 'Материал' })).toBeInTheDocument()
	})

	it('без подписи и ariaLabel имя — плейсхолдер; пустой плейсхолдер даёт имя по умолчанию', () => {
		const { unmount } = render(BaseSelect, { props: { modelValue: '', options: OPTIONS, placeholder: 'Выберите материал' } })
		expect(screen.getByRole('combobox', { name: 'Выберите материал' })).toBeInTheDocument()
		unmount()

		render(BaseSelect, { props: { modelValue: '', options: OPTIONS, placeholder: '' } })
		expect(screen.getByRole('combobox', { name: UI_TEXT.SELECT_PLACEHOLDER })).toBeInTheDocument()
	})

	it('видимая подпись важнее ariaLabel', () => {
		render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Материал', ariaLabel: 'Скрытое' } })

		const trigger = screen.getByRole('combobox', { name: 'Материал' })
		expect(trigger).not.toHaveAttribute('aria-label')
	})

	it('triggerAttrs: свой id, data-атрибут и внешнее описание вместе с ошибкой', () => {
		render({
			components: { BaseSelect },
			template: `
				<p id="hint">Влияет на цену</p>
				<BaseSelect model-value="" :options="options" label="Материал" error="Выберите материал"
					:trigger-attrs="{ id: 'material', 'data-qa': 'material', 'aria-describedby': 'hint' }" />
			`,
			setup: () => ({ options: OPTIONS }),
		})

		const trigger = screen.getByRole('combobox', { name: 'Материал' })
		expect(trigger).toHaveAttribute('id', 'material')
		expect(trigger).toHaveAttribute('data-qa', 'material')
		expect(trigger).toHaveAccessibleDescription('Выберите материал Влияет на цену')
	})

	it('внутри BaseFormField список называется подписью обёртки', async () => {
		const user = userEvent.setup()
		render({
			components: { BaseSelect, BaseFormField },
			template: `
				<BaseFormField label="Материал корпуса">
					<BaseSelect model-value="" :options="options" />
				</BaseFormField>
			`,
			setup: () => ({ options: OPTIONS }),
		})
		await nextTick()

		await user.click(screen.getByRole('combobox', { name: 'Материал корпуса' }))

		expect(await screen.findByRole('listbox', { name: 'Материал корпуса' })).toBeInTheDocument()
	})

	it('isMultiple + isRequired: пустой массив не проходит validate, ошибка — «Обязательное поле»', async () => {
		const wrapper = mount(BaseSelect, {
			props: { modelValue: [] as string[], options: OPTIONS, label: 'Материалы', isMultiple: true, isRequired: true },
		})

		expect(wrapper.vm.validate()).toBe(false)
		await nextTick()
		expect(wrapper.text()).toContain(UI_TEXT.REQUIRED_FIELD)
		expect(wrapper.find('[role="combobox"]').attributes('aria-invalid')).toBe('true')
		wrapper.unmount()
	})

	it('isMultiple + isRequired: выбранное значение проходит validate', () => {
		const wrapper = mount(BaseSelect, {
			props: { modelValue: ['metal'], options: OPTIONS, label: 'Материалы', isMultiple: true, isRequired: true },
		})

		expect(wrapper.vm.validate()).toBe(true)
		wrapper.unmount()
	})
})
