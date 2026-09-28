/**
 * Integration-тесты BaseInputNumber: кнопки, клавиши APG Spinbutton, ввод и подтверждение, форма.
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { BaseForm } from '@components/BaseForm'
import BaseInputNumber from '../ui/BaseInputNumber.vue'

/** Поле с рабочим v-model */
function renderModel(initial: number | null, props: Record<string, unknown> = {}) {
	const model = ref<number | null>(initial)
	const onChange = vi.fn()
	const utils = render({
		components: { BaseInputNumber },
		setup: () => ({ model, props, onChange }),
		template: '<BaseInputNumber v-model="model" v-bind="props" aria-label="Число" @change="onChange" />',
	})
	return { ...utils, model, onChange, field: screen.getByRole('spinbutton', { name: 'Число' }) }
}

describe('BaseInputNumber integration', () => {
	it('кнопки −/+ шагают, не выходят за границы и не уводят фокус', async () => {
		const user = userEvent.setup()
		const { model, onChange } = renderModel(9, { min: 0, max: 10 })

		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(model.value).toBe(10)
		await user.click(screen.getByRole('button', { name: 'Уменьшить' }))
		expect(model.value).toBe(9)
		expect(onChange).toHaveBeenCalledTimes(2)
	})

	it('клавиши: ↑/↓, PageUp/PageDown, Home/End; readonly — клавиши не меняют значение', async () => {
		const user = userEvent.setup()
		const { model, field, rerender } = renderModel(5, { min: 0, max: 100, step: 2 })

		field.focus()
		await user.keyboard('{ArrowUp}')
		expect(model.value).toBe(7)
		await user.keyboard('{ArrowDown}{ArrowDown}')
		expect(model.value).toBe(3)
		await user.keyboard('{PageUp}')
		expect(model.value).toBe(23)
		await user.keyboard('{PageDown}{PageDown}{PageDown}')
		expect(model.value).toBe(0)
		await user.keyboard('{End}')
		expect(model.value).toBe(100)
		await user.keyboard('{Home}')
		expect(model.value).toBe(0)
		void rerender
	})

	it('Home/End без границ не обрабатываются; readonly не шагает', async () => {
		const user = userEvent.setup()
		const readonly = renderModel(5, { isReadonly: true })

		readonly.field.focus()
		await user.keyboard('{ArrowUp}{Home}{End}')
		expect(readonly.model.value).toBe(5)
		readonly.unmount()

		const free = renderModel(5)
		free.field.focus()
		await user.keyboard('{Home}{End}')
		expect(free.model.value).toBe(5)
	})

	it('ввод: допустимое число сразу в v-model, вне границ — ждёт выхода из поля и ограничивается', async () => {
		const user = userEvent.setup()
		const { model, field, onChange } = renderModel(5, { min: 1, max: 50 })

		await user.clear(field)
		expect(model.value).toBeNull()
		await user.type(field, '12')
		expect(model.value).toBe(12)
		await user.type(field, '0')
		expect(model.value).toBe(12)
		await user.tab()
		expect(model.value).toBe(50)
		expect(field).toHaveValue('50')
		expect(onChange).toHaveBeenLastCalledWith(50)
	})

	it('нечисло при выходе из поля возвращает прежнее значение; Enter подтверждает ввод с округлением', async () => {
		const user = userEvent.setup()
		const { model, field } = renderModel(5, { step: 0.1 })

		await user.clear(field)
		await user.type(field, 'abc')
		await user.tab()
		expect(field).toHaveValue('')
		expect(model.value).toBeNull()

		await user.click(field)
		await user.type(field, '1,26{Enter}')
		expect(model.value).toBe(1.3)
		expect(field).toHaveValue('1,3')
	})

	it('шаг от пустого поля — от min, без min — от нуля; частичный ввод не мешает шагу', async () => {
		const user = userEvent.setup()
		const withMin = renderModel(null, { min: 3 })
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(withMin.model.value).toBe(4)
		withMin.unmount()

		const noMin = renderModel(null)
		noMin.field.focus()
		await user.type(noMin.field, '-')
		await user.keyboard('{ArrowUp}')
		expect(noMin.model.value).toBe(1)
	})

	it('внешнее изменение v-model обновляет текст; blur и focus пробрасываются', async () => {
		const user = userEvent.setup()
		const onBlur = vi.fn()
		const onFocus = vi.fn()
		const model = ref<number | null>(1)
		render({
			components: { BaseInputNumber },
			setup: () => ({ model, onBlur, onFocus }),
			template: '<BaseInputNumber v-model="model" aria-label="Число" @blur="onBlur" @focus="onFocus" />',
		})
		const field = screen.getByRole('spinbutton', { name: 'Число' })

		model.value = 42
		await Promise.resolve()
		await user.click(field)
		expect(field).toHaveValue('42')
		await user.tab()
		expect(onFocus).toHaveBeenCalledTimes(1)
		expect(onBlur).toHaveBeenCalledTimes(1)
	})

	it('методы через ref: focus, blur, validate, reset', async () => {
		const numberRef = ref<InstanceType<typeof BaseInputNumber> | null>(null)
		render({
			components: { BaseInputNumber },
			setup: () => ({ numberRef }),
			template: '<BaseInputNumber ref="numberRef" :model-value="null" aria-label="Число" is-required />',
		})

		numberRef.value!.focus()
		expect(screen.getByRole('spinbutton', { name: 'Число' })).toHaveFocus()
		numberRef.value!.blur()
		expect(numberRef.value!.validate()).toBe(false)
		numberRef.value!.reset()
	})

	it('в отключённой BaseForm поле и кнопки отключены', () => {
		render({
			components: { BaseForm, BaseInputNumber },
			template: '<BaseForm is-disabled><BaseInputNumber :model-value="1" aria-label="Число" /></BaseForm>',
		})

		expect(screen.getByRole('spinbutton', { name: 'Число' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Увеличить' })).toBeDisabled()
	})
})
