import '@testing-library/jest-dom/vitest'
import BaseTimeline from '../ui/BaseTimeline.vue'
import { render, screen } from '@testing-library/vue'
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

	describe('хронология', () => {
		const HISTORY: TimelineItem[] = [
			{ id: 1, title: 'Создан', date: new Date(2026, 4, 12, 9, 40) },
			{
				id: 2,
				title: 'Скриншот',
				date: new Date(2026, 4, 12, 14, 15),
				media: { src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'Экран оплаты' },
			},
			{ id: 3, title: 'Без даты' },
			{ id: 4, title: 'Утверждён', date: new Date(2026, 4, 13, 11, 30) },
		]

		it('isGrouped: заголовок дня над первым событием дня, у событий — время', () => {
			const { container } = render(BaseTimeline, { props: { items: HISTORY, isGrouped: true, customClass: { day: 'custom-day' } } })

			const days = [...container.querySelectorAll('.base-timeline__day')].map(day => day.textContent)
			expect(days).toHaveLength(2)
			expect(days[0]).toMatch(/12 мая 2026/)
			expect(days[1]).toMatch(/13 мая 2026/)
			expect(container.querySelector('.base-timeline__day')).toHaveClass('custom-day')
			expect(container.querySelector('time')).toHaveTextContent('09:40')
		})

		it('isGrouped и свой dateFormat: формат из пропа', () => {
			const { container } = render(BaseTimeline, { props: { items: HISTORY, isGrouped: true, dateFormat: { weekday: 'long' } } })

			expect(container.querySelector('time')).toHaveTextContent('вторник')
		})

		it('datePosition=side: время колонкой перед маркером; событие без даты держит колонку пустой', () => {
			const { container } = render(BaseTimeline, { props: { items: HISTORY, datePosition: 'side' } })

			expect(container.querySelector('.base-timeline')).toHaveClass('base-timeline--date-side')
			const firstItem = container.querySelector('.base-timeline__item') as HTMLElement
			expect(firstItem.firstElementChild).toHaveClass('base-timeline__date--side')
			expect(firstItem.querySelector('.base-timeline__content time')).toBeNull()
			expect(container.querySelectorAll('.base-timeline__date--side')).toHaveLength(4)
			expect(container.querySelectorAll('time.base-timeline__date--side')).toHaveLength(3)
		})

		it('datePosition=side у горизонтальной ленты не действует', () => {
			const { container } = render(BaseTimeline, { props: { items: HISTORY, datePosition: 'side', orientation: 'horizontal' } })

			expect(container.querySelector('.base-timeline')).not.toHaveClass('base-timeline--date-side')
			expect(container.querySelector('.base-timeline__content time')).not.toBeNull()
		})

		it('media — картинка события с описанием', () => {
			render(BaseTimeline, { props: { items: HISTORY } })

			expect(screen.getByRole('img', { name: 'Экран оплаты' })).toBeInTheDocument()
		})
	})
})
