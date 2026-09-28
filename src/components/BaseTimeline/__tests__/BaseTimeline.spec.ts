import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseTimeline from '../ui/BaseTimeline.vue'
import type { TimelineItem } from '../types/BaseTimeline.types'

const ITEMS: TimelineItem[] = [
	{ id: 1, title: 'Создан', date: new Date(2026, 4, 12, 10, 24), icon: 'check', color: 'success', description: 'Автор — Анна' },
	{ id: 2, title: 'На проверке', date: '2026-05-13T08:00:00' },
	{ id: 3, title: 'Опубликован', date: 'после проверки', color: 'neutral' },
]

describe('BaseTimeline', () => {
	it('упорядоченный список событий: заголовки, описание, маркер скрыт от скринридера, линии между событиями', () => {
		const { container } = render(BaseTimeline, { props: { items: ITEMS } })

		expect(container.querySelector('ol')).toBeInTheDocument()
		expect(screen.getAllByRole('listitem')).toHaveLength(3)
		expect(screen.getByText('Автор — Анна')).toBeInTheDocument()
		expect(container.querySelector('.base-timeline__marker')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelectorAll('.base-timeline__line')).toHaveLength(2)
		expect(container.querySelector('.base-timeline__icon')).not.toBeNull()
		expect(container.querySelectorAll('.base-timeline__dot')).toHaveLength(2)
		expect(container.querySelector('.base-timeline__item')).toHaveClass('base-timeline__item--success')
		expect(container.querySelectorAll('.base-timeline__item')[1]).toHaveClass('base-timeline__item--primary')
	})

	it('даты: Date и ISO — в формате языка с datetime, другая строка — как есть', () => {
		const { container } = render(BaseTimeline, { props: { items: ITEMS } })
		const times = container.querySelectorAll('time')

		expect(times[0]).toHaveTextContent('12 мая 2026')
		expect(times[0].getAttribute('datetime')).toMatch(/^2026-05-12T/)
		expect(times[1]).toHaveTextContent('13 мая 2026')
		expect(times[2]).toHaveTextContent('после проверки')
		expect(times[2]).toHaveAttribute('datetime', 'после проверки')
	})

	it('свой формат даты', () => {
		const { container } = render(BaseTimeline, {
			props: { items: ITEMS.slice(0, 1), dateFormat: { hour: '2-digit', minute: '2-digit' } },
		})

		expect(container.querySelector('time')).toHaveTextContent('10:24')
	})

	it('текущее событие — aria-current="step", следующие — предстоящие; неизвестный currentId — без текущего', async () => {
		const { container, rerender } = render(BaseTimeline, { props: { items: ITEMS, currentId: 2 } })
		const items = container.querySelectorAll('.base-timeline__item')

		expect(items[1]).toHaveAttribute('aria-current', 'step')
		expect(items[1]).toHaveClass('base-timeline__item--current')
		expect(items[2]).toHaveClass('base-timeline__item--upcoming')
		expect(items[0]).not.toHaveClass('base-timeline__item--upcoming')

		await rerender({ currentId: 99 })
		expect(container.querySelector('[aria-current]')).toBeNull()
		expect(container.querySelector('.base-timeline__item--upcoming')).toBeNull()
	})

	it('горизонтальная лента и слот события', () => {
		const { container } = render(BaseTimeline, {
			props: { items: ITEMS, orientation: 'horizontal', currentId: 1 },
			slots: {
				item: `<template #item="{ item, isCurrent, isUpcoming }">{{ item.title }}:{{ isCurrent }}:{{ isUpcoming }}</template>`,
			},
		})

		expect(container.querySelector('.base-timeline')).toHaveClass('base-timeline--horizontal')
		expect(screen.getByText('Создан:true:false')).toBeInTheDocument()
		expect(screen.getByText('На проверке:false:true')).toBeInTheDocument()
	})
})
