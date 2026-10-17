import '@testing-library/jest-dom/vitest'
import BaseRoadmap from '../ui/BaseRoadmap.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseRoadmap integration', () => {
	it('isLoading ставит aria-busy', () => {
		render(BaseRoadmap, { props: { data: { version: 1, title: 'Пример', stages: [] }, isLoading: true } })
		expect(screen.getByRole('region', { name: 'Пример' })).toHaveAttribute('aria-busy', 'true')
	})
})
