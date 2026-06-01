/**
 * Integration-тесты для BaseSearch.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseSearch from './BaseSearch.vue'

/** Мокаем DOM-зависимые композаблы */
vi.mock('@composables/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

describe('BaseSearch integration', () => {
	it('должен эмитить update:modelValue при вводе', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSearch, {
			props: { modelValue: '' },
		})

		const input = screen.getByPlaceholderText('Поиск...')
		await user.type(input, 'test')

		expect(emitted()).toHaveProperty('update:modelValue')
		expect(emitted()['update:modelValue']).toContainEqual(['t'])
		expect(emitted()['update:modelValue']).toContainEqual(['te'])
	})

	it('должен эмитить clear при клике на кнопку очистки', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSearch, {
			props: { modelValue: 'some text', hasClear: true },
		})

		const clearBtn = document.querySelector('.base-search__clear')!
		await user.click(clearBtn)

		expect(emitted()).toHaveProperty('clear')
		expect(emitted()['update:modelValue']).toContainEqual([''])
	})
})

