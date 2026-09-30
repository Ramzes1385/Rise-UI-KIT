import type meta from '../BaseTimeline.stories'
import { expect, within } from 'storybook/test'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TimelineItem } from '../../types/BaseTimeline.types'
import { literal, placeholderImage, storySource, useStorySetup } from '@/stories/helpers'

const history: TimelineItem[] = [
	{ id: 1, title: 'Анна создала макет', description: 'Главная страница, версия 1', date: '2026-05-12T09:40:00', icon: 'file' },
	{
		id: 2,
		title: 'Иван загрузил скриншот',
		description: 'Экран оплаты на телефоне',
		date: '2026-05-12T14:15:00',
		icon: 'image',
		media: { src: placeholderImage({ width: 640, height: 360, hue: 200 }), alt: 'Экран оплаты на телефоне' },
	},
	{
		id: 3,
		title: 'Мария оставила комментарий',
		description: '«Кнопку оплаты сделать заметнее»',
		date: '2026-05-12T16:02:00',
		icon: 'comment',
		color: 'info',
	},
	{ id: 4, title: 'Макет утверждён', description: 'Передан в разработку', date: '2026-05-13T11:30:00', icon: 'check', color: 'success' },
]

const template = `
	<div class="story-medium">
		<BaseTimeline v-bind="args" :items="history" is-grouped date-position="side" />
	</div>
`

export const Chronology: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Timeline — хронология уже случившегося: кто и когда что сделал. События сгруппированы по дням (`isGrouped`),',
					'время — колонкой слева (`datePosition="side"`), у события может быть картинка `media` (по клику открывается',
					'крупно). Шаги процесса, по которым идут вперёд, — BaseStepper.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTimeline'],
				script: `const history = ${literal(history)}`,
				omit: ['items', 'currentId'],
			}),
		},
	},
	render: args => ({
		components: { BaseTimeline },
		setup: useStorySetup(args, { data: { history } }),
		template,
	}),
	play: async ({ canvas }) => {
		const items = canvas.getAllByRole('listitem')
		await expect(items).toHaveLength(4)
		await expect(within(items[0]).getByText(/12 мая 2026/)).toHaveClass('base-timeline__day')
		await expect(within(items[1]).queryByText(/12 мая 2026/)).toBeNull()
		await expect(within(items[3]).getByText(/13 мая 2026/)).toBeInTheDocument()
		await expect(items[0].querySelector('time')).toHaveTextContent('09:40')
		await expect(within(items[1]).getByRole('img', { name: 'Экран оплаты на телефоне' })).toBeInTheDocument()
	},
}
