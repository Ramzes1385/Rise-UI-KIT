import { expect } from 'storybook/test'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCalendar from '../../../ui/BaseCalendar.vue'
import { isStoryBranded, literal, storyDate, storySource, useStorySetup } from '@/stories/helpers'

const models = { date: 'modelValue' }
const ui = { root: 'story-themed-calendar', title: 'story-themed-title', day: 'story-themed-day' }

const template = `
	<div class="story-grid" style="--story-grid-min: 300px;">
		<div class="story-col">
			<span class="story-label">По умолчанию</span>
			<BaseCalendar v-bind="args" v-model="date" />
		</div>
		<div class="story-col" style="--rise-card-bg: var(--rise-bg-muted); --rise-card-border: var(--rise-primary); --rise-card-radius: 16px; --rise-calendar-padding: 16px; --rise-calendar-header-text: var(--rise-primary-text); --rise-calendar-header-font-weight: var(--rise-font-weight-bold); --rise-calendar-day-radius: var(--rise-radius-md); --rise-calendar-day-height: 36px; --rise-calendar-day-bg-hover: var(--rise-primary-soft); --rise-calendar-day-bg-selected: var(--rise-success); --rise-calendar-day-text-selected: var(--rise-on-success); --rise-calendar-day-ring: var(--rise-primary);">
			<span class="story-label">Токены на контейнере</span>
			<BaseCalendar v-bind="args" v-model="date" />
		</div>
		<div class="story-col">
			<span class="story-label">Классы через ui</span>
			<BaseCalendar v-bind="args" v-model="date" :ui="ui" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-calendar-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `padding` (поле вокруг содержимого); шапка — `header-text`,',
					'`header-font-weight`; дни — `day-radius`, `day-height` (размер кнопки дня),',
					'`day-bg-hover`, `day-bg-selected`, `day-text-selected`, `day-ring` (кольцо сегодняшнего дня, по умолчанию его нет).',
					'Фон, рамка и радиус корня — токены карточки `--rise-card-bg`, `--rise-card-border`, `--rise-card-radius`',
					'(календарь построен на BaseCard): задайте их на календаре или его контейнере, либо классом через `ui.root`.',
					'Отступы шапки, сетки, времени и подвала умножаются на плотность темы `--rise-density`. Цвет из пропа `color`',
					'сильнее токенов.',
					'Проп `ui` добавляет классы к частям `root`, `header`, `nav-btn`, `title-btn`, `title`, `days`, `weekdays`, `weekday`,',
					'`week-num-header`, `week-num`, `grid`, `day-wrapper`, `day`, `day-dot`, `popover` (и `popover-arrow`, `popover-date`,',
					'`popover-highlights`, `popover-highlight`, `popover-highlight-dot`), `months`, `month-btn`, `years`, `year-btn`,',
					'`time` (и `time-caption`, `time-fields`, `time-input`, `time-sep`, `time-ampm`), `footer`, `today-btn`;',
					'глобально — `defaults.BaseCalendar.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCalendar'], models, script: `const ui = ${literal(ui)}` }),
		},
	},
	args: { modelValue: storyDate(2, 0, 0) },
	render: args => ({
		components: { BaseCalendar },
		setup: useStorySetup(args, { models, data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-calendar')]
		const part = (root: HTMLElement, selector: string) => root.querySelector<HTMLElement>(selector)!
		const style = (root: HTMLElement, selector: string) => getComputedStyle(part(root, selector))

		await expect(getComputedStyle(themed!).backgroundColor).not.toBe(getComputedStyle(plain!).backgroundColor)
		await expect(getComputedStyle(themed!).borderTopColor).not.toBe(getComputedStyle(plain!).borderTopColor)
		await expect(style(themed!, '.base-calendar__title').color).not.toBe(style(plain!, '.base-calendar__title').color)
		await expect(style(themed!, '.base-calendar__day--selected').backgroundColor).not.toBe(
			style(plain!, '.base-calendar__day--selected').backgroundColor,
		)
		await expect(style(themed!, '.base-calendar__title').fontWeight).toBe('700')
		if (!isStoryBranded()) {
			await expect(style(plain!, '.base-calendar__title').fontWeight).toBe('600')
			await expect(style(plain!, '.base-calendar__day').height).toBe('32px')
			await expect(style(themed!, '.base-calendar__day').height).toBe('36px')
			await expect(getComputedStyle(themed!).borderTopLeftRadius).toBe('16px')
		}
		await expect(classed).toHaveClass('base-calendar', 'story-themed-calendar')
		await expect(part(classed!, '.base-calendar__title')).toHaveClass('story-themed-title')
		for (const day of classed!.querySelectorAll('.base-calendar__day')) await expect(day).toHaveClass('story-themed-day')
	},
}
