/**
 * Integration-тесты BaseCheckboxGroup: v-model, «Выбрать все», группа в BaseFormField и BaseForm.
 */

import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { BaseForm } from '@components/BaseForm'
import { BaseFormField } from '@components/BaseFormField'
import BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import type { CheckboxGroupOption } from '../types/BaseCheckboxGroup.types'

const OPTIONS: CheckboxGroupOption[] = [
	{ value: 'email', label: 'Почта' },
	{ value: 'push', label: 'Push' },
	{ value: 'sms', label: 'SMS', isDisabled: true },
]

describe('BaseCheckboxGroup integration', () => {
	it('клик отмечает и снимает флажок: новый массив в порядке вариантов', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCheckboxGroup, { props: { options: OPTIONS, modelValue: ['push'] } })

		await user.click(screen.getByRole('checkbox', { name: 'Почта' }))
		await user.click(screen.getByRole('checkbox', { name: 'Push' }))

		expect(emitted()['update:modelValue']).toEqual([[['email', 'push']], [[]]])
		expect(emitted().change).toEqual([[['email', 'push']], [[]]])
	})

	it('значения вне вариантов сохраняются в конце массива', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCheckboxGroup, { props: { options: OPTIONS, modelValue: ['legacy'] } })

		await user.click(screen.getByRole('checkbox', { name: 'Push' }))

		expect(emitted()['update:modelValue']).toEqual([[['push', 'legacy']]])
	})

	it('«Выбрать все» отмечает доступные варианты, повторный клик снимает их; недоступный не трогает', async () => {
		const user = userEvent.setup()
		const model = ref<(string | number)[]>(['sms'])
		render({
			components: { BaseCheckboxGroup },
			setup: () => ({ model, options: OPTIONS }),
			template: '<BaseCheckboxGroup v-model="model" :options="options" has-select-all />',
		})
		const selectAll = screen.getByRole('checkbox', { name: 'Выбрать все' })

		await user.click(selectAll)
		expect(model.value).toEqual(['email', 'push', 'sms'])
		expect(selectAll).toBeChecked()

		await user.click(selectAll)
		expect(model.value).toEqual(['sms'])
		expect(selectAll).not.toBeChecked()
	})

	it('в BaseFormField группа названа подписью обёртки и описана её описанием', async () => {
		render({
			components: { BaseCheckboxGroup, BaseFormField },
			setup: () => ({ options: OPTIONS }),
			template: `
				<BaseFormField label="Каналы" description="Можно выбрать несколько">
					<BaseCheckboxGroup :options="options" />
				</BaseFormField>
			`,
		})

		// Обёртка узнаёт о контроле при его монтировании и перерисовывается в следующем тике
		await nextTick()
		const group = screen.getByRole('group', { name: 'Каналы' })
		expect(group).toHaveAccessibleDescription('Можно выбрать несколько')
		// Обёртка не добавляет свою группу: группа одна
		expect(screen.getAllByRole('group')).toHaveLength(1)
	})

	it('в отключённой BaseForm флажки отключены', () => {
		render({
			components: { BaseCheckboxGroup, BaseForm },
			setup: () => ({ options: OPTIONS }),
			template: '<BaseForm is-disabled><BaseCheckboxGroup :options="options" has-select-all /></BaseForm>',
		})

		for (const checkbox of screen.getAllByRole('checkbox')) expect(checkbox).toBeDisabled()
	})
})
