import { expect } from 'storybook/test'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseButton v-bind="args">из темы</BaseButton>
		<BaseButton v-bind="args" :padding="8">8 → 8px 16px</BaseButton>
		<BaseButton v-bind="args" :padding="{ x: 24, y: 10 }">x: 24, y: 10</BaseButton>
	</div>
`

export const Padding: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отступы `padding`: число — Y = n, X = 2n; объект `{ x, y, top, right, bottom, left }` задаёт стороны напрямую.',
					'Без `padding` отступы берутся из токенов темы (`--rise-control-padding-y/x`).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseButton'] }),
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const [themed, numeric] = canvas.getAllByRole('button')
		await expect(themed.style.getPropertyValue('--btn-pad-top')).toBe('')
		await expect(numeric.style.getPropertyValue('--btn-pad-left')).toBe('16px')
	},
}
