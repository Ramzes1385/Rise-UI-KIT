import { expect } from 'storybook/test'
import { GRID_STYLE } from '../../shared'
import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const STATS = [
	{ label: 'Заказы', value: 1284, valueFormat: {}, change: 0.08, isInverse: false },
	{
		label: 'Средний чек',
		value: 3750,
		valueFormat: { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 },
		change: -0.03,
		isInverse: false,
	},
	{ label: 'Отток', value: 0.031, valueFormat: { style: 'percent', maximumFractionDigits: 1 }, change: -0.004, isInverse: true },
	{ label: 'Обращения', value: 96, valueFormat: {}, change: 0, isInverse: false },
]

const hidden = ['label', 'value', 'valueFormat', 'change', 'isInverse']

const template = `
	<div style="${GRID_STYLE}">
		<BaseStat
			v-for="stat in stats"
			:key="stat.label"
			v-bind="args"
			:label="stat.label"
			:value="stat.value"
			:value-format="stat.valueFormat"
			:change="stat.change"
			:is-inverse="stat.isInverse" />
	</div>
`

export const Trends: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Рост, снижение и «без изменений». У оттока рост — плохо, поэтому `isInverse`: снижение на 0,4 % зелёное.',
					'Цвет лишь дополняет знак числа: «+8 %», «-3 %».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseStat'], script: `const stats = ${literal(STATS)}`, omit: hidden }),
		},
		controls: { include: ['variant', 'changeLabel', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseStat },
		setup: useStorySetup(args, { data: { stats: STATS }, slots: hidden }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const changes = [...canvasElement.querySelectorAll('.base-stat__change')]
		await expect(changes.map(change => change.className.replace(/.*--/, ''))).toEqual(['positive', 'negative', 'positive', 'neutral'])
	},
}
