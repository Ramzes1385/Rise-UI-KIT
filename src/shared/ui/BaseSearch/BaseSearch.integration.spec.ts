/**
 * Integration-тесты для BaseSearch.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseSearch from './BaseSearch.vue'

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

		const clearBtn = screen.getByText('✕')
		await user.click(clearBtn)

		expect(emitted()).toHaveProperty('clear')
		expect(emitted()['update:modelValue']).toContainEqual([''])
	})
})
