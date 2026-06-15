/**
 * Integration-тесты для BaseTooltip.
 * Проверяют взаимодействие: наведение, скрытие.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'

import BaseTooltip from '../ui/BaseTooltip.vue'

describe('BaseTooltip integration', () => {
	describe('наведение', () => {
		it('должен показывать тултип при наведении', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Цель</button>' },
			})

			await user.hover(screen.getByText('Цель'))

			await waitFor(() => {
				expect(screen.getByText('Подсказка')).toBeInTheDocument()
			})
		})

		it('должен скрывать тултип при уходе курсора', async () => {
			const user = userEvent.setup()
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Цель</button>' },
			})

			await user.hover(screen.getByText('Цель'))

			await waitFor(() => {
				expect(screen.getByText('Подсказка')).toBeInTheDocument()
			})

			await user.unhover(screen.getByText('Цель'))

			await waitFor(() => {
				expect(screen.queryByText('Подсказка')).not.toBeInTheDocument()
			})
		})
	})
})
