import '@testing-library/jest-dom/vitest'
import BaseSelect from '../ui/BaseSelect.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BaseSelectOption } from '../types/BaseSelect.types'

const OPTIONS: BaseSelectOption[] = [
	{ value: 'cn', label: '中国' },
	{ value: 'jp', label: '日本' },
	{ value: 'kr', label: '韓国' },
]

describe('BaseSelect: поиск через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: стрелки и Enter принадлежат IME, список остаётся открытым', async (_name, init) => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSelect, { props: { modelValue: '', options: OPTIONS, label: 'Страна', isSearchable: true } })
		const combobox = screen.getByRole('combobox', { name: 'Страна' })
		await user.click(combobox)
		const search = screen.getByRole('textbox', { name: 'Поиск' })

		await fireEvent.compositionStart(search)
		await fireEvent.update(search, 'ri')
		await fireEvent.keyDown(search, { key: 'ArrowDown', ...init })
		await fireEvent.keyDown(search, { key: 'Enter', ...init })
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(combobox).toHaveAttribute('aria-expanded', 'true')

		await fireEvent.compositionEnd(search)
		await fireEvent.update(search, '日')
		await fireEvent.keyDown(search, { key: 'ArrowDown', keyCode: 40 })
		await fireEvent.keyDown(search, { key: 'Enter', keyCode: 13 })
		expect(emitted()['update:modelValue']).toEqual([['jp']])
	})
})
