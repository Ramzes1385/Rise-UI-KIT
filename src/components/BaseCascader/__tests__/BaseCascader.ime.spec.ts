import '@testing-library/jest-dom/vitest'
import { REGIONS } from './cascaderFixtures'
import { UI_ARIA } from '@/locales/messages'
import BaseCascader from '../ui/BaseCascader.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseCascader: поиск через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: Enter и стрелки принадлежат IME, значение не выбирается', async (_name, init) => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCascader, { props: { items: REGIONS, label: 'Регион', isSearchable: true } })
		await user.click(screen.getByRole('combobox', { name: 'Регион' }))
		const search = screen.getByRole('textbox', { name: UI_ARIA.SEARCH })

		await fireEvent.compositionStart(search)
		await fireEvent.update(search, 'ар')
		await fireEvent.keyDown(search, { key: 'ArrowDown', ...init })
		await fireEvent.keyDown(search, { key: 'Enter', ...init })
		expect(emitted()['update:modelValue']).toBeUndefined()

		await fireEvent.compositionEnd(search)
		await fireEvent.keyDown(search, { key: 'Enter', keyCode: 13 })
		expect(emitted()['update:modelValue']).toEqual([[['am']]])
	})
})
