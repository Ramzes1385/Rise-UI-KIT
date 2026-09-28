import '@testing-library/jest-dom/vitest'
import BaseCard from '../ui/BaseCard.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseCard integration', () => {
	it('должен рендерить контент в слотах', () => {
		render(BaseCard, {
			slots: {
				header: 'Header Content',
				default: 'Body Content',
				footer: 'Footer Content',
			},
		})

		expect(screen.getByText('Header Content')).toBeInTheDocument()
		expect(screen.getByText('Body Content')).toBeInTheDocument()
		expect(screen.getByText('Footer Content')).toBeInTheDocument()
	})
})
