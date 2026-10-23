import type meta from '../../BaseSparkline.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSparkline from '../../../ui/BaseSparkline.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const TILES = [
	{
		label: 'Выручка',
		value: '305 тыс. ₽',
		delta: '+12% к ноябрю',
		values: [182, 190, 176, 214, 238, 229, 251, 247, 266, 281, 272, 305],
		color: 'var(--rise-primary)',
	},
	{
		label: 'Новые клиенты',
		value: '48',
		delta: '+4 к ноябрю',
		values: [30, 34, 29, 38, 41, 39, 42, 45, 40, 44, 44, 48],
		color: 'var(--rise-success)',
	},
	{
		label: 'Отток',
		value: '3,1%',
		delta: '−0,4 п. п.',
		values: [4.2, 4.1, 4.4, 3.9, 3.8, 3.9, 3.6, 3.5, 3.6, 3.4, 3.5, 3.1],
		color: 'var(--rise-info)',
	},
]

const hidden = ['values', 'label', 'height', 'sizeScale', 'markColor']

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; padding-top: 40px">
		<div
			v-for="tile in tiles"
			:key="tile.label"
			style="display: flex; flex-direction: column; gap: 6px; padding: 16px; border: 1px solid var(--rise-border); border-radius: 12px">
			<span style="font-size: 13px; color: var(--rise-text-muted)">{{ tile.label }}</span>
			<strong style="font-size: 24px; color: var(--rise-text-highlighted)">{{ tile.value }}</strong>
			<span style="font-size: 12px; color: var(--rise-text-muted)">{{ tile.delta }}</span>
			<BaseSparkline v-bind="args" :values="tile.values" :label="tile.label" :mark-color="tile.color" :height="36" />
		</div>
	</div>
`

export const StatTiles: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Карточки показателей: число, изменение и тренд за 12 месяцев.' },
			source: storySource({ template, imports: ['BaseSparkline'], script: `const tiles = ${literal(TILES)}`, omit: hidden }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseSparkline },
		setup: useStorySetup(args, { data: { tiles: TILES }, slots: hidden }),
		template,
	}),
}
