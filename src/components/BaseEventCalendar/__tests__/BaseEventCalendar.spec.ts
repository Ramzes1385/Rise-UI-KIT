import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'

describe('BaseEventCalendar unit', () => {
	it('рендерит сетку месяца', () => {
		render(BaseEventCalendar, { props: { date: '2026-10-02' } })
		expect(screen.getByRole('grid')).toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseEventCalendar, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-event-calendar')).toHaveClass('base-event-calendar--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseEventCalendar, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-event-calendar') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseEventCalendar, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-event-calendar')).toHaveClass('my-root')
	})
})
