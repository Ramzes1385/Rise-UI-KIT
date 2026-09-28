/**
 * Integration-тесты BaseTimePicker: фильтр по началу времени, свой ввод, границы, очистка.
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseTimePicker from '../ui/BaseTimePicker.vue'

function renderModel(initial: string | null = null, props: Record<string, unknown> = {}) {
	const model = ref<string | null>(initial)
	const onChange = vi.fn()
	const onBlur = vi.fn()
	const onFocus = vi.fn()
	const utils = render({
		components: { BaseTimePicker },
		setup: () => ({ model, props, onChange, onBlur, onFocus }),
		template: '<BaseTimePicker v-model="model" v-bind="props" aria-label="Время" @change="onChange" @blur="onBlur" @focus="onFocus" />',
	})
	return { ...utils, model, onChange, onBlur, onFocus, field: screen.getByRole('combobox', { name: 'Время' }) }
}

function labels(): string[] {
	return [...document.querySelectorAll('[role="option"]')].map(option => option.textContent?.trim() ?? '')
}

describe('BaseTimePicker integration', () => {
	it('цифры фильтруют список по началу времени: «9» — 09:…, «9:3» — 09:30', async () => {
		const user = userEvent.setup()
		const { field } = renderModel(null, { step: 30 })

		await user.type(field, '9')
		expect(labels()).toEqual(['09:00', '09:30'])
		await user.type(field, ':3')
		expect(labels()).toEqual(['09:30'])
	})

	it('набранное время без двоеточия становится HH:MM при выходе из поля; событие change', async () => {
		const user = userEvent.setup()
		const { field, model, onChange, onBlur, onFocus } = renderModel()

		await user.type(field, '1415')
		await user.tab()

		expect(model.value).toBe('14:15')
		expect(onChange).toHaveBeenLastCalledWith('14:15')
		expect(onFocus).toHaveBeenCalled()
		expect(onBlur).toHaveBeenCalled()
	})

	it('время вне границ и не время не принимаются; Escape очищает', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel('10:00', { minTime: '09:00', maxTime: '18:00' })

		await user.clear(field)
		await user.type(field, '2130')
		await user.tab()
		expect(model.value).toBe('10:00')

		await user.clear(field)
		await user.type(field, '0815')
		await user.tab()
		expect(model.value).toBe('10:00')

		await user.clear(field)
		await user.type(field, 'обед')
		await user.tab()
		expect(model.value).toBe('10:00')

		field.focus()
		await user.keyboard('{Escape}')
		expect(model.value).toBeNull()
	})

	it('без границ принимается любое время суток', async () => {
		const user = userEvent.setup()
		const { field, model } = renderModel()

		await user.type(field, '23:59{Enter}')

		expect(model.value).toBe('23:59')
	})

	it('методы через ref', () => {
		const pickerRef = ref<InstanceType<typeof BaseTimePicker> | null>(null)
		render({
			components: { BaseTimePicker },
			setup: () => ({ pickerRef }),
			template: '<BaseTimePicker ref="pickerRef" aria-label="Время" />',
		})

		pickerRef.value!.focus()
		expect(screen.getByRole('combobox', { name: 'Время' })).toHaveFocus()
		pickerRef.value!.blur()
		expect(pickerRef.value!.validate()).toBe(true)
		pickerRef.value!.reset()
	})
})
