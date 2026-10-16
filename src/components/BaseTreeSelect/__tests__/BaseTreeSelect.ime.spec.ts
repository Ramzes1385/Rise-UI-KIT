import '@testing-library/jest-dom/vitest'
import BaseTreeSelect from '../ui/BaseTreeSelect.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseTreeSelect: ввод через IME', () => {
	it('Safari: Enter с keyCode 229 в поле не открывает список', async () => {
		render(BaseTreeSelect, { props: { items: [{ id: 'tokyo', label: '東京' }], label: 'Город', modelValue: '' } })
		const combobox = screen.getByRole('combobox', { name: 'Город' })

		await fireEvent.keyDown(combobox, { key: 'Enter', keyCode: 229 })
		expect(combobox).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.keyDown(combobox, { key: 'Enter', keyCode: 13 })
		expect(combobox).toHaveAttribute('aria-expanded', 'true')
	})
})
