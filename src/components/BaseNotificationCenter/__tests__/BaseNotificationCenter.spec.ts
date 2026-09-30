import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseNotificationCenter from '../ui/BaseNotificationCenter.vue'
import type { NotificationCenterItem } from '../types/BaseNotificationCenter.types'

const NOW = new Date(2025, 4, 15, 10, 30)

const ITEMS: NotificationCenterItem[] = [
	{
		id: 'n1',
		title: 'Анна упомянула вас',
		text: 'Посмотрите макет',
		date: new Date(2025, 4, 15, 10, 25),
		avatar: 'data:image/png;base64,AA',
	},
	{ id: 'n2', title: 'Заказ оплачен', date: new Date(2025, 4, 15, 9, 30), icon: 'check-circle' },
	{ id: 'n3', title: 'Отчёт готов', date: new Date(2025, 4, 14, 18, 0), isRead: true },
]

const renderCenter = (props: Record<string, unknown> = {}) =>
	render(BaseNotificationCenter, { props: { items: ITEMS, now: NOW, ...props } })

describe('BaseNotificationCenter unit', () => {
	it('область «Уведомления», число новых, относительное время и отметка непрочитанного', () => {
		const { container } = renderCenter()
		expect(screen.getByRole('region', { name: 'Уведомления' })).toBeInTheDocument()
		expect(screen.getByRole('status')).toHaveTextContent('2 новых')
		expect(screen.getByRole('button', { name: 'Анна упомянула вас Посмотрите макет 5 минут назад не прочитано' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Отчёт готов 16 часов назад' })).toBeInTheDocument()
		expect(container.querySelector('time')).toHaveAttribute('datetime', new Date(ITEMS[0].date).toISOString())
		expect(container.querySelectorAll('.base-notification-center__item--unread')).toHaveLength(2)
	})

	it('картинка, своя иконка и колокольчик по умолчанию', () => {
		const { container } = renderCenter()
		expect(container.querySelector('.base-avatar img')).toHaveAttribute('alt', '')
		const icons = [...container.querySelectorAll('.base-notification-center__icon use')].map(use => use.getAttribute('href'))
		expect(icons[0]).toMatch(/#check-circle$/)
		expect(icons[1]).toMatch(/#bell$/)
	})

	it('клик по уведомлению отмечает его прочитанным и даёт select', async () => {
		const { emitted } = renderCenter()
		await fireEvent.click(screen.getByRole('button', { name: /^Анна упомянула вас/ }))
		expect(emitted().select).toEqual([[ITEMS[0]]])
		expect(emitted().read).toEqual([[['n1']]])
		expect((emitted()['update:items'][0] as [NotificationCenterItem[]])[0][0].isRead).toBe(true)
	})

	it('клик по прочитанному — только select', async () => {
		const { emitted } = renderCenter()
		await fireEvent.click(screen.getByRole('button', { name: /^Отчёт готов/ }))
		expect(emitted().select).toHaveLength(1)
		expect(emitted()['update:items']).toBeUndefined()
	})

	it('кнопка справа переключает отметку в обе стороны', async () => {
		const { emitted } = renderCenter()
		const [markRead] = screen.getAllByRole('button', { name: 'Отметить прочитанным' })
		await fireEvent.click(markRead)
		await fireEvent.click(screen.getByRole('button', { name: 'Отметить непрочитанным' }))
		expect(emitted().read).toEqual([[['n1']]])
		expect(emitted().unread).toEqual([[['n3']]])
	})

	it('«Прочитать все» отмечает все непрочитанные; без них кнопка недоступна', async () => {
		const { emitted, rerender } = renderCenter()
		await fireEvent.click(screen.getByRole('button', { name: 'Прочитать все' }))
		expect(emitted().read).toEqual([[['n1', 'n2']]])
		await rerender({ items: ITEMS.map(item => ({ ...item, isRead: true })) })
		expect(screen.getByRole('button', { name: 'Прочитать все' })).toBeDisabled()
		expect(screen.getByRole('status')).toHaveTextContent('')
	})

	it('фильтр «Непрочитанные»: свой без v-model и из пропа; пустой — «Всё прочитано»', async () => {
		const { emitted, rerender } = renderCenter()
		await fireEvent.click(screen.getByRole('radio', { name: 'Непрочитанные · 2' }))
		expect(emitted()['update:filter']).toEqual([['unread']])
		expect(screen.queryByText('Отчёт готов')).not.toBeInTheDocument()
		await rerender({ items: [ITEMS[2]], filter: 'unread' })
		expect(screen.getByText('Всё прочитано')).toBeInTheDocument()
		expect(screen.getByRole('radio', { name: 'Непрочитанные' })).toBeChecked()
		await rerender({ items: [ITEMS[2]], filter: undefined })
		expect(screen.getByText('Всё прочитано')).toBeInTheDocument()
	})

	it('пустой список, свой заголовок, высота списка, вариант и customClass', () => {
		const { container, rerender } = renderCenter({ items: [], title: 'Входящие', variant: 'ghost', customClass: { root: 'my-root' } })
		expect(screen.getByText('Уведомлений нет')).toBeInTheDocument()
		expect(screen.getByRole('region', { name: 'Входящие' })).toHaveClass('base-notification-center--ghost', 'my-root')
		return rerender({ items: ITEMS, maxHeight: 200 }).then(() => {
			expect((container.querySelector('.base-notification-center__list') as HTMLElement).style.maxHeight).toBe('200px')
		})
	})

	it('без now — относительно текущего времени', () => {
		render(BaseNotificationCenter, { props: { items: [{ id: 'x', title: 'Сейчас', date: new Date() }] } })
		expect(screen.getByRole('button', { name: /^Сейчас сейчас/ })).toBeInTheDocument()
	})
})
