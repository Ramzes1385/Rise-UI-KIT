import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import BaseCountdown from '../ui/BaseCountdown.vue'
import { render, screen } from '@testing-library/vue'

const NOW = new Date('2026-10-02T12:00:00Z').getTime()
const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const text = (element: Element | null): string => (element?.textContent ?? '').replace(/\s+/g, ' ').trim()
const cells = (container: Element): string[] =>
	[...container.querySelectorAll('.base-countdown__unit')].map(unit => [...unit.children].map(text).join(' '))

describe('BaseCountdown unit', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(NOW)
	})

	afterEach(() => {
		vi.useRealTimers()
		setLocale('ru')
	})

	it('ячейки: дни, часы, минуты и секунды с подписями по языку', () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND } })
		expect(cells(container)).toEqual(['2 дня', '03 часа', '04 минуты', '05 секунд'])
	})

	it('принимает Date, метку времени и строку ISO', async () => {
		const { container, rerender } = render(BaseCountdown, {
			props: { to: new Date(NOW + 90 * SECOND), format: ['minutes', 'seconds'] },
		})
		expect(cells(container)).toEqual(['01 минута', '30 секунд'])
		await rerender({ to: '2026-10-02T12:00:30Z' })
		expect(cells(container)).toEqual(['00 минут', '30 секунд'])
	})

	it('строка без смещения — местное время устройства, только дата — местная полночь', async () => {
		const { container, rerender } = render(BaseCountdown, { props: { to: '2026-10-03', format: ['hours', 'minutes', 'seconds'] } })
		const toLocalMidnight = new Date(2026, 9, 3).getTime() - NOW
		const hours = Math.floor(toLocalMidnight / HOUR)
		expect(text(container.querySelector('.base-countdown__value'))).toBe(String(hours).padStart(2, '0'))
		const later = new Date(NOW + 5 * HOUR)
		const local = `2026-10-${String(later.getDate()).padStart(2, '0')}T${String(later.getHours()).padStart(2, '0')}:00`
		await rerender({ to: local })
		expect(cells(container)).toEqual(['05 часов', '00 минут', '00 секунд'])
	})

	it('идёт каждую секунду и вызывает finish один раз на нуле', async () => {
		const { container, emitted } = render(BaseCountdown, { props: { to: NOW + 2 * SECOND + 500, format: ['seconds'] } })
		expect(cells(container)).toEqual(['03 секунды'])
		await vi.advanceTimersByTimeAsync(500)
		expect(cells(container)).toEqual(['02 секунды'])
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(cells(container)).toEqual(['01 секунда'])
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(cells(container)).toEqual(['00 секунд'])
		expect(container.querySelector('.base-countdown')).toHaveClass('base-countdown--finished')
		await vi.advanceTimersByTimeAsync(5 * SECOND)
		expect(emitted('finish')).toHaveLength(1)
	})

	it('дата уже прошла — нули без finish', async () => {
		const { container, emitted } = render(BaseCountdown, { props: { to: NOW - DAY } })
		await vi.advanceTimersByTimeAsync(2 * SECOND)
		expect(cells(container)).toEqual(['0 дней', '00 часов', '00 минут', '00 секунд'])
		expect(emitted('finish')).toBeUndefined()
	})

	it('неверная дата — нули без finish', async () => {
		const { container, emitted } = render(BaseCountdown, { props: { to: 'не дата', format: ['seconds'] } })
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(cells(container)).toEqual(['00 секунд'])
		expect(emitted('finish')).toBeUndefined()
	})

	it('новая дата после окончания запускает отсчёт заново', async () => {
		const { container, rerender, emitted } = render(BaseCountdown, { props: { to: NOW + SECOND, format: ['seconds'] } })
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(emitted('finish')).toHaveLength(1)
		await rerender({ to: Date.now() + 3 * SECOND })
		expect(cells(container)).toEqual(['03 секунды'])
		await vi.advanceTimersByTimeAsync(3 * SECOND)
		expect(emitted('finish')).toHaveLength(2)
	})

	it('format: старшая единица вбирает остаток, младшая округляется вверх', () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 2 * DAY + 30 * SECOND, format: ['hours', 'minutes'] } })
		expect(cells(container)).toEqual(['48 часов', '01 минута'])
	})

	it('format без известных единиц — все четыре, порядок от большей к меньшей', async () => {
		const { container, rerender } = render(BaseCountdown, { props: { to: NOW + HOUR, format: [] } })
		expect(container.querySelectorAll('.base-countdown__unit')).toHaveLength(4)
		await rerender({ format: ['seconds', 'hours'] })
		expect(cells(container)).toEqual(['01 час', '00 секунд'])
	})

	it('layout inline — строкой, как часы; дни только если есть', async () => {
		const { container, rerender } = render(BaseCountdown, {
			props: { to: NOW + DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND, layout: 'inline' },
		})
		expect(text(container.querySelector('.base-countdown__clock'))).toBe('1 дн. 02:03:04')
		await rerender({ to: NOW + 3 * MINUTE })
		expect(text(container.querySelector('.base-countdown__clock'))).toBe('00:03:00')
		await rerender({ format: ['days'] })
		expect(text(container.querySelector('.base-countdown__clock'))).toBe('1 дн.')
	})

	it('role="timer": текст для скринридера с точностью до минуты, цифры скрыты', async () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + DAY + 2 * HOUR + 59 * SECOND, label: 'До распродажи' } })
		const timer = screen.getByRole('timer')
		expect(timer).toHaveAttribute('aria-live', 'off')
		expect(timer).toHaveAttribute('aria-atomic', 'true')
		expect(text(container.querySelector('.base-countdown__spoken'))).toBe('До распродажи: 1 день 2 часа')
		expect(container.querySelector('.base-countdown__display')).toHaveAttribute('aria-hidden', 'true')
		await vi.advanceTimersByTimeAsync(30 * SECOND)
		expect(text(container.querySelector('.base-countdown__spoken'))).toBe('До распродажи: 1 день 2 часа')
	})

	it('меньше минуты и окончание — отдельные тексты, подпись по умолчанию из словаря', async () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 61 * SECOND, isLive: true } })
		expect(screen.getByRole('timer')).toHaveAttribute('aria-live', 'polite')
		const spoken = () => text(container.querySelector('.base-countdown__spoken'))
		expect(spoken()).toBe('Осталось: 1 минута')
		await vi.advanceTimersByTimeAsync(2 * SECOND)
		expect(spoken()).toBe('Осталось: меньше минуты')
		await vi.advanceTimersByTimeAsync(MINUTE)
		expect(spoken()).toBe('Осталось: время вышло')
	})

	it('английский язык', () => {
		setLocale('en')
		const { container } = render(BaseCountdown, { props: { to: NOW + DAY + 5 * MINUTE } })
		expect(cells(container)).toEqual(['1 day', '00 hours', '05 minutes', '00 seconds'])
		expect(text(container.querySelector('.base-countdown__spoken'))).toBe('Time left: 1 day 5 minutes')
	})

	it('слот finished заменяет нули после окончания', async () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + SECOND }, slots: { finished: 'Распродажа началась' } })
		expect(screen.queryByText('Распродажа началась')).toBeNull()
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(screen.getByText('Распродажа началась')).toBeInTheDocument()
		expect(container.querySelector('.base-countdown__display')).toBeNull()
	})

	it('слот finished доступен скринридеру вместо «время вышло», ссылки в нём не скрыты', async () => {
		const { container } = render(BaseCountdown, {
			props: { to: NOW + SECOND, isLive: true },
			slots: { finished: '<a href="/sale">Распродажа началась</a>' },
		})
		await vi.advanceTimersByTimeAsync(SECOND)
		const link = screen.getByRole('link', { name: 'Распродажа началась' })
		expect(link.closest('[aria-hidden]')).toBeNull()
		expect(container.querySelector('.base-countdown__spoken')).toBeNull()
		expect(screen.getByRole('timer')).toHaveTextContent(/^Распродажа началась$/)
	})

	it('без слота finished после окончания — «время вышло» и нули под aria-hidden', async () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + SECOND } })
		await vi.advanceTimersByTimeAsync(SECOND)
		expect(text(container.querySelector('.base-countdown__spoken'))).toBe('Осталось: время вышло')
		expect(container.querySelector('.base-countdown__display')).toHaveAttribute('aria-hidden', 'true')
	})

	it('слот default получает части времени', () => {
		render(BaseCountdown, {
			props: { to: NOW + HOUR + 2 * SECOND },
			slots: {
				default:
					'<template #default="{ days, hours, minutes, seconds, total, isFinished }">{{ days }}|{{ hours }}|{{ minutes }}|{{ seconds }}|{{ total }}|{{ isFinished }}</template>',
			},
		})
		expect(screen.getByText('0|1|0|2|3602000|false')).toBeInTheDocument()
	})

	it('при возврате на вкладку пересчитывает время сразу', async () => {
		const { container } = render(BaseCountdown, { props: { to: NOW + 10 * SECOND, format: ['seconds'] } })
		vi.setSystemTime(NOW + 4 * SECOND)
		document.dispatchEvent(new Event('visibilitychange'))
		await vi.advanceTimersByTimeAsync(0)
		expect(cells(container)).toEqual(['06 секунд'])
		Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
		vi.setSystemTime(NOW + 6 * SECOND)
		document.dispatchEvent(new Event('visibilitychange'))
		await vi.advanceTimersByTimeAsync(0)
		expect(cells(container)).toEqual(['06 секунд'])
		Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
	})

	it('после размонтирования таймер и слушатель сняты', async () => {
		const remove = vi.spyOn(document, 'removeEventListener')
		const { unmount, emitted } = render(BaseCountdown, { props: { to: NOW + SECOND } })
		unmount()
		await vi.advanceTimersByTimeAsync(2 * SECOND)
		expect(emitted('finish')).toBeUndefined()
		expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
	})

	it('вариант, масштаб и customClass частей', () => {
		const { container } = render(BaseCountdown, {
			props: { to: NOW + HOUR, variant: 'soft', sizeScale: 125, customClass: { root: 'r', unit: 'u', value: 'v', caption: 'c' } },
		})
		const root = container.querySelector('.base-countdown') as HTMLElement
		expect(root).toHaveClass('base-countdown--soft', 'base-countdown--blocks', 'r')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-countdown__unit')).toHaveClass('u')
		expect(container.querySelector('.base-countdown__value')).toHaveClass('v')
		expect(container.querySelector('.base-countdown__caption')).toHaveClass('c')
	})

	it('берёт умолчания из createUiKitPlugin({ defaults })', () => {
		const { container } = render(BaseCountdown, {
			props: { to: NOW + HOUR },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCountdown: { layout: 'inline', format: ['minutes'] } } })] },
		})
		expect(text(container.querySelector('.base-countdown__clock'))).toBe('60')
	})
})
