import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { layoutProps, sampleStages } from './layoutCases'
import RoadmapHorizontal from '../../../ui/layouts/RoadmapHorizontal.vue'

describe('RoadmapHorizontal', () => {
	it('кладёт холст в горизонтальную область прокрутки', () => {
		const { container } = render(RoadmapHorizontal, { props: layoutProps(sampleStages()) })
		const scroll = container.querySelector('.base-roadmap__scroll') as HTMLElement
		expect(scroll).toHaveClass('base-scroll-area', 'base-scroll-area--horizontal')
		expect(scroll.querySelector('.base-scroll-area__content > .base-roadmap__canvas--horizontal')).not.toBeNull()
	})

	it('вся лента остаётся в DOM: этапы, темы и цель', () => {
		const { container, getByText } = render(RoadmapHorizontal, { props: layoutProps(sampleStages(), { goal: 'Работа' }) })
		expect(container.querySelectorAll('.base-roadmap__scroll ol.base-roadmap__stages > li')).toHaveLength(3)
		expect(getByText('Работа')).toBeInTheDocument()
	})
})
