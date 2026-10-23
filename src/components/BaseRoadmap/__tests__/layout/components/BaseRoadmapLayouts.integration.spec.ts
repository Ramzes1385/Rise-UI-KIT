import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { render, screen } from '@testing-library/vue'
import type { RoadmapData } from '../../../types/roadmapData.types'

const DATA: RoadmapData = {
	version: 1,
	id: 'layouts',
	title: 'Фронтенд',
	goal: 'Работа мечты',
	stages: [
		{
			id: 'basics',
			title: 'Основы',
			topics: [
				{ id: 'html', title: 'HTML', hours: 4 },
				{ id: 'css', title: 'CSS', hours: 6, requires: ['html'] },
			],
		},
		{ id: 'frameworks', title: 'Фреймворки', requires: ['css'], topics: [{ id: 'vue', title: 'Vue', hours: 8 }] },
	],
}

function renderRoadmap(props: Record<string, unknown> = {}) {
	return render(BaseRoadmap, { props: { data: DATA, hasSummary: false, hasFilter: false, hasLayoutSwitch: false, ...props } })
}

beforeEach(() => {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
		width: 1200,
		height: 600,
		top: 0,
		left: 0,
		bottom: 600,
		right: 1200,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	})
})

afterEach(() => {
	vi.restoreAllMocks()
	document.documentElement.removeAttribute('dir')
})

describe('BaseRoadmap: раскладки на холсте', () => {
	it.each([{ layout: 'path' }, { layout: 'snake' }, { layout: 'horizontal' }])(
		'layout=$layout рисует свой холст в области вида',
		({ layout }) => {
			const { container } = renderRoadmap({ layout })
			expect(container.querySelector(`.base-roadmap__area--${layout} .base-roadmap__canvas--${layout}`)).not.toBeNull()
			expect(screen.getByText(/Работа мечты/)).toBeInTheDocument()
		},
	)

	it.each([{ layout: 'path' }, { layout: 'snake' }, { layout: 'horizontal' }])(
		'layout=$layout: этап сворачивается и раскрывается кнопкой, тема выбирается',
		async ({ layout }) => {
			const user = userEvent.setup()
			renderRoadmap({ layout })
			const stage = screen.getByRole('button', { name: /^Этап 1,\s*Основы/ })
			expect(stage).toHaveAttribute('aria-expanded', 'true')
			await user.click(stage)
			expect(stage).toHaveAttribute('aria-expanded', 'false')
			expect(screen.queryByRole('button', { name: /^HTML/ })).not.toBeInTheDocument()
			await user.click(stage)
			expect(stage).toHaveAttribute('aria-expanded', 'true')
			const topic = await screen.findByRole('button', { name: /^HTML/ })
			await user.click(topic)
			expect(topic).toHaveAttribute('aria-pressed', 'true')
		},
	)
})
