import '@testing-library/jest-dom/vitest'
import BaseSearch from '../../ui/BaseSearch.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

vi.mock('@composables/overlay/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/overlay/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/overlay/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

const RESULTS = [{ id: 1, title: '検索結果' }]

describe('BaseSearch: ввод через IME', () => {
	it('Safari: Enter с keyCode 229 не запускает поиск и не выбирает пункт', async () => {
		const { emitted } = render(BaseSearch, { props: { modelValue: '検索', results: RESULTS } })
		const field = screen.getByRole('combobox')
		await fireEvent.focus(field)

		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 })
		expect(emitted().search).toBeUndefined()
		expect(emitted().select).toBeUndefined()

		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 13 })
		expect(emitted().search).toEqual([['検索']])
	})
})
