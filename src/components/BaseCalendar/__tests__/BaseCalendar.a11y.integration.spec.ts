import '@testing-library/jest-dom/vitest'
import BaseCalendar from '../ui/BaseCalendar.vue'
import { fireEvent, render, screen, within } from '@testing-library/vue'

const dayName = (date: Date): string =>
	new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)

describe('BaseCalendar: доступность сетки дней', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('имя кнопки дня — полная дата, выбранный день помечен aria-pressed', () => {
		render(BaseCalendar, { props: { modelValue: new Date(2025, 4, 15) } })

		const selected = screen.getByRole('button', { name: dayName(new Date(2025, 4, 15)) })
		expect(selected).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', { name: dayName(new Date(2025, 4, 16)) })).toHaveAttribute('aria-pressed', 'false')
	})

	it('сегодняшний день помечен aria-current="date"', () => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date(2025, 4, 15, 10, 30))
		render(BaseCalendar, { props: { initialMonth: 4, initialYear: 2025 } })

		expect(screen.getByRole('button', { current: 'date' })).toHaveAccessibleName(dayName(new Date(2025, 4, 15)))
	})

	it('проп today задаёт «сегодня» независимо от часов: aria-current и кнопка «Сегодня»', async () => {
		const { emitted } = render(BaseCalendar, { props: { today: new Date(2020, 1, 10, 9, 0) } })

		expect(screen.getByRole('button', { current: 'date' })).toHaveAccessibleName(dayName(new Date(2020, 1, 10)))

		await fireEvent.click(screen.getByRole('button', { name: 'Сегодня' }))

		expect(emitted()['update:modelValue']).toEqual([[new Date(2020, 1, 10, 9, 0)]])
	})

	it('в имя дня с событием добавляется подпись события', () => {
		render(BaseCalendar, {
			props: {
				modelValue: new Date(2025, 4, 15),
				highlights: [{ date: new Date(2025, 4, 20), label: 'Релиз' }],
			},
		})

		expect(screen.getByRole('button', { name: `${dayName(new Date(2025, 4, 20))}, Релиз` })).toBeInTheDocument()
	})

	it('в диапазоне нажаты концы и дни между ними; полоса у концов — только у законченного диапазона', async () => {
		const { container, rerender } = render(BaseCalendar, {
			props: { selectionMode: 'range', modelValue: new Date(2025, 4, 12), modelValueEnd: null },
		})
		expect(container.querySelector('.base-calendar')).not.toHaveClass('base-calendar--range-complete')

		await rerender({ selectionMode: 'range', modelValue: new Date(2025, 4, 12), modelValueEnd: new Date(2025, 4, 18) })

		expect(container.querySelector('.base-calendar')).toHaveClass('base-calendar--range-complete')
		expect(screen.getByRole('button', { name: dayName(new Date(2025, 4, 15)) })).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', { name: dayName(new Date(2025, 4, 18)) })).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', { name: dayName(new Date(2025, 4, 19)) })).toHaveAttribute('aria-pressed', 'false')
	})

	it('отключённый календарь помечен aria-disabled, все его кнопки недоступны', () => {
		const { container } = render(BaseCalendar, { props: { modelValue: new Date(2025, 4, 15), isDisabled: true } })

		expect(container.querySelector('.base-calendar')).toHaveAttribute('aria-disabled', 'true')
		for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
	})

	it('без смены вида заголовок — текст, а не кнопка', () => {
		render(BaseCalendar, { props: { modelValue: new Date(2025, 4, 15), displayConfig: { canSwitchView: false } } })

		expect(screen.getByText('май 2025').tagName).toBe('SPAN')
		expect(screen.queryByRole('button', { name: 'май 2025' })).not.toBeInTheDocument()
	})
})

describe('BaseCalendar: блок времени', () => {
	it('поля времени — группа «Время» с именами «Часы», «Минуты», «Секунды»', () => {
		render(BaseCalendar, {
			props: { modelValue: new Date(2025, 4, 15, 14, 30, 5), timeConfig: { showTime: true, showSeconds: true } },
		})

		const group = screen.getByRole('group', { name: 'Время' })
		expect(within(group).getByLabelText('Часы')).toHaveValue(14)
		expect(within(group).getByLabelText('Минуты')).toHaveValue(30)
		expect(within(group).getByLabelText('Секунды')).toHaveValue(5)
	})
})

describe('BaseCalendar: слоты', () => {
	it('слот header заменяет навигацию и получает месяц и год', () => {
		render(BaseCalendar, {
			props: { modelValue: new Date(2025, 4, 15) },
			slots: { header: '<template #header="{ month, year }"><span>Месяц {{ month }}, год {{ year }}</span></template>' },
		})

		expect(screen.getByText('Месяц 4, год 2025')).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Следующий месяц' })).not.toBeInTheDocument()
	})

	it('слот day задаёт содержимое ячейки: имя кнопки — содержимое, состояние выбора сохраняется', () => {
		render(BaseCalendar, {
			props: { modelValue: new Date(2025, 4, 15) },
			slots: { day: '<template #day="{ date, isSelected }">Д{{ date.getDate() }}{{ isSelected ? "!" : "" }}</template>' },
		})

		const selected = screen.getByRole('button', { name: 'Д15!' })
		expect(selected).toHaveAttribute('aria-pressed', 'true')
		expect(selected).toHaveClass('base-calendar__day--custom')
	})
})

describe('BaseCalendar: popover даты', () => {
	const props = {
		modelValue: null,
		initialMonth: 4,
		initialYear: 2025,
		showDatePopover: true,
		highlights: [{ date: new Date(2025, 4, 20), label: 'Сдача монтажа' }, { date: new Date(2025, 4, 20) }],
	}

	it('клик по дню показывает дату и события; клик внутри не закрывает, mousedown снаружи — закрывает', async () => {
		const { container } = render(BaseCalendar, { props })

		await fireEvent.click(screen.getByRole('button', { name: /^вторник, 20 мая 2025/ }))
		const popover = container.querySelector<HTMLElement>('.base-calendar__popover')!
		expect(popover).toHaveTextContent('вторник, 20 мая 2025 г.')
		expect(within(popover).getByText('Сдача монтажа')).toBeInTheDocument()
		expect(within(popover).getByText('Событие')).toBeInTheDocument()

		await fireEvent.mouseDown(popover)
		await fireEvent.click(popover)
		expect(container.querySelector('.base-calendar__popover')).toBeInTheDocument()

		await fireEvent.mouseDown(document.body)
		expect(container.querySelector('.base-calendar__popover')).not.toBeInTheDocument()
	})

	it('popover у дней начала недели выровнен по левому краю ячейки, конца недели — по правому', async () => {
		const { container } = render(BaseCalendar, { props })

		await fireEvent.click(screen.getByRole('button', { name: /^понедельник, 19 мая 2025/ }))
		expect(container.querySelector('.base-calendar__popover')).toHaveClass('base-calendar__popover--start')

		await fireEvent.mouseDown(document.body)
		await fireEvent.click(screen.getByRole('button', { name: /^воскресенье, 25 мая 2025/ }))
		expect(container.querySelector('.base-calendar__popover')).toHaveClass('base-calendar__popover--end')
	})

	it('слот date-popover получает дату и close()', async () => {
		const { container } = render(BaseCalendar, {
			props,
			slots: {
				'date-popover':
					'<template #date-popover="{ date, close }"><span>Выбрано {{ date.getDate() }}</span><button @click="close">Закрыть</button></template>',
			},
		})

		await fireEvent.click(screen.getByRole('button', { name: /^вторник, 20 мая 2025/ }))
		expect(screen.getByText('Выбрано 20')).toBeInTheDocument()

		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		expect(container.querySelector('.base-calendar__popover')).not.toBeInTheDocument()
	})
})
