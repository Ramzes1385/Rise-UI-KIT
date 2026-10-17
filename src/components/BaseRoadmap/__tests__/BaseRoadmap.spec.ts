import '@testing-library/jest-dom/vitest'
import BaseRoadmap from '../ui/BaseRoadmap.vue'
import { render, screen } from '@testing-library/vue'
import type { RoadmapData } from '../types/roadmapData.types'

const data: RoadmapData = { version: 1, title: 'Пример', stages: [] }

describe('BaseRoadmap unit', () => {
	it('рендерит область с подписью из data.title', () => {
		render(BaseRoadmap, { props: { data } })
		expect(screen.getByRole('region', { name: 'Пример' })).toBeInTheDocument()
	})

	it('слот empty показывается без этапов', () => {
		render(BaseRoadmap, { props: { data }, slots: { empty: 'Пусто' } })
		expect(screen.getByText('Пусто')).toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseRoadmap, { props: { data, variant: 'outline' } })
		expect(container.querySelector('.base-roadmap')).toHaveClass('base-roadmap--outline')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseRoadmap, { props: { data, sizeScale: 125 } })
		expect((container.querySelector('.base-roadmap') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseRoadmap, { props: { data, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-roadmap')).toHaveClass('my-root')
	})
})
