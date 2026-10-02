import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, waitFor, within } from 'storybook/test'
import type { ImageMapData } from '../../../types/imageMapData.types'
import type { ImageMapHours } from '../../../types/ImageMapHours.types'
import { STORY_TODAY, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { filters: 'filters' } as const

const STORY_NOW = Date.UTC(STORY_TODAY.getFullYear(), STORY_TODAY.getMonth(), STORY_TODAY.getDate(), 7, 30)

const STORY_DATE = new Date(STORY_NOW).toISOString().slice(0, 10)

const COURT_SVG = [
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420">',
	'<rect width="900" height="420" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>',
	'<rect x="30" y="180" width="840" height="60" fill="#fefce8"/>',
	'<rect id="coffee" x="40" y="30" width="250" height="130" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>',
	'<rect id="restaurant" x="325" y="30" width="250" height="130" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>',
	'<rect id="bar" x="610" y="30" width="250" height="130" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>',
	'<rect id="pharmacy" x="40" y="260" width="250" height="130" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>',
	'<rect id="cleaners" x="325" y="260" width="250" height="130" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>',
	'<rect id="pickup" x="610" y="260" width="250" height="130" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>',
	'</svg>',
].join('')

function everyDay(range: string): ImageMapHours['week'] {
	return { mon: [range], tue: [range], wed: [range], thu: [range], fri: [range], sat: [range], sun: [range] }
}

const WEEKDAYS = { mon: ['09:00-19:00'], tue: ['09:00-19:00'], wed: ['09:00-19:00'], thu: ['09:00-19:00'], fri: ['09:00-19:00'] }

const HOURS_MAP: ImageMapData = {
	timeZone: 'Europe/Moscow',
	layers: [{ id: 'court', title: 'Фудкорт', svg: COURT_SVG, width: 900, height: 420 }],
	groups: [
		{ id: 'food', title: 'Еда', color: 'var(--rise-warning)', icon: 'star' },
		{ id: 'service', title: 'Сервис', color: 'var(--rise-success)', icon: 'info' },
	],
	filters: [{ id: 'now', title: 'Часы работы', type: 'open-now' }],
	objects: [
		{ id: 'coffee', type: 'svg', elementId: 'coffee', title: 'Кофейня', group: 'food', hours: { week: everyDay('08:00-22:00') } },
		{
			id: 'restaurant',
			type: 'svg',
			elementId: 'restaurant',
			title: 'Ресторан',
			group: 'food',
			hours: { week: everyDay('12:00-23:00') },
		},
		{
			id: 'bar',
			type: 'svg',
			elementId: 'bar',
			title: 'Бар',
			group: 'food',
			description: 'С четверга по субботу до трёх ночи',
			hours: { week: { thu: ['18:00-03:00'], fri: ['18:00-03:00'], sat: ['18:00-03:00'] } },
		},
		{ id: 'pharmacy', type: 'svg', elementId: 'pharmacy', title: 'Аптека', group: 'service', hours: { week: everyDay('00:00-24:00') } },
		{
			id: 'cleaners',
			type: 'svg',
			elementId: 'cleaners',
			title: 'Химчистка',
			group: 'service',
			description: 'Сегодня санитарный день',
			hours: { week: WEEKDAYS, exceptions: { [STORY_DATE]: [] } },
		},
		{
			id: 'pickup',
			type: 'svg',
			elementId: 'pickup',
			title: 'Пункт выдачи',
			group: 'service',
			description: 'Работает по времени Владивостока',
			hours: { timeZone: 'Asia/Vladivostok', week: everyDay('10:00-20:00') },
		},
	],
}

const template = `
	<div class="story-stack">
		<BaseImageMap v-bind="args" v-model:filters="filters" />
		<p>Фильтры: {{ JSON.stringify(filters) }}</p>
	</div>
`

export const OpeningHours: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					"Часы работы объектов (`hours`): расписание недели, исключения по датам и часовой пояс IANA — объекта или карты (`data.timeZone: 'Europe/Moscow'`). Состояние считается через `Intl` и показывается в подсказке, окне (с расписанием недели) и списке: «Открыто до 22:00», «Закрыто, откроется в 12:00», «Открыто круглосуточно».",
					"Бар работает через полночь, у химчистки сегодня исключение, пункт выдачи живёт по времени Владивостока. Фильтр `type: 'open-now'` — переключатель «Открыто сейчас». Момент расчёта зафиксирован пропом `now` (10:30 по Москве в день `STORY_TODAY`); без него карта берёт текущее время и обновляется раз в минуту.",
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImageMap', 'type ImageMapFilterValues'],
				models: MODELS,
				types: { filters: 'ImageMapFilterValues' },
			}),
		},
	},
	args: { data: HOURS_MAP, hasDirectory: true, directoryGroupBy: 'none', now: STORY_NOW, filters: {} },
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const list = within(canvas.getByRole('complementary', { name: 'Список объектов' }))
		const hoursOf = (id: string) => canvasElement.querySelector(`[data-image-map-entry="${id}"] .base-image-map__entry-hours`)
		await expect(hoursOf('coffee')).toHaveTextContent('Открыто до 22:00')
		await expect(hoursOf('restaurant')).toHaveTextContent('Закрыто, откроется в 12:00')
		await expect(hoursOf('bar')).toHaveTextContent('Закрыто, откроется в 18:00')
		await expect(hoursOf('pharmacy')).toHaveTextContent('Открыто круглосуточно')
		await expect(hoursOf('cleaners')).toHaveTextContent('Закрыто, откроется в 9:00')
		await expect(hoursOf('pickup')).toHaveTextContent('Открыто до 20:00')
		const openNow = list.getByRole('switch', { name: 'Открыто сейчас' })
		await tabTo(openNow, userEvent)
		await userEvent.keyboard(' ')
		await waitFor(() => expect(list.getAllByRole('listitem')).toHaveLength(3))
		await expect(canvas.getByText('Фильтры: {"now":["open"]}')).toBeVisible()
		await userEvent.click(list.getByRole('button', { name: /Кофейня/ }))
		const dialog = within(await within(document.body).findByRole('dialog', { name: 'Кофейня' }))
		await expect(dialog.getByText('Часы работы')).toBeVisible()
		await expect(dialog.getByText('Открыто до 22:00')).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument())
		await userEvent.click(list.getByRole('button', { name: 'Сбросить фильтры' }))
		await waitFor(() => expect(list.getAllByRole('listitem')).toHaveLength(6))
	},
}
