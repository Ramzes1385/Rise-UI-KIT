import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseDatePicker: клавиши поля и проверка', () => {
	it('буква в поле панель не открывает, ↓ — открывает', async () => {
		const { emitted } = render(BaseDatePicker, { props: { modelValue: null } })
		const field = screen.getByPlaceholderText('Выберите дату')

		await fireEvent.keyDown(field, { key: 'a' })
		expect(emitted().open).toBeUndefined()
		expect(document.querySelector('.date-picker-panel')).toBeNull()

		await fireEvent.keyDown(field, { key: 'ArrowDown' })
		expect(emitted().open).toHaveLength(1)
	})

	it('у отключённого поля Enter панель не открывает', async () => {
		const { emitted } = render(BaseDatePicker, { props: { modelValue: null, isDisabled: true } })

		await fireEvent.keyDown(screen.getByPlaceholderText('Выберите дату'), { key: 'Enter' })
		expect(emitted().open).toBeUndefined()
	})

	it('обязательное пустое поле не проходит validate()', () => {
		const wrapper = mount(BaseDatePicker, { props: { modelValue: null, isRequired: true } })

		expect(wrapper.vm.validate()).toBe(false)
		wrapper.unmount()
	})
})
