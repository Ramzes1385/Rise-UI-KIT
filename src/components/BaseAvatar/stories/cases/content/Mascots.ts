import { expect } from 'storybook/test'
import { CONTENT_ARGS } from '../../shared'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const mascots = [
	{ mascot: 'sprout', alt: 'Росток' },
	{ mascot: 'cloud', alt: 'Облачко' },
	{ mascot: 'droplet', alt: 'Капля' },
	{ mascot: 'pebble', alt: 'Камешек' },
	{ mascot: 'spark', alt: 'Искра' },
] as const

const template = `
	<div class="story-row">
		<div v-for="item in mascots" :key="item.mascot" class="story-col">
			<BaseAvatar v-bind="args" :mascot="item.mascot" :alt="item.alt" />
			<span class="story-label">{{ item.alt }}</span>
		</div>
	</div>
`

export const Mascots: StoryObj<typeof meta> = {
	name: 'Маскоты',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape', 'ring', 'mood', 'isBlinking', 'isEyesClosed'] },
		docs: {
			description: {
				story: [
					'Собственные персонажи кита (`mascot`): Росток, Облачко, Капля, Камешек и Искра. У всех одно лицо:',
					'зрачки и наклон головы идут за курсором на пружине, персонаж дышит и моргает, `mood` меняет выражение.',
					'Цвета — токены темы. В историях моргание выключено (`isBlinking: false`), чтобы снимки были одинаковыми.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: `const mascots = ${literal(mascots)} as const`,
				omit: [...CONTENT_ARGS, 'mascot'],
			}),
		},
	},
	args: { sizeScale: 250 },
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { mascots }, slots: [...CONTENT_ARGS, 'mascot'] }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const { alt } of mascots) await expect(canvas.getByRole('img', { name: alt })).toBeVisible()
	},
}
