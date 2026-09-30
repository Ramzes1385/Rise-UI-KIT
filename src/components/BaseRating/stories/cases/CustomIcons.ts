import { starOf } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseRating.stories'
import BaseRating from '../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { quality: 4, stages: 3 }

const template = `
	<div class="story-col">
		<div class="story-row">
			<span class="story-label">Озвучка</span>
			<BaseRating v-bind="args" v-model="quality" icon="mic" />
		</div>
		<div class="story-row">
			<span class="story-label">Этапы серии</span>
			<BaseRating v-bind="args" v-model="stages" icon="x-circle" icon-filled="check-circle" />
		</div>
	</div>
`

export const CustomIcons: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'variant'] },
		docs: {
			description: {
				story: [
					'Свои иконки: `icon` — пустая и (без `iconFilled`) заполненная, `iconFilled` — отдельная иконка заполненного',
					'состояния. Иконки берутся из спрайта библиотеки.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRating'],
				state,
				omit: ['default', 'modelValue', 'icon', 'iconFilled', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args, { state, slots: ['default', 'modelValue', 'icon', 'iconFilled', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const star = starOf(canvas.getAllByRole('slider')[1] as HTMLElement, 0)
		await expect(star.querySelector(':scope > .base-icon use')).toHaveAttribute('href', expect.stringContaining('#x-circle'))
		await expect(star.querySelector('.base-rating__star-fill use')).toHaveAttribute('href', expect.stringContaining('#check-circle'))
	},
}
