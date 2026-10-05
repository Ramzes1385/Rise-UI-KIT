import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseTimeline from '../ui/BaseTimeline.vue'
import type { TimelineItem } from '../types/BaseTimeline.types'

const ITEMS: TimelineItem[] = [
	{ id: 1, title: 'Создан', description: 'Автор — Анна', date: '2026-05-12T10:24:00', icon: 'check' },
	{
		id: 2,
		title: 'Опубликован',
		date: '2026-05-13T08:00:00',
		media: { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'Обложка' },
	},
]

const PARTS = {
	root: 'u-root',
	item: 'u-item',
	date: 'u-date',
	marker: 'u-marker',
	icon: 'u-icon',
	dot: 'u-dot',
	line: 'u-line',
	content: 'u-content',
	day: 'u-day',
	title: 'u-title',
	description: 'u-description',
	media: 'u-media',
}

describe('BaseTimeline: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseTimeline, { props: { items: ITEMS } })

		expect(container.querySelector('ol')).toHaveAttribute('class', 'base-timeline base-timeline--vertical')
		expect(container.querySelector('.base-timeline__title')).toHaveAttribute('class', 'base-timeline__title')
		expect(container.querySelector('.base-timeline__dot')).toHaveAttribute('class', 'base-timeline__dot')
		expect(container.querySelector('.base-timeline__line')).toHaveAttribute('class', 'base-timeline__line')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseTimeline, {
			props: { items: ITEMS, isGrouped: true, variant: 'soft', customClass: { root: 'own-root', item: 'own-item' }, ui: PARTS },
		})
		const root = container.querySelector('ol')!

		expect(root).toHaveClass('base-timeline', 'u-root', 'base-timeline--soft', 'own-root')
		expect(container.querySelector('.base-timeline__item')).toHaveClass('u-item', 'own-item', 'base-timeline__item--primary')
		for (const [part, name] of Object.entries(PARTS).filter(([part]) => part !== 'root')) {
			expect(container.querySelector(`.base-timeline__${part}`), part).toHaveClass(name)
		}
	})

	it('дата колонкой слева и пустое место под неё получают класс части date', () => {
		const { container } = render(BaseTimeline, {
			props: { items: [...ITEMS, { id: 3, title: 'Без даты' }], datePosition: 'side', ui: { date: 'u-date' } },
		})
		const dates = container.querySelectorAll('.base-timeline__date--side')

		expect(dates).toHaveLength(3)
		for (const date of dates) expect(date).toHaveClass('base-timeline__date', 'u-date')
	})

	it('классы из defaults.BaseTimeline.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseTimeline, {
			props: { items: ITEMS, ui: { title: 'own-title' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTimeline: { ui: { root: 'app-root', title: 'app-title' } } } })] },
		})

		expect(container.querySelector('ol')).toHaveClass('base-timeline', 'app-root')
		expect(container.querySelector('.base-timeline__title')).toHaveAttribute('class', 'base-timeline__title app-title own-title')
	})
})
