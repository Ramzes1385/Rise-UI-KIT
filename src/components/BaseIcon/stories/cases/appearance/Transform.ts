import { expect } from 'storybook/test'
import type meta from '../../BaseIcon.stories'
import BaseIcon from '../../../ui/BaseIcon.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const samples = [
	{ label: 'rotate 0', rotate: 0 },
	{ label: 'rotate 90', rotate: 90 },
	{ label: 'rotate 180', rotate: 180 },
	{ label: 'rotate 270', rotate: 270 },
	{ label: 'isFlipX', isFlipX: true },
	{ label: 'isFlipY', isFlipY: true },
]

const template = `
	<div class="story-row" style="gap: 24px;">
		<div v-for="sample in samples" :key="sample.label" class="story-col" style="align-items: center; gap: 8px;">
			<BaseIcon v-bind="args" name="arrow-right" :rotate="sample.rotate" :is-flip-x="sample.isFlipX" :is-flip-y="sample.isFlipY" />
			<span class="story-label" style="min-width: 0;">{{ sample.label }}</span>
		</div>
	</div>
`

export const Transform: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			description: {
				story: 'Поворот `rotate` (градусы) и отражение `isFlipX` / `isFlipY` — например, одна стрелка на четыре направления.',
			},
			source: storySource({
				template,
				imports: ['BaseIcon'],
				script: `const samples = ${literal(samples)}`,
				omit: ['name', 'rotate', 'isFlipX', 'isFlipY'],
			}),
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: useStorySetup(args, { data: { samples }, slots: ['name', 'rotate', 'isFlipX', 'isFlipY'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const svgs = canvasElement.querySelectorAll('svg')
		await expect(svgs[1].style.transform).toBe('rotate(90deg)')
		await expect(svgs[4].style.transform).toBe('scaleX(-1)')
	},
}
