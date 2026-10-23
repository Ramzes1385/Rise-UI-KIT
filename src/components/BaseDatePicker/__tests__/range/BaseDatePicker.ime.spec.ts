import '@testing-library/jest-dom/vitest'
import BaseDatePicker from '../../ui/BaseDatePicker.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseDatePicker: ввод периода через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: Enter, подтверждающий слово, не применяет и не открывает панель', async (_name, init) => {
		const { emitted } = render(BaseDatePicker, {
			props: { label: 'Период', selectionMode: 'range', isReadonly: false, locale: 'ja-JP' },
		})
		const input = screen.getByLabelText('Период')

		await fireEvent.compositionStart(input)
		await fireEvent.update(input, '２０２６／１０／０１')
		await fireEvent.keyDown(input, { key: 'Enter', ...init })
		expect(emitted()['range-select']).toBeUndefined()
		expect(document.body.querySelector('.date-picker-panel')).toBeNull()

		await fireEvent.compositionEnd(input)
		await fireEvent.update(input, '２０２６／１０／０１　〜　２０２６／１０／０５')
		await fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
		expect(emitted()['range-select']).toEqual([[new Date(2026, 9, 1), new Date(2026, 9, 5)]])
	})
})
