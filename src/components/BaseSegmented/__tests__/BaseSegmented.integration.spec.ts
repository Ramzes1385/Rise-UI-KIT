/**
 * Integration-тесты BaseSegmented: выбор кликом, BaseFormField и BaseForm вокруг.
 */

import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { BaseForm } from '@components/BaseForm'
import { BaseFormField } from '@components/BaseFormField'
import BaseSegmented from '../ui/BaseSegmented.vue'
import type { SegmentedOption } from '../model/BaseSegmented.types'

const OPTIONS: SegmentedOption[] = [
	{ value: 'day', label: 'День' },
	{ value: 'week', label: 'Неделя' },
]

describe('BaseSegmented integration', () => {
	it('клик по сегменту выбирает его: v-model и change', async () => {
		const user = userEvent.setup()
		const model = ref<string | number | null>('day')
		const onChange = vi.fn()
		render({
			components: { BaseSegmented },
			setup: () => ({ model, onChange, options: OPTIONS }),
			template: '<BaseSegmented v-model="model" :options="options" aria-label="Период" @change="onChange" />',
		})

		await user.click(screen.getByText('Неделя'))

		expect(model.value).toBe('week')
		expect(onChange).toHaveBeenCalledWith('week')
		expect(screen.getByRole('radio', { name: 'Неделя' })).toBeChecked()
	})

	it('в BaseFormField группа названа подписью обёртки и описана её ошибкой', async () => {
		render({
			components: { BaseSegmented, BaseFormField },
			setup: () => ({ options: OPTIONS }),
			template: '<BaseFormField label="Период" error="Выберите период"><BaseSegmented :options="options" /></BaseFormField>',
		})
		await nextTick()

		expect(screen.getByRole('radiogroup', { name: 'Период' })).toHaveAccessibleDescription('Выберите период')
	})

	it('в отключённой BaseForm сегменты отключены', () => {
		render({
			components: { BaseSegmented, BaseForm },
			setup: () => ({ options: OPTIONS }),
			template: '<BaseForm is-disabled><BaseSegmented :options="options" aria-label="Период" /></BaseForm>',
		})

		for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
	})
})
