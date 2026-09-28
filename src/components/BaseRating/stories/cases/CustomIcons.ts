import { ref } from 'vue'
import { starOf } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseRating.stories'
import BaseRating from '../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseRating v-model="quality" icon="mic" />',
					'<BaseRating v-model="stages" icon="x-circle" icon-filled="check-circle" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'icon', 'iconFilled', 'onUpdate:modelValue']),
			quality: ref(4),
			stages: ref(3),
		}),
		template: `
			<div class="story-col">
				<div class="story-row">
					<span class="story-label">Озвучка</span>
					<BaseRating v-bind="props" v-model="quality" icon="mic" />
				</div>
				<div class="story-row">
					<span class="story-label">Этапы серии</span>
					<BaseRating v-bind="props" v-model="stages" icon="x-circle" icon-filled="check-circle" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const star = starOf(canvas.getAllByRole('slider')[1] as HTMLElement, 0)
		await expect(star.querySelector(':scope > .base-icon use')).toHaveAttribute('href', expect.stringContaining('#x-circle'))
		await expect(star.querySelector('.base-rating__star-fill use')).toHaveAttribute('href', expect.stringContaining('#check-circle'))
	},
}
