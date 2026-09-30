import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseProgress v-bind="args" aria-label="Выполнение плана" />
		<BaseProgress v-bind="args" shape="circle" aria-label="Выполнение плана, круг" />
	</div>
`

export const CustomColor: StoryObj<typeof meta> = {
	args: { color: { bg: { base: '#16a34a' } }, hasLabel: true },
	parameters: {
		docs: {
			description: { story: 'Кастомный цвет заливки через `color.bg` — одинаково для полосы и кольца. Трек остаётся нейтральным.' },
			source: storySource({ template, imports: ['BaseProgress'], omit: ['default', 'shape'] }),
		},
		controls: { include: ['color', 'value', 'hasLabel', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { slots: ['default', 'shape'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const fill = canvasElement.querySelector('.base-progress__fill') as HTMLElement
		await expect(getComputedStyle(fill).backgroundColor).toBe('rgb(22, 163, 74)')
		const arc = canvasElement.querySelector('.base-progress__fill-circle') as SVGElement
		await expect(getComputedStyle(arc).stroke).toBe('rgb(22, 163, 74)')
	},
}
