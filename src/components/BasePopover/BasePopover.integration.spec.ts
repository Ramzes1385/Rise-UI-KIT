/**
 * Integration-тесты для BasePopover.
 * Проверяют взаимодействие: переключение видимости.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

import BasePopover from './BasePopover.vue'

describe('BasePopover integration', () => {
	describe('переключение', () => {
		it('должен эмитить update:isOpen при клике на триггер', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePopover, {
				props: { isOpen: false },
				slots: {
					trigger: '<button>Триггер</button>',
					default: '<p>Контент</p>',
				},
			})

			await user.click(screen.getByText('Триггер'))

			expect(emitted()).toHaveProperty('update:isOpen')
		})

		it('должен эмитить true при первом клике', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePopover, {
				props: { isOpen: false },
				slots: {
					trigger: '<button>Триггер</button>',
					default: '<p>Контент</p>',
				},
			})

			await user.click(screen.getByText('Триггер'))

			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(true)
		})
	})
})
