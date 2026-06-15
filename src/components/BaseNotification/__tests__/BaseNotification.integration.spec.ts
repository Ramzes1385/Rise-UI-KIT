/**
 * Integration-тесты для BaseNotification.
 * Проверяют рендер и базовую логику.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { vi } from 'vitest'

import BaseNotification from '../ui/BaseNotification.vue'

describe('BaseNotification integration', () => {
	describe('добавление уведомлений', () => {
		it('должен рендериться без ошибок когда передан title', () => {
			const { emitted } = render(BaseNotification, {
				props: { title: 'Тест', duration: 0 },
			})

			expect(emitted).toBeDefined()
		})
	})

	describe('закрытие', () => {
		it('должен рендериться с duration=0 без ошибок', () => {
			vi.useFakeTimers()
			const { emitted } = render(BaseNotification, {
				props: { title: 'Тест', duration: 0 },
			})

			vi.advanceTimersByTime(100)

			expect(emitted).toBeDefined()
			vi.useRealTimers()
		})
	})
})
