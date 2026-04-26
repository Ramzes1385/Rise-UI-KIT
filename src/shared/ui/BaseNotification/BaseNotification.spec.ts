/**
 * Unit-тесты для BaseNotification.
 * Проверяют рендер контейнера.
 * Компонент использует teleport + BaseAnimation(TransitionGroup) —
 * внутренние уведомления тестируются через integration.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BaseNotification from './BaseNotification.vue'

describe('BaseNotification unit', () => {
	describe('рендер', () => {
		it('должен рендерить контейнер уведомлений', () => {
			render(BaseNotification)

			expect(document.querySelector('.base-notification-container')).toBeInTheDocument()
		})

		it('должен рендерить контейнер с title', () => {
			render(BaseNotification, { props: { title: 'Тест' } })

			expect(document.querySelector('.base-notification-container')).toBeInTheDocument()
		})
	})
})
