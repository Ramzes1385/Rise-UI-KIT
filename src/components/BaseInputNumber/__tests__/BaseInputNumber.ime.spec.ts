import '@testing-library/jest-dom/vitest'
import BaseInputNumber from '../ui/BaseInputNumber.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseInputNumber: ввод через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: полноширинные цифры — стрелки не меняют шаг, Enter не подтверждает значение', async (_name, init) => {
		const { emitted } = render(BaseInputNumber, { props: { modelValue: 5, ariaLabel: 'Количество' } })
		const field = screen.getByRole('spinbutton', { name: 'Количество' })

		await fireEvent.compositionStart(field)
		await fireEvent.keyDown(field, { key: 'ArrowUp', ...init })
		await fireEvent.keyDown(field, { key: 'Enter', ...init })
		expect(emitted()['update:modelValue']).toBeUndefined()

		await fireEvent.compositionEnd(field)
		await fireEvent.keyDown(field, { key: 'ArrowUp', keyCode: 38 })
		expect(emitted()['update:modelValue']).toEqual([[6]])
	})
})
