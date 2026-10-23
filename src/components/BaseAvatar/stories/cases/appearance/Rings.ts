import { expect } from 'storybook/test'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CONTENT_ARGS, anna, ivan } from '../../shared'
import { AVATAR_RINGS } from '../../../types/BaseAvatar.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const rings = AVATAR_RINGS

const template = `
	<div class="story-col">
		<div v-for="ring in rings" :key="ring" class="story-row">
			<span class="story-label">{{ ring }}</span>
			<BaseAvatar v-bind="args" :ring="ring" :name="anna.name" />
			<BaseAvatar v-bind="args" :ring="ring" :src="ivan.avatar" :name="ivan.name" />
			<BaseAvatar v-bind="args" :ring="ring" mascot="sprout" />
		</div>
	</div>
`

export const Rings: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'shape', 'isOnline'] },
		docs: {
			description: {
				story: [
					'Обводка `ring`: `gradient` — радужная, `shimmer` — радужная и переливается по кругу, как у историй в соцсетях.',
					'Между обводкой и аватаром — зазор цвета фона. При `prefers-reduced-motion` `shimmer` не движется.',
					'Цвета обводки — токены `--rise-chart-*`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const rings = ${literal(rings)}`, `const anna = ${literal(anna)}`, `const ivan = ${literal(ivan)}`].join('\n'),
				omit: [...CONTENT_ARGS, 'ring', 'mascot'],
			}),
		},
	},
	args: { sizeScale: 150 },
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { rings, anna, ivan }, slots: [...CONTENT_ARGS, 'ring', 'mascot'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('.base-avatar--ring-gradient')).toHaveLength(3)
		await expect(canvasElement.querySelectorAll('.base-avatar--ring-shimmer')).toHaveLength(3)
	},
}
