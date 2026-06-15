/**
 * Integration-тесты для BaseAnimation.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseAnimation from '../ui/BaseAnimation.vue'

describe('BaseAnimation integration', () => {
	it('должен рендерить контент когда show=true', () => {
		render(BaseAnimation, {
			props: { show: true, name: 'fade' },
			slots: { default: 'Animated Content' },
		})

		expect(screen.getByText('Animated Content')).toBeInTheDocument()
	})
})
