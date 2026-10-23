import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = {
	root: 'story-themed-calendar',
	toolbar: 'story-themed-toolbar',
	day: 'story-themed-day',
	event: 'story-themed-event',
}

const template = `
	<div style="display: grid; gap: 24px">
		<BaseEventCalendar v-bind="args" aria-label="По умолчанию" />
		<div style="--rise-event-calendar-bg: var(--rise-bg-elevated); --rise-event-calendar-border: var(--rise-primary); --rise-event-calendar-radius: var(--rise-radius-xl); --rise-event-calendar-header-bg: var(--rise-primary-soft); --rise-event-calendar-header-text: var(--rise-primary-text); --rise-event-calendar-cell-border: var(--rise-primary-soft); --rise-event-calendar-cell-bg-hover: var(--rise-primary-soft); --rise-event-calendar-cell-padding-y: 8px; --rise-event-calendar-event-radius: var(--rise-radius-full); --rise-event-calendar-event-font-size: var(--rise-font-size-sm); --rise-event-calendar-event-padding-x: 10px; --rise-event-calendar-today-bg: var(--rise-success);">
			<BaseEventCalendar v-bind="args" aria-label="Токены на контейнере" />
		</div>
		<BaseEventCalendar v-bind="args" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'view'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-event-calendar-*`',
					'кит только читает — задайте их на `:root`, в теме или на контейнере: `bg`, `border` и `radius` (сам календарь;',
					'`bg` и `border` действуют и в вариантах `soft`, `outline`), `header-bg` и `header-text` (строка дней недели в месяце,',
					'заголовки дней и ресурсов в неделе и дне), `cell-border` (линии сетки), `cell-bg-hover` (день месяца под указателем,',
					'кроме дней соседних месяцев и выделенных), `cell-padding-y` (отступ дня месяца сверху и снизу), `event-radius`,',
					'`event-font-size` и `event-padding-x` (события всех видов), `today-bg` (число сегодняшнего дня). Отступы умножаются',
					'на плотность темы `--rise-density`. Кнопки панели, переключатель видов и поповер «+N ещё» — токены BaseButton,',
					'BaseSegmented и BasePopover. Цвет события — его поле `color`. Проп `ui` добавляет классы к частям `root`, `toolbar`,',
					'`nav`, `title`, `views`, `view`, `month`, `weekdays`, `weekday`, `week`, `day`, `day-number`, `lanes`, `event`,',
					'`event-time`, `event-title`, `more`, `more-button`, `popover`, `popover-title`, `list`, `agenda-day`, `agenda-date`,',
					'`agenda-items`, `empty`, `time-grid`, `resource-head`, `resource`, `time-head`, `header-day`, `all-day`,',
					'`all-day-label`, `all-day-events`, `time-body`, `axis`, `axis-slot`, `column`, `now`; глобально —',
					'`defaults.BaseEventCalendar.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEventCalendar'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'По умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('region', { name: 'Классы через ui' })
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-event-calendar__${name}`)!
		const style = (element: HTMLElement) => getComputedStyle(element)
		const today = (root: HTMLElement) =>
			root.querySelector<HTMLElement>('.base-event-calendar__day--today .base-event-calendar__day-number')!

		await expect(style(themed).backgroundColor).not.toBe(style(plain).backgroundColor)
		await expect(style(themed).borderTopColor).not.toBe(style(plain).borderTopColor)
		await expect(style(part(themed, 'weekdays')).backgroundColor).not.toBe(style(part(plain, 'weekdays')).backgroundColor)
		await expect(style(part(themed, 'weekday')).color).not.toBe(style(part(plain, 'weekday')).color)
		await expect(style(part(themed, 'month')).borderTopColor).not.toBe(style(part(plain, 'month')).borderTopColor)
		await expect(style(today(themed)).backgroundColor).not.toBe(style(today(plain)).backgroundColor)
		await expect(style(part(themed, 'event')).borderEndStartRadius).not.toBe(style(part(plain, 'event')).borderEndStartRadius)
		if (!isStoryBranded()) {
			await expect(style(part(plain, 'day')).paddingTop).toBe('4px')
			await expect(style(part(themed, 'day')).paddingTop).toBe('8px')
			await expect(style(part(plain, 'event')).paddingInlineEnd).toBe('6px')
			await expect(style(part(themed, 'event')).paddingInlineEnd).toBe('10px')
			await expect(style(part(plain, 'event')).fontSize).toBe('12px')
			await expect(style(part(themed, 'event')).fontSize).toBe('14px')
		}
		await expect(classed).toHaveClass('base-event-calendar', 'story-themed-calendar')
		await expect(part(classed, 'toolbar')).toHaveClass('story-themed-toolbar')
		for (const day of classed.querySelectorAll('.base-event-calendar__day')) await expect(day).toHaveClass('story-themed-day')
		for (const event of classed.querySelectorAll('.base-event-calendar__event')) await expect(event).toHaveClass('story-themed-event')
	},
}
